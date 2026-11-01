// Письменность корейского (хангыль): плитки-слоги, типичные ошибки, частицы, алфавит словаря.
import { decompose, compose, hasBatchim, isSyl, L } from './hangul.js';

// ---------------------------------------------------------------- буквы и плитки
// Плитка — слог целиком (한, 국, 어): в «Собери слово» слова складываются из слогов.
export function mergeTile() { return false; }
export const HAS_LETTER = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
export const isLetterTile = (t) => !t.space && /^[가-힣]$/.test(t.ch);
export function tileBase(ch) { return String(ch || ''); }
export function tileTail() { return ''; }
// «Угадай слово» играется буквами — для слогового письма игра не подходит (слов для неё не находится)
export const GUESS_WORD = /^(?!)/;
export const FILWORD_CELL = /^[가-힣]$/;
export const cleanWord = (w) => w.replace(/[.,!?;:«»"“”–—()~…]/g, '');

// ---------------------------------------------------------------- «Найди ошибку»
// Типичные ошибки изучающих: простой ↔ придыхательный ↔ напряжённый согласный (ㄱ ㅋ ㄲ…), похожие гласные
// (ㅓ ↔ ㅗ, ㅐ ↔ ㅔ, ㅜ ↔ ㅡ, ㅕ ↔ ㅛ), патчхим ㄴ ↔ ㅇ, ㄷ ↔ ㅅ. Ошибка — в одном слоге.
const CONS_SUBS = { 'ㄱ': ['ㅋ', 'ㄲ'], 'ㅋ': ['ㄱ'], 'ㄲ': ['ㄱ'], 'ㄷ': ['ㅌ', 'ㄸ'], 'ㅌ': ['ㄷ'], 'ㄸ': ['ㄷ'], 'ㅂ': ['ㅍ', 'ㅃ'], 'ㅍ': ['ㅂ'],
  'ㅃ': ['ㅂ'], 'ㅈ': ['ㅊ', 'ㅉ'], 'ㅊ': ['ㅈ'], 'ㅉ': ['ㅈ'], 'ㅅ': ['ㅆ'], 'ㅆ': ['ㅅ'], 'ㄴ': ['ㄹ'], 'ㄹ': ['ㄴ'] };
const VOW_SUBS = { 'ㅓ': ['ㅗ'], 'ㅗ': ['ㅓ'], 'ㅐ': ['ㅔ'], 'ㅔ': ['ㅐ'], 'ㅜ': ['ㅡ'], 'ㅡ': ['ㅜ'], 'ㅕ': ['ㅛ'], 'ㅛ': ['ㅕ'], 'ㅚ': ['ㅙ', 'ㅞ'], 'ㅙ': ['ㅚ'], 'ㅞ': ['ㅚ'] };
const FIN_SUBS = { 'ㄴ': ['ㅇ'], 'ㅇ': ['ㄴ'], 'ㄷ': ['ㅅ'], 'ㅅ': ['ㄷ'], 'ㅆ': ['ㅅ'] };
function sylSubs(ch) {
  const d = decompose(ch);
  if (!d) return [];
  const out = [];
  for (const l of CONS_SUBS[d.l] || []) out.push(compose(l, d.v, d.t));
  for (const v of VOW_SUBS[d.v] || []) out.push(compose(d.l, v, d.t));
  for (const t of FIN_SUBS[d.t] || []) out.push(compose(d.l, d.v, t));
  return out.filter(Boolean);
}
// SUBS[слог] → варианты с ошибкой (считаются на лету)
export const SUBS = new Proxy({}, { get: (_, ch) => (typeof ch === 'string' && isSyl(ch) ? sylSubs(ch) : undefined) });

// ---------------------------------------------------------------- глагол
// Словарная форма — на -다 (가다, 먹다); основа — без него
export const isInfinitive = (u) => /다$/.test(u);
export const verbStem = (uz) => uz.replace(/다$/, '');

// ---------------------------------------------------------------- частицы («Выберите окончание»)
// Частица ищется сразу после слова словаря в примере (학교 + 에). Варианты — другие частицы, правильные для этого
// слова (после патчхима: 은 이 을 과 으로; без патчхима: 는 가 를 와 로; ㄹ-патчхим + 로).
const GROUP = { '은': 'top', '는': 'top', '이': 'subj', '가': 'subj', '을': 'obj', '를': 'obj', '과': 'with', '와': 'with',
  '으로': 'dir', '로': 'dir', '에': 'loc', '에서': 'from', '의': 'gen', '도': 'also', '만': 'only', '부터': 'since', '까지': 'until',
  '한테': 'to', '에게': 'to', '하고': 'and', '랑': 'and', '이랑': 'and' };
const particles = (stem) => {
  const b = hasBatchim(stem);
  const rieul = b && /[ㄹ]$/.test(decompose([...stem].reverse().find(isSyl) || '가')?.t || '');
  return b
    ? ['은', '이', '을', '과', rieul ? '로' : '으로', '에', '에서', '의', '도', '만']
    : ['는', '가', '를', '와', '로', '에', '에서', '의', '도', '만'];
};
export const SUFFIX = {
  re: /^(으로|에서|부터|까지|한테|에게|하고|이랑|[은는이가을를과와로에의도만랑])/,
  group: GROUP,
  stemOk: (stem) => /[가-힣]$/.test(stem),
  pool: (suffix, stem = '') => particles(stem),
};

// ---------------------------------------------------------------- словарь
// Словарь по первой букве слога (ㄲ — в группе ㄱ и т. д.), 14 групп в порядке хангыля
export const ALPHABET = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const BASIC = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ' };
export function letterOf(syl) {
  const d = decompose(syl);
  return d ? (BASIC[d.l] || d.l) : syl;
}
export const COLLATE = 'ko';
export const FIRST_LETTER = /[가-힣]/;

// ---------------------------------------------------------------- «Угадай слово»: клавиши (игра для корейского скрыта)
export const GUESS_KEYS = L.slice();
