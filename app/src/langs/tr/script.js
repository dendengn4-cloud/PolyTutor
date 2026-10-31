// Письменность турецкого (латиница + ç ğ ı ö ş ü): буквы, плитки, типичные ошибки, падежные окончания, алфавит словаря.

// ---------------------------------------------------------------- буквы и плитки
// Плитки: каждая буква отдельно (ç ğ ı ö ş ü — отдельные буквы алфавита; â î û — как буквы).
export function mergeTile() { return false; }
export const HAS_LETTER = /[a-zA-ZçğıöşüÇĞİÖŞÜâîûÂÎÛ]/;
export const isLetterTile = (t) => !t.space && /^[a-zA-ZçğıöşüÇĞİÖŞÜâîûÂÎÛ]$/.test(t.ch);
export function tileBase(ch) { return String(ch || ''); }
export function tileTail() { return ''; }
export const GUESS_WORD = /^[a-zçğıöşüâîû-]+$/i;
export const FILWORD_CELL = /^[a-zçğıöşüâîû]+$/i;
export const cleanWord = (w) => w.replace(/[.,!?;:«»"“”–—()]/g, '');

// ---------------------------------------------------------------- «Найди ошибку»
// Реалистичные замены одной буквы (типичные ошибки изучающих): ı↔i, ş↔s, ç↔c, ğ↔g, ö↔o, ü↔u
export const SUBS = {
  ı: ['i'], i: ['ı'], ş: ['s'], s: ['ş'], ç: ['c'], c: ['ç'], ğ: ['g'], g: ['ğ'], ö: ['o'], o: ['ö'], ü: ['u'], u: ['ü'],
};

// ---------------------------------------------------------------- глагол
// Инфинитив на -mak/-mek; основа — без него (gelmek → gel): в «Пропуске» варианты подставляются основами других глаголов.
export const isInfinitive = (u) => /(mak|mek)$/.test(u);
export const verbStem = (uz) => uz.replace(/(mak|mek)$/, '');

// ---------------------------------------------------------------- падежные окончания («Выберите окончание»)
// Окончание ищется сразу после слова словаря в примере (ev + de). Неверные варианты — другие падежи того же слова
// с той же гармонией гласных и тем же озвончением: ev → eve, evden, evi, evin; kitap → kitapta… (смягчённые основы
// вроде kitab-ı упражнение не берёт: основа в примере должна совпадать со словом).
const VOW = 'aeıioöuüâîû';
const VOICELESS = 'çfhkpsşt';
const lastVowel = (s) => ({ 'â': 'a', 'î': 'i', 'û': 'u' })[[...s].reverse().find((c) => VOW.includes(c))] || [...s].reverse().find((c) => VOW.includes(c)) || 'e';
// v — гласная, по которой строится гармония (по умолчанию последняя гласная основы)
const forms = (stem, v0) => {
  const s = stem.toLocaleLowerCase('tr');
  const v = v0 || lastVowel(s);
  const A = 'aıou'.includes(v) ? 'a' : 'e';
  const I = { a: 'ı', ı: 'ı', e: 'i', i: 'i', o: 'u', u: 'u', ö: 'ü', ü: 'ü' }[v];
  const end = s.slice(-1);
  const vEnd = VOW.includes(end);
  const D = VOICELESS.includes(end) ? 't' : 'd';
  const L = `l${A}r`;
  const LI = A === 'a' ? 'ı' : 'i';
  return {
    base: { dat: (vEnd ? 'y' : '') + A, loc: D + A, abl: D + A + 'n', acc: (vEnd ? 'y' : '') + I, gen: (vEnd ? 'n' : '') + I + 'n' },
    pl: { pl: L, pldat: L + A, plloc: L + 'd' + A, plabl: L + 'd' + A + 'n', placc: L + LI, plgen: L + LI + 'n' },
  };
};
const SUFFIX_GROUP = {};
for (const x of ['a', 'e', 'ya', 'ye']) SUFFIX_GROUP[x] = 'dat';
for (const x of ['da', 'de', 'ta', 'te']) SUFFIX_GROUP[x] = 'loc';
for (const x of ['dan', 'den', 'tan', 'ten']) SUFFIX_GROUP[x] = 'abl';
for (const x of ['ı', 'i', 'u', 'ü', 'yı', 'yi', 'yu', 'yü']) SUFFIX_GROUP[x] = 'acc';
for (const x of ['ın', 'in', 'un', 'ün', 'nın', 'nin', 'nun', 'nün']) SUFFIX_GROUP[x] = 'gen';
for (const [k, a, i] of [['', 'a', 'ı'], ['', 'e', 'i']]) {
  const L = `l${a}r${k}`;
  Object.assign(SUFFIX_GROUP, { [L]: 'pl', [L + a]: 'pldat', [L + 'd' + a]: 'plloc', [L + 'd' + a + 'n']: 'plabl', [L + i]: 'placc', [L + i + 'n']: 'plgen' });
}
export const SUFFIX = {
  re: /^([a-zçğıöşü]+)/,
  group: SUFFIX_GROUP,
  // окончание должно быть тем, что даёт правило для этой основы (иначе это другое окончание: ev-i «его дом» и т. п. — тоже по правилу)
  stemOk: (stem) => /[aeıioöuü]/i.test(stem) && stem.length >= 2,
  pool: (suffix, stem = '') => {
    const pl = suffix.startsWith('lar') || suffix.startsWith('ler');
    let set = Object.values((pl ? forms(stem || 'ev').pl : forms(stem || 'ev').base));
    if (!set.includes(suffix)) {
      // слово-исключение из гармонии (saat → saati, metal → metalden): гармония — по гласной найденного окончания
      const sv = [...suffix].find((c) => 'aeıiuü'.includes(c)) || 'e';
      const v = { a: 'a', ı: 'a', e: 'e', i: 'e', u: 'u', ü: 'ü' }[sv];
      set = Object.values((pl ? forms(stem || 'ev', v).pl : forms(stem || 'ev', v).base));
    }
    return set;
  },
};

// ---------------------------------------------------------------- словарь
// Турецкий алфавит: 29 букв (нет q, w, x); ç ğ ı ö ş ü — на своих местах
export const ALPHABET = ['a', 'b', 'c', 'ç', 'd', 'e', 'f', 'g', 'ğ', 'h', 'ı', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'ö', 'p', 'r', 's', 'ş', 't',
  'u', 'ü', 'v', 'y', 'z'];
export const COLLATE = 'tr';
export const FIRST_LETTER = /[a-zçğıöşü]/;

// ---------------------------------------------------------------- игра «Угадай слово»: клавиши
export const GUESS_KEYS = ['a', 'b', 'c', 'ç', 'd', 'e', 'f', 'g', 'ğ', 'h', 'ı', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'ö', 'p', 'r', 's', 'ş', 't',
  'u', 'ü', 'v', 'y', 'z'];
