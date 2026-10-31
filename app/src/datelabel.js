// Даты и периоды курса истории (course_units.period, timeline_events.date_label) записаны по-русски:
// «ок. 10 000 – 3000 гг. до н.э.», «XV – XVIII вв.», «29 октября 1923 г.», «1991 г. – наст. время».
// Для интерфейса на другом языке подпись переводится правилами — в базе остаётся одна колонка.
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  sv: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
};
const W = {
  en: { bc: 'BC', ad: 'AD', ca: 'c.', present: 'present', ago: 'years ago', cent: 'cent.', mill: 'millennium', mln: 'million',
        early: (x) => `early ${x}`, late: (x) => `late ${x}`, mid: (x) => `mid-${x}`, half2: (x) => `second half of the ${x}`,
        decade: (y) => `${y}s` },
  tr: { bc: 'MÖ', ad: 'MS', ca: 'yak.', present: 'günümüz', ago: 'yıl önce', cent: 'yy.', mill: 'binyıl', mln: 'milyon',
        early: (x) => `${x} başı`, late: (x) => `${x} sonu`, mid: (x) => `${x} ortası`, half2: (x) => `${x} ikinci yarısı`,
        decade: (y) => `${y}’ler` },
  sv: { bc: 'f.Kr.', ad: 'e.Kr.', ca: 'ca', present: 'i dag', ago: 'år sedan', cent: 'årh.', mill: 'årtusendet', mln: 'miljon',
        early: (x) => `början av ${x}`, late: (x) => `slutet av ${x}`, mid: (x) => `mitten av ${x}`, half2: (x) => `andra hälften av ${x}`,
        decade: (y) => `${y}-talet` },
  uz: { bc: 'mil. avv.', ad: 'milodiy', ca: 'taxm.', present: 'hozirgacha', ago: 'yil oldin', cent: 'asr', mill: 'ming yillik', mln: 'mln',
        early: (x) => `${x} boshi`, late: (x) => `${x} oxiri`, mid: (x) => `${x} oʻrtasi`, half2: (x) => `${x} ikkinchi yarmi`,
        decade: (y) => `${y}-yillar` },
  hy: { bc: 'մ.թ.ա.', ad: 'մ.թ.', ca: 'մոտ', present: 'մեր օրերը', ago: 'տարի առաջ', cent: 'դ.', mill: 'հազարամյակ', mln: 'մլն',
        early: (x) => `${x} սկիզբ`, late: (x) => `${x} վերջ`, mid: (x) => `${x} կես`, half2: (x) => `${x} երկրորդ կես`,
        decade: (y) => `${y}-ական`.replace('0-ական', '0-ականներ') },
};
const ROMAN = '[IVXLC]+';

function segment(s, w, lang) {
  let t = s.trim();
  // 29 октября 1923 г. → 29 October 1923 / 29.10.1923
  t = t.replace(new RegExp(`(\\d{1,2}) (${MONTHS.join('|')}) (\\d{3,4})( г\\.)?`), (m, d, mon, y) => {
    const i = MONTHS.indexOf(mon);
    const names = MONTH_NAMES[lang];
    return names ? (lang === 'en' ? `${d} ${names[i]} ${y}` : `${d} ${names[i]} ${y}`) : `${d.padStart(2, '0')}.${String(i + 1).padStart(2, '0')}.${y}`;
  });
  t = t.replace(/(\d{3,4})-е( гг\.)?/g, (m, y) => w.decade(y));
  t = t.replace(/наст(\.|оящее) время/g, w.present);
  t = t.replace(/лет назад/g, w.ago);
  t = t.replace(/(\d+) млн/g, `$1 ${w.mln}`);
  t = t.replace(/(\d+) тыс\./g, (m, n) => String(Number(n) * 1000));
  t = t.replace(new RegExp(`(${ROMAN}(?:\\s*–\\s*${ROMAN})?) тыс\\.`, 'g'), `$1 ${w.mill}`);
  t = t.replace(new RegExp(`(${ROMAN}(?:\\s*–\\s*${ROMAN})?) вв?\\.`, 'g'), `$1 ${w.cent}`);
  const R = `(${ROMAN}(?: (?:${w.cent.replace('.', '\\.')}|${w.mill}))?)`;
  t = t.replace(new RegExp(`2-я пол\\. ${R}`, 'g'), (m, r) => w.half2(r));
  t = t.replace(new RegExp(`нач\\. ${R}`, 'g'), (m, r) => w.early(r));
  t = t.replace(new RegExp(`кон\\. ${R}`, 'g'), (m, r) => w.late(r));
  t = t.replace(new RegExp(`сер\\. ${R}`, 'g'), (m, r) => w.mid(r));
  t = t.replace(/ гг?\./g, '');
  t = t.replace(/^ок\. /, `${w.ca} `);
  return t;
}

export function dateLabel(s, lang) {
  if (!s || lang === 'ru') return s;
  const w = W[lang] || W.en;
  let t = String(s);
  // «с 1973 г. до наших дней», «с 2016 г. по настоящее время», «с 2016 г.» → «1973 – present»
  t = t.replace(/^с (\d{3,4}) г\.( до наших дней| по настоящее время)?$/, `$1 – ${w.present}`);
  const parts = t.split(/\s*–\s*/);
  const bc = parts.map((p) => /до н\.э\./.test(p));
  const ad = parts.map((p) => /(^|[^о] )н\.э\./.test(p) && !/до н\.э\./.test(p));
  let out = parts.map((p) => segment(p.replace(/\s*(до )?н\.э\./, ''), w, lang));
  if (lang === 'tr' && out.some((p) => / (yy\.|binyıl)/.test(p))) out = out.map((p) => p.replace(/\b([IVXLC]+)\b(?!\.)/g, '$1.'));
  if (lang === 'tr') {
    // MS — перед числом: «I–IV вв. н.э.» → «MS I. – IV. yy.»
    const k = ad.indexOf(true) === ad.length - 1 && !bc.some(Boolean) ? 0 : -1;
    out = out.map((p, i) => ((k === 0 ? i === 0 && ad.some(Boolean) : ad[i]) ? `${w.ad} ${p}` : p));
  } else out = out.map((p, i) => (ad[i] ? `${p} ${w.ad}` : p));
  if (bc.some(Boolean)) {
    const onlyLast = bc.indexOf(true) === bc.length - 1;
    if (lang === 'tr') {
      // MÖ ставится перед числом; если «до н.э.» только в конце — весь период до нашей эры
      const pre = (p) => (p.includes(w.ago) ? p : p.replace(/^(yak\. )?/, (m) => `${m}${w.bc} `));
      return out.map((p, i) => (bc[i] || (onlyLast && i < bc.length - 1) ? pre(p) : p)).join(' – ');
    }
    return out.map((p, i) => (bc[i] ? `${p} ${w.bc}` : p)).join(' – ');
  }
  return out.join(' – ');
}
