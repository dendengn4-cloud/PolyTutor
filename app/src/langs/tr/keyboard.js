// Ввод турецких букв, которых может не быть на телефонной клавиатуре: кнопки ç ğ ı ö ş ü под полем ответа.
// Общий код вызывает langKeyboard(input, { onEnter }) — у каждого языка своя «клавиатура».
import { h } from '../ui.js';

// input — поле ответа или функция, которая его возвращает (несколько полей: пишем в то, где был курсор)
export function langKeyboard(input) {
  const add = (s) => () => {
    const el = typeof input === 'function' ? input() : input;
    if (!el) return;
    el.value += s;
    el.focus();
  };
  return h('div', { class: 'helper-row' },
    ...['ç', 'ğ', 'ı', 'İ', 'ö', 'ş', 'ü'].map((ch) => h('button', { class: 'chip-btn', type: 'button', onClick: add(ch) }, ch)));
}
