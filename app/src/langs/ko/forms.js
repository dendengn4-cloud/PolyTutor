// Формы корейских слов: тексты разделов «Формы глагола» и «Частицы существительного», строки таблиц, проверка ответов.
// Сами формы приходят из базы (words.morph, собраны scripts/langs/ko/ko_forms.py):
//   глагол/прилагательное {v: {inf, stem, irr, adj, pres[3], past[3], fut[3], neg[3], nec[3], conn[3], cond[2], mod[1|3],
//                              hon[3]?, want[3]?, abil[3]?, imp[3]?, prog[3]?}}
//     три стиля: 해요 (вежливый), 합니다 (официальный), 반말 (дружеский); у прилагательных нет want/abil/imp/prog
//   сущ.  {n: {p[7]}} — 은/는, 이/가, 을/를, 이에요/예요, 와/과, (으)로, (이)랑
import { getLang } from '../i18n.js';

const STYLES = ['해요', '합니다', '반말'];

// ---------------------------------------------------------------- тексты (ru / ko / en)
const TX = {
  ru: {
    conjTitle: 'Формы глагола', conjSub: 'Времена и обороты каждого глагола и прилагательного словаря в трёх стилях вежливости. Уровни упражнений — свои у каждого слова.',
    declTitle: 'Частицы существительного', declSub: 'С какой формой частицы употребляется каждое существительное словаря: после согласной или после гласной.',
    inf: 'Словарная форма', pres: 'Настоящее время', past: 'Прошедшее -았/었-', fut: 'Будущее -(으)ㄹ 거예요',
    neg: 'Отрицание -지 않다', want: 'Желание -고 싶다', abil: 'Возможность -(으)ㄹ 수 있다', nec: 'Необходимость -아/어야 하다',
    imp: 'Просьба -(으)세요', prog: 'Длительное -고 있다', hon: 'Уважительные формы -(으)시-', conn: 'Связки: и, но, и потому',
    cond: 'Если, даже если', mod: 'Определительная форма',
    styles: STYLES, styleRu: ['вежливо', 'официально', 'с друзьями'],
    labels: {
      imp: ['-(으)세요', '-(으)십시오', '반말'], hon: ['наст. 해요', 'наст. 합니다', 'прош. 해요'],
      conn: ['-고', '-지만', '-아/어서'], cond: ['-(으)면', '-아/어도'],
      mod: ['наст. -는', 'прош. -(으)ㄴ', 'буд. -(으)ㄹ'], modAdj: ['-(으)ㄴ'],
    },
    irr: { b: 'неправильный на ㅂ', d: 'неправильный на ㄷ', s: 'неправильный на ㅅ', h: 'неправильный на ㅎ',
      l: 'основа на ㄹ (ㄹ выпадает)', reu: 'неправильный на 르', eu: 'выпадение ㅡ' },
    adjNote: 'прилагательное',
    parts: ['тема 은/는', 'подлежащее 이/가', 'объект 을/를', 'связка 이에요/예요', '«и, с» 와/과', 'направление (으)로', '«и, с» (이)랑 (разг.)'],
    partsShort: ['은/는', '이/가', '을/를', '이에요/예요', '와/과', '(으)로', '(이)랑'],
    lvWord: 'слово', lvForm: 'форма', lvTable: 'таблица', lvDecl: 'частицы',
    trainForm: 'Напишите форму', trainTable: 'Все стили', trainDecl: 'Частицы',
    trainFormThis: 'Напишите форму', trainTableThis: 'Все стили', trainDeclThis: 'Тренировать частицы',
    search: 'Поиск: корейское или русское слово', nVerbs: (n) => `${n} сл.`, nNouns: (n) => `${n} сущ.`,
    open: (n, all) => `Открыто форм: ${n} из ${all}. Новые открываются, когда вы читаете темы грамматики о глаголе или сдаёте тест уровня.`,
    openNoun: (n, all) => `Открыто частиц: ${n} из ${all}. Новые открываются с темами грамматики о связке 이다, частицах темы, подлежащего, объекта и других.`,
    openNone: 'Формы откроются, когда вы прочитаете тему грамматики «Вежливый стиль 해요: настоящее время».',
    openNoneNoun: 'Частицы откроются с темами грамматики «Связка 이다» и «Частицы темы и подлежащего».',
    cap: (n) => `Максимальный уровень упражнений сейчас: ${n} из 15 — растёт с пройденными темами.`,
    notStudied: 'тема не пройдена', showAll: (n) => `Показать ещё ${n}`, hideAll: 'Скрыть непройденные',
    check: 'Проверить', next: 'Далее', done: 'Готово', again: 'Ещё раз', back: 'К списку', dontKnow: 'Не знаю',
    right: 'Верно', wrong: 'Правильно:', result: (a, b) => `Верно ${a} из ${b}`, levelNow: (l) => `Уровень: ${l}`,
    noWords: 'Пока нет слов для тренировки: начните учить слова — и они появятся здесь.',
    noOpen: 'Сначала прочитайте темы грамматики — формы откроются для тренировки.',
    writeForm: (label) => `Напишите: ${label}`, fillAll: 'Напишите все формы', gfTitle: 'Как образуется',
    hint: 'Формы построены по правилам; у части слов есть исключения. Пробелы при проверке не важны. Если форма неверна, нажмите ⚑.',
    sgCol: 'форма', plCol: '',
  },
  ko: {
    conjTitle: '용언 활용', conjSub: '사전에 있는 동사와 형용사의 시제와 표현을 세 가지 높임 등급으로 보여 줍니다. 단어마다 연습 단계가 따로 있습니다.',
    declTitle: '명사와 조사', declSub: '받침이 있는 명사와 없는 명사에 붙는 조사의 모양을 연습합니다.',
    inf: '기본형', pres: '현재', past: '과거 -았/었-', fut: '미래 -(으)ㄹ 거예요', neg: '부정 -지 않다', want: '희망 -고 싶다',
    abil: '가능 -(으)ㄹ 수 있다', nec: '의무 -아/어야 하다', imp: '명령·요청 -(으)세요', prog: '진행 -고 있다',
    hon: '높임 -(으)시-', conn: '연결 어미', cond: '조건과 양보', mod: '관형형',
    styles: STYLES, styleRu: ['해요체', '합쇼체', '반말'],
    labels: {
      imp: ['-(으)세요', '-(으)십시오', '반말'], hon: ['현재 해요', '현재 합니다', '과거 해요'],
      conn: ['-고', '-지만', '-아/어서'], cond: ['-(으)면', '-아/어도'],
      mod: ['현재 -는', '과거 -(으)ㄴ', '미래 -(으)ㄹ'], modAdj: ['-(으)ㄴ'],
    },
    irr: { b: 'ㅂ 불규칙', d: 'ㄷ 불규칙', s: 'ㅅ 불규칙', h: 'ㅎ 불규칙', l: 'ㄹ 탈락', reu: '르 불규칙', eu: 'ㅡ 탈락' },
    adjNote: '형용사',
    parts: ['주제 은/는', '주어 이/가', '목적어 을/를', '이에요/예요', '와/과', '(으)로', '(이)랑'],
    partsShort: ['은/는', '이/가', '을/를', '이에요/예요', '와/과', '(으)로', '(이)랑'],
    lvWord: '단어', lvForm: '형태', lvTable: '표', lvDecl: '조사',
    trainForm: '형태 쓰기', trainTable: '모든 등급', trainDecl: '조사',
    trainFormThis: '형태 쓰기', trainTableThis: '모든 등급', trainDeclThis: '조사 연습',
    search: '검색: 한국어나 러시아어 단어', nVerbs: (n) => `${n}개`, nNouns: (n) => `${n}개`,
    open: (n, all) => `열린 형태: ${n} / ${all}. 용언에 관한 문법 주제를 읽거나 수준 시험에 합격하면 새 형태가 열립니다.`,
    openNoun: (n, all) => `열린 조사: ${n} / ${all}. 이다, 조사에 관한 문법 주제를 읽으면 열립니다.`,
    openNone: '"해요체: 현재" 문법 주제를 읽으면 형태가 열립니다.',
    openNoneNoun: '"이다"와 "은/는, 이/가" 문법 주제를 읽으면 조사가 열립니다.',
    cap: (n) => `지금 가장 높은 연습 단계: ${n} / 15 — 읽은 주제와 함께 올라갑니다.`,
    notStudied: '아직 안 읽음', showAll: (n) => `${n}개 더 보기`, hideAll: '안 읽은 것 숨기기',
    check: '확인', next: '다음', done: '완료', again: '다시', back: '목록으로', dontKnow: '모르겠어요',
    right: '맞았어요', wrong: '정답:', result: (a, b) => `${b}개 중 ${a}개 정답`, levelNow: (l) => `단계: ${l}`,
    noWords: '아직 연습할 단어가 없습니다. 단어를 배우기 시작하면 여기에 나타납니다.',
    noOpen: '먼저 문법 주제를 읽으세요. 그러면 연습할 형태가 열립니다.',
    writeForm: (label) => `쓰세요: ${label}`, fillAll: '모든 형태를 쓰세요', gfTitle: '만드는 법',
    hint: '형태는 규칙에 따라 만들었고 예외가 있는 단어도 있습니다. 띄어쓰기는 따지지 않습니다. 틀린 형태가 있으면 ⚑을 누르세요.',
    sgCol: '형태', plCol: '',
  },
  en: {
    conjTitle: 'Verb forms', conjSub: 'Tenses and patterns of every verb and adjective in the dictionary in three politeness styles. Each word has its own exercise levels.',
    declTitle: 'Noun particles', declSub: 'Which form of each particle a noun takes: after a consonant or after a vowel.',
    inf: 'Dictionary form', pres: 'Present', past: 'Past -았/었-', fut: 'Future -(으)ㄹ 거예요', neg: 'Negative -지 않다',
    want: 'Wish -고 싶다', abil: 'Ability -(으)ㄹ 수 있다', nec: 'Obligation -아/어야 하다', imp: 'Request -(으)세요',
    prog: 'Progressive -고 있다', hon: 'Honorific -(으)시-', conn: 'Linking: and, but, so', cond: 'If, even if', mod: 'Modifier form',
    styles: STYLES, styleRu: ['polite', 'formal', 'casual'],
    labels: {
      imp: ['-(으)세요', '-(으)십시오', '반말'], hon: ['present 해요', 'present 합니다', 'past 해요'],
      conn: ['-고', '-지만', '-아/어서'], cond: ['-(으)면', '-아/어도'],
      mod: ['present -는', 'past -(으)ㄴ', 'future -(으)ㄹ'], modAdj: ['-(으)ㄴ'],
    },
    irr: { b: 'ㅂ-irregular', d: 'ㄷ-irregular', s: 'ㅅ-irregular', h: 'ㅎ-irregular', l: 'ㄹ-stem (ㄹ drops)', reu: '르-irregular', eu: 'ㅡ drops' },
    adjNote: 'adjective',
    parts: ['topic 은/는', 'subject 이/가', 'object 을/를', 'copula 이에요/예요', '"and, with" 와/과', 'direction (으)로', '"and, with" (이)랑 (spoken)'],
    partsShort: ['은/는', '이/가', '을/를', '이에요/예요', '와/과', '(으)로', '(이)랑'],
    lvWord: 'word', lvForm: 'form', lvTable: 'table', lvDecl: 'particles',
    trainForm: 'Type the form', trainTable: 'All styles', trainDecl: 'Particles',
    trainFormThis: 'Type the form', trainTableThis: 'All styles', trainDeclThis: 'Practise particles',
    search: 'Search: Korean or Russian word', nVerbs: (n) => `${n} words`, nNouns: (n) => `${n} nouns`,
    open: (n, all) => `Open forms: ${n} of ${all}. New ones open as you read grammar topics on the verb or pass a level test.`,
    openNoun: (n, all) => `Open particles: ${n} of ${all}. New ones open with the grammar topics on 이다 and the particles.`,
    openNone: 'The forms open once you read the grammar topic “Polite 해요 style: present tense”.',
    openNoneNoun: 'The particles open with the grammar topics on 이다 and on topic and subject particles.',
    cap: (n) => `Highest exercise level now: ${n} of 15 — it grows with the topics you read.`,
    notStudied: 'topic not read', showAll: (n) => `Show ${n} more`, hideAll: 'Hide unread',
    check: 'Check', next: 'Next', done: 'Done', again: 'Again', back: 'Back to the list', dontKnow: 'Don’t know',
    right: 'Correct', wrong: 'Correct answer:', result: (a, b) => `${a} of ${b} correct`, levelNow: (l) => `Level: ${l}`,
    noWords: 'No words to practise yet: start learning words and they will appear here.',
    noOpen: 'Read the grammar topics first — then the forms open for practice.',
    writeForm: (label) => `Type: ${label}`, fillAll: 'Type all the forms', gfTitle: 'How the forms are built',
    hint: 'The forms follow the rules; some words have exceptions. Spaces don’t matter when checking. If a form is wrong, tap ⚑.',
    sgCol: 'form', plCol: '',
  },
};
export function tx(key, ...args) {
  const l = getLang();
  const d = TX[l] || TX.ru;
  const v = d[key] ?? TX.ru[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
}

// ---------------------------------------------------------------- какие формы открыты (по темам грамматики)
// Темы корейской грамматики: 15 해요, 16 прошедшее, 17 будущее, 18 отрицание, 22 -고 싶다, 23 возможность,
// 24 необходимость, 25 просьба, 27 -고 있다, 28 связки, 30 условие, 31 определения, 34 уважительные формы;
// частицы: 11 이다, 12 은/는 и 이/가, 13 을/를, 35 другие частицы.
export const VERB_TOPIC = { pres: 15, past: 16, fut: 17, neg: 18, want: 22, abil: 23, nec: 24, imp: 25, prog: 27, conn: 28,
  cond: 30, mod: 31, hon: 34 };
export const TENSES = ['pres', 'past', 'fut', 'neg', 'want', 'abil', 'nec', 'imp', 'prog', 'conn', 'cond', 'mod', 'hon'];
export const NOUN_TOPIC = { cop: 11, topic: 12, obj: 13, other: 35 };
const PART_TOPIC = ['topic', 'topic', 'obj', 'cop', 'other', 'other', 'other'];   // частица → тема
export const CASES = ['p0', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6'];

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
// подписи ячеек: стили или особые подписи (просьба, связки, определения)
export function personsOf(key, v) {
  const L = tx('labels');
  if (key === 'mod') return v && v.adj ? L.modAdj : L.mod;
  return L[key] || tx('styles');
}

// подзаголовок таблицы: тип основы и часть речи
export function irrType(v) {
  if (!v) return '';
  const parts = [];
  if (v.adj) parts.push(tx('adjNote'));
  if (v.irr) parts.push(tx('irr')[v.irr] || '');
  return parts.filter(Boolean).join(' · ');
}
export const aorType = irrType;

// строки таблицы глагола: [{key, label, forms:[{p, f}]}]
export function verbRows(m) {
  const v = m && m.v;
  if (!v) return [];
  return [{ key: 'inf', label: tx('inf'), forms: [{ p: '', f: v.inf }] },
    ...TENSES.filter((k) => Array.isArray(v[k])).map((k) => ({
      key: k, label: tx(k), forms: v[k].map((f, i) => ({ p: personsOf(k, v)[i], f })),
    }))];
}
// одна форма: 'pres.0' → {label, form}
export function verbSlot(v, slot) {
  const [k, i] = slot.split('.');
  const n = Number(i);
  const p = personsOf(k, v)[n];
  return { label: `${tx(k)} · ${p}`, short: p, form: v[k][n] };
}

// ---------------------------------------------------------------- существительное: частицы
export function nounRows(m) {
  const n = m && m.n;
  if (!n || !Array.isArray(n.p)) return [];
  return n.p.map((f, i) => ({ key: CASES[i], label: tx('parts')[i], sg: f, topic: PART_TOPIC[i] }));
}
export function nounSlot(n, slot) {
  const x = Number(String(slot).split('.')[1]);
  return { label: tx('parts')[x], form: n.p[x] };
}
// какие частицы можно тренировать при открытых темах
export function nounSlots(open) {
  const out = [];
  PART_TOPIC.forEach((t, i) => { if (open.has(t)) out.push(`p.${i}`); });
  return out;
}

// ---------------------------------------------------------------- проверка ответа
// по-корейски: пробелы и знаки не важны (띄어쓰기 не проверяется); можно написать с местоимением: «저는 가요» = «가요»
const PRON = /^(저는|나는|제가|내가|저도|나도|우리는|우리가)/;
const norm = (s) => String(s || '').normalize('NFC').toLowerCase().replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-z0-9]/g, '').replace(PRON, '');
export function formOk(answer, correct) {
  const c = norm(correct);
  return Boolean(c) && norm(answer) === c;
}
