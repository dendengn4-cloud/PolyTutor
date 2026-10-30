// Пробный экзамен на гражданство (шведский курс обществознания): 40 случайных вопросов из тем курса,
// для сдачи — 70% (как на первом medborgarskapsprovet, 28 из 40). Тренажёр: результат не сохраняется,
// после каждого ответа — верный вариант и цитата из темы.
import { rpc } from '../api.js';
import { t, getLang, tierName } from '../i18n.js';
import { h, mount, spinner, haptic } from '../ui.js';
import { icon } from '../icons.js';

export async function renderExam(app) {
  mount(spinner(t('loading')));
  const data = await rpc('civics_exam');
  if (data.error === 'locked_tier') {
    mount(h('div', { class: 'screen' }, h('h1', {}, t('examTitle')),
      h('div', { class: 'card note gold' }, icon('lock'), h('div', {}, h('div', {}, t('lockedTier', tierName(data.need))),
        h('button', { class: 'btn btn-small', type: 'button', onClick: () => app.go('subscription', { tier: data.need }) }, t('toSubscription'))))));
    return;
  }
  if (data.error) throw new Error(data.error);
  const qs = data.questions || [];
  const L = getLang() === 'en' ? 'en' : getLang() === 'ru' ? 'ru' : 'uz';   // uz — колонки изучаемого языка
  let i = 0, ok = 0;
  const wrong = [];
  const step = () => {
    if (i >= qs.length) return finish();
    const q = qs[i];
    const opts = q[`o_${L}`] || q.o_ru;
    let answered = false;
    const fb = h('div', {});
    const next = h('button', { class: 'btn btn-big', type: 'button', hidden: true, onClick: () => { i++; step(); } }, t('next'));
    const buttons = opts.map((o, k) => h('button', { class: 'option', type: 'button', onClick: () => {
      if (answered) return;
      answered = true;
      const right = k === q.c;
      if (right) ok++; else wrong.push(q);
      haptic(right ? 'success' : 'error');
      buttons.forEach((b, n) => { b.disabled = true; if (n === q.c) b.classList.add('right'); else if (n === k) b.classList.add('wrong'); });
      fb.replaceChildren(h('div', { class: `small ${right ? 'ok' : 'err'}` }, right ? t('examRight') : t('examWrong', opts[q.c])),
        q.quote ? h('div', { class: 'quote small' }, icon('learn'), h('span', {}, `«${q.quote}»`)) : '');
      next.hidden = false;
    } }, o));
    mount(h('div', { class: 'screen' },
      h('div', { class: 'row' }, h('span', { class: 'muted small' }, `${i + 1}/${qs.length}`), h('span', { class: 'spacer' }),
        h('span', { class: 'chip' }, t('examScore', ok))),
      h('div', { class: 'track', style: { margin: '6px 0 12px' } }, h('div', { class: 'fill strong', style: { width: `${Math.round((i / qs.length) * 100)}%` } })),
      h('div', { class: 'label' }, q[`unit_${L}`] || q.unit),
      h('div', { class: 'card' }, h('p', {}, h('b', {}, q[`p_${L}`] || q.p_ru)), h('div', { class: 'options' }, buttons)),
      fb, next));
  };
  const finish = () => {
    const pct = qs.length ? ok / qs.length : 0;
    const passed = pct >= (data.pass || 0.7);
    haptic(passed ? 'success' : 'error');
    mount(h('div', { class: 'screen' },
      h('div', { class: 'card center-text' },
        h('div', { class: 'result-icon' }, icon(passed ? 'trophy' : 'target')),
        h('h2', {}, t(passed ? 'examPassed' : 'examFailed')),
        h('p', {}, t('examResult', ok, qs.length, Math.round(pct * 100))),
        h('p', { class: 'small muted' }, t('examNote'))),
      wrong.length ? [h('h2', {}, t('examReview')), h('div', { class: 'card' }, wrong.map((q) => h('div', { class: 'pay-row' },
        h('div', {}, h('b', {}, q[`p_${L}`] || q.p_ru), h('div', { class: 'small ok' }, (q[`o_${L}`] || q.o_ru)[q.c])))))] : null,
      h('button', { class: 'btn', type: 'button', onClick: () => renderExam(app) }, t('examAgain')),
      h('button', { class: 'btn btn-secondary', type: 'button', onClick: () => app.back() }, t('back'))));
  };
  if (!qs.length) { mount(h('div', { class: 'screen' }, h('div', { class: 'card empty' }, h('p', {}, t('examEmpty'))))); return; }
  step();
}
