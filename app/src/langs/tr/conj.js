// Формы турецкого глагола и существительного: таблицы и упражнения пока не включены (features.js → MORPH: false).
// Модуль даёт общему коду те же имена, что у других языков: кнопок «Спряжение» и «Склонение» нет,
// а если экран всё же открыт (старая ссылка), показывается «Этого раздела нет в турецком курсе».
import { t } from '../i18n.js';
import { h, mount } from '../ui.js';

let appRef = null;
export function setConjApp(a) { appRef = a; }

export const canConjugate = () => false;
export const canDecline = () => false;
export async function conjSheet() { return null; }
export async function declSheet() { return null; }

export function unavailable(app = appRef) {
  mount(h('div', { class: 'screen' },
    h('p', { class: 'muted' }, t('featureUnavailable')),
    h('button', { class: 'btn btn-big', type: 'button', onClick: () => app && app.back() }, t('back'))));
}

export async function renderConj(app) { unavailable(app); }
