// Рисунки языка (корейский): города на карте пути, украшения, картинки знакомства. Общий icons.js берёт их отсюда.
// ---------------------------------------------------------------- рисунки для карты пути (64×64)
// .fa — мягкая заливка акцентным цветом, .fb — заливка «золотом»

export const ART = {
  // Сеул: башня N Seoul Tower на горе Намсан
  namsan: '<path class="fa" d="M4 60c8-14 18-20 28-20s20 6 28 20z"/><path d="M30 40V22h4v18"/><path class="fb" d="M26 22h12l-2-6h-8z"/><path d="M32 16V4"/><path d="M28 28h8"/><path d="M4 60h56"/>',
  // Пусан: мост Кванан над морем
  busan: '<path d="M4 40h56"/><path class="fa" d="M18 40V18M46 40V18"/><path d="M18 18c6 10 22 10 28 0M4 30c6-2 10-6 14-12M46 18c4 6 8 10 14 12"/><path d="M24 40V31M32 40V33M40 40V31"/><path d="M4 50c5-3 9-3 14 0s9 3 14 0 9-3 14 0 9 3 14 0" opacity=".6"/><path class="fb" d="M50 10a4 4 0 1 0 .01 0"/>',
  // Кёнджу: обсерватория Чхомсондэ
  gyeongju: '<path class="fa" d="M22 58c2-16 4-30 4-42h12c0 12 2 26 4 42z"/><path class="fb" d="M24 10h16v6H24z"/><path d="M27 32h10v6H27z"/><path d="M24 22h16M23 44h18"/><path d="M8 58h48"/>',
  // Чеджу: каменный дедушка тольхарыбан
  jeju: '<path class="fa" d="M20 58V34c0-12 5-20 12-20s12 8 12 20v24z"/><path class="fb" d="M20 20c0-8 5-12 12-12s12 4 12 12z"/><path d="M26 30h.01M38 30h.01" stroke-width="3"/><path d="M30 34c0 4 4 4 4 0M28 40h8"/><path d="M24 48c4-2 6-2 8 0M40 48c-4-2-6-2-8 0"/><path d="M12 58h40"/>',
  // ворота (финиш уровня)
  gate: '<path class="fa" d="M12 60V26h40v34"/><path d="M24 60V45a8 8 0 0 1 16 0v15"/><path d="M8 26c8-4 40-4 48 0"/><path d="M6 22c10-6 42-6 52 0"/><path d="M32 16V7"/><path class="fb" d="M32 7h11l-3 3.5 3 3.5H32z"/>',
  // кувшин онги для кимчхи
  onggi: '<path class="fa" d="M18 22c-6 6-8 14-6 22s10 14 20 14 18-6 20-14-0-16-6-22z"/><path class="fb" d="M20 16h24v6H20z"/><path d="M24 10h16v6"/><path d="M16 36c10 3 22 3 32 0"/>',
  // пибимпап в каменной чаше
  bibim: '<path class="fa" d="M8 30h48c0 14-10 24-24 24S8 44 8 30z"/><path d="M6 30h52"/><path class="fb" d="M27 24a5 5 0 1 0 10 0 5 5 0 1 0-10 0"/><path d="M14 30c2-4 6-6 10-6M40 26c4 0 8 2 10 4M20 30l4-4M44 30l-3-4"/>',
  // цветок мугунхва
  mugung: '<path class="fa" d="M32 32c-6-14-2-24 0-24s6 10 0 24zM32 32c14-6 24-2 24 0s-10 6-24 0zM32 32c6 14 2 24 0 24s-6-10 0-24zM32 32c-14 6-24 2-24 0s10-6 24 0z"/><path class="fb" d="M28 32a4 4 0 1 0 8 0 4 4 0 1 0-8 0"/>',
  // веер с тхэгыком
  fan: '<path class="fa" d="M32 56 8 26c8-10 40-10 48 0z"/><path d="M32 56 20 22M32 56V20M32 56l12-34"/><path class="fb" d="M26 34a6 6 0 0 1 12 0c0-3-3-3-3 0s-6 3-6 0 3-3-3 0"/>',
  // фонарь чхоннон
  lantern: '<path d="M32 4v8"/><path class="fa" d="M20 18c0-4 6-6 12-6s12 2 12 6v24c0 4-6 6-12 6s-12-2-12-6z"/><path class="fb" d="M20 24h24M20 36h24"/><path d="M28 48v8M36 48v8M32 48v10"/>',
  // палочки и ложка
  sujeo: '<path class="fa" d="M18 10c-6 0-8 8-4 12 2 2 4 2 6 0 4-4 4-12-2-12z"/><path d="M18 22 30 58"/><path d="M40 8 34 58M48 8 40 58"/>',
  // хангыль (буква ㅎ)
  hangul: '<path class="fa" d="M8 8h48v48H8z"/><path d="M24 18h16M20 26h24"/><path class="fb" d="M24 40a8 8 0 1 0 16 0 8 8 0 1 0-16 0"/>',
};

export const DECOR = ['onggi', 'bibim', 'mugung', 'fan', 'lantern', 'sujeo', 'namsan', 'jeju', 'hangul', 'gyeongju'];
export const CITY_ART = { A1: 'namsan', A2: 'busan', B1: 'gyeongju', B2: 'jeju' };

// рисунок по умолчанию (неизвестное имя, финиш пути)
export const FALLBACK_ART = 'mugung';
// картинки экранов знакомства (screens/welcome.js)
export const WELCOME_ART = { w1: 'namsan', w2: 'bibim', w3: 'gate', wP: 'hangul', w4: 'lantern' };
