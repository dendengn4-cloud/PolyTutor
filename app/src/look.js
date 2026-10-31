// Оформление (Настройки → «Оформление», экран «Под себя» при первом входе):
//   radius   — скругление углов карточек и кнопок, 0…11 (8 — как раньше, 18 px; 11 — максимум, кнопки-овалы);
//   icons    — скругление иконок, 0…7 (0 — квадрат, 3 — как раньше, 7 — круг);
//   pics     — картинки к словам (true/false), pics_style — line | flat | wc, pics_bg — white | none | sticker.
// Хранится в профиле (settings) и в памяти телефона — чтобы при запуске не было мигания.
const KEY = 'ut_look';

export const ROUND_PX = [0, 2, 4, 6, 8, 10, 12, 15, 18, 22, 26, 28];
export const ROUND_DEFAULT = 8;
export const ICON_PCT = [0, 10, 20, 32, 38, 42, 46, 50];
export const ICON_DEFAULT = 3;
export const PIC_STYLES = ['line', 'flat', 'wc'];
export const PIC_BGS = ['white', 'none', 'sticker'];

const clampInt = (v, max, def) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= max ? n : def;
};

// настройки оформления из settings профиля (с умолчаниями)
export function lookOf(me) {
  const s = (me && me.settings) || {};
  return {
    radius: clampInt(s.radius, ROUND_PX.length - 1, ROUND_DEFAULT),
    icons: clampInt(s.icons, ICON_PCT.length - 1, ICON_DEFAULT),
    pics: s.pics !== false,
    pics_style: PIC_STYLES.includes(s.pics_style) ? s.pics_style : 'line',
    pics_bg: PIC_BGS.includes(s.pics_bg) ? s.pics_bg : 'white',
  };
}

let current = null;
export function currentLook() { return current || lookOf(null); }

export function applyLook(look) {
  current = { ...currentLook(), ...look };
  const root = document.documentElement;
  root.style.setProperty('--rk', String(ROUND_PX[current.radius] / 18));
  root.style.setProperty('--ik', String(ICON_PCT[current.icons] / 32));
  if (current.radius === ROUND_PX.length - 1) root.dataset.round = 'max'; else delete root.dataset.round;
  if (current.icons === ICON_PCT.length - 1) root.dataset.icons = 'circle'; else delete root.dataset.icons;
  try { localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* приватный режим */ }
}

export function initLook() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { /* нет доступа */ }
  applyLook(lookOf({ settings: saved || {} }));
}

// названия шагов ползунков
export function roundLabel(i, t) {
  if (i === 0) return t('lookSharp');
  if (i === ROUND_DEFAULT) return t('lookAsNow');
  if (i === ROUND_PX.length - 1) return t('lookMax');
  return i < 4 ? t('lookSlight') : i < ROUND_DEFAULT ? t('lookSoft') : t('lookRound');
}
export function iconLabel(i, t) {
  if (i === 0) return t('lookSquare');
  if (i === ICON_DEFAULT) return t('lookAsNow');
  if (i === ICON_PCT.length - 1) return t('lookCircle');
  return i < ICON_DEFAULT ? t('lookNearSquare') : t('lookNearCircle');
}
