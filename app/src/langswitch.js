// Переключение изучаемого языка. Каждый язык — своя страница рядом: ../hy/, ../uz/ …
// Выбор запоминается (localStorage и облако Telegram), стартовая страница (app/root/index.html) открывает его сразу.
import { LANG, LANGS } from './lang/info.js';

const KEY = 'tutor_lang';

export { LANG, LANGS };

export function langName(l, ui) {
  return (l.name && (l.name[ui] || l.name.en)) || l.code;
}

export function rememberLang(code) {
  try { localStorage.setItem(KEY, code); } catch { /* недоступно — не страшно */ }
  try {
    const cs = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.CloudStorage;
    if (cs && cs.setItem) cs.setItem(KEY, code, () => {});
  } catch { /* старая версия Telegram */ }
}

export function switchLang(code) {
  if (!code || code === LANG.code || !LANGS.some((l) => l.code === code)) return;
  rememberLang(code);
  // данные входа Telegram остаются в sessionStorage этого адреса; hash передаём на всякий случай
  location.replace(`../${code}/${location.hash || ''}`);
}

// текущий язык — запомнить (на случай, если страницу открыли по прямой ссылке)
rememberLang(LANG.code);
