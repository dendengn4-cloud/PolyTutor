// Рисунки языка: города на карте пути, украшения, картинки знакомства. Общий icons.js берёт их отсюда.
// ---------------------------------------------------------------- рисунки для карты пути (64×64)
// .fa — мягкая заливка акцентным цветом, .fb — заливка «золотом»

export const ART = {
  // Стамбул: Галатская башня с конической крышей над Золотым Рогом
  galata: '<path class="fa" d="M24 60V24h16v36"/><path class="fb" d="M22 24 32 6l10 18z"/><path d="M32 6V2"/><path d="M22 24h20M22 30h20"/><path d="M28 36h.01M36 36h.01M28 44h.01M36 44h.01" stroke-width="2.6"/><path d="M29 60v-8a3 3 0 0 1 6 0v8"/><path d="M4 60h56"/><path d="M6 62c4-2 8-2 12 0s8 2 12 0 8-2 12 0 8 2 12 0" opacity=".55"/>',
  // Измир: Часовая башня на площади Конак
  izmir: '<path class="fa" d="M26 60V22h12v38"/><path class="fb" d="M24 22h16l-2-6H26z"/><path d="M32 16V8"/><path class="fb" d="M29 8a3 3 0 1 0 6 0 3 3 0 1 0-6 0"/><path d="M32 30a4 4 0 1 0 .01 0M32 30v3l2 1"/><path d="M22 60V50h20v10"/><path d="M8 60h48"/>',
  // Анкара: Аныткабир — колоннада на холме
  ankara: '<path class="fa" d="M10 34h44v4H10z"/><path class="fb" d="M8 34 32 24l24 10z"/><path d="M14 38v16M22 38v16M30 38v16M38 38v16M46 38v16M52 38v16"/><path d="M8 54h48v4H8z"/><path d="M2 62h60"/>',
  // Каппадокия: «каменные грибы» и воздушный шар
  kapadokya: '<path class="fa" d="M6 60c2-10 4-18 8-22 4 4 6 12 8 22M24 60c2-12 4-20 8-26 4 6 6 14 8 26"/><path class="fb" d="M10 38a4 3 0 0 1 8 0zM28 34a4 3 0 0 1 8 0z"/><path class="fa" d="M48 6a8 9 0 0 1 8 9c0 5-5 9-8 11-3-2-8-6-8-11a8 9 0 0 1 8-9z"/><path d="M46 26h4v4h-4zM45 26l-2-2M51 26l2-2"/><path d="M2 60h60"/>',
  // ворота уровня (тест)
  gate: '<path class="fa" d="M12 60V26h40v34"/><path d="M24 60V45a8 8 0 0 1 16 0v15"/><path d="M10 26h44M13 26v-6h38v6"/><path d="M32 20V7"/><path class="fb" d="M32 7h11l-3 3.5 3 3.5H32z"/>',
  // стаканчик чая-«тюльпан» на блюдце
  cay: '<path class="fa" d="M24 18h16c0 6-4 9-4 14s4 8 4 14H24c0-6 4-9 4-14s-4-8-4-14z"/><path class="fb" d="M26 36h12c0 4 1 6 2 10H24c1-4 2-6 2-10z"/><path d="M16 52h32"/><path d="M14 52c4 4 32 4 36 0" /><path d="M30 12c0-3 2-4 2-7"/>',
  // симит
  simit: '<path class="fa" d="M32 12a20 20 0 1 0 .01 0z"/><path d="M32 24a8 8 0 1 0 .01 0z"/><path class="fb" d="M20 22h.01M44 22h.01M16 34h.01M48 34h.01M24 46h.01M40 46h.01M32 16h.01M32 50h.01" stroke-width="3"/>',
  // назар-бонджук
  nazar: '<circle class="fa" cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="14"/><circle class="fb" cx="32" cy="32" r="8"/><circle cx="32" cy="32" r="3"/>',
  // тюльпан
  lale: '<path class="fa" d="M22 14c2 6 4 10 10 12 6-2 8-6 10-12-4 2-6 4-10 4s-6-2-10-4z"/><path class="fa" d="M22 14c0 12 4 18 10 18s10-6 10-18"/><path d="M32 32v26"/><path class="fb" d="M32 48c-6-6-12-6-16-4 4 6 10 8 16 4zM32 44c6-6 12-6 16-4-4 6-10 8-16 4z"/>',
  // гранат
  nar: '<path class="fa" d="M32 16c12 0 20 8 20 20s-9 20-20 20-20-8-20-20 8-20 20-20z"/><path class="fb" d="M26 16l2-6 4 4 4-4 2 6"/><path d="M24 34h.01M32 30h.01M40 34h.01M28 42h.01M36 42h.01" stroke-width="3"/>',
  // стамбульская кошка
  kedi: '<path class="fa" d="M18 56V34c0-8 6-14 14-14s14 6 14 14v22z"/><path class="fa" d="M20 26 18 12l10 8M44 26l2-14-10 8"/><path d="M26 32h.01M38 32h.01" stroke-width="3"/><path d="M30 38l2 2 2-2M24 40h-8M40 40h8"/><path d="M46 52c6 0 10-4 8-10"/>',
  // пароход-«вапур»
  vapur: '<path class="fa" d="M6 42h52l-6 10H12z"/><path class="fa" d="M16 42V30h28v12"/><path class="fb" d="M26 30V20h8v10"/><path d="M20 36h.01M28 36h.01M36 36h.01M44 36h.01" stroke-width="2.6"/><path d="M4 58c5-3 10-3 14 0s9 3 14 0 9-3 14 0 9 3 14 0" opacity=".55"/>',
  // полумесяц и звезда
  hilal: '<path class="fa" d="M38 12a20 20 0 1 0 0 40 16 16 0 1 1 0-40z"/><path class="fb" d="m46 26 2 5 5 .4-4 3.4 1.3 5-4.3-2.8-4.3 2.8 1.3-5-4-3.4 5-.4z"/>',
  // джезве с кофе
  cezve: '<path class="fa" d="M20 24h20l-2 26a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z"/><path d="M40 28h14"/><path d="M18 24h24"/><path d="M26 18c0-3 2-4 2-7M32 18c0-3 2-4 2-7"/><path class="fb" d="M14 58h32"/>',
};

export const DECOR = ['cay', 'simit', 'nazar', 'lale', 'nar', 'kedi', 'vapur', 'hilal', 'cezve', 'kapadokya'];
export const CITY_ART = { A1: 'galata', A2: 'izmir', B1: 'ankara', B2: 'kapadokya' };

// рисунок по умолчанию (неизвестное имя, финиш пути)
export const FALLBACK_ART = 'nazar';
// картинки экранов знакомства (screens/welcome.js)
export const WELCOME_ART = { w1: 'galata', w2: 'cay', w3: 'gate', wP: 'vapur', w4: 'nazar' };
