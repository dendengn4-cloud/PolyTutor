// Знакомство с приложением: короткие экраны при первом входе. Из «Настроек» открывается как «Как пользоваться» —
// там есть ещё экран о режимах внимания (Обычный / Фокусировка / Максимальная фокусировка).
import { rpc } from '../api.js';
import { COMMUNITY_URL } from '../config.js';
import { t } from '../i18n.js';
import { h, mount, haptic, openLink } from '../ui.js';
import { icon, art, WELCOME_ART } from '../icons.js';
import { focusMode, applyFocus } from '../focus.js';
import { applyTheme, currentTheme } from '../theme.js';
import { themePicker, lookControls, saveLook } from './look-ui.js';
import { currentLook } from '../look.js';

const SLIDES = [
  { art: WELCOME_ART.w1, key: 'w1' },
  { art: WELCOME_ART.w2, key: 'w2' },
  { art: WELCOME_ART.w3, key: 'w3' },
  { art: WELCOME_ART.wP, key: 'wP', placement: true },
  { art: WELCOME_ART.w2, key: 'wF', modes: true, replayOnly: true },
  { art: WELCOME_ART.w1, key: 'wL', look: true, firstOnly: true },
  { art: WELCOME_ART.w4, key: 'w4' },
];
const MODES = ['off', 'focus', 'max'];

export function renderWelcome(app, params = {}) {
  const replay = Boolean(params.replay);
  const slides = SLIDES.filter((s) => (replay ? !s.firstOnly : !s.replayOnly));
  let i = 0;
  let remind = !(app.me && app.me.settings && app.me.settings.remind === false);

  const finish = async () => {
    haptic('success');
    // новым пользователям картинки к словам включены, если на экране «Под себя» их не выключили
    if (!replay && !(app.me && app.me.settings && 'pics' in app.me.settings)) await saveLook(app, { pics: true });
    if (!replay) {
      app.me = await rpc('update_settings', { p_ui_lang: null, p_settings: { onboarded: true, remind } }).catch(() => app.me);
      app.home();
    } else {
      app.back();
    }
  };

  const draw = () => {
    const s = slides[i];
    const last = i === slides.length - 1;
    const list = t(`${s.key}Points`);
    const points = (Array.isArray(list) ? list : []).map((p) => h('li', {}, icon('check'), h('span', {}, p)));
    const extra = [];
    if (s.placement) {
      // уже знаете язык? — тест уровня A1 сразу (сдали — откроется A2 и т. д.)
      extra.push(h('button', { type: 'button', class: 'btn', onClick: async () => {
        haptic();
        if (!replay) app.me = await rpc('update_settings', { p_ui_lang: null, p_settings: { onboarded: true, remind } }).catch(() => app.me);
        app.tab('home');
        app.go('test', { cefr: 'A1' });
      } }, icon('test'), t('wPTest')));
    }
    if (s.look) {
      // «Под себя»: тема, углы, иконки, картинки, режим внимания — всё потом есть в Настройках
      const now = focusMode(app.me);
      const setFocus = async (v) => {
        const r = await rpc('set_focus', { p_mode: v, p_sound: null, p_timer: null }).catch(() => null);
        if (r && r.settings) app.me.settings = r.settings;
        applyFocus(focusMode(app.me));
        applyTheme(currentTheme());
        haptic('success');
        draw();
      };
      if (!(app.me && app.me.settings && 'pics' in app.me.settings) && !currentLook().pics) saveLook(app, { pics: true });
      extra.push(
        h('div', { class: 'label' }, t('lookTheme')),
        themePicker((name) => { rpc('update_settings', { p_ui_lang: null, p_settings: { theme: name } }).then((me) => { if (me && me.settings) app.me = me; }).catch(() => null); draw(); }),
        lookControls(app, { onChange: draw }),
        h('div', { class: 'label' }, t('focusTitle')),
        h('div', { class: 'radio-list focus-modes' }, MODES.map((m) =>
          h('button', { type: 'button', class: `radio ${m === now ? 'active' : ''}`, onClick: () => m !== now && setFocus(m) },
            h('span', { class: 'spacer' }, h('b', {}, t(`focus_${m}`)), h('div', { class: 'small muted' }, t(`focus_${m}_hint`)))))));
    }
    if (s.modes) {
      // режимы внимания: чем отличаются; текущий отмечен
      const now = focusMode(app.me);
      const modes = t('wFModes');
      extra.push(...MODES.map((m) => h('div', { class: `card focus-guide ${m === now ? 'current' : ''}` },
        h('div', { class: 'row focus-guide-head' }, h('b', {}, t(`focus_${m}`)), m === now ? h('span', { class: 'chip accent' }, t('wFNow')) : null),
        h('ul', { class: 'feature-list' }, ((modes && modes[m]) || []).map((p) => h('li', {}, icon('check'), h('span', {}, p)))))));
      extra.push(h('button', { type: 'button', class: 'btn btn-secondary', onClick: () => { haptic(); app.back(); } }, icon('settings'), t('wFChange')));
    }
    if (last) {
      // напоминания — сразу здесь, чтобы не искать в настройках
      extra.push(h('button', { type: 'button', class: `card remind-toggle ${remind ? 'on' : ''}`, onClick: () => { remind = !remind; haptic(); draw(); } },
        h('span', { class: 'tile-icon' }, icon('clock')),
        h('div', {}, h('b', {}, t('wRemind')), h('div', { class: 'small muted' }, t('wRemindHint'))),
        h('span', { class: `switch ${remind ? 'on' : ''}` }, h('i'))));
      if (COMMUNITY_URL) {
        extra.push(h('button', { type: 'button', class: 'btn btn-secondary', onClick: () => openLink(COMMUNITY_URL) },
          icon('users'), t('wJoinGroup')));
      }
    }
    mount(h('div', { class: 'screen welcome' },
      h('div', { class: 'dots' }, slides.map((_, k) => h('i', { class: k === i ? 'on' : '' }))),
      h('div', { class: 'welcome-art' }, art(s.art)),
      h('h1', {}, t(`${s.key}Title`)),
      h('p', { class: 'muted' }, t(`${s.key}Text`)),
      points.length ? h('ul', { class: 'feature-list' }, points) : null,
      ...extra,
      h('div', { class: 'welcome-nav' },
        i > 0 ? h('button', { type: 'button', class: 'btn btn-ghost', onClick: () => { i--; draw(); } }, t('back')) : h('span'),
        h('button', { type: 'button', class: 'btn btn-big', onClick: () => { haptic(); if (last) finish(); else { i++; draw(); } } },
          last ? (replay ? t('wDone') : t('wStart')) : t('next'))),
      !last && !replay ? h('button', { type: 'button', class: 'btn btn-ghost small', onClick: finish }, t('wSkip')) : null));
  };
  draw();
}
