// Рисунки языка: города на карте пути, украшения, картинки знакомства. Общий icons.js берёт их отсюда.
// ---------------------------------------------------------------- рисунки для карты пути (64×64)
// .fa — мягкая заливка акцентным цветом, .fb — заливка «золотом»
function rosette() {
  let petals = '';
  for (let i = 0; i < 8; i++) {
    petals += `<path class="fa" transform="rotate(${i * 45} 32 32)" d="M32 6c4 4 4 10 0 14-4-4-4-10 0-14z"/>`;
  }
  return `${petals}<circle class="fb" cx="32" cy="32" r="9"/><circle cx="32" cy="32" r="3.5"/>`;
}

export const ART = {
  // Ташкент: телебашня
  tvtower: '<path d="M32 4v12"/><path class="fa" d="M25 20h14l-2.5 7h-9z"/><path d="M29.5 27 28 60M34.5 27 36 60"/><path d="M29 40h6M28.6 50h6.8"/><path d="M22 60l6.5-18M42 60l-6.5-18"/><path d="M16 60h32"/><circle class="fb" cx="32" cy="16" r="2.5"/>',
  // Самарканд: портал медресе с куполами
  registan: '<path class="fa" d="M22 60V18h20v42"/><path d="M27 60V36a5 5 0 0 1 10 0v24"/><path d="M8 60V32h14M42 32h14v28"/><path class="fb" d="M10 32a6 6 0 0 1 10 0M44 32a6 6 0 0 1 10 0"/><path d="M4 60V22h4v38M56 60V22h4v38"/><path d="M4 22l2-4 2 4M56 22l2-4 2 4"/><path d="M2 60h60"/><path d="M24 22h16M24 26h16"/>',
  // Бухара: минарет
  minaret: '<path class="fa" d="M27 58 29 20h6l2 38z"/><path d="M26 20h12l-1.5-5h-9z"/><path class="fb" d="M28 15c0-3.5 2-5.5 4-6.5 2 1 4 3 4 6.5z"/><path d="M28.4 30h7.2M27.9 40h8.2M27.4 50h9.2"/><path d="M18 58h28"/>',
  // Хива: Кальта-Минор
  kaltaminor: '<path class="fa" d="M18 58 22 22h20l4 36z"/><path d="M21 31h22M20 40h24M19 49h26"/><path class="fb" d="M22 22h20v-3H22z"/><path d="M12 58h40"/><path d="M8 58V40h7v18M49 58V40h7v18"/>',
  // ворота уровня (тест)
  gate: '<path class="fa" d="M12 60V26h40v34"/><path d="M24 60V45a8 8 0 0 1 16 0v15"/><path d="M10 26h44M13 26v-6h38v6"/><path d="M32 20V7"/><path class="fb" d="M32 7h11l-3 3.5 3 3.5H32z"/>',
  pomegranate: '<path class="fa" d="M32 18c11 0 18 8 18 19s-8 19-18 19-18-8-18-19 7-19 18-19z"/><path d="M26.5 19 27 12l5 4 5-4 .5 7"/><circle class="fb" cx="26" cy="36" r="2"/><circle class="fb" cx="33" cy="32" r="2"/><circle class="fb" cx="38" cy="39" r="2"/><circle class="fb" cx="30" cy="43" r="2"/>',
  cotton: '<circle class="fa" cx="25" cy="24" r="8"/><circle class="fa" cx="39" cy="24" r="8"/><circle class="fa" cx="32" cy="34" r="8.5"/><path d="M32 42.5V60"/><path d="M32 50c-6 0-10-3-12-7M32 54c6 0 10-3 12-7"/>',
  non: '<ellipse class="fa" cx="32" cy="36" rx="24" ry="15"/><ellipse cx="32" cy="36" rx="12" ry="7"/><path d="M28 34h.01M32 36h.01M36 34h.01M30 38.5h.01M34 38.5h.01" stroke-width="2.4"/><path d="M14 30c2-2 4-3 6-4M50 30c-2-2-4-3-6-4"/>',
  doppi: '<path class="fa" d="M12 46c0-14 9-24 20-24s20 10 20 24z"/><path d="M12 46h40"/><path class="fb" d="M32 26c3 3 3 7 0 10-3-3-3-7 0-10zM21 33c3 2 4 6 2 9-3-2-4-6-2-9zM43 33c-3 2-4 6-2 9 3-2 4-6 2-9z"/>',
  choynak: '<path class="fa" d="M16 30h28v9a14 14 0 0 1-28 0z"/><path d="M16 34 7 27"/><path d="M44 32h3.5a5.5 5.5 0 0 1 0 11H43"/><path class="fb" d="M22 30c0-4 4.5-6 8-6s8 2 8 6z"/><path d="M30 24v-3"/><path d="M48 58h12M50 52h8l-1.5 6h-5z"/>',
  melon: '<ellipse class="fa" cx="32" cy="36" rx="22" ry="13" transform="rotate(-18 32 36)"/><path d="M14 44c8-9 22-14 34-11M16 37c8-8 20-11 30-10"/><path d="M50 22l5-5"/>',
  grapes: '<circle class="fa" cx="26" cy="28" r="5"/><circle class="fa" cx="36" cy="28" r="5"/><circle class="fa" cx="31" cy="36" r="5"/><circle class="fa" cx="21" cy="36" r="5"/><circle class="fa" cx="41" cy="36" r="5"/><circle class="fa" cx="26" cy="44" r="5"/><circle class="fa" cx="36" cy="44" r="5"/><circle class="fa" cx="31" cy="52" r="5"/><path d="M31 23V12"/><path class="fb" d="M31 15c4-6 12-6 16-2-4 5-11 6-16 2z"/>',
  dutar: '<ellipse class="fa" cx="22" cy="44" rx="10" ry="13" transform="rotate(-40 22 44)"/><path d="M27 38 52 10"/><path d="M50 8l5 3M47.5 11l5 3"/><path d="M18 46 26 37" /><circle class="fb" cx="21" cy="43" r="2.4"/>',
  suzani: rosette(),
  ikat: '<path class="fa" d="M32 6 50 32 32 58 14 32z"/><path class="fb" d="M32 18 41 32 32 46 23 32z"/><path d="M32 26 36 32 32 38 28 32z"/>',
  karnay: '<path d="M8 50 50 16"/><path class="fa" d="M46 12c4 0 8 4 8 8l-6 2-4-4z"/><path d="M8 50l-2 4 4-2"/>',
  plov: '<path class="fa" d="M8 32h48c0 12-10 20-24 20S8 44 8 32z"/><path class="fb" d="M14 32c2-7 10-11 18-11s16 4 18 11z"/><path d="M4 32h56"/><path d="M28 21c1-3 3-4 4-6M36 21c0-3 2-5 3-7"/>',
};

export const DECOR = ['pomegranate', 'cotton', 'non', 'doppi', 'choynak', 'melon', 'grapes', 'dutar', 'suzani', 'ikat', 'karnay', 'plov'];
export const CITY_ART = { A1: 'tvtower', A2: 'registan', B1: 'minaret', B2: 'kaltaminor' };

// рисунок по умолчанию (неизвестное имя, финиш пути)
export const FALLBACK_ART = 'suzani';
// картинки экранов знакомства (screens/welcome.js)
export const WELCOME_ART = { w1: 'tvtower', w2: 'choynak', w3: 'gate', wP: 'registan', w4: 'suzani' };
