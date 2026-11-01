// Корейская экранная клавиатура (두벌식, как на корейских телефонах и компьютерах) со сборкой слогов:
// ㅎ + ㅏ + ㄴ → 한, ㄷ + ㅏ + ㄹ + ㄱ → 닭; гласная после патчхима забирает его в новый слог (한 + ㅏ → 하나).
// ⇧ — двойные согласные и ㅒ ㅖ. Включена — системная клавиатура не выскакивает (inputmode="none"); выключить — «⌨».
import { h, haptic } from '../ui.js';
import { t } from '../i18n.js';
import { L, V, T, T_JOIN, T_SPLIT, V_JOIN, V_SPLIT, decompose, compose, isSyl } from './hangul.js';

const ROWS = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'],
];
const SHIFT = { 'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ', 'ㅐ': 'ㅒ', 'ㅔ': 'ㅖ' };
const NO_BATCHIM = new Set(['ㄸ', 'ㅃ', 'ㅉ']);
const PREF = 'ko_keyboard';

function prefOn() {
  try { return localStorage.getItem(PREF) !== 'off'; } catch { return true; }
}
function savePref(on) {
  try { localStorage.setItem(PREF, on ? 'on' : 'off'); } catch { /* приватный режим */ }
}

// замена n символов перед курсором на text
function replaceBefore(input, n, text) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const from = Math.max(0, start - n);
  input.value = input.value.slice(0, from) + text + input.value.slice(end);
  const pos = from + text.length;
  try { input.setSelectionRange(pos, pos); } catch { /* ignore */ }
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
const prevChar = (input) => {
  const start = input.selectionStart ?? input.value.length;
  return start > 0 && input.selectionStart === input.selectionEnd ? input.value[start - 1] : '';
};

// ввод одной буквы со сборкой слога
export function typeJamo(input, j) {
  const p = prevChar(input);
  const d = isSyl(p) ? decompose(p) : null;
  if (!V.includes(j)) {                                   // согласная
    if (d && !d.t && T.includes(j) && !NO_BATCHIM.has(j)) return replaceBefore(input, 1, compose(d.l, d.v, j));
    if (d && d.t && T_JOIN[d.t + j]) return replaceBefore(input, 1, compose(d.l, d.v, T_JOIN[d.t + j]));
    return replaceBefore(input, 0, j);
  }
  // гласная
  if (L.includes(p)) return replaceBefore(input, 1, compose(p, j));
  if (d && d.t) {
    if (T_SPLIT[d.t]) { const [a, b] = T_SPLIT[d.t]; return replaceBefore(input, 1, compose(d.l, d.v, a) + compose(b, j)); }
    if (L.includes(d.t)) return replaceBefore(input, 1, compose(d.l, d.v, '') + compose(d.t, j));
  }
  if (d && !d.t && V_JOIN[d.v + j]) return replaceBefore(input, 1, compose(d.l, V_JOIN[d.v + j], ''));
  if (V_JOIN[p + j]) return replaceBefore(input, 1, V_JOIN[p + j]);
  return replaceBefore(input, 0, j);
}

// стирание по буквам: 닭 → 달 → 다 → ㄷ → (пусто)
export function backJamo(input) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  if (start !== end) return replaceBefore(input, 0, '');
  const p = prevChar(input);
  if (!p) return;
  const d = isSyl(p) ? decompose(p) : null;
  if (!d) return replaceBefore(input, 1, V_SPLIT[p] ? V_SPLIT[p][0] : '');
  if (d.t) return replaceBefore(input, 1, compose(d.l, d.v, T_SPLIT[d.t] ? T_SPLIT[d.t][0] : ''));
  if (V_SPLIT[d.v]) return replaceBefore(input, 1, compose(d.l, V_SPLIT[d.v][0], ''));
  return replaceBefore(input, 1, d.l);
}

// Элемент: переключатель и (если включена) клавиатура. input — поле, массив полей или функция, которая возвращает поле.
export function langKeyboard(input, { onEnter } = {}) {
  const getter = typeof input === 'function' ? input : null;
  const fields = getter ? [] : (Array.isArray(input) ? input.filter(Boolean) : [input]);
  let current = fields[0];
  for (const f of fields) f.addEventListener('focus', () => { current = f; });
  const target = () => (getter ? getter() : current);
  let on = prefOn();
  let shift = false;
  const keys = [];
  const key = (label, fn, cls = '') => {
    const b = h('button', {
      class: `hk-key ${cls}`, type: 'button', tabindex: '-1',
      onPointerdown: (e) => e.preventDefault(),            // поле ввода не теряет фокус и курсор
      onClick: () => { haptic(); const el = target(); if (el) fn(el); },
    }, label);
    return b;
  };
  const drawShift = () => keys.forEach(([b, j]) => { b.textContent = shift && SHIFT[j] ? SHIFT[j] : j; });
  const rows = ROWS.map((row, i) => h('div', { class: 'hk-row' },
    i === 2 ? key('⇧', () => { shift = !shift; drawShift(); }, 'hk-wide hk-shift') : null,
    row.map((j) => {
      const b = key(j, (el) => { typeJamo(el, shift && SHIFT[j] ? SHIFT[j] : j); if (shift) { shift = false; drawShift(); } });
      keys.push([b, j]);
      return b;
    }),
    i === 2 ? key('⌫', (el) => backJamo(el), 'hk-wide') : null));
  const grid = h('div', { class: 'hk-grid hk-ko' }, rows,
    h('div', { class: 'hk-row' },
      key('?', (el) => replaceBefore(el, 0, '?'), 'hk-wide'),
      key(t('kbSpace'), (el) => replaceBefore(el, 0, ' '), 'hk-space'),
      key('.', (el) => replaceBefore(el, 0, '.'), 'hk-wide'),
      onEnter ? key('↵', () => onEnter(), 'hk-wide hk-enter') : null));
  const toggle = h('button', { class: 'chip-btn hk-toggle', type: 'button' });
  const allFields = () => (getter ? [getter()].filter(Boolean) : fields);
  const apply = () => {
    grid.hidden = !on;
    for (const f of allFields()) f.setAttribute('inputmode', on ? 'none' : 'text');
    toggle.textContent = on ? `⌨ ${t('kbSystem')}` : '⌨ 한글';
  };
  toggle.addEventListener('click', () => {
    on = !on; savePref(on); apply();
    const el = target(); if (el) { el.blur(); setTimeout(() => el.focus(), 30); }
  });
  apply();
  return h('div', { class: 'hk' }, h('div', { class: 'helper-row' }, toggle), grid);
}
