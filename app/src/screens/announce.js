// Сообщение пользователям (администратор): показать в приложении при входе (этот язык или все языки)
// и/или отправить в чат с ботом. Ниже — последние сообщения этого языка: скрыть / показать снова.
import { rpc, postAnnouncement } from '../api.js';
import { t, formatDate } from '../i18n.js';
import { h, mount, spinner, haptic } from '../ui.js';
import { icon } from '../icons.js';
import { LANG } from '../lang/info.js';

export async function renderAnnounce(app) {
  mount(spinner(t('loading')));
  const data = await rpc('admin_announcements');
  if (data.error) {
    mount(h('div', { class: 'screen' }, h('div', { class: 'card empty' }, icon('lock'), h('p', {}, t('adminOnly')))));
    return;
  }
  let target = 'this', how = 'banner', busy = false, armed = false, armTimer = 0;
  const seg = (items, get, set) => {
    const el = h('div', { class: 'segmented' });
    const draw = () => el.replaceChildren(...items.map(([v, l]) =>
      h('button', { type: 'button', class: v === get() ? 'active' : '', onClick: () => { set(v); draw(); disarm(); } }, l)));
    draw();
    return el;
  };
  const ta = h('textarea', { class: 'answer-input report-ta', maxlength: '2000', rows: '6', placeholder: t('annText') });
  const status = h('p', { class: 'small muted' });
  const sendLabel = h('span', {}, t('annSend'));
  const disarm = () => { armed = false; clearTimeout(armTimer); sendLabel.textContent = t('annSend'); sendBtn.classList.remove('btn-ok'); };
  const sendBtn = h('button', { class: 'btn', type: 'button', onClick: async () => {
    if (busy) return;
    const text = ta.value.trim();
    if (!text) { status.textContent = t('annEmpty'); return; }
    // первое нажатие — подтвердить (сообщение увидят все выбранные пользователи)
    if (!armed) {
      armed = true;
      sendLabel.textContent = t('annConfirm');
      sendBtn.classList.add('btn-ok');
      armTimer = setTimeout(disarm, 6000);
      return;
    }
    disarm();
    busy = true; sendBtn.disabled = true;
    const banner = how !== 'chat', chat = how !== 'banner';
    const sum = { banners: 0, sent: 0, blocked: 0, failed: 0, total: 0 };
    try {
      let offset = 0;
      for (;;) {
        const r = await postAnnouncement({ target, banner, chat, text, offset });
        sum.banners += r.banners || 0; sum.sent += r.sent || 0; sum.blocked += r.blocked || 0; sum.failed += r.failed || 0;
        sum.total = r.total || 0;
        if (r.done || r.next_offset == null) break;
        offset = r.next_offset;
        status.textContent = t('annSending', offset, sum.total);
      }
      haptic('success');
      ta.value = '';
      status.textContent = t('annDone', sum, banner, chat);
      if (banner) setTimeout(() => app.replace('announce', {}), 2500);
    } catch (err) {
      status.textContent = t('annErr', (err && err.code) || (err && err.message) || 'error');
    } finally {
      busy = false; sendBtn.disabled = false;
    }
  } }, icon('check'), sendLabel);

  const item = (a) => {
    const chip = h('span', { class: `chip ${a.active ? 'accent' : ''}` }, a.active ? t('annActive') : t('annHidden'));
    const btn = h('button', { class: 'btn btn-small btn-secondary', type: 'button', onClick: async () => {
      const next = !a.active;
      const r = await rpc('admin_set_announcement', { p_id: a.id, p_active: next }).catch(() => null);
      if (r && r.ok) {
        a.active = next; haptic();
        chip.textContent = next ? t('annActive') : t('annHidden');
        chip.classList.toggle('accent', next);
        btn.textContent = next ? t('annHide') : t('annShow');
      }
    } }, a.active ? t('annHide') : t('annShow'));
    return h('div', { class: 'card' },
      h('div', { class: 'row', style: { justifyContent: 'space-between' } },
        h('span', { class: 'tiny muted' }, `${formatDate(a.created_at)}${a.scope === 'all' ? ` · ${t('annScopeAll')}` : ''} · ${t('annSeen', a.seen)}`), chip),
      h('p', { style: { whiteSpace: 'pre-wrap' } }, a.body),
      btn);
  };

  mount(h('div', { class: 'screen' },
    h('h1', {}, t('annTitle')),
    h('p', { class: 'muted small' }, t('annSub')),
    h('div', { class: 'label' }, t('annWho')),
    seg([['this', `${LANG.flag} ${t('annThis')}`], ['all', `🌍 ${t('annAll')}`]], () => target, (v) => { target = v; }),
    h('div', { class: 'label', style: { marginTop: '12px' } }, t('annHow')),
    seg([['banner', t('annBanner')], ['chat', t('annChat')], ['both', t('annBoth')]], () => how, (v) => { how = v; }),
    ta,
    h('div', { style: { height: '10px' } }),
    sendBtn,
    status,
    h('h2', {}, t('annRecent')),
    data.items.length ? data.items.map(item) : h('div', { class: 'card empty' }, h('p', {}, t('annNone')))));
}

// Показ сообщения пользователю при входе в приложение — один раз: сразу отмечается как показанное,
// поэтому закрытие любым способом (кнопка, ×, нажатие мимо окна) больше его не покажет.
export async function showAnnouncement(sheet) {
  const a = await rpc('get_announcement').catch(() => null);
  if (!a || !a.id) return;
  rpc('mark_announcement_seen', { p_id: a.id }).catch(() => null);
  let close = () => {};
  close = sheet(
    h('h2', {}, icon('sparkle'), ' ', t('annModalTitle')),
    h('p', { style: { whiteSpace: 'pre-wrap' } }, a.body),
    h('button', { class: 'btn', type: 'button', onClick: () => close() }, t('wDone')));
}
