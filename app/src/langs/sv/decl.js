// Формы шведского существительного: список по уровням, таблица (en/ett, опр. форма, мн. число) и упражнение
// «Формы существительных» (уровень «формы» = verb_progress kind 'decl'). Формы открываются темами грамматики 4–6.
import { rpc } from '../api.js';
import { getLang } from '../i18n.js';
import { h, mount, spinner, sheet, haptic } from '../ui.js';
import { icon } from '../icons.js';
import { langKeyboard } from './keyboard.js';
import { tx, nounRows, openNounForms, NOUN_DRILL, formOk } from './forms.js';
import { reportSheet, flagButton } from './report.js';

const CEFRS = ['A1', 'A2', 'B1', 'B2'];
const meaning = (v) => (getLang() === 'en' && v.e ? v.e : v.r);
const loadMorph = (ids) => (ids.length ? rpc('get_morph', { p_ids: ids.slice(0, 60) }).catch(() => ({})) : Promise.resolve({}));
const pill = (label, v, cls = '') => h('span', { class: `lvl-pill ${cls} ${v == null ? 'empty' : ''}` }, `${label} ${v == null ? '—' : v}`);

function nounTable(m, open, word) {
  const rows = nounRows(m);
  if (!rows.length) return h('p', { class: 'muted' }, '—');
  const n = m.n;
  return h('div', { class: 'conj-card' },
    word ? flagButton(() => reportSheet({ word, kind: 'decl', title: tx('declTitle'), rows })) : null,
    h('div', { class: 'conj-sub muted' }, `${tx('gender')}: ${n.g} · ${tx('decl', n.decl)}`),
    rows.map((r) => {
      const closed = r.key !== 'sg' && open && !open.has(r.key);
      return h('div', { class: `conj-row sv-row ${closed ? 'not-studied' : ''}` },
        h('span', { class: 'conj-p sv-label' }, r.label, closed ? h('span', { class: 'chip tiny-chip' }, tx('notStudied')) : null),
        h('div', { class: 'conj-cell' }, h('b', {}, r.form), r.none ? h('div', { class: 'conj-tr' }, tx('noPlural')) : null));
    }));
}

export async function declSheet(noun, app) {
  const [morphs, st] = await Promise.all([loadMorph([noun.id]), rpc('get_morph_state').catch(() => ({}))]);
  const close = sheet(
    h('div', { class: 'label' }, tx('declTitle')),
    h('h3', {}, noun.uz, h('span', { class: 'muted' }, ` — ${noun.ru}`)),
    app ? h('button', { class: 'btn btn-big', type: 'button', onClick: () => { close(); app.go('decl', { noun }); } }, icon('practice'), tx('trainDeclThis')) : null,
    nounTable(morphs[noun.id], openNounForms(st), noun));
}

export async function renderDecl(app, params = {}) {
  if (params.noun) return renderNoun(app, params.noun);
  if (params.train) return startTraining(app, params.nouns);
  mount(spinner('…'));
  const data = await rpc('get_nouns');
  const nouns = data.nouns || [];
  const st = data.state || {};
  const open = openNounForms(st);
  let q = '';
  const list = h('div', {});
  const draw = () => {
    const ql = q.toLowerCase();
    const rows = q ? nouns.filter((v) => v.u.toLowerCase().includes(ql) || (v.r || '').toLowerCase().includes(ql) || (v.e || '').toLowerCase().includes(ql)) : nouns;
    list.replaceChildren(...CEFRS.map((cefr) => {
      const lv = rows.filter((v) => v.c === cefr);
      if (!lv.length) return null;
      // длинные списки: показываем первые 80, остальные — поиском
      return h('div', {},
        h('div', { class: 'lv-head' }, h('b', {}, cefr), h('span', { class: 'muted small' }, tx('nNouns', lv.length))),
        h('div', { class: 'card dict-card' }, lv.slice(0, q ? 200 : 80).map((v) => h('button', { class: 'dict-row', type: 'button',
          onClick: () => app.go('decl', { noun: { id: v.i, uz: v.u, ru: meaning(v) } }) },
          h('div', { class: 'dict-main' }, h('b', {}, v.u), h('div', { class: 'small muted' }, meaning(v)),
            v.l != null || v.d != null ? h('div', { class: 'pill-row' }, pill(tx('lvWord'), v.l), pill(tx('lvDecl'), v.d, 'gold')) : null),
          icon('chevron', 'ic chev')))));
    }).filter(Boolean));
  };
  const search = h('input', { class: 'answer-input dict-search', type: 'search', placeholder: tx('search'),
    onInput: () => { q = search.value.trim(); draw(); } });
  draw();
  const mine = nouns.filter((v) => v.l != null)
    .sort((a, b) => ((b.dd ? 1 : 0) - (a.dd ? 1 : 0)) || (a.d ?? -1) - (b.d ?? -1))
    .map((v) => ({ id: v.i, uz: v.u, ru: meaning(v) }));
  mount(h('div', { class: 'screen' },
    h('h1', {}, tx('declTitle')),
    h('p', { class: 'muted small' }, tx('declSub')),
    h('div', { class: 'card note' }, icon('grammar'),
      h('div', { class: 'small' }, open.size ? tx('openNoun', open.size, 3) : tx('openNoneNoun'),
        h('div', { class: 'tiny muted' }, tx('cap', st.decl_cap || 1)))),
    h('button', { class: 'btn', type: 'button', disabled: !open.size, onClick: () => app.go('decl', { train: true, nouns: mine.slice(0, 8) }) },
      icon('practice'), tx('trainDecl')),
    search, list));
}

async function renderNoun(app, noun) {
  mount(spinner('…'));
  const [morphs, st] = await Promise.all([loadMorph([noun.id]), rpc('get_morph_state').catch(() => ({}))]);
  const open = openNounForms(st);
  mount(h('div', { class: 'screen' },
    h('div', { class: 'label' }, tx('declTitle')),
    h('h1', {}, noun.uz), h('p', { class: 'muted' }, noun.ru),
    h('button', { class: 'btn', type: 'button', disabled: !open.size, onClick: () => app.go('decl', { train: true, nouns: [noun] }) }, icon('practice'), tx('trainDeclThis')),
    open.size ? null : h('p', { class: 'small muted' }, tx('noOpen')),
    nounTable(morphs[noun.id], open, noun)));
}

// упражнение: по каждому существительному — открытые формы (опр. ед., мн., опр. мн.)
async function startTraining(app, nouns) {
  mount(spinner('…'));
  const st = await rpc('get_morph_state').catch(() => ({}));
  const open = NOUN_DRILL.filter((k) => openNounForms(st).has(k));
  const list = (nouns || []).filter(Boolean);
  if (!list.length || !open.length) {
    mount(h('div', { class: 'screen' }, h('div', { class: 'card empty' }, icon('grammar'), h('p', {}, list.length ? tx('noOpen') : tx('noWords'))),
      h('button', { class: 'btn', type: 'button', onClick: () => app.replace('decl', {}) }, tx('back'))));
    return;
  }
  const morphs = await loadMorph(list.map((v) => v.id));
  const tasks = list.filter((v) => morphs[v.id] && morphs[v.id].n)
    .map((noun) => ({ noun, keys: open.filter((k) => morphs[noun.id].n[k]) })).filter((x) => x.keys.length);
  const score = [];
  let i = 0;
  let lastFocus = null;
  const step = () => {
    if (i >= tasks.length) return finish();
    lastFocus = null;
    const { noun, keys } = tasks[i];
    const n = morphs[noun.id].n;
    const inputs = keys.map((k) => ({ k, inp: h('input', { class: 'answer-input', type: 'text', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false' }), res: h('div', { class: 'small' }) }));
    const btn = h('button', { class: 'btn btn-big', type: 'button' }, tx('check'));
    let checked = false;
    const doCheck = () => {
      if (checked) { i++; step(); return; }
      checked = true;
      let ok = 0;
      for (const x of inputs) {
        const right = formOk(x.inp.value, n[x.k]);
        if (right) ok++;
        x.inp.disabled = true;
        x.inp.classList.add(right ? 'ok' : 'bad');
        x.res.className = `small ${right ? 'ok' : 'err'}`;
        x.res.textContent = right ? tx('right') : `${tx('wrong')} ${n[x.k]}`;
      }
      haptic(ok === inputs.length ? 'success' : 'error');
      score.push([noun, ok, inputs.length]);
      btn.textContent = tx('next');
    };
    btn.addEventListener('click', doCheck);
    inputs.forEach((x, k) => {
      x.inp.addEventListener('focus', () => { lastFocus = x.inp; });
      x.inp.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (inputs[k + 1] && !checked) inputs[k + 1].inp.focus(); else doCheck();
      });
    });
    mount(h('div', { class: 'screen' },
      h('div', { class: 'row' }, h('span', { class: 'muted small' }, `${i + 1}/${tasks.length}`)),
      h('div', { class: 'card' },
        h('div', { class: 'label' }, tx('fillAll')),
        h('div', { class: 'sv-word' }, `${n.g} ${n.sg}`), h('p', { class: 'muted' }, noun.ru),
        inputs.map((x) => h('div', { class: 'sv-drill' }, h('div', { class: 'small muted' }, tx(x.k)), x.inp, x.res))),
      langKeyboard(() => lastFocus || inputs[0].inp),
      btn));
    inputs[0].inp.focus();
  };
  const finish = async () => {
    mount(spinner('…'));
    const res = await Promise.all(score.map(([noun, a, b]) =>
      rpc('answer_morph', { p_word: noun.id, p_kind: 'decl', p_ok: a, p_total: b }).catch(() => null)));
    const ok = score.reduce((s, x) => s + x[1], 0), all = score.reduce((s, x) => s + x[2], 0);
    mount(h('div', { class: 'screen' },
      h('div', { class: 'card center-text' }, h('div', { class: 'result-icon' }, icon('check')), h('h2', {}, tx('result', ok, all)),
        score.map(([noun, a, b], k) => h('p', { class: 'small' }, `${noun.uz}: ${a}/${b}`, res[k] && res[k].level != null ? ` · ${tx('levelNow', res[k].level)}` : ''))),
      h('button', { class: 'btn', type: 'button', onClick: () => startTraining(app, list) }, tx('again')),
      h('button', { class: 'btn btn-secondary', type: 'button', onClick: () => app.replace('decl', {}) }, tx('back'))));
  };
  step();
}
