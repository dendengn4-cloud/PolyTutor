// Рисунки языка: города на карте пути, украшения, картинки знакомства. Общий icons.js берёт их отсюда.
// ---------------------------------------------------------------- рисунки для карты пути (64×64)
// .fa — мягкая заливка акцентным цветом, .fb — заливка «золотом»

// армянский «знак вечности» (аревахач): 8 загнутых лучей вокруг центра
function eternity() {
  let arms = '';
  for (let i = 0; i < 8; i++) {
    arms += `<path class="fa" transform="rotate(${i * 45} 32 32)" d="M32 32c0-8 4-14 11-16-1 6-4 11-11 16z"/>`;
  }
  return `${arms}<circle class="fb" cx="32" cy="32" r="5"/>`;
}

export const ART = {
  // Ереван: Каскад (лестница-террасы) и Арарат за ним
  cascade: '<path class="fa" d="M4 34 18 16l6 7 8-12 14 23z"/><path class="fb" d="M14 21l4-5 3 3.5M28 15l4-4 4 5"/><path d="M10 60V52h10v-6h10v-6h10v-6h10v26"/><path d="M15 52v8M25 46v14M35 40v20M45 34v26"/><path d="M4 60h56"/>',
  // Гюмри: армянская церковь — барабан и конический купол
  church: '<path class="fa" d="M14 60V36h36v24"/><path d="M14 36l18-8 18 8"/><path class="fa" d="M26 30V20h12v10"/><path class="fb" d="M24.5 20 32 9l7.5 11z"/><path d="M32 9V4M30 6h4"/><path d="M28 60V49a4 4 0 0 1 8 0v11"/><path d="M20 44v4M44 44v4M31 23v4M33 23v4"/><path d="M8 60h48"/>',
  // Дилижан: горы и лес
  dilijan: '<path d="M2 40 18 22l10 10 10-14 24 22"/><path class="fa" d="M14 60 22 38l8 22zM34 60l9-26 9 26z"/><path class="fb" d="M10 60l5-14 5 14zM46 60l5-12 5 12z"/><path d="M22 52v8M43 50v10"/><path d="M4 60h56"/>',
  // Татев: монастырь на скале над ущельем
  tatev: '<path class="fa" d="M4 60V44l10-4 8 2v18M42 60V42l10-6 8 4v20"/><path d="M22 60c4-6 16-6 20 0"/><path class="fa" d="M10 40V30h12v10"/><path class="fb" d="M14 30v-5h4v5"/><path d="M13 25 16 19l3 6"/><path d="M48 36V28h8v8"/><path d="M50 28l2-5 2 5"/><path d="M26 30l16-4" stroke-dasharray="2 3"/>',
  // ворота уровня (тест)
  gate: '<path class="fa" d="M12 60V26h40v34"/><path d="M24 60V45a8 8 0 0 1 16 0v15"/><path d="M10 26h44M13 26v-6h38v6"/><path d="M32 20V7"/><path class="fb" d="M32 7h11l-3 3.5 3 3.5H32z"/>',
  pomegranate: '<path class="fa" d="M32 18c11 0 18 8 18 19s-8 19-18 19-18-8-18-19 7-19 18-19z"/><path d="M26.5 19 27 12l5 4 5-4 .5 7"/><circle class="fb" cx="26" cy="36" r="2"/><circle class="fb" cx="33" cy="32" r="2"/><circle class="fb" cx="38" cy="39" r="2"/><circle class="fb" cx="30" cy="43" r="2"/>',
  // абрикос с листом
  apricot: '<path class="fa" d="M32 20c-10-2-18 6-18 17s8 19 18 19 18-8 18-19-8-19-18-17z"/><path d="M32 21c-3 8-3 22 0 34" opacity=".55"/><path d="M32 20c0-4 1-7 3-9"/><path class="fb" d="M35 13c6-5 14-4 17 1-6 4-12 4-17-1z"/>',
  // лаваш: тонкий лист с пузырьками
  lavash: '<path class="fa" d="M8 22c8-4 40-4 48 0 3 8 3 20 0 28-8 4-40 4-48 0-3-8-3-20 0-28z"/><path d="M18 30h.01M28 27h.01M40 30h.01M24 38h.01M36 37h.01M46 41h.01M16 44h.01M30 45h.01" stroke-width="2.6"/>',
  // дудук: трубка с отверстиями и трость
  duduk: '<path class="fa" d="M10 50 46 14l4 4-36 36z"/><path d="M46 14l6-6 4 4-6 6"/><path d="M20 44h.01M25 39h.01M30 34h.01M35 29h.01M40 24h.01" stroke-width="2.8"/><path class="fb" d="M8 52l-3 3 4 4 3-3z"/>',
  // хачкар: каменный крест с узором
  khachkar: '<path class="fa" d="M18 60V10h28v50"/><path d="M14 60h36"/><path class="fb" d="M29 18h6v8h8v6h-8v14h-6V32h-8v-6h8z"/><path d="M22 52c3-3 6-3 10 0 4-3 7-3 10 0"/><path d="M22 14h.01M42 14h.01" stroke-width="2.6"/>',
  grapes: '<circle class="fa" cx="26" cy="28" r="5"/><circle class="fa" cx="36" cy="28" r="5"/><circle class="fa" cx="31" cy="36" r="5"/><circle class="fa" cx="21" cy="36" r="5"/><circle class="fa" cx="41" cy="36" r="5"/><circle class="fa" cx="26" cy="44" r="5"/><circle class="fa" cx="36" cy="44" r="5"/><circle class="fa" cx="31" cy="52" r="5"/><path d="M31 23V12"/><path class="fb" d="M31 15c4-6 12-6 16-2-4 5-11 6-16 2z"/>',
  eternity: eternity(),
  // Арарат: Масис и Сис
  ararat: '<path class="fa" d="M2 54 24 18l12 14 6-6 20 28z"/><path class="fb" d="M18 28l6-10 6 7-4 3-3-2zM39 29l3-3 4 5-3 1z"/><path d="M2 54h60"/>',
  // джезве с кофе
  jazzve: '<path class="fa" d="M20 26h18l-3 26a4 4 0 0 1-4 3h-4a4 4 0 0 1-4-3z"/><path d="M38 30 56 22"/><path class="fb" d="M21 30h16"/><path d="M26 20c0-3 2-4 2-7M32 20c0-3 2-4 2-7"/><path d="M14 58h30"/>',
  // ковёр: ромбы
  carpet: '<rect class="fa" x="10" y="12" width="44" height="40" rx="2"/><path class="fb" d="M32 18 44 32 32 46 20 32z"/><path d="M32 26 37 32 32 38 27 32z"/><path d="M10 56v4M18 56v4M26 56v4M34 56v4M42 56v4M50 56v4"/>',
};

export const DECOR = ['pomegranate', 'apricot', 'lavash', 'duduk', 'khachkar', 'grapes', 'eternity', 'ararat', 'jazzve', 'carpet'];
export const CITY_ART = { A1: 'cascade', A2: 'church', B1: 'dilijan', B2: 'tatev' };

// рисунок по умолчанию (неизвестное имя, финиш пути)
export const FALLBACK_ART = 'eternity';
// картинки экранов знакомства (screens/welcome.js)
export const WELCOME_ART = { w1: 'cascade', w2: 'jazzve', w3: 'gate', wP: 'church', w4: 'eternity' };
