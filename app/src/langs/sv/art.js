// Рисунки языка: города на карте пути, украшения, картинки знакомства. Общий icons.js берёт их отсюда.
// ---------------------------------------------------------------- рисунки для карты пути (64×64)
// .fa — мягкая заливка акцентным цветом, .fb — заливка «золотом»

// «Три короны» (Tre Kronor) — государственный символ Швеции
function crown(x, y, s) {
  return `<path class="fb" transform="translate(${x} ${y}) scale(${s})" d="M0 10 2 2l4 4 4-6 4 6 4-4 2 8z"/>`;
}

export const ART = {
  // Стокгольм: башня Ратуши с тремя коронами над водой
  stadshuset: `<path class="fa" d="M24 60V22h16v38"/><path d="M22 22h20M26 22v-6h12v6"/><path d="M29 16V9h6v7"/>${crown(26.5, 1, 0.55)}<path d="M28 30h.01M36 30h.01M28 38h.01M36 38h.01" stroke-width="2.6"/><path class="fa" d="M8 60V40h16M40 44h16v16"/><path d="M4 60h56"/><path d="M6 62c4-2 8-2 12 0s8 2 12 0 8-2 12 0 8 2 12 0" opacity=".55"/>`,
  // Гётеборг: портовый кран и маяк
  goteborg: '<path d="M10 60V20h4v40M12 20h30M38 20v10"/><path class="fa" d="M34 30h8v6h-8z"/><path d="M14 26l10-6M12 20l-6 8"/><path class="fa" d="M46 60V34l4-8 4 8v26"/><path class="fb" d="M47 30h6v4h-6z"/><path d="M4 60h56"/>',
  // Уппсала: собор с двумя шпилями
  uppsala: '<path class="fa" d="M14 60V28h36v32"/><path class="fa" d="M18 28V16h8v12M38 28V16h8v12"/><path class="fb" d="M18 16 22 4l4 12zM38 16 42 4l4 12z"/><path d="M28 60V48a4 4 0 0 1 8 0v12"/><path d="M32 30a5 5 0 1 0 .01 0"/><path d="M8 60h48"/>',
  // Кируна: горы, северное сияние и церковь
  kiruna: '<path d="M6 16c10-6 22 4 32-2s16-4 20 0" class="fb" opacity=".75"/><path d="M2 46 18 26l10 10 12-16 22 26"/><path class="fa" d="M38 60V46l8-8 8 8v14z"/><path d="M46 38v-6M44 34h4"/><path d="M4 60h56"/>',
  // ворота уровня (тест)
  gate: '<path class="fa" d="M12 60V26h40v34"/><path d="M24 60V45a8 8 0 0 1 16 0v15"/><path d="M10 26h44M13 26v-6h38v6"/><path d="M32 20V7"/><path class="fb" d="M32 7h11l-3 3.5 3 3.5H32z"/>',
  // далекарлийская лошадка
  dalahast: '<path class="fa" d="M14 52V34c0-6 4-10 10-10h10l4-10 6 2 4 10-4 4h-6v20h-6V40H22v12z"/><path class="fb" d="M24 32c3 2 7 2 10 0M26 38h6"/><path d="M42 18h.01" stroke-width="2.8"/><path d="M10 56h40"/>',
  // коричная булочка
  kanelbulle: '<path class="fa" d="M32 16c12 0 20 7 20 16s-8 16-20 16-20-7-20-16 8-16 20-16z"/><path d="M32 32c0-3 4-4 6-2s1 7-4 8-10-3-9-9 7-10 14-8"/><path class="fb" d="M24 22h.01M40 22h.01M44 34h.01M22 40h.01" stroke-width="3"/>',
  // брусника: ветка с ягодами
  lingon: '<path d="M14 54C22 40 34 28 50 16"/><path class="fb" d="M30 34c-6-4-10-2-12 2 5 3 9 2 12-2zM40 24c6-4 10-2 12 2-5 3-9 2-12-2z"/><circle class="fa" cx="22" cy="48" r="5"/><circle class="fa" cx="31" cy="46" r="5"/><circle class="fa" cx="26" cy="40" r="4.5"/>',
  // лось
  alg: '<path class="fa" d="M14 52V38c0-5 4-8 10-8h14l6-6 6 2-2 8-6 2v16h-5V42H24v10z"/><path d="M44 24c-4-4-4-10 0-14M44 18l-6-4M44 14l-4-6M50 22c4-4 6-10 4-14M52 16l6-2M54 10l2-6"/><path d="M8 56h48"/>',
  // мидсоммарский шест
  majstang: '<path d="M32 60V8"/><path d="M20 22h24"/><path class="fa" d="M20 22c0 8 4 12 6 12M44 22c0 8-4 12-6 12"/><circle class="fb" cx="20" cy="38" r="5"/><circle class="fb" cx="44" cy="38" r="5"/><path class="fa" d="M28 10c2-4 6-4 8 0-2 3-6 3-8 0z"/><path d="M20 60h24"/>',
  // красный летний домик
  stuga: '<path class="fa" d="M12 60V32h40v28"/><path d="M8 34 32 14l24 20"/><path class="fb" d="M18 40h8v8h-8zM38 40h8v8h-8z"/><path d="M28 60V48h8v12"/><path d="M12 32v28M52 32v28"/><path d="M44 20v-8h5v12"/>',
  // три короны
  kronor: `${crown(6, 20, 1.1)}${crown(36, 20, 1.1)}${crown(21, 36, 1.1)}<path d="M8 60h48"/>`,
  // чашка кофе (фика)
  fika: '<path class="fa" d="M14 28h28v14a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12z"/><path d="M42 32h4a6 6 0 0 1 0 12h-5"/><path d="M22 22c0-3 2-4 2-7M30 22c0-3 2-4 2-7"/><path class="fb" d="M10 58h40"/>',
  // корабль викингов
  vikingaskepp: '<path class="fa" d="M6 42h52l-8 10H14z"/><path d="M6 42c-2-6 0-12 4-14M58 42c2-6 0-12-4-14"/><path d="M32 42V10"/><path class="fb" d="M20 14h24v20H20z"/><path d="M20 24h24M32 14v20" opacity=".6"/><path d="M4 58c5-3 10-3 14 0s9 3 14 0 9-3 14 0 9 3 14 0" opacity=".55"/>',
  // снежинка
  snoflinga: '<path d="M32 8v48M11 20l42 24M11 44l42-24"/><path class="fb" d="M32 8l-4 6h8zM32 56l-4-6h8z"/><circle class="fa" cx="32" cy="32" r="6"/>',
};

export const DECOR = ['dalahast', 'kanelbulle', 'lingon', 'alg', 'majstang', 'stuga', 'kronor', 'fika', 'vikingaskepp', 'snoflinga'];
export const CITY_ART = { A1: 'stadshuset', A2: 'goteborg', B1: 'uppsala', B2: 'kiruna' };

// рисунок по умолчанию (неизвестное имя, финиш пути)
export const FALLBACK_ART = 'kronor';
// картинки экранов знакомства (screens/welcome.js)
export const WELCOME_ART = { w1: 'stadshuset', w2: 'fika', w3: 'gate', wP: 'dalahast', w4: 'kronor' };
