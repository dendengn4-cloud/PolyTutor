// Темы оформления. Выбор хранится в профиле (settings.theme) и в памяти телефона — чтобы не мигало при запуске.
const KEY = 'ut_theme';

// Цвет фона каждой темы — для шапки Telegram
export const THEMES = {
  telegram: null,
  light: '#f5f6f8',
  dark: '#0f1115',
  gray: '#e6e7ea',
  sand: '#f3ede2',
  midnight: '#0b1424',
};
// Темы режима «Максимальная фокусировка» (выбираются сами, вместо темы пользователя)
const FOCUS_THEMES = { focus: '#eceae4', 'focus-dark': '#1c1e22' };

function webApp() {
  return window.Telegram && window.Telegram.WebApp;
}

export function currentTheme() {
  return requested;
}

let requested = 'telegram';
// тема, выбранная пользователем (в режиме «Максимальная фокусировка» на экране — тема фокуса)
export function chosenTheme() { return requested; }

export function applyTheme(name) {
  const theme = Object.prototype.hasOwnProperty.call(THEMES, name) ? name : 'telegram';
  requested = theme;
  const root = document.documentElement;
  const wa = webApp();
  const scheme = theme === 'telegram' ? (wa && wa.colorScheme) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme === 'dark' || theme === 'midnight' ? 'dark' : 'light';
  // «Максимальная фокусировка»: спокойная тема — светлая или тёмная по выбору пользователя / Telegram
  const shown = root.dataset.focus === 'max' ? (scheme === 'dark' ? 'focus-dark' : 'focus') : theme;
  root.dataset.theme = shown;
  root.dataset.scheme = scheme;
  try { localStorage.setItem(KEY, theme); } catch { /* приватный режим */ }
  if (wa) {
    try {
      const color = FOCUS_THEMES[shown] || THEMES[shown];
      if (color) {
        wa.setHeaderColor && wa.setHeaderColor(color);
        wa.setBackgroundColor && wa.setBackgroundColor(color);
        wa.setBottomBarColor && wa.setBottomBarColor(color);
      } else {
        wa.setHeaderColor && wa.setHeaderColor('secondary_bg_color');
        wa.setBackgroundColor && wa.setBackgroundColor('secondary_bg_color');
      }
    } catch { /* старые клиенты Telegram */ }
  }
}

export function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch { /* нет доступа */ }
  applyTheme(saved || 'telegram');
  const wa = webApp();
  if (wa && wa.onEvent) wa.onEvent('themeChanged', () => requested === 'telegram' && applyTheme('telegram'));
}
