// Картинка слова для экранов: учитывает выбор в «Оформлении» (картинки вкл/выкл, стиль, фон) и детский режим.
import { currentLook } from '../look.js';
import { picOf, drawPic, cellBg } from './draw.js';

export { picOf, drawPic, cellBg, ruKey, kidsPics, kidsKeys, picTag } from './draw.js';

export const picsOn = () => currentLook().pics;

// <span class="pic-box …"> с картинкой слова или null (картинки выключены / у слова нет рисунка)
// opts: size — 'lg' | 'md' | 'sm' | 'opt'; style/bg — явно (детский режим, предпросмотр); force — показать даже при выключенных
export function wordPic(word, opts = {}) {
  const look = currentLook();
  if (!opts.force && !look.pics) return null;
  const key = opts.key || picOf(word);
  if (!key) return null;
  return picBox(key, opts.style || look.pics_style, opts.bg || look.pics_bg, opts.size || 'md');
}

export function picBox(key, style, bg, size = 'md') {
  const box = document.createElement('span');
  box.className = `pic-box pic-${size} pic-bg-${bg}`;
  box.style.background = cellBg(style, bg);
  box.append(drawPic(key, style, bg));
  return box;
}
