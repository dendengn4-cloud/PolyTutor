// Формы шведских слов: тексты разделов «Спряжение» и «Склонение», строки таблиц, проверка ответов.
// Сами формы приходят из базы (words.morph, собраны scripts/langs/sv/sv_forms.py):
//   глагол  {v: {inf, pres, pret, sup, imp}, tr: {ru: {inf, pres[6], past[3], imp[2]}, en: {f[5]}}}
//   сущ.    {n: {g, sg, def, pl, defpl}}
import { getLang } from '../i18n.js';

// ---------------------------------------------------------------- тексты (ru / sv / en)
const TX = {
  ru: {
    conjTitle: 'Формы глагола', conjSub: 'Пять основных форм каждого глагола словаря и время, которое из них строится. Уровни упражнений — свои у каждого глагола.',
    declTitle: 'Формы существительного', declSub: 'Род (en/ett), определённая форма и множественное число каждого существительного словаря.',
    inf: 'Инфинитив', pres: 'Презенс — настоящее', pret: 'Претерит — прошедшее', sup: 'Супин', imp: 'Повелительное',
    perf: 'Перфект: har + супин', plusq: 'Плюсквамперфект: hade + супин', fut: 'Будущее: ska / kommer att + инфинитив',
    cond: 'Условное: skulle + инфинитив',
    sg: 'Ед. ч., неопределённая', def: 'Ед. ч., определённая', pl: 'Мн. ч., неопределённая', defpl: 'Мн. ч., определённая',
    gender: 'Род', noPlural: 'обычно без множественного числа',
    group: (g) => (g === 4 ? 'Сильный / неправильный глагол' : `Группа ${g}`),
    decl: (d) => (d ? `${d}-е склонение` : 'Особые формы'),
    lvWord: 'слово', lvForm: 'форма', lvTable: 'таблица', lvDecl: 'формы',
    trainForm: 'Напишите форму', trainTable: 'Все формы глагола', trainDecl: 'Формы существительных',
    trainFormThis: 'Напишите форму', trainTableThis: 'Все формы', trainDeclThis: 'Тренировать формы',
    search: 'Поиск: шведское или русское слово', nVerbs: (n) => `${n} гл.`, nNouns: (n) => `${n} сущ.`,
    open: (n, all) => `Открыто форм: ${n} из ${all}. Новые формы открываются, когда вы читаете темы грамматики о глаголе или сдаёте тест уровня.`,
    openNoun: (n, all) => `Открыто форм: ${n} из ${all}. Новые открываются с темами грамматики о существительном.`,
    openNone: 'Формы откроются, когда вы прочитаете первые темы грамматики о глаголе (инфинитив и настоящее время).',
    openNoneNoun: 'Формы откроются с темой грамматики «Определённая форма».',
    cap: (n) => `Максимальный уровень упражнений сейчас: ${n} из 15 — растёт с пройденными темами.`,
    notStudied: 'тема не пройдена', showAll: (n) => `Показать ещё ${n}`, hideAll: 'Скрыть непройденные',
    check: 'Проверить', next: 'Далее', done: 'Готово', again: 'Ещё раз', back: 'К списку', dontKnow: 'Не знаю',
    right: 'Верно', wrong: 'Правильно:', result: (a, b) => `Верно ${a} из ${b}`, levelNow: (l) => `Уровень: ${l}`,
    noWords: 'Пока нет слов для тренировки: начните учить слова — и они появятся здесь.',
    noOpen: 'Сначала прочитайте темы грамматики — формы откроются для тренировки.',
    writeForm: (label) => `Напишите: ${label.toLowerCase()}`, fillAll: 'Напишите все формы', gfTitle: 'Как образуется',
    jag: 'я', will: 'буду', would: 'бы',
  },
  sv: {
    conjTitle: 'Verbets former', conjSub: 'De fem huvudformerna av varje verb i ordlistan och tempusen som bildas av dem. Övningsnivåerna är egna för varje verb.',
    declTitle: 'Substantivets former', declSub: 'Genus (en/ett), bestämd form och plural för varje substantiv i ordlistan.',
    inf: 'Infinitiv', pres: 'Presens', pret: 'Preteritum', sup: 'Supinum', imp: 'Imperativ',
    perf: 'Perfekt: har + supinum', plusq: 'Pluskvamperfekt: hade + supinum', fut: 'Futurum: ska / kommer att + infinitiv',
    cond: 'Konditionalis: skulle + infinitiv',
    sg: 'Singular, obestämd', def: 'Singular, bestämd', pl: 'Plural, obestämd', defpl: 'Plural, bestämd',
    gender: 'Genus', noPlural: 'oftast utan plural',
    group: (g) => (g === 4 ? 'Starkt / oregelbundet verb' : `Grupp ${g}`),
    decl: (d) => (d ? `Deklination ${d}` : 'Särskilda former'),
    lvWord: 'ord', lvForm: 'form', lvTable: 'tabell', lvDecl: 'former',
    trainForm: 'Skriv formen', trainTable: 'Alla verbformer', trainDecl: 'Substantivformer',
    trainFormThis: 'Skriv formen', trainTableThis: 'Alla former', trainDeclThis: 'Öva formerna',
    search: 'Sök: svenskt eller ryskt ord', nVerbs: (n) => `${n} verb`, nNouns: (n) => `${n} subst.`,
    open: (n, all) => `Öppna former: ${n} av ${all}. Nya former öppnas när du läser grammatikteman om verbet eller klarar ett nivåtest.`,
    openNoun: (n, all) => `Öppna former: ${n} av ${all}. Nya öppnas med grammatikteman om substantivet.`,
    openNone: 'Formerna öppnas när du läser de första grammatiktemana om verbet (infinitiv och presens).',
    openNoneNoun: 'Formerna öppnas med grammatiktemat ”Bestämd form”.',
    cap: (n) => `Högsta övningsnivå just nu: ${n} av 15 – den växer med lästa teman.`,
    notStudied: 'temat inte läst', showAll: (n) => `Visa ${n} till`, hideAll: 'Dölj olästa',
    check: 'Kontrollera', next: 'Nästa', done: 'Klart', again: 'En gång till', back: 'Till listan', dontKnow: 'Vet inte',
    right: 'Rätt', wrong: 'Rätt svar:', result: (a, b) => `Rätt ${a} av ${b}`, levelNow: (l) => `Nivå: ${l}`,
    noWords: 'Inga ord att öva än: börja lära dig ord, så dyker de upp här.',
    noOpen: 'Läs först grammatiktemana – då öppnas formerna för övning.',
    writeForm: (label) => `Skriv: ${label.toLowerCase()}`, fillAll: 'Skriv alla former', gfTitle: 'Så bildas formerna',
    jag: 'jag', will: 'ska', would: 'skulle',
  },
  en: {
    conjTitle: 'Verb forms', conjSub: 'The five principal forms of every verb in the dictionary and the tenses built from them. Each verb has its own exercise levels.',
    declTitle: 'Noun forms', declSub: 'Gender (en/ett), definite form and plural of every noun in the dictionary.',
    inf: 'Infinitive', pres: 'Present', pret: 'Past (preterite)', sup: 'Supine', imp: 'Imperative',
    perf: 'Perfect: har + supine', plusq: 'Past perfect: hade + supine', fut: 'Future: ska / kommer att + infinitive',
    cond: 'Conditional: skulle + infinitive',
    sg: 'Singular, indefinite', def: 'Singular, definite', pl: 'Plural, indefinite', defpl: 'Plural, definite',
    gender: 'Gender', noPlural: 'usually no plural',
    group: (g) => (g === 4 ? 'Strong / irregular verb' : `Group ${g}`),
    decl: (d) => (d ? `Declension ${d}` : 'Special forms'),
    lvWord: 'word', lvForm: 'form', lvTable: 'table', lvDecl: 'forms',
    trainForm: 'Type the form', trainTable: 'All verb forms', trainDecl: 'Noun forms',
    trainFormThis: 'Type the form', trainTableThis: 'All forms', trainDeclThis: 'Practise forms',
    search: 'Search: Swedish or Russian word', nVerbs: (n) => `${n} verbs`, nNouns: (n) => `${n} nouns`,
    open: (n, all) => `Open forms: ${n} of ${all}. New forms open as you read grammar topics on the verb or pass a level test.`,
    openNoun: (n, all) => `Open forms: ${n} of ${all}. New ones open with grammar topics on the noun.`,
    openNone: 'The forms open once you read the first grammar topics on the verb (infinitive and present).',
    openNoneNoun: 'The forms open with the grammar topic “Definite form”.',
    cap: (n) => `Highest exercise level now: ${n} of 15 — it grows with the topics you read.`,
    notStudied: 'topic not read', showAll: (n) => `Show ${n} more`, hideAll: 'Hide unread',
    check: 'Check', next: 'Next', done: 'Done', again: 'Again', back: 'Back to the list', dontKnow: 'Don’t know',
    right: 'Correct', wrong: 'Correct answer:', result: (a, b) => `${a} of ${b} correct`, levelNow: (l) => `Level: ${l}`,
    noWords: 'No words to practise yet: start learning words and they will appear here.',
    noOpen: 'Read the grammar topics first — then the forms open for practice.',
    writeForm: (label) => `Type: ${label.toLowerCase()}`, fillAll: 'Type all the forms', gfTitle: 'How the forms are built',
    jag: 'I', will: 'will', would: 'would',
  },
};
export function tx(key, ...args) {
  const l = getLang();
  const d = TX[l] || (l === 'sv' ? TX.sv : TX.ru);
  const v = d[key] ?? TX.ru[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
}

// ---------------------------------------------------------------- какие формы открыты (по темам грамматики)
// Темы шведской грамматики: 3 en/ett, 4 опр. форма, 5 мн. число, 6 опр. мн., 15 инфинитив и презенс,
// 16 претерит, 17 супин и перфект, 18 будущее, 19 повелительное.
export const VERB_TOPIC = { inf: 15, pres: 15, pret: 16, sup: 17, imp: 19, perf: 17, plusq: 17, fut: 18, cond: 18 };
export const NOUN_TOPIC = { def: 4, pl: 5, defpl: 6 };
export const VERB_DRILL = ['pres', 'pret', 'sup', 'imp'];
export const NOUN_DRILL = ['def', 'pl', 'defpl'];

function passed(state) {
  return new Set((state && Array.isArray(state.grammar) ? state.grammar : []).map(Number));
}
export function openVerbForms(state) {
  const p = passed(state);
  return new Set(Object.keys(VERB_TOPIC).filter((k) => p.has(VERB_TOPIC[k])));
}
export function openNounForms(state) {
  const p = passed(state);
  return new Set(Object.keys(NOUN_TOPIC).filter((k) => p.has(NOUN_TOPIC[k])));
}

// ---------------------------------------------------------------- глагол
export function verbGroup(v) {
  if (!v) return 0;
  const head = (s) => (s || '').split(' ')[0];
  const inf = head(v.inf), pret = head(v.pret);
  if (pret === `${inf}de` && inf.endsWith('a')) return 1;
  if (/dde$/.test(pret) && !inf.endsWith('a')) return 3;
  const stem = inf.endsWith('a') ? inf.slice(0, -1) : inf;
  if (pret.startsWith(stem.replace(/(mm|nn)$/, (m) => m[0])) && /(de|te|dde|tte)$/.test(pret)) return 2;
  return 4;
}

const swapSig = (s) => s.replace(/\bsig\b/g, 'mig').replace(/\bsitt\b/g, 'mitt');

// перевод формы: 'pres' → «я строю», 'fut' → «я буду строить»
function gloss(tr, key) {
  if (!tr) return '';
  if (getLang() === 'en') {
    const f = tr.en && tr.en.f;
    if (!f) return '';
    const [base, , past, pp] = f;
    return { inf: `to ${base}`, pres: `I ${base}`, pret: `I ${past}`, sup: `(have) ${pp}`, imp: `${base}!`, perf: `I have ${pp}`,
      plusq: `I had ${pp}`, fut: `I will ${base}`, cond: `I would ${base}` }[key] || '';
  }
  const r = tr.ru;
  if (!r) return '';
  return { inf: r.inf, pres: `я ${r.pres[0]}`, pret: `я ${r.past[0]}`, sup: '', imp: `${r.imp[0]}!`, perf: `я ${r.past[0]}`,
    plusq: `я ${r.past[0]} (раньше)`, fut: `я буду ${r.inf}`, cond: `я ${r.past[0]} бы` }[key] || '';
}

// строки таблицы глагола: [{key, label, form, example, tr}]
export function verbRows(m) {
  const v = m && m.v;
  if (!v) return [];
  const tr = m.tr || (m.ru ? { ru: m.ru } : null);
  const jag = (s) => `jag ${swapSig(s)}`;
  const rows = [
    { key: 'inf', form: `att ${v.inf}`, example: '' },
    { key: 'pres', form: v.pres, example: jag(v.pres) },
    { key: 'pret', form: v.pret, example: jag(v.pret) },
    { key: 'sup', form: v.sup, example: '' },
    { key: 'imp', form: v.imp ? `${v.imp}!` : '—', example: '' },
    { key: 'perf', form: `har ${v.sup}`, example: jag(`har ${v.sup}`) },
    { key: 'plusq', form: `hade ${v.sup}`, example: jag(`hade ${v.sup}`) },
    { key: 'fut', form: `ska ${v.inf} · kommer att ${v.inf}`, example: jag(`ska ${v.inf}`) },
    { key: 'cond', form: `skulle ${v.inf}`, example: jag(`skulle ${v.inf}`) },
  ];
  return rows.map((r) => ({ ...r, label: tx(r.key), tr: gloss(tr, r.key) }));
}

// ---------------------------------------------------------------- существительное
export function nounRows(m) {
  const n = m && m.n;
  if (!n) return [];
  return [
    { key: 'sg', label: tx('sg'), form: `${n.g} ${n.sg}` },
    { key: 'def', label: tx('def'), form: n.def },
    { key: 'pl', label: tx('pl'), form: n.pl || '—', none: !n.pl },
    { key: 'defpl', label: tx('defpl'), form: n.defpl || '—', none: !n.defpl },
  ];
}

// ---------------------------------------------------------------- проверка ответа
// принимаются равноправные варианты: sa/sade, la/lade, gett/givit; без учёта регистра и лишних пробелов
const ALT = { sa: ['sade'], sade: ['sa'], la: ['lade'], lade: ['la'], gett: ['givit'], givit: ['gett'], blev: ['blev'] };
const norm = (s) => String(s || '').toLowerCase().replace(/[!.?]/g, '').replace(/^att\s+/, '').replace(/\s+/g, ' ').trim();
export function formOk(answer, correct) {
  const a = norm(answer), c = norm(correct);
  if (!c || c === '—') return false;
  if (a === c) return true;
  const [ch, ...crest] = c.split(' ');
  const [ah, ...arest] = a.split(' ');
  return (ALT[ch] || []).includes(ah) && arest.join(' ') === crest.join(' ');
}
