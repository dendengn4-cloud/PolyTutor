// Картинки к словам: какой рисунок у слова и как его нарисовать в выбранном стиле.
//   обычный режим: line (линия) | flat (плоская графика) | wc (акварель);
//   детский режим: outline (контур) | paper (аппликация) | crayon (цветные мелки);
//   фон: white (светлая плашка) | none (без фона; в тёмных темах линии светлеют) | sticker (белая кайма с тенью).
// Рисунок один на все языки: слово находится по русскому значению (первое значение до запятой).
// Библиотека рисунков (~110 КБ) грузится отдельным файлом, параллельно со входом — не задерживает запуск.
// Пока она не загрузилась, у слов просто нет картинок; детский режим ждёт picsReady.
let PICS = {}, RU = {}, KIDS = [], TAG = {};
export const picsReady = import('./lib.js').then((m) => { ({ PICS, RU, KIDS, TAG } = m); }).catch(() => {});

const NS = 'http://www.w3.org/2000/svg';
const INK = '#2B2D42';

export function ruKey(s) {
  let x = String(s || '').replace(/\([^)]*\)/g, ' ');
  x = x.split(',')[0].split(';')[0].split('/')[0];
  return x.replace(/ё/g, 'е').replace(/Ё/g, 'Е').toLowerCase().split(/\s+/).filter(Boolean).join(' ');
}

// рисунок слова (или null): по русскому значению
export function picOf(word) {
  if (!word) return null;
  const k = RU[ruKey(word.ru != null ? word.ru : word.r)];
  return k && PICS[k] ? k : null;
}
export const kidsPics = () => KIDS.slice();
export const picTag = (k) => TAG[k] || 'n';
export const kidsKeys = () => {
  // русские значения детского набора (для kids_words): все значения каждого рисунка
  const out = {};
  for (const [ru, k] of Object.entries(RU)) if (KIDS.includes(k)) (out[k] = out[k] || []).push(ru);
  return out;
};

// фильтры (один раз на страницу)
let defsReady = false;
function ensureDefs() {
  if (defsReady || typeof document === 'undefined') return;
  defsReady = true;
  const box = document.createElement('div');
  box.setAttribute('aria-hidden', 'true');
  box.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  box.innerHTML = `<svg width="0" height="0"><defs>
<filter id="pf-wc" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".7"/></filter>
<filter id="pf-ink" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="pf-sticker" x="-20%" y="-20%" width="140%" height="145%"><feMorphology in="SourceAlpha" operator="dilate" radius="2.6" result="d"/><feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="w"/><feGaussianBlur in="d" stdDeviation="1.4" result="b"/><feOffset in="b" dy="1.6" result="o"/><feFlood flood-color="#000" flood-opacity=".35"/><feComposite in2="o" operator="in" result="sh"/><feMerge><feMergeNode in="sh"/><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="pf-paper" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="1.2" dy="1.8" stdDeviation="0.3" flood-color="#5A3D1A" flood-opacity=".35"/></filter>
<filter id="pf-wobble" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="pf-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="7" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.2" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
</defs></svg>`;
  document.body.append(box);
}

const hex6 = (c) => /^#[0-9a-f]{6}$/i.test(c || '');
const mix = (c, t, k) => {
  const a = parseInt(c.slice(1), 16), b = parseInt(t.slice(1), 16);
  const ch = (s) => Math.round(((a >> s) & 255) * (1 - k) + ((b >> s) & 255) * k);
  return `#${((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1)}`;
};
const isInk = (c) => String(c || '').toUpperCase() === INK;

const INHERIT = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'];
function base(key) {
  const g = document.createElementNS(NS, 'g');
  g.innerHTML = PICS[key];
  // цвета, заданные группе (<g fill=…>), переносим на её фигуры — стили перекрашивают каждую фигуру отдельно
  for (const grp of [...g.querySelectorAll('g')].reverse()) {
    for (const a of INHERIT) {
      const v = grp.getAttribute(a);
      if (v == null) continue;
      for (const ch of grp.children) if (!ch.hasAttribute(a)) ch.setAttribute(a, v);
      grp.removeAttribute(a);
    }
  }
  return g;
}

export function isDarkScheme() {
  return typeof document !== 'undefined' && document.documentElement.dataset.scheme === 'dark';
}

// SVG-картинка: key — рисунок, style — line|flat|wc|outline|paper|crayon, bg — white|none|sticker
export function drawPic(key, style = 'line', bg = 'white', dark = isDarkScheme()) {
  ensureDefs();
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'pic-svg');
  if (!PICS[key]) return svg;
  const light = dark && bg === 'none';                 // линии светлеют на тёмной карточке
  const LINE = light ? '#E5E7EB' : '#1F2937', WINK = light ? '#EDE6DA' : '#33302C', FINK = light ? '#D8DCE3' : '#3B4252';
  if (style === 'line') {
    const g = base(key);
    for (const n of g.querySelectorAll('*')) {
      const f = n.getAttribute('fill'), s = n.getAttribute('stroke');
      if (s) { n.setAttribute('stroke', LINE); n.setAttribute('stroke-width', '1.5'); }
      if (hex6(f) && isInk(f)) n.setAttribute('fill', LINE);
      else if (hex6(f)) n.setAttribute('fill-opacity', light ? '.8' : s ? '.28' : '.5');
    }
    svg.append(g);
  } else if (style === 'flat') {
    const g = base(key);
    for (const n of g.querySelectorAll('*')) {
      const f = n.getAttribute('fill'), s = n.getAttribute('stroke');
      if (hex6(f)) n.setAttribute('fill', isInk(f) ? FINK : mix(f, '#8A9099', 0.22));
      if (hex6(f) && s) n.removeAttribute('stroke');
      else if (s) n.setAttribute('stroke', isInk(s) ? FINK : hex6(s) ? mix(s, '#8A9099', 0.22) : s);
    }
    g.setAttribute('transform', 'translate(6.4 6.4) scale(.8)');
    if (bg !== 'sticker') {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', '32'); c.setAttribute('cy', '33'); c.setAttribute('r', '28');
      c.setAttribute('fill', light ? '#2A303A' : '#E2E7EE');
      svg.append(c);
    }
    svg.append(g);
  } else if (style === 'wc') {
    const wash = base(key);
    for (const n of wash.querySelectorAll('*')) {
      const f = n.getAttribute('fill');
      n.removeAttribute('stroke');
      if (!hex6(f) || isInk(f)) n.setAttribute('fill', 'none'); else n.setAttribute('fill-opacity', '.7');
    }
    wash.setAttribute('filter', 'url(#pf-wc)');
    wash.setAttribute('transform', 'translate(1.2 1.2)');
    const ink = base(key);
    for (const n of ink.querySelectorAll('*')) {
      const f = n.getAttribute('fill'), s = n.getAttribute('stroke');
      if (s) { n.setAttribute('stroke', WINK); n.setAttribute('stroke-width', '1.2'); if (f && f !== 'none') n.setAttribute('fill', 'none'); }
      else if (hex6(f) && !isInk(f)) n.setAttribute('fill', 'none');
      else if (hex6(f)) n.setAttribute('fill', WINK);
    }
    ink.setAttribute('filter', 'url(#pf-ink)');
    svg.append(wash, ink);
  } else if (style === 'paper') {
    const g = base(key);
    for (const n of g.querySelectorAll('*')) {
      const f = n.getAttribute('fill'), s = n.getAttribute('stroke');
      if (f && f !== 'none' && s) n.removeAttribute('stroke');
      else if ((!f || f === 'none') && isInk(s)) { n.setAttribute('stroke', '#5A4632'); n.setAttribute('stroke-width', '1.8'); }
    }
    g.setAttribute('filter', 'url(#pf-paper)');
    svg.append(g);
  } else if (style === 'crayon') {
    const body = base(key);
    for (const n of body.querySelectorAll('*')) if (isInk(n.getAttribute('stroke'))) { n.setAttribute('stroke', '#3B3B48'); n.setAttribute('stroke-width', '2'); }
    const fills = body.cloneNode(true);
    for (const n of fills.querySelectorAll('*')) n.removeAttribute('stroke');
    fills.setAttribute('filter', 'url(#pf-grain)');
    const w = document.createElementNS(NS, 'g');
    w.setAttribute('filter', 'url(#pf-wobble)');
    w.append(fills);
    const lines = body.cloneNode(true);
    for (const n of lines.querySelectorAll('*')) { const f = n.getAttribute('fill'); if (f && f !== 'none' && n.getAttribute('stroke')) n.setAttribute('fill', 'none'); }
    lines.setAttribute('filter', 'url(#pf-wobble)');
    svg.append(w, lines);
  } else {                                              // outline — как нарисовано
    svg.append(base(key));
  }
  if (bg === 'sticker') {
    const w = document.createElementNS(NS, 'g');
    w.setAttribute('filter', 'url(#pf-sticker)');
    while (svg.firstChild) w.append(svg.firstChild);
    svg.append(w);
  }
  return svg;
}

// фон плашки под картинкой: белая (в тёмных темах — тоже светлая), без фона и наклейка — прозрачно
const CELL = { line: '#F3F6F8', flat: '#EEF1F4', wc: '#FBF8F2', outline: '#F4F8FC', paper: '#FBF5EA', crayon: '#FFFDF7' };
export function cellBg(style, bg, dark = isDarkScheme()) {
  if (bg !== 'white') return 'transparent';
  return dark ? '#F4F5F7' : (CELL[style] || '#F3F6F8');
}
