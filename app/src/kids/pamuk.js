// Памук — персонаж детского режима (один на все языки): обычный, радуется (верно), думает (попробуй ещё).
const BASE = '<path d="M44 50c8 0 12-4 11-9" fill="none" stroke="#2B2D42" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="32" cy="47" rx="15" ry="12" fill="#fff" stroke="#2B2D42" stroke-width="2.4"/><path d="M19 21 17 7l10 7M45 21l2-14-10 7" fill="#fff" stroke="#2B2D42" stroke-width="2.4" stroke-linejoin="round"/><path d="M18.5 9.5 21 16.5 25.5 13.5Z" fill="#FFB199"/><circle cx="32" cy="27" r="15" fill="#fff" stroke="#2B2D42" stroke-width="2.4"/><path d="M39 13.5c5 1.5 8 6 8 11-4 1-9-2-10-6" fill="#F4A259"/><circle cx="26" cy="27" r="2.6" fill="#2B2D42"/><circle cx="38" cy="27" r="2.6" fill="#2B2D42"/><circle cx="27" cy="26" r=".9" fill="#fff"/><circle cx="39" cy="26" r=".9" fill="#fff"/><ellipse cx="22" cy="32" rx="2.6" ry="1.6" fill="#FFB199"/><ellipse cx="42" cy="32" rx="2.6" ry="1.6" fill="#FFB199"/><path d="M30.5 31h3l-1.5 1.8Z" fill="#E87A6A"/><path d="M28 34c2 2 6 2 8 0" fill="none" stroke="#2B2D42" stroke-width="2" stroke-linecap="round"/><path d="M21 39c7 4 15 4 22 0l-1 5c-6 3-14 3-20 0Z" fill="#2FAE6A" stroke="#2B2D42" stroke-width="2" stroke-linejoin="round"/><circle cx="32" cy="43" r="2.2" fill="#FFC23D" stroke="#2B2D42" stroke-width="1.4"/>';
const MOOD = {
  joy: '<rect x="22" y="23" width="8" height="6" fill="#fff"/><rect x="34" y="23" width="8" height="6" fill="#fff"/><path d="M23 27c1.5-2.5 4-2.5 5.5 0M35.5 27c1.5-2.5 4-2.5 5.5 0" fill="none" stroke="#2B2D42" stroke-width="2.2" stroke-linecap="round"/><rect x="27" y="33" width="10" height="3.5" fill="#fff"/><path d="M27.5 33.5c2 3.5 7 3.5 9 0Z" fill="#E87A6A" stroke="#2B2D42" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 14l2 4 4 1-4 1-2 4-2-4-4-1 4-1ZM56 8l1.5 3 3 1-3 1L56 16l-1.5-3-3-1 3-1Z" fill="#FFC23D"/>',
  think: '<rect x="27" y="33" width="10" height="3.5" fill="#fff"/><path d="M29 35h6" stroke="#2B2D42" stroke-width="2" stroke-linecap="round"/><circle cx="52" cy="12" r="5" fill="#fff" stroke="#2B2D42" stroke-width="1.8"/><path d="M50.3 10.6c0-1.2.8-1.9 1.8-1.9s1.8.7 1.8 1.6c0 1.2-1.6 1.4-1.6 2.6" fill="none" stroke="#F2A33A" stroke-width="1.6" stroke-linecap="round"/><circle cx="52.3" cy="15" r=".9" fill="#F2A33A"/>',
};
export function pamuk(mood = '', cls = 'pamuk') {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('class', cls);
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = BASE + (MOOD[mood] || '');
  return svg;
}
