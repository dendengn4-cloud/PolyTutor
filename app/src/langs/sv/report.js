// Шторка «Нужно исправить» для таблиц форм: вся таблица или одна строка + комментарий → администратору
// (report_form, kind 'conj' / 'decl'; администратор видит пометку в «Пометки форм» и в сообщении бота).
import { rpc, notifyFlags } from '../api.js';
import { t } from '../i18n.js';
import { h, sheet, haptic } from '../ui.js';
import { icon } from '../icons.js';

export function reportSheet({ word, kind, title, rows }) {
  let person = null;
  const chips = h('div', { class: 'segmented scroll wrap' });
  const drawChips = () => chips.replaceChildren(
    h('button', { type: 'button', class: person === null ? 'active' : '', onClick: () => { person = null; drawChips(); } }, t('repWhole')),
    ...rows.map((r, i) => h('button', { type: 'button', class: person === i ? 'active' : '', onClick: () => { person = i; drawChips(); } }, r.label)));
  drawChips();
  const ta = h('textarea', { class: 'answer-input report-ta', rows: '3', maxlength: '500', placeholder: t('repPlaceholder') });
  const msg = h('div', { class: 'small muted' });
  const send = h('button', { class: 'btn btn-big', type: 'button', onClick: async () => {
    const comment = ta.value.trim();
    if (!comment) { ta.focus(); return; }
    send.disabled = true;
    const row = person === null ? null : rows[person];
    const res = await rpc('report_form', { p_word: word.id, p_kind: kind, p_item: row ? row.label : t('repWhole'), p_person: null,
      p_form: row ? `${row.label}: ${row.form}` : rows.map((r) => `${r.label}: ${r.form}`).join('; ').slice(0, 300), p_comment: comment })
      .catch(() => ({ error: 'net' }));
    if (res && res.ok) {
      haptic('success');
      notifyFlags();
      close();
    } else {
      send.disabled = false;
      msg.textContent = res && res.error === 'too_many' ? t('repTooMany') : t('repFailed');
    }
  } }, t('repSend'));
  const close = sheet(
    h('div', { class: 'label' }, t('repTitle')),
    h('h3', {}, `${word.uz} · ${title}`),
    chips, ta, msg, send,
    h('p', { class: 'tiny muted center-text' }, t('repHint')));
  setTimeout(() => ta.focus(), 100);
}

export const flagButton = (onClick) =>
  h('button', { class: 'flag-mini', type: 'button', title: t('repTitle'), 'aria-label': t('repTitle'), onClick: (e) => { e.stopPropagation(); onClick(); } },
    icon('flag'));
