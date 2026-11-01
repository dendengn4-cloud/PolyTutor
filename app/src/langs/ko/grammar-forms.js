// Блок «Как образуется» в темах турецкой грамматики: таблицы образования форм с примерами.
// Номера — темы курса (data/tr/source/grammar.xlsx): 3 настоящее -(I)yor, 5 прошедшее -DI, 6 -mIş, 7 будущее,
// 8 отрицание, 9 падежи, 10 принадлежность, 11 множественное число, 12 сравнение, 16 широкое время,
// 17 повелительное и желательное, 18 возможность, 19 связка, 20 долженствование, 21 условие, 23 сложные времена.
// Обозначения: A = a/e, I = ı/i/u/ü (гармония гласных), D = d/t (после глухих — t), C = c/ç.
import { h } from '../ui.js';
import { getLang } from '../i18n.js';

const L = () => (getLang() === 'en' ? 'en' : getLang() === 'tr' ? 'tr' : 'ru');
const T = {
  title: { ru: 'Как образуется', tr: 'Nasıl yapılır', en: 'How it is formed' },
  hint: { ru: 'A = a/e, I = ı/i/u/ü по гармонии гласных; D = d/t (после глухих согласных — t).',
          tr: 'A = a/e, I = ı/i/u/ü (ünlü uyumu); D = d/t (sert ünsüzden sonra t).',
          en: 'A = a/e, I = ı/i/u/ü by vowel harmony; D = d/t (t after voiceless consonants).' },
  rule: { ru: 'Правило', tr: 'Kural', en: 'Rule' },
  example: { ru: 'Пример', tr: 'Örnek', en: 'Example' },
};
const tr = (k) => T[k][L()];

// [правило ru, tr, en], пример
const PRES = [
  [['основа + -Iyor + личное окончание', 'kök + -Iyor + kişi eki', 'stem + -Iyor + personal ending'], 'gel-iyor-um, bak-ıyor-sun, gör-üyor'],
  [['основа на гласный: + -yor', 'ünlüyle biten kök: + -yor', 'stem ending in a vowel: + -yor'], 'oku-yor-uz, uyu-yor-lar'],
  [['конечные -a/-e основы сужаются', 'kökün sonundaki -a/-e daralır', 'a final -a/-e of the stem narrows'], 'bekle → bekl-iyor, ara → ar-ıyor'],
  [['окончания: -um, -sun, —, -uz, -sunuz, -lar', 'ekler: -um, -sun, —, -uz, -sunuz, -lar', 'endings: -um, -sun, —, -uz, -sunuz, -lar'], 'geliyorum, geliyorsun, geliyor, geliyoruz, geliyorsunuz, geliyorlar'],
  [['git-, et-: t → d перед гласной', 'git-, et-: ünlüden önce t → d', 'git-, et-: t → d before a vowel'], 'git → gid-iyor, et → ed-iyor'],
];
const PAST = [
  [['основа + -DI + -m, -n, —, -k, -nIz, -lAr', 'kök + -DI + -m, -n, —, -k, -nIz, -lAr', 'stem + -DI + -m, -n, —, -k, -nIz, -lAr'], 'geldim, geldin, geldi, geldik, geldiniz, geldiler'],
  [['после глухих (ç f h k p s ş t): -tI', 'sert ünsüzden sonra: -tI', 'after voiceless consonants: -tI'], 'baktım, gittik, içtiniz'],
  [['отрицание: основа + -mA + -DI', 'olumsuz: kök + -mA + -DI', 'negative: stem + -mA + -DI'], 'gelmedim, bakmadık'],
];
const MIS = [
  [['основа + -mIş + личное окончание', 'kök + -mIş + kişi eki', 'stem + -mIş + personal ending'], 'gelmişim, gelmişsin, gelmiş'],
  [['пересказ или вывод: «говорят», «оказывается»', 'duyulan ya da sonradan fark edilen olay', 'hearsay or inference: “apparently”'], 'Ali gelmiş. Hava soğukmuş.'],
  [['мы / вы / они', 'biz / siz / onlar', 'we / you / they'], 'gelmişiz, gelmişsiniz, gelmişler'],
];
const FUT = [
  [['основа + -(y)AcAk + личное окончание', 'kök + -(y)AcAk + kişi eki', 'stem + -(y)AcAk + personal ending'], 'geleceğim, geleceksin, gelecek'],
  [['k → ğ перед гласной окончания', 'ünlüyle başlayan ekten önce k → ğ', 'k → ğ before a vowel ending'], 'gelecek → geleceğim, geleceğiz'],
  [['основа на гласный: + -y-', 'ünlüyle biten kök: + -y-', 'stem ending in a vowel: + -y-'], 'oku → okuyacağım'],
  [['отрицание: -mAyAcAk', 'olumsuz: -mAyAcAk', 'negative: -mAyAcAk'], 'gelmeyeceğim, bakmayacaksın'],
];
const NEG = [
  [['глагол: основа + -mA', 'fiil: kök + -mA', 'verb: stem + -mA'], 'gel-me-di, bak-ma-yacak'],
  [['с -Iyor: -mIyor', '-Iyor ile: -mIyor', 'with -Iyor: -mIyor'], 'gelmiyorum, bakmıyor'],
  [['именное сказуемое: değil', 'isim cümlesi: değil', 'noun predicate: değil'], 'Öğrenci değilim.'],
  [['«нет, не имеется»: yok', '“yok”: bulunmama', '“there is no”: yok'], 'Param yok. Evde kimse yok.'],
];
const CASES = [
  [['направительный (куда?): -(y)A', 'yönelme (nereye?): -(y)A', 'dative (where to?): -(y)A'], 'ev → eve, okul → okula, Ankara → Ankara’ya'],
  [['местный (где?): -DA', 'bulunma (nerede?): -DA', 'locative (where?): -DA'], 'evde, okulda, parkta'],
  [['исходный (откуда?): -DAn', 'ayrılma (nereden?): -DAn', 'ablative (where from?): -DAn'], 'evden, okuldan, işten'],
  [['винительный (определённый объект): -(y)I', 'belirtme: -(y)I', 'accusative (definite object): -(y)I'], 'evi, kitabı, arabayı'],
  [['родительный (чей?): -(n)In', 'ilgi (kimin?): -(n)In', 'genitive (whose?): -(n)In'], 'Ali’nin, evin, arabanın'],
  [['p ç t k → b c d ğ перед гласной', 'ünlüden önce p ç t k → b c d ğ', 'p ç t k → b c d ğ before a vowel'], 'kitap → kitabı, ağaç → ağaca, renk → rengi'],
];
const POSS = [
  [['мой: -(I)m', 'benim: -(I)m', 'my: -(I)m'], 'evim, arabam'],
  [['твой: -(I)n', 'senin: -(I)n', 'your: -(I)n'], 'evin, araban'],
  [['его/её: -(s)I', 'onun: -(s)I', 'his/her: -(s)I'], 'evi, arabası'],
  [['наш: -(I)mIz', 'bizim: -(I)mIz', 'our: -(I)mIz'], 'evimiz, arabamız'],
  [['ваш: -(I)nIz', 'sizin: -(I)nIz', 'your (pl.): -(I)nIz'], 'eviniz, arabanız'],
  [['их: -lArI', 'onların: -lArI', 'their: -lArI'], 'evleri, arabaları'],
];
const PL = [
  [['после a ı o u: -lar', 'a ı o u’dan sonra: -lar', 'after a ı o u: -lar'], 'kitaplar, okullar'],
  [['после e i ö ü: -ler', 'e i ö ü’den sonra: -ler', 'after e i ö ü: -ler'], 'evler, günler'],
  [['после числа — без -lAr', 'sayıdan sonra -lAr yok', 'no -lAr after a number'], 'iki kitap, üç ev'],
  [['порядок: основа + -lAr + принадлежность + падеж', 'sıra: kök + -lAr + iyelik + hâl', 'order: stem + -lAr + possessive + case'], 'ev-ler-imiz-de'],
];
const COMP = [
  [['сравнительная: daha + прил., сравниваемое — в -DAn', 'karşılaştırma: daha + sıfat, -DAn ile', 'comparative: daha + adj., compared item in -DAn'], 'Ankara İzmir’den daha büyük.'],
  [['превосходная: en + прил.', 'en üstünlük: en + sıfat', 'superlative: en + adj.'], 'en güzel, en büyük şehir'],
  [['«такой же, как»: kadar', '“kadar” ile eşitlik', '“as … as”: kadar'], 'Ali kadar uzun'],
];
const AOR = [
  [['односложная основа на согласный: -Ar', 'tek heceli, ünsüzle biten kök: -Ar', 'one-syllable stem ending in a consonant: -Ar'], 'yazar, yapar, içer'],
  [['исключения на -Ir: al, bil, bul, dur, gel, gör, kal, ol, öl, san, ver, var, vur', 'istisnalar (-Ir): al, bil, bul, dur, gel, gör, kal, ol, öl, san, ver, var, vur', 'exceptions with -Ir: al, bil, bul, dur, gel, gör, kal, ol, öl, san, ver, var, vur'], 'alır, bilir, gelir, olur'],
  [['многосложная основа на согласный: -Ir', 'çok heceli kök: -Ir', 'stem of several syllables: -Ir'], 'çalışır, konuşur'],
  [['основа на гласный: -r', 'ünlüyle biten kök: -r', 'stem ending in a vowel: -r'], 'okur, bekler'],
  [['отрицание: -mAz (я — -mAm, мы — -mAyIz)', 'olumsuz: -mAz (ben -mAm, biz -mAyIz)', 'negative: -mAz (I — -mAm, we — -mAyIz)'], 'gelmez, gelmem, gelmeyiz'],
];
const IMP = [
  [['ты: основа', 'sen: kök', 'you: the stem'], 'Gel! Bak! Oku!'],
  [['вы (вежливо): -(y)In / -(y)InIz', 'siz: -(y)In / -(y)InIz', 'you (polite): -(y)In / -(y)InIz'], 'Gelin! Oturunuz.'],
  [['пусть он: -sIn', 'o: -sIn', 'let him/her: -sIn'], 'Gelsin.'],
  [['давай(те): -(y)AlIm', 'biz: -(y)AlIm', 'let’s: -(y)AlIm'], 'Gidelim! Başlayalım.'],
  [['отрицание: -mA', 'olumsuz: -mA', 'negative: -mA'], 'Gelme! Unutmayın.'],
];
const ABIL = [
  [['могу: основа + -(y)Abil + время', 'yeterlilik: kök + -(y)Abil + zaman', 'can: stem + -(y)Abil + tense'], 'gelebilirim, okuyabildim'],
  [['не могу: -(y)AmA + время', 'olumsuz: -(y)AmA + zaman', 'cannot: -(y)AmA + tense'], 'gelemem, okuyamadım'],
  [['вежливая просьба', 'kibar rica', 'polite request'], 'Yardım edebilir misiniz?'],
];
const COP = [
  [['я: -(y)Im', 'ben: -(y)Im', 'I am: -(y)Im'], 'öğrenciyim, doktorum'],
  [['ты: -sIn', 'sen: -sIn', 'you are: -sIn'], 'öğrencisin'],
  [['он: — (или -DIr)', 'o: — (ya da -DIr)', 'he/she is: — (or -DIr)'], 'O öğrenci(dir).'],
  [['мы / вы / они: -(y)Iz, -sInIz, -lAr', 'biz / siz / onlar: -(y)Iz, -sInIz, -lAr', 'we / you / they: -(y)Iz, -sInIz, -lAr'], 'öğrenciyiz, öğrencisiniz, öğrenciler'],
  [['прошедшее: -(y)DI', 'geçmiş: -(y)DI', 'past: -(y)DI'], 'evdeydim, hastaydı'],
];
const NEC = [
  [['основа + -mAlI + личное окончание', 'kök + -mAlI + kişi eki', 'stem + -mAlI + personal ending'], 'gitmeliyim, çalışmalısın'],
  [['инфинитив + lazım / gerek', 'mastar + lazım / gerek', 'infinitive + lazım / gerek'], 'Gitmem lazım. Çalışmak gerek.'],
  [['не нужно: -mAmAlI', 'olumsuz: -mAmAlI', 'must not: -mAmAlI'], 'Geç kalmamalısın.'],
];
const COND = [
  [['если: основа + -sA + -m, -n, —, -k, -nIz, -lAr', 'şart: kök + -sA + kişi eki', 'if: stem + -sA + personal ending'], 'gelsem, gelsen, gelse'],
  [['реальное условие: время + -sA', 'gerçek şart: zaman eki + -sA', 'real condition: tense + -sA'], 'gelirsen, geldiyse'],
  [['нереальное: -sAydI', 'gerçek dışı: -sAydI', 'unreal: -sAydI'], 'Bilseydim gelirdim.'],
  [['имя: -(y)sA', 'isimle: -(y)sA', 'with a noun: -(y)sA'], 'Hastaysan dinlen.'],
];
const COMPOUND = [
  [['прошедшее длительное: -Iyordu', 'şimdiki zamanın hikâyesi: -Iyordu', 'past continuous: -Iyordu'], 'geliyordum'],
  [['давнопрошедшее: -mIştI', 'öğrenilen geçmişin hikâyesi: -mIştI', 'past perfect: -mIştI'], 'gelmiştim'],
  [['будущее в прошедшем: -(y)AcAktI', 'geleceğin hikâyesi: -(y)AcAktI', 'future in the past: -(y)AcAktI'], 'gelecektim'],
  [['привычка в прошлом: -(A/I)rdI', 'geniş zamanın hikâyesi: -(A/I)rdI', 'past habit: -(A/I)rdI'], 'gelirdim'],
];
const TOPICS = { 3: PRES, 5: PAST, 6: MIS, 7: FUT, 8: NEG, 9: CASES, 10: POSS, 11: PL, 12: COMP, 16: AOR, 17: IMP, 18: ABIL,
  19: COP, 20: NEC, 21: COND, 23: COMPOUND };

export function grammarFormsBlock(unit) {
  if (!unit || unit.course_id !== 'grammar') return null;
  const spec = TOPICS[unit.n];
  if (!spec) return null;
  const i = { ru: 0, tr: 1, en: 2 }[L()];
  return h('div', {},
    h('h2', {}, tr('title')),
    h('p', { class: 'small muted' }, tr('hint')),
    h('div', { class: 'gf-card' },
      h('table', { class: 'gf-table' },
        h('thead', {}, h('tr', {}, h('th', {}, tr('rule')), h('th', {}, tr('example')))),
        h('tbody', {}, spec.map(([rule, ex]) => h('tr', {}, h('td', {}, rule[i]), h('td', {}, h('div', { class: 'gf-result' }, ex))))))));
}
