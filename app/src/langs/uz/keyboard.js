// Ввод узбекских букв, которых обычно нет на телефонной клавиатуре: кнопки oʻ, gʻ, ʼ под полем ответа
// (как в Uzbek Tutor). Общий код вызывает langKeyboard(input, { onEnter }) — у каждого языка своя «клавиатура».
import { h } from '../ui.js';

export function langKeyboard(input) {
  const add = (s) => () => {
    input.value += s;
    input.focus();
  };
  return h('div', { class: 'helper-row' },
    h('button', { class: 'chip-btn', type: 'button', onClick: add('oʻ') }, 'oʻ'),
    h('button', { class: 'chip-btn', type: 'button', onClick: add('gʻ') }, 'gʻ'),
    h('button', { class: 'chip-btn', type: 'button', onClick: add('ʼ') }, 'ʼ'));
}
