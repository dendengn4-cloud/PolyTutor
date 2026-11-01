// Хангыль: разбор слогов на буквы (чамо), сборка обратно, правила чтения и транскрипция.
// Слог = 0xAC00 + (начальная × 21 + гласная) × 28 + конечная (патчхим).
export const SBASE = 0xAC00;
export const L = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
export const V = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
export const T = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
// двойные патчхимы и составные гласные
export const T_SPLIT = { 'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'], 'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'],
  'ㄽ': ['ㄹ', 'ㅅ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'], 'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ'] };
export const T_JOIN = Object.fromEntries(Object.entries(T_SPLIT).map(([k, [a, b]]) => [a + b, k]));
export const V_JOIN = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
export const V_SPLIT = Object.fromEntries(Object.entries(V_JOIN).map(([k, v]) => [v, [...k]]));

export const isSyl = (c) => { const n = (c || '').charCodeAt(0); return n >= SBASE && n < SBASE + 11172; };
export const isCons = (c) => L.includes(c) || T.includes(c) && c !== '';
export const isVowel = (c) => V.includes(c);

export function decompose(c) {
  if (!isSyl(c)) return null;
  const n = c.charCodeAt(0) - SBASE;
  return { l: L[Math.floor(n / 588)], v: V[Math.floor((n % 588) / 28)], t: T[n % 28] };
}
export function compose(l, v, t = '') {
  const li = L.indexOf(l), vi = V.indexOf(v), ti = T.indexOf(t);
  if (li < 0 || vi < 0 || ti < 0) return null;
  return String.fromCharCode(SBASE + (li * 21 + vi) * 28 + ti);
}
// есть ли патчхим у последнего слога (для частиц 은/는, 이/가, 을/를; у (으)로 ㄹ считается как без патчхима)
export function hasBatchim(word) {
  const s = [...String(word || '')].reverse().find(isSyl);
  const d = s && decompose(s);
  return Boolean(d && d.t);
}
export function batchimOf(word) {
  const s = [...String(word || '')].reverse().find(isSyl);
  const d = s && decompose(s);
  return d ? d.t : '';
}

// ---------------------------------------------------------------- правила чтения
// Слово → последовательность «слогов чтения» [{l, v, t}] после основных правил:
// связывание (патчхим переходит к следующему слогу на ㅇ), ㅎ (придыхание, выпадение), назализация (ㄱ/ㄷ/ㅂ перед ㄴ/ㅁ),
// ㄹ (ㄴ+ㄹ, ㄹ+ㄴ → ㄹㄹ; ㅁ/ㅇ+ㄹ → ㅁ/ㅇ+ㄴ), палатализация (ㄷ/ㅌ + 이 → 지/치), упрощение двойных патчхимов.
const NEUTRAL = { 'ㄱ': 'ㄱ', 'ㄲ': 'ㄱ', 'ㅋ': 'ㄱ', 'ㄷ': 'ㄷ', 'ㅅ': 'ㄷ', 'ㅆ': 'ㄷ', 'ㅈ': 'ㄷ', 'ㅊ': 'ㄷ', 'ㅌ': 'ㄷ', 'ㅎ': 'ㄷ',
  'ㅂ': 'ㅂ', 'ㅍ': 'ㅂ', 'ㄴ': 'ㄴ', 'ㄹ': 'ㄹ', 'ㅁ': 'ㅁ', 'ㅇ': 'ㅇ' };
// какой согласный остаётся от двойного патчхима в конце слога (ㄺ, ㄻ, ㄿ — второй; остальные — первый)
const KEEP_SECOND = new Set(['ㄺ', 'ㄻ', 'ㄿ']);
const ASPIRATE = { 'ㄱ': 'ㅋ', 'ㄷ': 'ㅌ', 'ㅂ': 'ㅍ', 'ㅈ': 'ㅊ' };
const NASAL = { 'ㄱ': 'ㅇ', 'ㄷ': 'ㄴ', 'ㅂ': 'ㅁ' };

export function pronounce(word) {
  const syl = [...word].map(decompose);
  if (syl.some((x) => !x)) return null;
  const s = syl.map((x) => ({ ...x }));
  for (let i = 0; i < s.length; i++) {
    const cur = s[i];
    const nxt = s[i + 1];
    if (!cur.t) continue;
    if (nxt) {
      // ㅎ в патчхиме
      if (cur.t === 'ㅎ' || cur.t === 'ㄶ' || cur.t === 'ㅀ') {
        const rest = cur.t === 'ㅎ' ? '' : T_SPLIT[cur.t][0];
        if (ASPIRATE[nxt.l]) { nxt.l = ASPIRATE[nxt.l]; cur.t = rest; continue; }
        if (nxt.l === 'ㅇ') { cur.t = rest; if (rest) { nxt.l = rest; cur.t = ''; } continue; }
        if (nxt.l === 'ㄴ') { cur.t = rest || 'ㄴ'; if (!rest) cur.t = 'ㄴ'; continue; }
        if (nxt.l === 'ㅅ') { nxt.l = 'ㅆ'; cur.t = rest; continue; }
      }
      // ㄱ/ㄷ/ㅂ/ㅈ-патчхим + ㅎ → придыхательный (축하 → 추카, 좋다 уже выше); ㄴ/ㄹ/ㅁ/ㅇ + ㅎ — ㅎ остаётся
      if (nxt.l === 'ㅎ') {
        const b = T_SPLIT[cur.t] ? T_SPLIT[cur.t][1] : cur.t;
        const a = cur.t === 'ㅈ' ? 'ㅈ' : NEUTRAL[b];
        if (ASPIRATE[a]) { nxt.l = ASPIRATE[a]; cur.t = T_SPLIT[cur.t] ? T_SPLIT[cur.t][0] : ''; continue; }
      }
      // связывание
      if (nxt.l === 'ㅇ' && cur.t !== 'ㅇ') {
        if (T_SPLIT[cur.t]) { const [a, b] = T_SPLIT[cur.t]; cur.t = a; nxt.l = b === 'ㅅ' ? 'ㅆ' : b; }
        else { nxt.l = cur.t; cur.t = ''; }
        // палатализация: ㄷ/ㅌ + ㅣ
        if (nxt.v === 'ㅣ' && (nxt.l === 'ㄷ' || nxt.l === 'ㅌ')) nxt.l = nxt.l === 'ㄷ' ? 'ㅈ' : 'ㅊ';
        continue;
      }
    }
    // конец слога: двойной патчхим → один согласный, нейтрализация
    if (T_SPLIT[cur.t]) cur.t = KEEP_SECOND.has(cur.t) ? T_SPLIT[cur.t][1] : T_SPLIT[cur.t][0];
    cur.t = NEUTRAL[cur.t] || cur.t;
    if (!nxt) continue;
    // назализация
    if ((nxt.l === 'ㄴ' || nxt.l === 'ㅁ') && NASAL[cur.t]) cur.t = NASAL[cur.t];
    // ㄹ
    if (nxt.l === 'ㄹ') {
      if (cur.t === 'ㄴ') cur.t = 'ㄹ';
      else if (cur.t === 'ㅁ' || cur.t === 'ㅇ') nxt.l = 'ㄴ';
      else if (NASAL[cur.t]) { cur.t = NASAL[cur.t]; nxt.l = 'ㄴ'; }
    } else if (nxt.l === 'ㄴ' && cur.t === 'ㄹ') nxt.l = 'ㄹ';
  }
  return s;
}

// ---------------------------------------------------------------- транскрипция
// Кириллица по системе Концевича (по произношению), латиница — Revised Romanization (по произношению, без дефисов).
const CYR_V = { 'ㅏ': 'а', 'ㅐ': 'э', 'ㅑ': 'я', 'ㅒ': 'йе', 'ㅓ': 'о', 'ㅔ': 'е', 'ㅕ': 'ё', 'ㅖ': 'йе', 'ㅗ': 'о', 'ㅘ': 'ва', 'ㅙ': 'вэ',
  'ㅚ': 'ве', 'ㅛ': 'ё', 'ㅜ': 'у', 'ㅝ': 'во', 'ㅞ': 'ве', 'ㅟ': 'ви', 'ㅠ': 'ю', 'ㅡ': 'ы', 'ㅢ': 'ый', 'ㅣ': 'и' };
const CYR_V_START = { ...CYR_V, 'ㅔ': 'э', 'ㅖ': 'е', 'ㅒ': 'я' };
const CYR_L = { 'ㄱ': ['к', 'г'], 'ㄲ': ['кк', 'кк'], 'ㄴ': ['н', 'н'], 'ㄷ': ['т', 'д'], 'ㄸ': ['тт', 'тт'], 'ㄹ': ['р', 'р'], 'ㅁ': ['м', 'м'],
  'ㅂ': ['п', 'б'], 'ㅃ': ['пп', 'пп'], 'ㅅ': ['с', 'с'], 'ㅆ': ['сс', 'сс'], 'ㅇ': ['', ''], 'ㅈ': ['ч', 'дж'], 'ㅉ': ['чч', 'чч'],
  'ㅊ': ['чх', 'чх'], 'ㅋ': ['кх', 'кх'], 'ㅌ': ['тх', 'тх'], 'ㅍ': ['пх', 'пх'], 'ㅎ': ['х', 'х'] };
const CYR_T = { 'ㄱ': 'к', 'ㄴ': 'н', 'ㄷ': 'т', 'ㄹ': 'ль', 'ㅁ': 'м', 'ㅂ': 'п', 'ㅇ': 'н' };
const LAT_V = { 'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo', 'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa', 'ㅙ': 'wae',
  'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo', 'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i' };
const LAT_L = { 'ㄱ': ['g', 'g'], 'ㄲ': ['kk', 'kk'], 'ㄴ': ['n', 'n'], 'ㄷ': ['d', 'd'], 'ㄸ': ['tt', 'tt'], 'ㄹ': ['r', 'r'], 'ㅁ': ['m', 'm'],
  'ㅂ': ['b', 'b'], 'ㅃ': ['pp', 'pp'], 'ㅅ': ['s', 's'], 'ㅆ': ['ss', 'ss'], 'ㅇ': ['', ''], 'ㅈ': ['j', 'j'], 'ㅉ': ['jj', 'jj'],
  'ㅊ': ['ch', 'ch'], 'ㅋ': ['k', 'k'], 'ㅌ': ['t', 't'], 'ㅍ': ['p', 'p'], 'ㅎ': ['h', 'h'] };
const LAT_T = { 'ㄱ': 'k', 'ㄴ': 'n', 'ㄷ': 't', 'ㄹ': 'l', 'ㅁ': 'm', 'ㅂ': 'p', 'ㅇ': 'ng' };
const SONOR = new Set(['ㄴ', 'ㄹ', 'ㅁ', 'ㅇ']);

function wordCyr(word) {
  const s = pronounce(word);
  if (!s) return word;
  let out = '';
  s.forEach((x, i) => {
    const prev = s[i - 1];
    const voiced = Boolean(prev) && (!prev.t || SONOR.has(prev.t));       // между гласными или после сонорного — звонкий
    let l = CYR_L[x.l][voiced ? 1 : 0];
    if (x.l === 'ㄹ') l = prev && prev.t === 'ㄹ' ? 'л' : 'р';
    if (x.l === 'ㅅ' && x.v === 'ㅣ') l = 'с';
    const v = (!prev && x.l === 'ㅇ' ? CYR_V_START : CYR_V)[x.v];
    // ㅇ перед гласной в середине слова после согласного — без знака; ㅔ после ㅇ в середине — э
    out += l + (x.l === 'ㅇ' && x.v === 'ㅔ' ? 'э' : v);
    if (x.t) {
      if (x.t === 'ㄹ') out += s[i + 1] && s[i + 1].l === 'ㄹ' ? 'л' : 'ль';
      else out += CYR_T[x.t] || '';
    }
  });
  return out.replace(/льл/g, 'лл');
}

function wordLat(word) {
  const s = pronounce(word);
  if (!s) return word;
  let out = '';
  s.forEach((x, i) => {
    const prev = s[i - 1];
    let l = LAT_L[x.l][prev ? 1 : 0];
    if (x.l === 'ㄹ') l = prev && prev.t === 'ㄹ' ? 'l' : 'r';
    out += l + LAT_V[x.v];
    if (x.t) out += x.t === 'ㄹ' && s[i + 1] && s[i + 1].l === 'ㄹ' ? 'l' : LAT_T[x.t] || '';
  });
  return out.replace(/ll/g, 'll');
}

// текст → транскрипция: слова из хангыля переводятся, остальное (знаки, цифры, латиница) — как есть
export function transcribe(text, kind = 'cyr') {
  const f = kind === 'lat' ? wordLat : wordCyr;
  return String(text || '').normalize('NFC').replace(/[가-힣]+/g, (w) => f(w));
}
