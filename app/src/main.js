// Точка входа: вход через Telegram, три вкладки (Дом, Путь, Настройки), стек экранов, кнопка «Назад» Telegram.
import { login, rpc, tg, ApiError } from './api.js';
import { setLang, t } from './i18n.js';
import { h, mount, spinner, haptic, sheet, inlineNotice, onSheetsChange, sheetCount, closeTopSheet, closeAllSheets, restoreView, cancelRestore, endRestore } from './ui.js';
import { icon } from './icons.js';
import { initTheme, applyTheme, currentTheme } from './theme.js';
import { initFocus, applyFocus, focusMode, currentFocus } from './focus.js';
import { renderHome } from './screens/home.js';
import { renderPath } from './screens/path.js';
import { renderLearn } from './screens/learn.js';
import { renderProgress } from './screens/progress.js';
import { renderSettings } from './screens/settings.js';
import { renderSoon } from './screens/soon.js';
import { renderPractice } from './screens/practice.js';
import { renderGames } from './screens/games.js';
import { renderTest } from './screens/test.js';
import { renderSubscription } from './screens/subscription.js';
import { renderCourse, renderUnit } from './screens/course.js';
import { renderWordCheck } from './screens/wordcheck.js';
import { renderUnitTest } from './screens/unittest.js';
import { renderReview } from './screens/review.js';
import { renderDictionary } from './screens/dictionary.js';
import { renderWordFlags } from './screens/wordflags.js';
import { renderWelcome } from './screens/welcome.js';
import { renderConj, setConjApp } from './lang/conj.js';
import { renderSentences } from './screens/sentences.js';
import { renderDecl } from './lang/decl.js';
import { renderAnalytics } from './screens/analytics.js';
import { renderFormReports } from './screens/formreports.js';
import { renderSisterApps } from './screens/sisterapps.js';
import { renderAnnounce, showAnnouncement } from './screens/announce.js';
import { renderCodes } from './screens/codes.js';
import { renderExam } from './screens/exam.js';

const TABS = ['home', 'path', 'settings'];

export const app = {
  me: null,
  stack: [],
  async refreshMe() {
    this.me = await rpc('get_me');
    setLang(this.me && this.me.ui_lang);
    // режим внимания — до темы: в «Максимальной фокусировке» тема своя
    applyFocus(focusMode(this.me));
    applyTheme((this.me && this.me.settings && this.me.settings.theme) || currentTheme());
    return this.me;
  },
  leave() {
    if (this.cleanup) { try { this.cleanup(); } catch (e) { console.warn(e); } this.cleanup = null; }
  },
  go(screen, params = {}) {
    closeAllSheets();
    this.leave();
    cancelRestore();
    // запоминаем, где был экран: «Назад» вернёт на то же место
    const cur = this.stack[this.stack.length - 1];
    if (cur) { cur.y = window.scrollY; cur.node = document.getElementById('app').firstElementChild; }
    this.stack.push({ screen, params });
    render();
  },
  back() {
    if (closeTopSheet()) return;           // сначала закрываем открытую шторку
    this.leave();
    if (this.stack.length > 1) {
      this.stack.pop();
      const top = this.stack[this.stack.length - 1];
      restoreView(top.node, top.y);
      top.node = null;
    }
    render();
  },
  // заменить текущий экран (без добавления в историю)
  replace(screen, params = {}) {
    closeAllSheets();
    this.leave();
    cancelRestore();
    this.stack[this.stack.length - 1] = { screen, params };
    render();
  },
  tab(name) {
    this.leave();
    cancelRestore();
    this.stack = [{ screen: name, params: {} }];
    render();
  },
  home() { this.tab('home'); },
};
setConjApp(app);
if (window.__TEST__) window.__app = app;   // для автотестов

const SCREENS = {
  home: renderHome,
  path: renderPath,
  settings: renderSettings,
  learn: renderLearn,
  progress: renderProgress,
  soon: renderSoon,
  practice: renderPractice,
  games: renderGames,
  test: renderTest,
  subscription: renderSubscription,
  course: renderCourse,
  unit: renderUnit,
  unittest: renderUnitTest,
  wordcheck: renderWordCheck,
  review: renderReview,
  announce: renderAnnounce,
  codes: renderCodes,
  exam: renderExam,
  dictionary: renderDictionary,
  wordflags: renderWordFlags,
  welcome: renderWelcome,
  conj: renderConj,
  sentences: renderSentences,
  decl: renderDecl,
  analytics: renderAnalytics,
  formreports: renderFormReports,
  sisterapps: renderSisterApps,
};

// ---------------------------------------------------------------- нижняя навигация
let tabbar = null;
function ensureTabbar() {
  if (tabbar) return tabbar;
  const items = [['home', 'home', 'tabHome'], ['path', 'map', 'tabPath'], ['settings', 'settings', 'tabSettings']];
  tabbar = h('nav', { class: 'tabbar' }, h('div', { class: 'tabbar-inner' }, items.map(([name, ic, label]) =>
    h('button', { class: 'tab', type: 'button', 'data-tab': name, onClick: () => {
      haptic();
      const cur = app.stack[0] && app.stack[0].screen;
      if (cur === name && app.stack.length === 1) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      app.tab(name);
    } }, icon(ic), h('span', { class: 'tab-label' }, t(label))))));
  document.body.append(tabbar);
  return tabbar;
}

function updateTabbar() {
  const bar = ensureTabbar();
  const top = app.stack[app.stack.length - 1];
  const visible = app.stack.length === 1 && TABS.includes(top.screen);
  bar.style.display = visible ? '' : 'none';
  document.getElementById('app').classList.toggle('with-tabs', visible);
  const labels = { home: 'tabHome', path: 'tabPath', settings: 'tabSettings' };
  bar.querySelectorAll('.tab').forEach((b) => {
    b.classList.toggle('active', b.dataset.tab === top.screen);
    b.querySelector('.tab-label').textContent = t(labels[b.dataset.tab]);
  });
}

// Стрелка «назад» в самом приложении — всегда, когда есть куда вернуться (у шторок — свой крестик).
// Кнопка Telegram в заголовке тоже работает, но есть не во всех клиентах и не всем заметна.
function fallbackBack() {
  let btn = document.getElementById('fallback-back');
  if (!btn) {
    btn = h('button', { id: 'fallback-back', class: 'fallback-back', type: 'button', 'aria-label': t('back'), onClick: () => app.back() }, icon('chevron'));
    document.body.append(btn);
  }
  const show = app.stack.length > 1;
  btn.hidden = !show;
  document.body.classList.toggle('has-back', show);
}

// Кнопка «Назад» видна, если есть куда вернуться или открыта шторка
function updateBack() {
  const webApp = tg();
  if (webApp && webApp.BackButton) {
    if (app.stack.length > 1 || sheetCount()) webApp.BackButton.show();
    else webApp.BackButton.hide();
  }
  fallbackBack();
}
onSheetsChange(updateBack);

function render() {
  const { screen, params } = app.stack[app.stack.length - 1];
  updateBack();
  updateTabbar();
  Promise.resolve(SCREENS[screen](app, params)).then(() => { updateTabbar(); endRestore(); }).catch((e) => { cancelRestore(); showError(e); });
}

function showError(err) {
  console.error(err);
  mount(h('div', { class: 'screen center' },
    h('p', { class: 'err' }, `${t('loginFailed')}: ${err && (err.message || err.code) || err}`),   // с подробностями: код и текст ошибки сервера
    h('button', { class: 'btn', onClick: () => start() }, t('retry'))));
}

async function start() {
  initFocus();
  initTheme();
  const webApp = tg();
  if (!webApp) {
    mount(h('div', { class: 'screen center' }, h('h1', {}, t('appName')), h('p', { class: 'muted' }, t('loginNeeded'))));
    return;
  }
  webApp.ready();
  webApp.expand();
  if (webApp.BackButton) webApp.BackButton.onClick(() => app.back());
  setLang((webApp.initDataUnsafe && webApp.initDataUnsafe.user && webApp.initDataUnsafe.user.language_code || 'ru').slice(0, 2));
  mount(spinner(t('loading')));
  try {
    await login();
    await app.refreshMe();
    app.info = await rpc('get_app_info').catch(() => ({}));
    // реферальная ссылка: код из ссылки на мини-приложение (startapp=ref_…) или запомненный ботом (/start ref_…)
    const startParam = (webApp.initDataUnsafe && webApp.initDataUnsafe.start_param) || null;
    rpc('apply_referral', { p_code: startParam && /^ref_/i.test(startParam) ? startParam : null }).catch(() => null);
    // первый вход — короткое знакомство с приложением
    if (!(app.me && app.me.settings && app.me.settings.onboarded)) app.tab('welcome');
    else {
      app.home();
      // сообщение администратора (если есть новое) — поверх главного экрана; при первом входе — после знакомства
      showAnnouncement(currentFocus() === 'max' ? inlineNotice : sheet).catch(() => null);
    }
  } catch (err) {
    showError(err instanceof ApiError ? err : new ApiError(String(err)));
  }
}

start();
