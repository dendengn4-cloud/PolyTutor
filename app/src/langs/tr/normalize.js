// Нормализация ответов — те же правила, что в базе (public.key_uz / public.key_ru, base/turkish)
// и в scripts/langs/tr/build_vocab.py: регистр не важен (по-турецки: I → ı, İ → i), â î û = a i u;
// ç ğ ı ö ş ü — отдельные буквы; апострофы убираются; всё кроме турецких букв — пробел; дефис = пробел.
const APOS = /[‘’'ʻʼ`´ʹ]/g;

// строчные буквы по-турецки: I → ı, İ → i (toLowerCase() без локали дал бы I → i)
export const trLower = (s) => String(s ?? '').normalize('NFC').replace(/I/g, 'ı').replace(/İ/g, 'i').toLowerCase().replace(/i\u0307/g, 'i');

export function keyUz(s) {
  return trLower(s)
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')
    .replace(APOS, '')
    .replace(/[^a-zçğıöşü \-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function keyRu(s) {
  return String(s ?? '')
    .replace(/\([^)]*\)/g, ' ')
    .normalize('NFC')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^0-9a-zа-я \-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Число слов (без пояснений в скобках) — варианты ответа подбираются той же длины
export function wordCount(s) {
  const t = String(s ?? '').replace(/\([^)]*\)/g, ' ').replace(/[-–—]/g, ' ').trim();
  return t ? t.split(/\s+/).length : 0;
}

// Ответ на турецком без личного местоимения тоже верный: «geliyorum» = «ben geliyorum»
const PRON = new Set(['ben', 'sen', 'o', 'biz', 'siz', 'onlar']);
export function stripPron(s) {
  return keyUz(s).split(' ').filter((w) => w && !PRON.has(w)).join(' ');
}
export function uzSame(a, b) {
  const ka = keyUz(a);
  if (!ka) return false;
  if (ka === keyUz(b)) return true;
  const sa = stripPron(a);
  return sa !== '' && sa === stripPron(b);
}

// Турецкий текст с ввода пользователя для показа: NFC, лишние пробелы убраны
export function displayUz(s) {
  return String(s ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
}

// Посимвольное сравнение для подсветки ошибки: [{ch, kind: 'same'|'wrong'|'missing'|'extra'}]
export function diffChars(answer, correct) {
  const a = [...String(answer ?? '')];
  const b = [...String(correct ?? '')];
  const n = (c) => trLower(c).replace(APOS, "'").replace('ё', 'е').replace(/[âîû]/, (x) => ({ 'â': 'a', 'î': 'i', 'û': 'u' })[x]);
  const eq = (x, y) => n(x) === n(y);
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (eq(a[i - 1], b[j - 1]) ? 0 : 1));
  const out = [];
  let i = a.length, j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (eq(a[i - 1], b[j - 1]) ? 0 : 1)) {
      out.push({ ch: b[j - 1], kind: eq(a[i - 1], b[j - 1]) ? 'same' : 'wrong' });
      i--; j--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      out.push({ ch: b[j - 1], kind: 'missing' });
      j--;
    } else {
      out.push({ ch: a[i - 1], kind: 'extra' });
      i--;
    }
  }
  return out.reverse();
}
