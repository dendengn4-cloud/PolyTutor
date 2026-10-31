// Экран сеанса: карточки новых слов и упражнения (уровни слов меняются по правилам сервера).
import { rpc, tg } from '../api.js';
import { t } from '../i18n.js';
import { h, mount, spinner } from '../ui.js';
import { icon } from '../icons.js';
import { nextButton } from '../recommend.js';
import { Session } from '../session.js';
import { renderCard, renderExercise } from '../exercise-view.js';
import { focusOn, focusSound, focusTimer, answerSound, FOCUS_BLOCK, FOCUS_TIMER } from '../focus.js';

export async function renderLearn(app, { mode = 'normal', topicId = null }) {
  mount(spinner(t('loading')));
  const data = await rpc('start_session', { p_mode: mode, p_topic_id: topicId });
  const message = (text, ...buttons) => mount(h('div', { class: 'screen' }, h('div', { class: 'card empty' },
    icon('sparkle'), h('p', {}, text), ...buttons)));

  if (data.error === 'daily_limit') {
    message(t('dailyLimit'),
      h('button', { class: 'btn', onClick: () => app.go('subscription') }, t('toSubscription')),
      h('button', { class: 'btn btn-secondary', onClick: () => app.home() }, t('toHome')));
    return;
  }
  if (data.error === 'level_locked' || data.error === 'locked_tier') {
    message((t('topicErr') || {})[data.error], h('button', { class: 'btn', onClick: () => app.back() }, t('back')));
    return;
  }
  if (data.error) throw new Error(data.error);
  if (!data.items.length) {
    // в «Повторении» новых слов нет: если повторять нечего — предлагаем изучить новые
    if (mode === 'review') {
      message(t('emptyReview'), h('button', { class: 'btn', onClick: () => app.replace('learn', { mode: 'normal' }) }, t('secLearn')),
        h('button', { class: 'btn btn-secondary', onClick: () => app.home() }, t('toHome')));
      return;
    }
    message(t('emptySession'), h('button', { class: 'btn', onClick: () => app.home() }, t('toHome')));
    return;
  }

  const audioEnabled = !(app.me.settings && app.me.settings.audio_exercises === false);
  const focus = focusOn(app.me);
  const sound = focusSound(app.me);
  const timerOn = focusTimer(app.me);
  const session = new Session(data, { audio: audioEnabled, focusBlock: focus ? FOCUS_BLOCK : 0 });
  // режим фокуса: счёт заданий в текущем блоке и таймер блока
  const block = { done: 0, answers: 0, correct: 0, startedAt: Date.now(), n: 0 };
  let tick = null;
  const stopTick = () => { if (tick) { clearInterval(tick); tick = null; } };
  const webApp = tg();
  if (webApp && webApp.enableClosingConfirmation) webApp.enableClosingConfirmation();
  app.cleanup = () => {
    stopTick();
    session.flush();
    if (webApp && webApp.disableClosingConfirmation) webApp.disableClosingConfirmation();
  };

  const timerText = () => {
    const left = FOCUS_TIMER - Math.floor((Date.now() - block.startedAt) / 1000);
    return left >= 0 ? `0:${String(left).padStart(2, '0')}` : t('focusOvertime');
  };
  const frame = (content) => {
    if (focus) {
      // шкала из шагов текущего блока: ● пройдено, ◉ сейчас, ○ впереди
      const size = block.done + session.blockLeft + 1;
      const steps = h('div', { class: 'focus-steps', 'aria-label': `${block.done + 1}/${size}` },
        Array.from({ length: Math.min(size, 14) }, (_, i) => h('span', { class: `fs-dot ${i < block.done ? 'done' : i === block.done ? 'now' : ''}` })));
      const timer = timerOn ? h('span', { class: 'focus-timer' }, timerText()) : null;
      stopTick();
      if (timer) tick = setInterval(() => { timer.textContent = timerText(); }, 1000);
      return h('div', { class: 'screen session focus-session' },
        h('div', { class: 'session-top' }, steps, timer),
        session.saveFailed ? h('p', { class: 'warn small' }, t('saveError')) : null,
        content);
    }
    const pct = Math.round((session.done / Math.max(session.total, 1)) * 100);
    return h('div', { class: 'screen session' },
      h('div', { class: 'session-top' },
        h('div', { class: 'progress' }, h('div', { class: 'bar', style: { width: `${pct}%` } })),
        h('span', { class: 'counter' }, `${session.done}/${session.total}`)),
      session.saveFailed ? h('p', { class: 'warn small' }, t('saveError')) : null,
      content);
  };

  // пауза между блоками: «Ещё 5» или «Закончить»
  const pause = () => {
    stopTick();
    const secs = Math.round((Date.now() - block.startedAt) / 1000);
    block.n++;
    mount(h('div', { class: 'screen focus-pause' },
      h('div', { class: 'card result-hero' },
        h('div', { class: 'result-icon ok' }, icon('check')),
        h('h1', {}, t('focusBlockDone')),
        block.answers ? h('p', { class: 'muted' }, t('doneStats', block.correct, block.answers)) : null,
        timerOn ? h('p', { class: 'muted' }, secs <= FOCUS_TIMER ? t('focusInTime', secs) : t('focusTime', secs)) : null),
      h('button', { class: 'btn btn-big', type: 'button', onClick: () => {
        Object.assign(block, { done: 0, answers: 0, correct: 0, startedAt: Date.now() });
        step();
      } }, t('focusMore', FOCUS_BLOCK)),
      h('button', { class: 'btn btn-secondary', type: 'button', onClick: () => finish() }, t('focusStop'))));
  };

  const step = () => {
    const task = session.next();
    if (!task) return finish();
    if (task.kind === 'pause') return pause();
    const done = () => { block.done++; step(); };
    if (task.kind === 'card') {
      session.cardShown(task.item);
      return mount(frame(renderCard(task.item, { audioEnabled, onNext: done })));
    }
    return mount(frame(renderExercise(task.ex, {
      audioEnabled,
      onAnswer: (answerText) => {
        const ok = session.answer(task, answerText).correct;
        block.answers++;
        if (ok) block.correct++;
        if (sound) answerSound(ok);
        return ok;
      },
      onNext: done,
    })));
  };

  async function finish() {
    stopTick();
    mount(spinner(t('loading')));
    const r = await session.finish();
    app.cleanup && app.cleanup();
    app.cleanup = null;
    const pct = r.answers ? Math.round((r.correct / r.answers) * 100) : 0;
    const nb = await nextButton(app);
    mount(h('div', { class: 'screen' },
      h('div', { class: 'card result-hero' },
        h('div', { class: 'result-icon ok' }, icon('trophy')),
        h('h1', {}, t('sessionDone')),
        h('div', { class: 'big' }, `${pct}%`),
        h('p', { class: 'muted' }, t('doneStats', r.correct, r.answers)),
        h('div', { class: 'stats two' },
          h('div', { class: 'stat' }, h('b', {}, String(r.newWords)), h('span', {}, t('planNew'))),
          h('div', { class: 'stat' }, h('b', {}, String(r.reviewed)), h('span', {}, t('planReview'))))),
      nb,
      app.me.tier !== 'free'
        ? h('button', { class: `btn ${nb ? 'btn-secondary' : 'btn-big'}`, onClick: () => app.replace('learn', { mode: 'normal' }) }, t('anotherSession'))
        : null,
      h('button', { class: 'btn btn-secondary', onClick: () => app.home() }, t('toHome'))));
  }

  step();
}
