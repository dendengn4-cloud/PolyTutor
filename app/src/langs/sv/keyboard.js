// Ввод шведских букв, которых может не быть на телефонной клавиатуре: кнопки å, ä, ö, é под полем ответа.
// Общий код вызывает langKeyboard(input, { onEnter }) — у каждого языка своя «клавиатура».
import { h } from '../ui.js';

export function langKeyboard(input) {
  const add = (s) => () => {
    input.value += s;
    input.focus();
  };
  return h('div', { class: 'helper-row' },
    ...['å', 'ä', 'ö', 'é'].map((ch) => h('button', { class: 'chip-btn', type: 'button', onClick: add(ch) }, ch)));
}
