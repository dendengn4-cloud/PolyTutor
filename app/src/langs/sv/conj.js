// Спряжение: в шведской версии таблиц форм нет — раздел выключен (FEATURES.MORPH = false).
// Экспорты те же, что у других языков, чтобы общий код работал без изменений.
import { t } from '../i18n.js';
import { h, mount } from '../ui.js';
import { declSheet as declSheetImpl } from './decl.js';

let appRef = null;
export function setConjApp(a) { appRef = a; }
export async function conjSheet() { return null; }
export const declSheet = (noun, app = appRef) => declSheetImpl(noun, app);
export const canConjugate = () => false;
export const canDecline = () => false;
export async function renderConj(app) {
  mount(h('div', { class: 'screen' },
    h('p', { class: 'muted' }, t('featureUnavailable')),
    h('button', { class: 'btn btn-primary', type: 'button', onClick: () => app.home() }, t('back'))));
}
