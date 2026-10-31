// Формы турецкого глагола: список глаголов словаря по уровням, таблица времён по лицам и два упражнения со своими уровнями:
//   • «Напишите форму» (уровень «форма») — одна форма за вопрос (время + лицо);
//   • «Все лица» (уровень «таблица») — одно время сразу во всех лицах.
// Времена открываются по прочитанным темам грамматики (forms.js → VERB_TOPIC); потолок уровня — в get_verbs.state.
import { rpc } from '../api.js';
import { FEATURES } from './features.js';
import { getLang } from '../i18n.js';
import { h, mount, spinner, sheet, haptic } from '../ui.js';
import { icon } from '../icons.js';
import { langKeyboard } from './keyboard.js';
import { NOUN_IDS, VERB_IDS } from './nouns.js';
import { tx, verbRows, verbSlot, aorType, openVerbForms, personsOf, formOk } from './forms.js';
import { declSheet as declSheetImpl } from './decl.js';
import { reportSheet, flagButton } from './report.js';

let appRef = null;
export function setConjApp(a) { appRef = a; }

const CEFRS = ['A1', 'A2', 'B1', 'B2'];
const meaning = (v) => (getLang() === 'en' && v.e ? v.e : v.r);
export const loadMorph = (ids) => (ids.length ? rpc('get_morph', { p_ids: ids.slice(0, 60) }).catch(() => ({})) : Promise.resolve({}));
export const pill = (label, v, cls = '') => h('span', { class: `lvl-pill ${cls} ${v == null ? 'empty' : ''}` }, `${label} ${v == null ? '—' : v}`);
const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

export const canConjugate = (word) => FEATURES.MORPH && word && VERB_IDS.has(Number(word.id));
export const canDecline = (word) => FEATURES.MORPH && word && NOUN_IDS.has(Number(word.id));
export const declSheet = (noun, app = appRef) => declSheetImpl(noun, app);

// ---------------------------------------------------------------- таблица
function verbTable(m, open, state, redraw, word) {
  const rows = verbRows(m);
  if (!rows.length) return h('p', { class: 'muted' }, '—');
  const isOpen = (r) => r.key === 'inf' || !open || open.has(r.key);
  const studied = rows.filter(isOpen);
  const rest = rows.filter((r) => !isOpen(r));
  const row = (r, closed) => h('div', { class: `conj-row sv-row ${closed ? 'not-studied' : ''}` },
    h('span', { class: 'conj-p sv-label' }, r.label, closed ? h('span', { class: 'chip tiny-chip' }, tx('notStudied')) : null),
    h('div', { class: 'conj-cell' }, r.forms.length === 1
      ? h('b', {}, r.forms[0].f)
      : h('div', { class: 'tr-persons' }, r.forms.map((x) => h('div', { class: 'tr-person' }, h('span', { class: 'muted small' }, x.p), ' ', h('b', {}, x.f))))));
  const flatRows = rows.flatMap((r) => r.forms.map((x) => ({ key: r.key, label: x.p ? `${r.label} · ${x.p}` : r.label, form: x.f })));
  const out = [h('div', { class: 'conj-card' },
    word ? flagButton(() => reportSheet({ word, kind: 'conj', title: tx('conjTitle'), rows: flatRows })) : null,
    h('div', { class: 'conj-sub muted' }, aorType(m.v)),
    studied.map((r) => row(r, false)),
    rest.length && state.showAll ? rest.map((r) => row(r, true)) : null,
    h('p', { class: 'tiny muted' }, tx('hint')))];
  if (rest.length) {
    out.push(h('button', { class: 'more-toggle', type: 'button', onClick: () => { state.showAll = !state.showAll; redraw(); } },
      state.showAll ? tx('hideAll') : tx('showAll', rest.length), icon('chevron', `ic ${state.showAll ? 'up' : 'down'}`)));
  }
  return h('div', { class: 'conj' }, out);
}

const redrawer = (box, build) => () => box.replaceChildren(build());

// Шторка с формами — из карточки слова, задания, словаря
export async function conjSheet(verb, app = appRef) {
  const [morphs, st] = await Promise.all([loadMorph([verb.id]), rpc('get_morph_state').catch(() => ({}))]);
  const m = morphs[verb.id];
  const state = { showAll: false };
  const box = h('div', {});
  const redraw = redrawer(box, () => verbTable(m, openVerbForms(st), state, redraw, verb));
  redraw();
  const close = sheet(
    h('div', { class: 'label' }, tx('conjTitle')),
    h('h3', {}, verb.uz, h('span', { class: 'muted' }, ` — ${verb.ru}`)),
    app ? h('button', { class: 'btn btn-big', type: 'button', onClick: () => { close(); app.go('conj', { verb }); } }, icon('practice'), tx('trainTableThis')) : null,
    box);
}

// ---------------------------------------------------------------- список глаголов
export async function renderConj(app, params = {}) {
  if (params.verb) return renderVerb(app, params.verb);
  if (params.train) return startTraining(app, params.train, params.verbs);
  mount(spinner('…'));
  const data = await rpc('get_verbs');
  const verbs = (data.verbs || []).sort((a, b) => a.u.localeCompare(b.u, 'tr'));   // по турецкому алфавиту (ç после c, ı перед i)
  const st = data.state || {};
  const open = openVerbForms(st);
  let q = '';
  const list = h('div', {});
  const draw = () => {
    const ql = q.toLocaleLowerCase('tr');
    const rows = q ? verbs.filter((v) => v.u.toLocaleLowerCase('tr').includes(ql) || (v.r || '').toLowerCase().includes(ql) || (v.e || '').toLowerCase().includes(ql)) : verbs;
    list.replaceChildren(...CEFRS.map((cefr) => {
      const lv = rows.filter((v) => v.c === cefr);
      if (!lv.length) return null;
      return h('div', {},
        h('div', { class: 'lv-head' }, h('b', {}, cefr), h('span', { class: 'muted small' }, tx('nVerbs', lv.length))),
        h('div', { class: 'card dict-card' }, lv.map((v) => h('button', { class: 'dict-row', type: 'button',
          onClick: () => app.go('conj', { verb: { id: v.i, uz: v.u, ru: meaning(v) } }) },
          h('div', { class: 'dict-main' }, h('b', {}, v.u), h('div', { class: 'small muted' }, meaning(v)),
            v.l != null || v.f != null || v.t != null
              ? h('div', { class: 'pill-row' }, pill(tx('lvWord'), v.l), pill(tx('lvForm'), v.f, 'gold'), pill(tx('lvTable'), v.t, 'gold'))
              : null),
          icon('chevron', 'ic chev')))));
    }).filter(Boolean));
  };
  const search = h('input', { class: 'answer-input dict-search', type: 'search', placeholder: tx('search'),
    onInput: () => { q = search.value.trim(); draw(); } });
  draw();
  const mine = verbs.filter((v) => v.l != null);
  const pick = (key) => [...mine].sort((a, b) => ((b[`${key}d`] ? 1 : 0) - (a[`${key}d`] ? 1 : 0)) || (a[key] ?? -1) - (b[key] ?? -1))
    .map((v) => ({ id: v.i, uz: v.u, ru: meaning(v) }));
  mount(h('div', { class: 'screen' },
    h('h1', {}, tx('conjTitle')),
    h('p', { class: 'muted small' }, tx('conjSub')),
    h('div', { class: 'card note' }, icon('grammar'),
      h('div', { class: 'small' }, open.size ? tx('open', open.size, 10) : tx('openNone'),
        h('div', { class: 'tiny muted' }, tx('cap', st.conj_cap || 1)))),
    h('div', { class: 'two-btns' },
      h('button', { class: 'btn', type: 'button', disabled: !open.size, onClick: () => app.go('conj', { train: 'form', verbs: pick('f').slice(0, 10) }) },
        icon('practice'), tx('trainForm')),
      h('button', { class: 'btn', type: 'button', disabled: !open.size, onClick: () => app.go('conj', { train: 'table', verbs: pick('t').slice(0, 3) }) },
        icon('conj'), tx('trainTable'))),
    search, list));
}

// ---------------------------------------------------------------- страница глагола
async function renderVerb(app, verb) {
  mount(spinner('…'));
  const [morphs, data] = await Promise.all([loadMorph([verb.id]), rpc('get_verbs').catch(() => ({}))]);
  const m = morphs[verb.id];
  const me = (data.verbs || []).find((v) => v.i === verb.id) || {};
  const open = openVerbForms(data.state || {});
  const can = open.size > 0;
  const state = { showAll: false };
  const box = h('div', {});
  const redraw = redrawer(box, () => verbTable(m, open, state, redraw, verb));
  redraw();
  mount(h('div', { class: 'screen' },
    h('div', { class: 'label' }, tx('conjTitle')),
    h('h1', {}, verb.uz), h('p', { class: 'muted' }, verb.ru),
    h('div', { class: 'pill-row' }, pill(tx('lvWord'), me.l), pill(tx('lvForm'), me.f, 'gold'), pill(tx('lvTable'), me.t, 'gold')),
    h('div', { class: 'two-btns' },
      h('button', { class: 'btn', type: 'button', disabled: !can, onClick: () => app.go('conj', { train: 'table', verbs: [verb] }) }, icon('conj'), tx('trainTableThis')),
      h('button', { class: 'btn btn-secondary', type: 'button', disabled: !can, onClick: () => app.go('conj', { train: 'form', verbs: [verb] }) }, icon('practice'), tx('trainFormThis'))),
    can ? null : h('p', { class: 'small muted' }, tx('noOpen')),
    box));
}

// ---------------------------------------------------------------- упражнения
// kind 'form' — до 10 вопросов «время + лицо»; kind 'table' — по глаголу одно открытое время во всех лицах.
// Итог по каждому глаголу → answer_morph(слово, вид, верных, всего).
async function startTraining(app, kind, verbs) {
  mount(spinner('…'));
  const st = await rpc('get_morph_state').catch(() => ({}));
  const open = [...openVerbForms(st)];
  const list = (verbs || []).filter(Boolean);
  if (!list.length || !open.length) {
    mount(h('div', { class: 'screen' }, h('div', { class: 'card empty' }, icon('grammar'), h('p', {}, list.length ? tx('noOpen') : tx('noWords'))),
      h('button', { class: 'btn', type: 'button', onClick: () => app.replace('conj', {}) }, tx('back'))));
    return;
  }
  const morphs = await loadMorph(list.map((v) => v.id));
  const usable = list.filter((v) => morphs[v.id] && morphs[v.id].v);
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  // задания: [{verb, tense, slots:['pres.0', …]}]
  let tasks;
  if (kind === 'table') {
    tasks = usable.map((verb) => {
      const tense = rnd(open);
      return { verb, tense, slots: personsOf(tense).map((_, i) => `${tense}.${i}`) };
    });
  } else {
    tasks = [];
    for (let i = 0; tasks.length < 10 && i < 40 && usable.length; i++) {
      const verb = usable[i % usable.length];
      const tense = rnd(open);
      tasks.push({ verb, tense, slots: [`${tense}.${Math.floor(Math.random() * personsOf(tense).length)}`] });
    }
    tasks = shuffle(tasks);
  }
  const score = {};   // id → [верно, всего, глагол]
  let i = 0;
  let lastFocus = null;
  const step = () => {
    if (i >= tasks.length) return finish();
    lastFocus = null;
    const { verb, tense, slots } = tasks[i];
    const v = morphs[verb.id].v;
    const inputs = slots.map((slot) => {
      const s = verbSlot(v, slot);
      const inp = h('input', { class: 'answer-input', type: 'text', autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false' });
      return { s, inp, res: h('div', { class: 'small' }) };
    });
    const checkBtn = h('button', { class: 'btn btn-big', type: 'button' }, tx('check'));
    let checked = false;
    const doCheck = () => {
      if (checked) { i++; step(); return; }
      checked = true;
      let ok = 0;
      for (const x of inputs) {
        const right = formOk(x.inp.value, x.s.form);
        if (right) ok++;
        x.inp.disabled = true;
        x.inp.classList.add(right ? 'ok' : 'bad');
        x.res.className = `small ${right ? 'ok' : 'err'}`;
        x.res.textContent = right ? tx('right') : `${tx('wrong')} ${x.s.form}`;
      }
      haptic(ok === inputs.length ? 'success' : 'error');
      const s = score[verb.id] || (score[verb.id] = [0, 0, verb]);
      s[0] += ok; s[1] += inputs.length;
      checkBtn.textContent = tx('next');
    };
    checkBtn.addEventListener('click', doCheck);
    inputs.forEach((x, n) => x.inp.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (inputs[n + 1] && !checked) inputs[n + 1].inp.focus(); else doCheck();
    }));
    mount(h('div', { class: 'screen' },
      h('div', { class: 'row' }, h('span', { class: 'muted small' }, `${i + 1}/${tasks.length}`)),
      h('div', { class: 'card' },
        h('div', { class: 'label' }, inputs.length > 1 ? `${tx('fillAll')}: ${tx(tense)}` : tx('writeForm', inputs[0].s.label)),
        h('div', { class: 'sv-word' }, v.inf), h('p', { class: 'muted' }, verb.ru),
        inputs.map((x) => h('div', { class: 'sv-drill' }, h('div', { class: 'small muted' }, inputs.length > 1 ? x.s.short : x.s.label), x.inp, x.res))),
      langKeyboard(() => lastFocus || inputs[0].inp),
      checkBtn));
    inputs.forEach((x) => x.inp.addEventListener('focus', () => { lastFocus = x.inp; }));
    inputs[0].inp.focus();
  };
  const finish = async () => {
    mount(spinner('…'));
    const items = Object.entries(score);
    let ok = 0, all = 0;
    const res = await Promise.all(items.map(([id, [a, b]]) => {
      ok += a; all += b;
      return rpc('answer_morph', { p_word: Number(id), p_kind: kind, p_ok: a, p_total: b }).catch(() => null);
    }));
    mount(h('div', { class: 'screen' },
      h('div', { class: 'card center-text' }, h('div', { class: 'result-icon' }, icon('check')), h('h2', {}, tx('result', ok, all)),
        items.map(([, [a, b, verb]], n) => h('p', { class: 'small' }, `${verb.uz}: ${a}/${b}`, res[n] && res[n].level != null ? ` · ${tx('levelNow', res[n].level)}` : ''))),
      h('button', { class: 'btn', type: 'button', onClick: () => startTraining(app, kind, list) }, tx('again')),
      h('button', { class: 'btn btn-secondary', type: 'button', onClick: () => app.replace('conj', {}) }, tx('back'))));
  };
  step();
}
