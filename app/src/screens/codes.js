// Коды подписки (администратор): уровень, срок, количество и число активаций одного кода → список кодов с копированием.
// Код действует в этом языке: Подписка → Код подписки.
import { rpc } from '../api.js';
import { t, tierName } from '../i18n.js';
import { h, mount, haptic } from '../ui.js';
import { icon } from '../icons.js';
import { LANG } from '../lang/info.js';

export function renderCodes() {
  let tier = 'basic', months = 1;
  const seg = (items, get, set) => {
    const el = h('div', { class: 'segmented' });
    const draw = () => el.replaceChildren(...items.map(([v, l]) =>
      h('button', { type: 'button', class: v === get() ? 'active' : '', onClick: () => { set(v); draw(); } }, l)));
    draw();
    return el;
  };
  const count = h('input', { class: 'answer-input', type: 'number', min: '1', max: '50', value: '1', inputmode: 'numeric' });
  const uses = h('input', { class: 'answer-input', type: 'number', min: '1', max: '1000', value: '1', inputmode: 'numeric' });
  const out = h('div', {});
  const status = h('p', { class: 'small muted' });
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); haptic('success'); status.textContent = t('copied'); } catch { status.textContent = text; }
  };
  const btn = h('button', { class: 'btn btn-big', type: 'button', onClick: async () => {
    btn.disabled = true; status.textContent = t('loading');
    const r = await rpc('admin_generate_codes', { p_tier: tier, p_months: months,
      p_count: Math.max(1, Math.min(50, Number(count.value) || 1)), p_uses: Math.max(1, Math.min(1000, Number(uses.value) || 1)) }).catch((e) => ({ error: e.message }));
    btn.disabled = false;
    if (!r || r.error) { status.textContent = t('codesErr', (r && r.error) || 'error'); return; }
    status.textContent = '';
    haptic('success');
    const codes = r.codes || [];
    out.replaceChildren(...[
      h('h2', {}, `${tierName(r.tier)} · ${t('months', r.months)}${r.uses > 1 ? ` · ${t('codesUsesShort', r.uses)}` : ''}`),
      h('div', { class: 'card' }, codes.map((c) => h('div', { class: 'pay-row' },
        h('b', { class: 'code-text' }, c),
        h('button', { class: 'btn btn-small btn-secondary', type: 'button', onClick: () => copy(c) }, t('copy'))))),
      codes.length > 1 ? h('button', { class: 'btn btn-secondary', type: 'button', onClick: () => copy(codes.join('\n')) }, icon('check'), t('codesCopyAll')) : null].filter(Boolean));
  } }, icon('sparkle'), t('codesCreate'));
  mount(h('div', { class: 'screen' },
    h('h1', {}, t('codesTitle')),
    h('p', { class: 'muted small' }, t('codesSub', `${LANG.flag} ${LANG.name.native}`)),
    h('div', { class: 'label' }, t('codesTier')),
    seg([['basic', tierName('basic')], ['advanced', tierName('advanced')]], () => tier, (v) => { tier = v; }),
    h('div', { class: 'label', style: { marginTop: '12px' } }, t('codesMonths')),
    seg([1, 3, 6, 12].map((m) => [m, t('months', m)]), () => months, (v) => { months = v; }),
    h('div', { class: 'two-btns two-inputs' },
      h('label', {}, h('div', { class: 'small muted' }, t('codesCount')), count),
      h('label', {}, h('div', { class: 'small muted' }, t('codesUses')), uses)),
    btn, status, out));
}
