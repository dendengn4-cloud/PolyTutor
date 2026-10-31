// Формы турецких слов: тексты разделов «Формы глагола» и «Формы существительного», строки таблиц, проверка ответов.
// Сами формы приходят из базы (words.morph, собраны scripts/langs/tr/tr_forms.py):
//   глагол  {v: {inf, stem, pres[6], past[6], mis[6], fut[6], aor[6], neg[6], cond[6], nec[6], abil[6], imp[4]}}
//           лица: ben, sen, o, biz, siz, onlar; imp: sen, o, biz, siz
//   сущ.    {n: {sg[6], pl[6], poss[6]}} — падежи: именительный, винительный, родительный, дательный, местный, исходный;
//           poss: benim, senin, onun, bizim, sizin, onların
import { getLang } from '../i18n.js';

// ---------------------------------------------------------------- тексты (ru / tr / en)
const TX = {
  ru: {
    conjTitle: 'Формы глагола', conjSub: 'Времена и наклонения каждого глагола словаря по лицам. Уровни упражнений — свои у каждого глагола.',
    declTitle: 'Формы существительного', declSub: 'Падежи в единственном и множественном числе и формы принадлежности каждого существительного словаря.',
    inf: 'Инфинитив', pres: 'Настоящее -(I)yor', past: 'Прошедшее -DI', mis: 'Заглазное прошедшее -mIş', fut: 'Будущее -(y)AcAk',
    aor: 'Широкое время -(A/I)r', neg: 'Настоящее, отрицание -mIyor', cond: 'Условное -sA', nec: 'Долженствование -mAlI',
    abil: 'Возможность -(y)Abilir', imp: 'Повелительное',
    nom: 'Именительный', acc: 'Винительный (кого? что?)', gen: 'Родительный (чей?)', dat: 'Дательный (куда? кому?)',
    loc: 'Местный (где?)', abl: 'Исходный (откуда?)', sgCol: 'ед. ч.', plCol: 'мн. ч.', poss: 'Принадлежность', pl: 'Множественное число',
    persons: ['ben', 'sen', 'o', 'biz', 'siz', 'onlar'], impPersons: ['sen', 'o', 'biz', 'siz'],
    possPersons: ['benim', 'senin', 'onun', 'bizim', 'sizin', 'onların'],
    personRu: ['я', 'ты', 'он, она', 'мы', 'вы', 'они'],
    aorIr: 'широкое время на -Ir', aorAr: 'широкое время на -Ar', aorR: 'широкое время на -r',
    lvWord: 'слово', lvForm: 'форма', lvTable: 'таблица', lvDecl: 'формы',
    trainForm: 'Напишите форму', trainTable: 'Все лица', trainDecl: 'Формы существительных',
    trainFormThis: 'Напишите форму', trainTableThis: 'Все лица', trainDeclThis: 'Тренировать формы',
    search: 'Поиск: турецкое или русское слово', nVerbs: (n) => `${n} гл.`, nNouns: (n) => `${n} сущ.`,
    open: (n, all) => `Открыто времён: ${n} из ${all}. Новые открываются, когда вы читаете темы грамматики о глаголе или сдаёте тест уровня.`,
    openNoun: (n, all) => `Открыто форм: ${n} из ${all}. Новые открываются с темами грамматики «Падежи», «Аффиксы принадлежности» и «Множественное число».`,
    openNone: 'Формы откроются, когда вы прочитаете тему грамматики «Настоящее время на -(I)yor».',
    openNoneNoun: 'Формы откроются с темой грамматики «Падежи».',
    cap: (n) => `Максимальный уровень упражнений сейчас: ${n} из 15 — растёт с пройденными темами.`,
    notStudied: 'тема не пройдена', showAll: (n) => `Показать ещё ${n}`, hideAll: 'Скрыть непройденные',
    check: 'Проверить', next: 'Далее', done: 'Готово', again: 'Ещё раз', back: 'К списку', dontKnow: 'Не знаю',
    right: 'Верно', wrong: 'Правильно:', result: (a, b) => `Верно ${a} из ${b}`, levelNow: (l) => `Уровень: ${l}`,
    noWords: 'Пока нет слов для тренировки: начните учить слова — и они появятся здесь.',
    noOpen: 'Сначала прочитайте темы грамматики — формы откроются для тренировки.',
    writeForm: (label) => `Напишите: ${label}`, fillAll: 'Напишите все формы', gfTitle: 'Как образуется',
    hint: 'Формы построены по правилам; у части слов есть исключения. Если форма неверна, нажмите ⚑.',
  },
  tr: {
    conjTitle: 'Fiil çekimi', conjSub: 'Sözlükteki her fiilin kişilere göre zamanları ve kipleri. Her fiilin kendi alıştırma seviyeleri vardır.',
    declTitle: 'İsim çekimi', declSub: 'Sözlükteki her ismin tekil ve çoğul hâlleri ile iyelik biçimleri.',
    inf: 'Mastar', pres: 'Şimdiki zaman -(I)yor', past: 'Görülen geçmiş -DI', mis: 'Öğrenilen geçmiş -mIş', fut: 'Gelecek zaman -(y)AcAk',
    aor: 'Geniş zaman -(A/I)r', neg: 'Şimdiki zaman, olumsuz -mIyor', cond: 'Şart kipi -sA', nec: 'Gereklilik kipi -mAlI',
    abil: 'Yeterlilik -(y)Abilir', imp: 'Emir kipi',
    nom: 'Yalın hâl', acc: 'Belirtme hâli (-I)', gen: 'İlgi hâli (-In)', dat: 'Yönelme hâli (-A)', loc: 'Bulunma hâli (-DA)',
    abl: 'Ayrılma hâli (-DAn)', sgCol: 'tekil', plCol: 'çoğul', poss: 'İyelik', pl: 'Çoğul',
    persons: ['ben', 'sen', 'o', 'biz', 'siz', 'onlar'], impPersons: ['sen', 'o', 'biz', 'siz'],
    possPersons: ['benim', 'senin', 'onun', 'bizim', 'sizin', 'onların'],
    personRu: ['', '', '', '', '', ''],
    aorIr: 'geniş zaman -Ir', aorAr: 'geniş zaman -Ar', aorR: 'geniş zaman -r',
    lvWord: 'kelime', lvForm: 'biçim', lvTable: 'tablo', lvDecl: 'hâller',
    trainForm: 'Biçimi yaz', trainTable: 'Bütün kişiler', trainDecl: 'İsim çekimi',
    trainFormThis: 'Biçimi yaz', trainTableThis: 'Bütün kişiler', trainDeclThis: 'Hâlleri çalış',
    search: 'Ara: Türkçe ya da Rusça kelime', nVerbs: (n) => `${n} fiil`, nNouns: (n) => `${n} isim`,
    open: (n, all) => `Açık zamanlar: ${n} / ${all}. Fiille ilgili dil bilgisi konularını okudukça ya da seviye sınavını geçtikçe yenileri açılır.`,
    openNoun: (n, all) => `Açık biçimler: ${n} / ${all}. Yenileri “Hâl ekleri”, “İyelik ekleri” ve “Çoğul eki” konularıyla açılır.`,
    openNone: 'Biçimler “Şimdiki zaman: -(I)yor” konusunu okuyunca açılır.',
    openNoneNoun: 'Biçimler “Hâl ekleri” konusuyla açılır.',
    cap: (n) => `Şu anki en yüksek alıştırma seviyesi: ${n} / 15 — okunan konularla artar.`,
    notStudied: 'konu okunmadı', showAll: (n) => `${n} tane daha göster`, hideAll: 'Okunmayanları gizle',
    check: 'Kontrol et', next: 'İleri', done: 'Tamam', again: 'Yeniden', back: 'Listeye', dontKnow: 'Bilmiyorum',
    right: 'Doğru', wrong: 'Doğrusu:', result: (a, b) => `${a} / ${b} doğru`, levelNow: (l) => `Seviye: ${l}`,
    noWords: 'Henüz çalışılacak kelime yok: kelime öğrenmeye başlayın, burada görünecekler.',
    noOpen: 'Önce dil bilgisi konularını okuyun — biçimler alıştırma için açılır.',
    writeForm: (label) => `Yazın: ${label}`, fillAll: 'Bütün biçimleri yazın', gfTitle: 'Nasıl yapılır',
    hint: 'Biçimler kurallara göre oluşturuldu; bazı kelimelerin istisnaları var. Bir biçim yanlışsa ⚑ simgesine dokunun.',
  },
  en: {
    conjTitle: 'Verb forms', conjSub: 'Tenses and moods of every verb in the dictionary, by person. Each verb has its own exercise levels.',
    declTitle: 'Noun forms', declSub: 'Cases in the singular and plural and possessive forms of every noun in the dictionary.',
    inf: 'Infinitive', pres: 'Present -(I)yor', past: 'Past -DI', mis: 'Reported past -mIş', fut: 'Future -(y)AcAk',
    aor: 'Aorist -(A/I)r', neg: 'Present, negative -mIyor', cond: 'Conditional -sA', nec: 'Necessity -mAlI',
    abil: 'Ability -(y)Abilir', imp: 'Imperative',
    nom: 'Nominative', acc: 'Accusative (-I)', gen: 'Genitive (-In)', dat: 'Dative (-A)', loc: 'Locative (-DA)', abl: 'Ablative (-DAn)',
    sgCol: 'sg.', plCol: 'pl.', poss: 'Possessive', pl: 'Plural',
    persons: ['ben', 'sen', 'o', 'biz', 'siz', 'onlar'], impPersons: ['sen', 'o', 'biz', 'siz'],
    possPersons: ['benim', 'senin', 'onun', 'bizim', 'sizin', 'onların'],
    personRu: ['I', 'you', 'he/she', 'we', 'you (pl.)', 'they'],
    aorIr: 'aorist in -Ir', aorAr: 'aorist in -Ar', aorR: 'aorist in -r',
    lvWord: 'word', lvForm: 'form', lvTable: 'table', lvDecl: 'forms',
    trainForm: 'Type the form', trainTable: 'All persons', trainDecl: 'Noun forms',
    trainFormThis: 'Type the form', trainTableThis: 'All persons', trainDeclThis: 'Practise forms',
    search: 'Search: Turkish or Russian word', nVerbs: (n) => `${n} verbs`, nNouns: (n) => `${n} nouns`,
    open: (n, all) => `Open tenses: ${n} of ${all}. New ones open as you read grammar topics on the verb or pass a level test.`,
    openNoun: (n, all) => `Open forms: ${n} of ${all}. New ones open with the grammar topics on cases, possessive suffixes and the plural.`,
    openNone: 'The forms open once you read the grammar topic “Present tense -(I)yor”.',
    openNoneNoun: 'The forms open with the grammar topic “Cases”.',
    cap: (n) => `Highest exercise level now: ${n} of 15 — it grows with the topics you read.`,
    notStudied: 'topic not read', showAll: (n) => `Show ${n} more`, hideAll: 'Hide unread',
    check: 'Check', next: 'Next', done: 'Done', again: 'Again', back: 'Back to the list', dontKnow: 'Don’t know',
    right: 'Correct', wrong: 'Correct answer:', result: (a, b) => `${a} of ${b} correct`, levelNow: (l) => `Level: ${l}`,
    noWords: 'No words to practise yet: start learning words and they will appear here.',
    noOpen: 'Read the grammar topics first — then the forms open for practice.',
    writeForm: (label) => `Type: ${label}`, fillAll: 'Type all the forms', gfTitle: 'How the forms are built',
    hint: 'The forms follow the rules; some words have exceptions. If a form is wrong, tap ⚑.',
  },
};
export function tx(key, ...args) {
  const l = getLang();
  const d = TX[l] || TX.ru;
  const v = d[key] ?? TX.ru[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
}

// ---------------------------------------------------------------- какие формы открыты (по темам грамматики)
// Темы турецкой грамматики: 3 -(I)yor, 5 -DI, 6 -mIş, 7 будущее, 8 отрицание, 9 падежи, 10 принадлежность,
// 11 множественное число, 16 широкое время, 17 повелительное, 18 возможность, 20 долженствование, 21 условное.
export const VERB_TOPIC = { pres: 3, past: 5, mis: 6, fut: 7, neg: 8, aor: 16, imp: 17, abil: 18, nec: 20, cond: 21 };
export const TENSES = ['pres', 'past', 'mis', 'fut', 'neg', 'aor', 'imp', 'abil', 'nec', 'cond'];
export const NOUN_TOPIC = { cases: 9, poss: 10, pl: 11 };
export const CASES = ['nom', 'acc', 'gen', 'dat', 'loc', 'abl'];

function passed(state) {
  return new Set((state && Array.isArray(state.grammar) ? state.grammar : []).map(Number));
}
export function openVerbForms(state) {
  const p = passed(state);
  return new Set(TENSES.filter((k) => p.has(VERB_TOPIC[k])));
}
export function openNounForms(state) {
  const p = passed(state);
  return new Set(Object.keys(NOUN_TOPIC).filter((k) => p.has(NOUN_TOPIC[k])));
}

// ---------------------------------------------------------------- глагол
export const personsOf = (key) => (key === 'imp' ? tx('impPersons') : tx('persons'));

// тип широкого времени: -r (основа на гласную), -Ar или -Ir
export function aorType(v) {
  if (!v || !v.aor) return '';
  const base = v.aor[2].split(' ').pop();
  const stem = v.stem.split(' ').pop();
  if (base === `${stem}r`) return tx('aorR');
  return /[ae]r$/.test(base) ? tx('aorAr') : tx('aorIr');
}

// строки таблицы глагола: [{key, label, forms:[{p, f}]}]
export function verbRows(m) {
  const v = m && m.v;
  if (!v) return [];
  return [{ key: 'inf', label: tx('inf'), forms: [{ p: '', f: v.inf }] },
    ...TENSES.filter((k) => Array.isArray(v[k])).map((k) => ({
      key: k, label: tx(k), forms: v[k].map((f, i) => ({ p: personsOf(k)[i], f })),
    }))];
}
// одна форма: 'pres.0' → {label, form}
export function verbSlot(v, slot) {
  const [k, i] = slot.split('.');
  const n = Number(i);
  return { label: `${tx(k)} · ${personsOf(k)[n]}`, short: personsOf(k)[n], form: v[k][n] };
}

// ---------------------------------------------------------------- существительное
export function nounRows(m) {
  const n = m && m.n;
  if (!n) return [];
  return CASES.map((c, i) => ({ key: c, label: tx(c), sg: n.sg[i], pl: n.pl[i] }));
}
export function nounSlot(n, slot) {
  const [k, i] = slot.split('.');
  const x = Number(i);
  if (k === 'sg') return { label: `${tx(CASES[x])} · ${tx('sgCol')}`, form: n.sg[x] };
  if (k === 'pl') return { label: `${tx(CASES[x])} · ${tx('plCol')}`, form: n.pl[x] };
  return { label: `${tx('poss')} · ${tx('possPersons')[x]}`, form: n.poss[x] };
}
// какие ячейки существительного можно тренировать при открытых темах
export function nounSlots(open) {
  const out = [];
  if (open.has('cases')) for (let i = 1; i < 6; i++) out.push(`sg.${i}`);
  if (open.has('pl')) { out.push('pl.0'); if (open.has('cases')) for (let i = 1; i < 6; i++) out.push(`pl.${i}`); }
  if (open.has('poss')) for (let i = 0; i < 6; i++) out.push(`poss.${i}`);
  return out;
}

// ---------------------------------------------------------------- проверка ответа
// по-турецки: регистр не важен (I/ı, İ/i), â î û = a i u, лишние пробелы и знаки — не важны;
// можно написать с личным местоимением: «ben geliyorum» = «geliyorum»
const PRON = /^(ben|sen|o|biz|siz|onlar|benim|senin|onun|bizim|sizin|onların)\s+/;
const norm = (s) => String(s || '').normalize('NFC').replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase()
  .replace(/[âîû]/g, (c) => ({ 'â': 'a', 'î': 'i', 'û': 'u' })[c]).replace(/[!.?,]/g, '').replace(/\s+/g, ' ').trim().replace(PRON, '');
export function formOk(answer, correct) {
  const c = norm(correct);
  return Boolean(c) && norm(answer) === c;
}
