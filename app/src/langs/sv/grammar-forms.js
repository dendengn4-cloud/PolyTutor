// Блок «Как образуется» в темах шведской грамматики: таблицы образования форм с примерами.
// Темы: 3 en/ett, 4 определённая форма, 5 множественное число, 6 опр. мн., 15 презенс, 16 претерит,
// 17 супин и перфект, 18 будущее, 19 повелительное.
import { h } from '../ui.js';
import { getLang } from '../i18n.js';
import { tx } from './forms.js';

const L = () => (getLang() === 'en' ? 'en' : getLang() === 'sv' ? 'sv' : 'ru');
const T = {
  rule: { ru: 'Правило', sv: 'Regel', en: 'Rule' },
  example: { ru: 'Пример', sv: 'Exempel', en: 'Example' },
};
const tr = (k) => T[k][L()];

// [правило ru, sv, en], примеры
const NOUN_GENDER = [
  [['en-слова — общий род (около 75% слов)', 'en-ord – utrum (cirka 75 % av orden)', 'en-words — common gender (about 75%)'], 'en bil, en stol, en flicka'],
  [['ett-слова — средний род', 'ett-ord – neutrum', 'ett-words — neuter'], 'ett hus, ett bord, ett äpple'],
  [['род запоминают вместе со словом', 'genus lärs in tillsammans med ordet', 'learn the gender with the word'], 'en penna, ett papper'],
];
const NOUN_DEF = [
  [['en-слово на согласный: + -en', 'en-ord på konsonant: + -en', 'en-word ending in a consonant: + -en'], 'en bil → bilen'],
  [['en-слово на гласный: + -n', 'en-ord på vokal: + -n', 'en-word ending in a vowel: + -n'], 'en flicka → flickan'],
  [['ett-слово на согласный: + -et', 'ett-ord på konsonant: + -et', 'ett-word ending in a consonant: + -et'], 'ett hus → huset'],
  [['ett-слово на гласный: + -t', 'ett-ord på vokal: + -t', 'ett-word ending in a vowel: + -t'], 'ett äpple → äpplet'],
  [['-el, -en, -er: e выпадает', '-el, -en, -er: e faller bort', '-el, -en, -er: the e drops'], 'ett fönster → fönstret'],
];
const NOUN_PL = [
  [['1-е склонение: -a → -or', 'Deklination 1: -a → -or', 'Declension 1: -a → -or'], 'en flicka → flickor'],
  [['2-е: -ar (много en-слов, слова на -e)', 'Deklination 2: -ar', 'Declension 2: -ar'], 'en bil → bilar, en pojke → pojkar'],
  [['3-е: -er / -r (заимствования, ударный слог)', 'Deklination 3: -er / -r', 'Declension 3: -er / -r'], 'en park → parker, en sko → skor'],
  [['4-е: -n (ett-слова на гласный)', 'Deklination 4: -n', 'Declension 4: -n'], 'ett äpple → äpplen'],
  [['5-е: без окончания (ett-слова на согласный, -are)', 'Deklination 5: ingen ändelse', 'Declension 5: no ending'], 'ett hus → hus, en lärare → lärare'],
  [['особые формы со сменой гласного', 'oregelbundna former med vokalväxling', 'irregular forms with a vowel change'], 'en man → män, en bok → böcker'],
];
const NOUN_DEFPL = [
  [['-or / -ar / -er + -na', '-or / -ar / -er + -na', '-or / -ar / -er + -na'], 'flickor → flickorna, bilar → bilarna'],
  [['-n (4-е) + -a', '-n (dekl. 4) + -a', '-n (decl. 4) + -a'], 'äpplen → äpplena'],
  [['5-е склонение: + -en', 'Deklination 5: + -en', 'Declension 5: + -en'], 'hus → husen, lärare → lärarna'],
];
const VERB_PRES = [
  [['группа 1: -a → -ar', 'Grupp 1: -a → -ar', 'Group 1: -a → -ar'], 'tala → talar'],
  [['группы 2 и 4: -a → -er', 'Grupp 2 och 4: -a → -er', 'Groups 2 and 4: -a → -er'], 'köpa → köper, skriva → skriver'],
  [['основа на -r: без окончания', 'stam på -r: ingen ändelse', 'stem in -r: no ending'], 'köra → kör, göra → gör'],
  [['группа 3 (короткие): + -r', 'Grupp 3 (korta): + -r', 'Group 3 (short): + -r'], 'bo → bor, tro → tror'],
  [['одна форма для всех лиц', 'samma form för alla personer', 'one form for all persons'], 'jag/du/hon/vi talar'],
];
const VERB_PRET = [
  [['группа 1: + -de', 'Grupp 1: + -de', 'Group 1: + -de'], 'tala → talade'],
  [['группа 2a: основа + -de', 'Grupp 2a: stam + -de', 'Group 2a: stem + -de'], 'stänga → stängde'],
  [['группа 2b (k, p, s, t, x): основа + -te', 'Grupp 2b (k, p, s, t, x): stam + -te', 'Group 2b (k, p, s, t, x): stem + -te'], 'köpa → köpte'],
  [['группа 3: + -dde', 'Grupp 3: + -dde', 'Group 3: + -dde'], 'bo → bodde'],
  [['группа 4 (сильные): смена гласного', 'Grupp 4 (starka): vokalväxling', 'Group 4 (strong): vowel change'], 'skriva → skrev, dricka → drack'],
];
const VERB_SUP = [
  [['группа 1: + -t', 'Grupp 1: + -t', 'Group 1: + -t'], 'tala → har talat'],
  [['группы 2: основа + -t', 'Grupp 2: stam + -t', 'Group 2: stem + -t'], 'stänga → har stängt, köpa → har köpt'],
  [['группа 3: + -tt', 'Grupp 3: + -tt', 'Group 3: + -tt'], 'bo → har bott'],
  [['группа 4: -it', 'Grupp 4: -it', 'Group 4: -it'], 'skriva → har skrivit'],
  [['перфект = har + супин; плюсквамперфект = hade + супин', 'perfekt = har + supinum; pluskvamperfekt = hade + supinum', 'perfect = har + supine; past perfect = hade + supine'], 'jag har ätit, jag hade ätit'],
];
const VERB_FUT = [
  [['намерение, план: ska + инфинитив', 'avsikt: ska + infinitiv', 'intention: ska + infinitive'], 'jag ska resa'],
  [['прогноз: kommer att + инфинитив', 'prognos: kommer att + infinitiv', 'prediction: kommer att + infinitive'], 'det kommer att regna'],
  [['часто — просто презенс', 'ofta – bara presens', 'often — just the present'], 'jag reser i morgon'],
  [['условное: skulle + инфинитив', 'konditionalis: skulle + infinitiv', 'conditional: skulle + infinitive'], 'jag skulle resa'],
];
const VERB_IMP = [
  [['группа 1 и 3: = инфинитив', 'Grupp 1 och 3: = infinitiv', 'Groups 1 and 3: = infinitive'], 'tala!, bo!'],
  [['группы 2 и 4: основа без -a', 'Grupp 2 och 4: stammen utan -a', 'Groups 2 and 4: the stem without -a'], 'köp!, skriv!, stäng!'],
  [['отрицание: inte после глагола', 'nekande: inte efter verbet', 'negative: inte after the verb'], 'spring inte!'],
];
const TOPICS = { 3: NOUN_GENDER, 4: NOUN_DEF, 5: NOUN_PL, 6: NOUN_DEFPL, 15: VERB_PRES, 16: VERB_PRET, 17: VERB_SUP, 18: VERB_FUT, 19: VERB_IMP };

export function grammarFormsBlock(unit) {
  if (!unit || unit.course_id !== 'grammar') return null;
  const spec = TOPICS[unit.n];
  if (!spec) return null;
  const i = { ru: 0, sv: 1, en: 2 }[L()];
  return h('div', {},
    h('h2', {}, tx('gfTitle')),
    h('div', { class: 'gf-card' },
      h('table', { class: 'gf-table' },
        h('thead', {}, h('tr', {}, h('th', {}, tr('rule')), h('th', {}, tr('example')))),
        h('tbody', {}, spec.map(([rule, ex]) => h('tr', {}, h('td', {}, rule[i]), h('td', {}, h('div', { class: 'gf-result' }, ex))))))));
}
