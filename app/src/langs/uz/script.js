// Письменность узбекского (латиница): буквы, плитки, типичные ошибки, падежные окончания, алфавит словаря.
// Правила перенесены из Uzbek Tutor (exercises.js, dictionary.js, games/guess.js, dialog.js) без изменений.

// ---------------------------------------------------------------- буквы и плитки
// Плитки: каждая буква отдельно (sh, ch, ng тоже — одна плитка), oʻ и gʻ — одна плитка; ʼ прилипает к предыдущей букве.
export function mergeTile(ch, last) {
  if (ch === 'ʻ' && last && /[oOgG]$/.test(last.ch || '')) return true;
  // sh, ch, ng — одна буква узбекского алфавита, одна плитка (решение владельца, шаг 11)
  if (/[hgHG]/.test(ch) && last && /^[scnSCN]$/.test(last.ch || '') && /^(sh|ch|ng)$/i.test(last.ch + ch)) return true;
  if (ch === 'ʼ' && last && !last.space) return true;
  return false;
}
export const HAS_LETTER = /[a-zA-Z]/;
export const isLetterTile = (t) => !t.space && /[a-zA-Z]/.test(t.ch);
export function tileBase(ch) { return String(ch || '').replace('ʼ', ''); }
export function tileTail(ch) { return String(ch).endsWith('ʼ') ? 'ʼ' : ''; }
export const GUESS_WORD = /^[a-zA-Zʻʼ-]+$/;
export const FILWORD_CELL = /^[a-zA-Zʻʼ]+$/;
export const cleanWord = (w) => w.replace(/[.,!?;:«»"]/g, '');

// ---------------------------------------------------------------- «Найди ошибку»
// Реалистичные замены одной буквы (типичные ошибки): oʻ↔o, gʻ↔g, x↔h, q↔k, a↔o, i↔e, u↔oʻ
export const SUBS = {
  'oʻ': ['o', 'u'], 'gʻ': ['g'], o: ['a', 'oʻ'], g: ['gʻ'], a: ['o'],
  x: ['h'], h: ['x'], q: ['k', 'gʻ'], k: ['q'], i: ['e'], e: ['i'], u: ['oʻ'], sh: ['s'], ch: ['sh'], ng: ['n'],
};

// ---------------------------------------------------------------- глагол
export const isInfinitive = (u) => /(moq|mak)$/i.test(u);
export const verbStem = (uz) => uz.replace(/(moq|mak)$/i, '');

// ---------------------------------------------------------------- падежные окончания («Выберите окончание»)
// с вариантами после глухих: -ka/-qa, -ta, -tan; они же после -lar
const SUFFIX_GROUP = {
  ga: 'dat', ka: 'dat', qa: 'dat', da: 'loc', ta: 'loc', dan: 'abl', tan: 'abl', ni: 'acc', ning: 'gen',
  larga: 'dat', larda: 'loc', lardan: 'abl', larni: 'acc', larning: 'gen',
};
const BASE_SUFFIXES = ['ga', 'da', 'dan', 'ni', 'ning'];
const PLURAL_SUFFIXES = ['larga', 'larda', 'lardan', 'larni', 'larning'];
export const SUFFIX = {
  re: /^([a-zA-Zʻʼ']+)/,
  group: SUFFIX_GROUP,
  stemOk: () => true,
  pool: (suffix) => (suffix.startsWith('lar') ? PLURAL_SUFFIXES : BASE_SUFFIXES),
};

// ---------------------------------------------------------------- словарь
// Порядок узбекского алфавита (латиница)
export const ALPHABET = ['a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z',
  'oʻ', 'gʻ', 'sh', 'ch', 'ng'];
export const COLLATE = 'uz';
export const FIRST_LETTER = /[a-z]/;

// ---------------------------------------------------------------- игра «Угадай слово»: клавиши
export const GUESS_KEYS = ['a', 'b', 'd', 'e', 'f', 'g', 'gʻ', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'oʻ', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 'sh', 'ch', 'ng'];
