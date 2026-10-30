// Склонение: в шведском падежей нет — раздел выключен (FEATURES.MORPH = false). Экран — заглушка на случай прямой ссылки.
import { t } from '../i18n.js';
import { h, mount } from '../ui.js';

export async function declSheet() { return null; }
export async function renderDecl(app) {
  mount(h('div', { class: 'screen' },
    h('p', { class: 'muted' }, t('featureUnavailable')),
    h('button', { class: 'btn btn-primary', type: 'button', onClick: () => app.home() }, t('back'))));
}
