// «Оформление»: тема, скругление углов и иконок (ползунки), картинки к словам (вкл/выкл, стиль, фон).
// Одни и те же элементы — в Настройках и на экране «Под себя» при первом входе.
import { rpc } from '../api.js';
import { t } from '../i18n.js';
import { h, haptic } from '../ui.js';
import { icon } from '../icons.js';
import { applyTheme, currentTheme } from '../theme.js';
import { applyLook, currentLook, lookOf, ROUND_PX, ICON_PCT, roundLabel, iconLabel, PIC_STYLES, PIC_BGS } from '../look.js';
import { picBox } from '../pics/index.js';

// превью тем: фон, карточка, акцент, текст
export const SWATCH = {
  telegram: ['var(--tg-theme-secondary-bg-color, #eef0f3)', 'var(--tg-theme-bg-color, #ffffff)', 'var(--tg-theme-button-color, #2481cc)', 'var(--tg-theme-text-color, #222)'],
  light: ['#f5f6f8', '#ffffff', '#0e7c86', '#15171c'],
  dark: ['#0f1115', '#181b21', '#2bb3be', '#eceef2'],
  gray: ['#e6e7ea', '#f3f3f5', '#3f6e8c', '#222327'],
  sand: ['#f3ede2', '#fbf8f2', '#1f7a8c', '#2b2620'],
  midnight: ['#0b1424', '#121d31', '#e0a43a', '#e6ecf5'],
};

export function themePicker(onPick) {
  return h('div', { class: 'themes' }, Object.entries(SWATCH).map(([name, [bg, card, accent, text]]) =>
    h('button', { type: 'button', class: `theme-opt ${name === currentTheme() ? 'active' : ''}`, onClick: () => {
      if (name === currentTheme()) return;
      applyTheme(name);          // сразу, без ожидания сервера
      onPick(name);
    } },
      h('div', { class: 'swatch', style: { background: bg } },
        h('i', { style: { background: card, width: '100%' } }),
        h('i', { style: { background: accent, width: '60%' } }),
        h('i', { style: { background: text, width: '40%', opacity: '.7' } })),
      h('span', {}, (t('themeNames') || {})[name] || name))));
}

// сохранить настройки оформления (сразу применяются на экране, на сервер — без ожидания)
export async function saveLook(app, patch) {
  applyLook({ ...currentLook(), ...patch });
  try {
    const me = await rpc('set_look', { p: patch });
    if (me && me.settings) { app.me = me; applyLook(lookOf(me)); }
  } catch (e) { console.warn('[look]', e); }
}

const seg = (items, current, onPick) => h('div', { class: 'segmented' }, items.map(([value, label]) =>
  h('button', { type: 'button', class: value === current ? 'active' : '', onClick: () => value !== current && onPick(value) }, label)));

// ползунок: подпись текущего шага меняется сразу, сохраняется при отпускании
function slider({ max, value, label, sub, aria, preview, onInput, onChange }) {
  const out = h('output', { class: 'look-out' });
  const prev = h('span', { class: `look-prev ${preview}`, 'aria-hidden': 'true' });
  const input = h('input', { type: 'range', min: '0', max: String(max), step: '1', value: String(value), 'aria-label': aria, class: 'look-range' });
  const show = (v) => {
    out.replaceChildren(label(v), h('small', {}, sub(v)));
    onInput(v, prev);
  };
  input.addEventListener('input', () => show(Number(input.value)));
  input.addEventListener('change', () => { haptic(); onChange(Number(input.value)); });
  show(value);
  return h('div', { class: 'look-slider' }, prev, input, out);
}

// блок «Оформление» (без темы): app — для сохранения; onChange — перерисовать экран (необязательно)
export function lookControls(app, { onChange } = {}) {
  const L = currentLook();
  const preview = h('div', { class: 'look-pic-prev' });
  const drawPreview = () => {
    const c = currentLook();
    preview.replaceChildren(...(c.pics ? ['cat', 'tea', 'apple'].map((k) => picBox(k, c.pics_style, c.pics_bg, 'md')) : []));
    preview.hidden = !c.pics;
  };
  drawPreview();
  // ползунки — только сохранить; переключатели — сохранить и перерисовать экран (появляются/исчезают пункты)
  const saved = (patch) => { saveLook(app, patch); drawPreview(); };
  const changed = (patch) => { saved(patch); if (onChange) onChange(); else drawPreview(); };

  const round = slider({
    max: ROUND_PX.length - 1, value: L.radius, aria: t('lookRound'), preview: 'rect',
    label: (v) => roundLabel(v, t), sub: (v) => (v === ROUND_PX.length - 1 ? t('lookPill') : `${ROUND_PX[v]} px`),
    onInput: (v, prev) => { prev.style.borderRadius = `${Math.min(ROUND_PX[v] * 0.6, 12)}px`; applyLook({ ...currentLook(), radius: v }); },
    onChange: (v) => saved({ radius: v }),
  });
  const icons = slider({
    max: ICON_PCT.length - 1, value: L.icons, aria: t('lookIcons'), preview: 'square',
    label: (v) => iconLabel(v, t), sub: (v) => `${ICON_PCT[v]} %`,
    onInput: (v, prev) => { prev.style.borderRadius = `${ICON_PCT[v]}%`; applyLook({ ...currentLook(), icons: v }); },
    onChange: (v) => saved({ icons: v }),
  });
  const picsOn = L.pics;
  return h('div', { class: 'look-controls' },
    h('div', { class: 'label' }, t('lookCorners')), round,
    h('div', { class: 'label' }, t('lookIcons')), icons,
    h('div', { class: 'label' }, t('picsTitle')),
    h('div', { class: 'card remind-card' },
      h('button', { type: 'button', class: `remind-toggle ${picsOn ? 'on' : ''}`, onClick: () => { haptic(); changed({ pics: !currentLook().pics }); } },
        h('div', {}, h('b', {}, t('picsShow')), h('div', { class: 'small muted' }, t('picsHint'))),
        h('span', { class: `switch ${picsOn ? 'on' : ''}` }, h('i')))),
    picsOn ? [
      seg(PIC_STYLES.map((s) => [s, t(`pics_${s}`)]), L.pics_style, (v) => changed({ pics_style: v })),
      seg(PIC_BGS.map((s) => [s, t(`picsBg_${s}`)]), L.pics_bg, (v) => changed({ pics_bg: v })),
    ] : h('p', { class: 'small muted' }, t('picsOffNote')),
    preview);
}

// иконка-пример для превью скругления иконок (на экране «Под себя»)
export const iconSample = () => h('span', { class: 'tile-icon' }, icon('learn'));
