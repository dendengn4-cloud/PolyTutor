// Режимы внимания (Настройки → «Режим внимания»), для тех, кому трудно удерживать внимание (СДВГ):
//   off   — обычный режим;
//   focus — «Фокусировка»: занятие блоками по 5 слов с паузой «ещё 5», мгновенный отклик (звук и вибрация),
//           задания разных типов подряд, таймер по желанию, мягкая серия дней, в темах — сначала выжимка;
//   max   — «Максимальная фокусировка»: всё из focus + спокойная тема с цветами по смыслу (оранжевый — срочное,
//           бирюзовый — учёба, нейтральный фон), без украшений, всплывающих окон и резких анимаций.
// Режим хранится в профиле (settings.focus) и в памяти телефона — чтобы оформление не мигало при запуске.
const KEY = 'ut_focus';
export const FOCUS_BLOCK = 5;          // слов в одном блоке занятия
export const FOCUS_TIMER = 60;         // секунд на блок (если таймер включён)

export function focusMode(me) {
  const m = me && me.settings && me.settings.focus;
  return m === 'focus' || m === 'max' ? m : 'off';
}
export const focusOn = (me) => focusMode(me) !== 'off';
export const focusSound = (me) => focusOn(me) && !(me.settings && me.settings.focus_sound === false);
export const focusTimer = (me) => focusOn(me) && Boolean(me.settings && me.settings.focus_timer);

export function currentFocus() {
  return document.documentElement.dataset.focus || 'off';
}

export function applyFocus(mode) {
  const m = mode === 'focus' || mode === 'max' ? mode : 'off';
  document.documentElement.dataset.focus = m;
  try { localStorage.setItem(KEY, m); } catch { /* нет доступа */ }
}

export function initFocus() {
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch { /* нет доступа */ }
  applyFocus(saved || 'off');
}

// ---------------------------------------------------------------- звук ответа
// Короткий мягкий сигнал без файлов: верно — два восходящих тона, неверно — один низкий приглушённый.
let ctx = null;
export function answerSound(correct) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === 'suspended') ctx.resume();
    const notes = correct ? [[660, 0], [880, 0.09]] : [[220, 0]];
    for (const [freq, at] of notes) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      const t0 = ctx.currentTime + at;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(correct ? 0.12 : 0.08, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (correct ? 0.18 : 0.25));
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + 0.3);
    }
  } catch { /* звук недоступен — не страшно */ }
}
