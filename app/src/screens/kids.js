// Детский режим (все языки): крупный интерфейс, картинки, звук, почти без набора текста.
//   • включается взрослым в Настройках с ПИН-кодом (4 цифры); настройки и выключение — только по ПИН-коду;
//     «Забыли код?» — бот присылает код сброса;
//   • занятие — блок из 5 слов: «Где …?» (слово → 4 картинки), «Что это?» (картинка → 3 слова), «Собери слово»;
//     ошибка — «Попробуй ещё», после второй ошибки подсвечивается верный ответ;
//   • за каждый блок — наклейка в альбом (картинка выученного слова); «Успехи» — дни, минуты, слова.
// Слова — из словаря языка по русским значениям детского набора рисунков (kids_words), прогресс — kids_progress.
import { rpc, requestKidsReset } from '../api.js';
import { t } from '../i18n.js';
import { h, mount, spinner, haptic, sheet } from '../ui.js';
import { icon } from '../icons.js';
import { play, wordAudio } from '../audio.js';
import { COLLATE } from '../lang/script.js';
import { kidsKeys, picBox, picsReady } from '../pics/index.js';
import { pamuk } from '../kids/pamuk.js';

export const KIDS_STYLES = ['outline', 'paper', 'crayon'];
const BLOCK = 5;

// альбомы наклеек — по темам
export const ALBUMS = [
  ['animals', ['cat', 'dog', 'bird', 'fish', 'horse', 'cow', 'sheep', 'chicken', 'mouse', 'rabbit', 'bear', 'lion', 'elephant', 'monkey', 'duck', 'pig', 'frog', 'butterfly', 'bee', 'goat']],
  ['food', ['apple', 'pear', 'banana', 'orange', 'lemon', 'grapes', 'strawberry', 'watermelon', 'cherry', 'tomato', 'cucumber', 'carrot', 'potato', 'bread', 'cheese', 'egg', 'milk', 'water', 'tea', 'coffee', 'cake', 'icecream', 'soup', 'honey']],
  ['home', ['house', 'door', 'window', 'table', 'chair', 'bed', 'key', 'clock', 'phone', 'book', 'pencil', 'bag', 'backpack', 'cup', 'plate', 'spoon', 'fork', 'ball', 'doll', 'toy', 'gift', 'school']],
  ['nature', ['sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'tree', 'flower', 'leaf', 'sea', 'mountain', 'fire', 'rainbow', 'grass']],
  ['travel', ['car', 'bus', 'bicycle', 'plane', 'train', 'ship', 'boat']],
  ['clothes', ['shirt', 'dress', 'trousers', 'shoes', 'hat', 'glasses', 'umbrella', 'coat', 'sock']],
  ['body', ['hand', 'eye', 'ear', 'nose', 'mouth', 'foot', 'tooth', 'heart', 'head', 'hair']],
  ['people', ['mother', 'father', 'grandmother', 'grandfather', 'baby', 'boy', 'girl', 'brother', 'sister', 'friend']],
  ['actions', ['eat', 'drink', 'sleep', 'run', 'walk', 'read', 'write', 'speak', 'listen', 'see', 'give', 'open', 'close', 'buy', 'cook', 'play', 'swim', 'sing', 'love', 'think', 'wash', 'draw', 'dance']],
  ['colors', ['red', 'blue', 'green', 'yellow', 'orange_c', 'purple', 'pink', 'brown', 'black', 'white', 'grey', 'big', 'small', 'hot', 'cold', 'happy', 'sad', 'angry', 'good', 'bad', 'slow', 'tall', 'beautiful', 'sweet']],
  ['numbers', ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10']],
];

const ALBUM_OF = new Map(ALBUMS.flatMap(([name, keys]) => keys.map((k) => [k, name])));
const lower = (s) => String(s || '').toLocaleLowerCase(COLLATE);
const shuffle = (a) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
export const kidsOn = (me) => Boolean(me && me.settings && me.settings.kids);
const kidsStyle = (me) => (KIDS_STYLES.includes(me && me.settings && me.settings.kids_style) ? me.settings.kids_style : 'outline');

// ---------------------------------------------------------------- слова детского набора (кэш на время работы)
let wordsCache = null;
async function loadWords(force = false) {
  if (wordsCache && !force) return wordsCache;
  await picsReady;                                 // библиотека рисунков грузится отдельно от приложения
  const byKey = kidsKeys();                        // рисунок → русские значения
  const keyOf = {};
  for (const [k, list] of Object.entries(byKey)) for (const ru of list) keyOf[ru] = k;
  const rows = await rpc('kids_words', { p_keys: Object.keys(keyOf) });
  const seen = new Set();
  const out = [];
  for (const r of rows || []) {
    const pic = keyOf[r.k];
    if (!pic || seen.has(pic)) continue;           // одно слово на рисунок
    seen.add(pic);
    out.push({ id: r.i, uz: r.u, ru: r.r, audio: r.a, box: r.b || 0, seen: r.s || 0, pic });
  }
  // порядок — как в альбомах (от простого к сложному)
  const order = new Map(ALBUMS.flatMap(([, keys]) => keys).map((k, i) => [k, i]));
  out.sort((a, b) => (order.get(a.pic) ?? 999) - (order.get(b.pic) ?? 999));
  wordsCache = out;
  return out;
}

// ---------------------------------------------------------------- ПИН-код
function pinPad({ title, hint, onDone, extra }) {
  let pin = '';
  const dots = h('div', { class: 'pin-dots' });
  const msg = h('div', { class: 'pin-msg small' });
  const drawDots = () => dots.replaceChildren(...[0, 1, 2, 3].map((i) => h('i', { class: i < pin.length ? 'on' : '' })));
  const press = async (d) => {
    haptic();
    if (d === 'del') pin = pin.slice(0, -1);
    else if (pin.length < 4) pin += d;
    drawDots();
    if (pin.length === 4) {
      const p = pin;
      const err = await onDone(p);
      pin = '';
      drawDots();
      if (err) { msg.textContent = err; dots.classList.add('shake'); setTimeout(() => dots.classList.remove('shake'), 400); }
    }
  };
  drawDots();
  return h('div', { class: 'pin-pad' },
    title ? h('h3', { class: 'center-text' }, title) : null,
    hint ? h('p', { class: 'small muted center-text' }, hint) : null,
    dots, msg,
    h('div', { class: 'pin-keys' }, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((d) =>
      d === '' ? h('span') : h('button', { type: 'button', class: 'pin-key', 'aria-label': d === 'del' ? t('kidsPinDel') : d, onClick: () => press(d) },
        d === 'del' ? icon('close') : d))),
    extra || null);
}

const pinError = (r) => (r && r.locked ? t('kidsPinLocked', r.wait || 10) : t('kidsPinWrong'));

// включение: ПИН дважды
export function kidsEnableSheet(app) {
  let first = null;
  let close = () => {};
  const box = h('div', {});
  const step = () => box.replaceChildren(pinPad({
    title: first ? t('kidsPinRepeat') : t('kidsPinSet'),
    hint: first ? null : t('kidsPinSetHint'),
    onDone: async (p) => {
      if (!first) { first = p; step(); return null; }
      if (p !== first) { first = null; step(); return t('kidsPinMismatch'); }
      const r = await rpc('kids_enable', { p_pin: p }).catch(() => null);
      if (!r || !r.ok) return t('kidsError');
      app.me = r.me;
      haptic('success');
      close();
      app.home();
      return null;
    },
  }));
  step();
  close = sheet(box);
}

// «Забыли код?»: бот присылает код; ввод кода и нового ПИН
function resetSheet(app, done) {
  let close = () => {};
  const box = h('div', {});
  const status = h('p', { class: 'small muted center-text' });
  const codeInput = h('input', { class: 'answer-input', inputmode: 'numeric', maxlength: '6', autocomplete: 'one-time-code', placeholder: '000000' });
  const ask = async () => {
    status.textContent = '…';
    try { await requestKidsReset(); status.textContent = t('kidsResetSent'); } catch (e) { status.textContent = e && e.code === 'too_often' ? t('kidsResetWait') : t('kidsError'); }
  };
  const toPin = () => {
    const code = codeInput.value.replace(/\D/g, '');
    if (code.length !== 6) { status.textContent = t('kidsResetCode'); return; }
    box.replaceChildren(pinPad({
      title: t('kidsPinNew'),
      onDone: async (p) => {
        const r = await rpc('kids_reset', { p_code: code, p_pin: p }).catch(() => null);
        if (r && r.ok) { haptic('success'); close(); if (done) done(); return null; }
        if (r && (r.error === 'bad_code' || r.error === 'no_code')) { setTimeout(() => { close(); resetSheet(app, done); }, 900); return t('kidsResetBad'); }
        return t('kidsError');
      },
    }));
  };
  box.append(h('h3', {}, t('kidsForgot')), h('p', { class: 'small muted' }, t('kidsResetHint')),
    h('button', { class: 'btn', type: 'button', onClick: ask }, icon('chat'), t('kidsResetSend')),
    codeInput, h('button', { class: 'btn btn-secondary', type: 'button', onClick: toPin }, t('next')), status);
  close = sheet(box);
}

// вход в настройки детского режима: по ПИН-коду; разблокировка — до закрытия приложения или 10 минут
let unlockedUntil = 0;
let lastPin = '';
export const kidsUnlocked = () => Date.now() < unlockedUntil;
export function kidsPinScreen(app, onOk) {
  mount(h('div', { class: 'screen kids-pin-screen' },
    h('div', { class: 'kids-lock' }, icon('lock')),
    pinPad({
      title: t('kidsPinEnter'), hint: t('kidsPinEnterHint'),
      onDone: async (p) => {
        const r = await rpc('kids_check', { p_pin: p }).catch(() => null);
        if (r && r.ok) { unlockedUntil = Date.now() + 10 * 60 * 1000; lastPin = p; haptic('success'); onOk(); return null; }
        haptic('error');
        return pinError(r);
      },
      extra: h('button', { class: 'btn btn-ghost', type: 'button', onClick: () => resetSheet(app, () => kidsPinScreen(app, onOk)) }, t('kidsForgot')),
    })));
}

// карточка в Настройках: включить / (в детском режиме, после ПИН) стиль картинок и выключить
export function kidsSettingsCard(app) {
  const me = app.me;
  if (!kidsOn(me)) {
    return h('button', { class: 'card sub-card', type: 'button', onClick: () => { haptic(); kidsEnableSheet(app); } },
      h('span', { class: 'tile-icon kids-ic' }, pamuk('', 'pamuk-ic')),
      h('div', {}, h('b', {}, t('kidsOn')), h('div', { class: 'small muted' }, t('kidsOnHint'))),
      icon('chevron', 'ic chev'));
  }
  const style = kidsStyle(me);
  return h('div', { class: 'card kids-set' },
    h('div', { class: 'label' }, t('kidsStyle')),
    h('div', { class: 'kids-style-row' }, KIDS_STYLES.map((s) =>
      h('button', { type: 'button', class: `kids-style ${s === style ? 'active' : ''}`, onClick: async () => {
        if (s === style) return;
        haptic();
        const r = await rpc('set_look', { p: { kids_style: s } }).catch(() => null);
        if (r && r.settings) app.me = r;
        app.replace('settings', { keep: true });
      } }, picBox('cat', s, 'white', 'md'), h('span', {}, t(`kidsStyle_${s}`))))),
    h('button', { class: 'btn btn-secondary', type: 'button', onClick: async () => {
      const r = await rpc('kids_disable', { p_pin: lastPin }).catch(() => null);
      if (r && r.ok) { app.me = r.me; unlockedUntil = 0; wordsCache = null; haptic('success'); app.home(); return; }
      kidsPinScreen(app, async () => {
        const r2 = await rpc('kids_disable', { p_pin: lastPin }).catch(() => null);
        if (r2 && r2.ok) { app.me = r2.me; unlockedUntil = 0; wordsCache = null; app.home(); }
      });
    } }, t('kidsOff')),
    h('p', { class: 'tiny muted' }, t('kidsOffHint')));
}

// ---------------------------------------------------------------- главная
export async function renderKidsHome(app) {
  mount(spinner('…'));
  const [words, st] = await Promise.all([loadWords(true), rpc('kids_stats').catch(() => ({}))]);
  const me = app.me || {};
  const name = me.first_name || '';
  const learned = words.filter((w) => w.box >= 1).length;
  const album = ALBUMS.find(([, keys]) => keys.some((k) => !words.find((w) => w.pic === k && w.box >= 1))) || ALBUMS[0];
  const inAlbum = words.filter((w) => album[1].includes(w.pic));
  const got = inAlbum.filter((w) => w.box >= 1).length;
  mount(h('div', { class: 'screen kids-home' },
    h('div', { class: 'kids-top' },
      st.streak ? h('span', { class: 'kids-chip sun' }, icon('flame'), t('kidsStreak', st.streak)) : h('span'),
      h('span', { class: 'kids-chip lilac' }, icon('star'), t('kidsStickers', learned)),
      h('button', { class: 'kids-gear', type: 'button', 'aria-label': t('tabSettings'), onClick: () => app.go('settings') }, icon('settings'))),
    h('div', { class: 'kids-hello' }, pamuk('', 'pamuk-big'),
      h('div', { class: 'kids-speech' }, name ? t('kidsHello', name) : t('kidsHelloAnon'))),
    h('button', { class: 'kids-btn', type: 'button', onClick: () => { haptic(); app.replace('kidsplay'); } }, t('kidsPlay'), ' ▶'),
    inAlbum.length ? h('button', { class: 'kids-card kids-album-card', type: 'button', onClick: () => app.go('kidsalbum', { album: album[0] }) },
      h('div', { class: 'row' }, h('b', { class: 'spacer' }, t(`kidsAlbum_${album[0]}`)), h('b', { class: 'kids-lilac' }, `${got} / ${inAlbum.length}`)),
      h('div', { class: 'kids-prog' }, h('i', { style: { width: `${Math.round((100 * got) / inAlbum.length)}%` } }))) : null,
    h('div', { class: 'kids-tiles' },
      h('button', { class: 'kids-tile', type: 'button', onClick: () => app.go('kidsalbum', {}) }, picBox('gift', kidsStyle(me), 'none', 'md'), t('kidsAlbum')),
      h('button', { class: 'kids-tile', type: 'button', onClick: () => app.go('kidsstats') }, picBox('star', kidsStyle(me), 'none', 'md'), t('kidsStats'))),
    words.length < 8 ? h('p', { class: 'small muted center-text' }, t('kidsFewWords')) : null));
}

// ---------------------------------------------------------------- занятие: блок из 5 слов
export async function renderKidsPlay(app) {
  mount(spinner('…'));
  const words = await loadWords();
  const style = kidsStyle(app.me);
  if (words.length < 4) { mount(h('div', { class: 'screen' }, h('p', {}, t('kidsFewWords')))); return; }
  // сначала слова, которые ещё не выучены (новые — по порядку альбомов), затем повторение
  const fresh = words.filter((w) => w.box < 3);
  const pool = fresh.length >= BLOCK ? fresh.slice(0, BLOCK + 3) : [...fresh, ...shuffle(words.filter((w) => w.box >= 3))];
  const block = shuffle(pool.slice(0, BLOCK + 3)).slice(0, BLOCK);
  const kinds = (w) => {
    const k = ['where', 'what'];
    const one = lower(w.uz).replace(/[!?.,]/g, '');
    if (!/\s/.test(one) && Array.from(one).length >= 2 && Array.from(one).length <= 7) k.push('letters');
    return k;
  };
  let lastKind = '';
  const tasks = block.map((w) => {
    const list = kinds(w).filter((k) => k !== lastKind);
    const kind = w.seen === 0 ? 'where' : list[Math.floor(Math.random() * list.length)];
    lastKind = kind;
    return { w, kind };
  });
  let i = 0;
  let started = Date.now();
  const newStickers = [];
  const next = () => { i++; if (i >= tasks.length) finish(); else step(); };
  const record = (w, ok, last) => {
    const secs = Math.round((Date.now() - started) / 1000);
    started = Date.now();
    rpc('kids_answer', { p_word: w.id, p_ok: ok, p_seconds: secs, p_block_done: Boolean(last) }).catch(() => null);
    if (ok && w.box === 0) newStickers.push(w);
    w.box = ok ? Math.min(5, w.box + 1) : Math.max(0, w.box - 1);
    w.seen += 1;
  };
  const say = (w) => { if (w.audio) play(wordAudio(w.id)); };
  const dots = () => h('div', { class: 'kids-dots' }, tasks.map((_, k) => h('i', { class: k < i ? 'on' : k === i ? 'now' : '' })));
  const top = () => h('div', { class: 'kids-bar' },
    h('button', { class: 'kids-x', type: 'button', 'aria-label': t('kidsExit'), onClick: () => app.home() }, icon('close')), dots(), h('span'));

  const feedback = (ok, w) => h('div', { class: `kids-fb ${ok ? 'good' : 'try'}` },
    pamuk(ok ? 'joy' : 'think', 'pamuk-fb'),
    h('div', { class: 'spacer' }, h('b', {}, ok ? t('kidsGood') : t('kidsTry')), h('div', { class: 'small' }, ok ? `${w.uz} — ${w.ru}` : t('kidsTryHint'))));

  const step = () => {
    const { w, kind } = tasks[i];
    // варианты — сначала из той же темы (животные к животным), потом остальные
    const same = (x) => ALBUM_OF.get(x.pic) === ALBUM_OF.get(w.pic);
    const rest = words.filter((x) => x.pic !== w.pic);
    const others = [...shuffle(rest.filter(same)), ...shuffle(rest.filter((x) => !same(x)))];
    const last = i === tasks.length - 1;
    let tries = 0;
    let recorded = false;
    const rec = (ok) => { if (recorded) return; recorded = true; record(w, ok, last); };   // один ответ на задание
    const screen = h('div', { class: 'screen kids-play' });
    const fbBox = h('div', {});
    const nextBtn = h('button', { class: 'kids-btn kids-next', type: 'button', onClick: () => { haptic(); next(); } }, t('next'));
    nextBtn.hidden = true;
    const answer = (ok, el, all, rightEl) => {
      if (ok) {
        haptic('success');
        el.classList.add('right');
        all.forEach((b) => { b.disabled = true; if (b !== el) b.classList.add('dim'); });
        rec(tries === 0);
        say(w);
        fbBox.replaceChildren(feedback(true, w));
        nextBtn.hidden = false;
        setTimeout(() => nextBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 60);
        return;
      }
      haptic('error');
      tries++;
      el.classList.add('try');
      el.disabled = true;
      fbBox.replaceChildren(feedback(false, w));
      if (tries >= 2 && rightEl) {
        rightEl.classList.add('hint');
        if (tries === 2) rec(false);
      }
    };
    let body;
    if (kind === 'where') {
      // «Где …?»: слово звучит, ребёнок нажимает картинку
      const opts = shuffle([w, ...others.slice(0, 3)]);
      const btns = opts.map((o) => h('button', { class: 'kids-opt', type: 'button', 'aria-label': o.ru, onClick: (e) => answer(o === w, e.currentTarget, btns, btns[opts.indexOf(w)]) },
        picBox(o.pic, style, 'none', 'kid')));
      body = [h('div', { class: 'kids-q' },
        h('button', { class: 'kids-spk', type: 'button', 'aria-label': t('kidsListen'), onClick: () => say(w) }, icon('sound')),
        h('div', { class: 'kids-word' }, t('kidsWhere', w.uz))),
      h('div', { class: 'kids-grid' }, btns)];
      setTimeout(() => say(w), 250);
    } else if (kind === 'what') {
      // «Что это?»: картинка, три слова (каждое можно послушать)
      const opts = shuffle([w, ...others.slice(0, 2)]);
      const btns = opts.map((o) => h('button', { class: 'kids-word-opt', type: 'button', onClick: (e) => { if (o.audio) play(wordAudio(o.id)); answer(o === w, e.currentTarget, btns, btns[opts.indexOf(w)]); } }, o.uz));
      body = [h('div', { class: 'kids-q' }, h('div', { class: 'kids-what' }, picBox(w.pic, style, 'white', 'kid-lg')), h('div', { class: 'kids-word small' }, t('kidsWhat'))),
        h('div', { class: 'kids-words' }, btns)];
    } else {
      // «Собери слово»: буквы-кубики
      const target = Array.from(lower(w.uz).replace(/[!?.,]/g, ''));
      const letters = shuffle(target.map((ch, k) => ({ ch, k })));
      let pos = 0;
      const slots = target.map(() => h('i', {}));
      const cubes = letters.map((l) => h('button', { class: 'kids-cube', type: 'button', onClick: (e) => {
        const b = e.currentTarget;
        if (l.ch === target[pos]) {
          haptic();
          slots[pos].textContent = l.ch; slots[pos].classList.add('f');
          b.classList.add('used'); b.disabled = true;
          pos++;
          if (pos === target.length) answer(true, slots[0].parentNode, [], null);
        } else {
          haptic('error');
          b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400);
          tries++;
          if (tries === 2) { rec(false); slots[pos].textContent = target[pos]; slots[pos].classList.add('hint'); }
          fbBox.replaceChildren(feedback(false, w));
        }
      } }, l.ch));
      body = [h('div', { class: 'kids-q' }, h('div', { class: 'kids-what' }, picBox(w.pic, style, 'white', 'kid-lg')),
        h('button', { class: 'kids-spk small', type: 'button', onClick: () => say(w) }, icon('sound'))),
        h('div', { class: 'kids-slots' }, slots), h('div', { class: 'kids-cubes' }, cubes)];
      setTimeout(() => say(w), 250);
    }
    screen.append(top(), ...body, fbBox, nextBtn);
    mount(screen);
  };

  const finish = () => {
    haptic('success');
    const got = newStickers.length ? newStickers : block.slice(0, 1);
    mount(h('div', { class: 'screen kids-done' },
      h('div', { class: 'kids-hello' }, pamuk('joy', 'pamuk-big'), h('div', { class: 'kids-speech' }, newStickers.length ? t('kidsNewStickers', newStickers.length) : t('kidsBlockDone'))),
      h('div', { class: 'kids-album' }, got.map((w) => h('div', { class: 'kids-stk new' }, picBox(w.pic, style, 'sticker', 'kid')))),
      h('button', { class: 'kids-btn', type: 'button', onClick: () => app.replace('kidsplay') }, t('kidsMore', BLOCK)),
      h('button', { class: 'btn btn-ghost', type: 'button', onClick: () => app.home() }, t('kidsEnough'))));
  };
  step();
}

// ---------------------------------------------------------------- альбом
export async function renderKidsAlbum(app, params = {}) {
  mount(spinner('…'));
  const words = await loadWords();
  const style = kidsStyle(app.me);
  const have = new Map(words.map((w) => [w.pic, w]));
  const albums = ALBUMS.map(([name, keys]) => [name, keys.filter((k) => have.has(k))]).filter(([, keys]) => keys.length);
  const show = params.album ? albums.filter(([n]) => n === params.album) : albums;
  mount(h('div', { class: 'screen kids-albums' },
    h('h1', {}, t('kidsAlbum')),
    show.map(([name, keys]) => {
      const got = keys.filter((k) => have.get(k).box >= 1).length;
      return h('div', { class: 'kids-card' },
        h('div', { class: 'row' }, h('b', { class: 'spacer' }, t(`kidsAlbum_${name}`)), h('b', { class: 'kids-lilac' }, `${got} / ${keys.length}`)),
        h('div', { class: 'kids-album' }, keys.map((k) => {
          const w = have.get(k);
          return w.box >= 1
            ? h('button', { class: 'kids-stk', type: 'button', 'aria-label': w.ru, onClick: () => { if (w.audio) play(wordAudio(w.id)); } }, picBox(k, style, 'sticker', 'kid'))
            : h('div', { class: 'kids-stk locked' }, '?');
        })));
    }),
    params.album ? h('button', { class: 'btn btn-ghost', type: 'button', onClick: () => app.replace('kidsalbum', {}) }, t('kidsAllAlbums')) : null));
}

// ---------------------------------------------------------------- успехи (в этом же профиле)
export async function renderKidsStats(app) {
  mount(spinner('…'));
  const [st, words] = await Promise.all([rpc('kids_stats').catch(() => ({})), loadWords()]);
  const style = kidsStyle(app.me);
  const picOfWord = new Map(words.map((w) => [w.id, w.pic]));
  const week = st.week || [];
  const max = Math.max(1, ...week.map((d) => d.m));
  const days = t('kidsWeekDays') || [];
  mount(h('div', { class: 'screen kids-stats' },
    h('h1', {}, t('kidsStats')),
    h('div', { class: 'kids-stat3' },
      h('div', {}, h('b', {}, String(st.words || 0)), h('span', {}, t('kidsStatWords'))),
      h('div', {}, h('b', {}, String(st.days || 0)), h('span', {}, t('kidsStatDays'))),
      h('div', {}, h('b', {}, String(st.minutes || 0)), h('span', {}, t('kidsStatMin')))),
    h('div', { class: 'kids-card' },
      h('b', {}, t('kidsWeek')),
      h('div', { class: 'kids-bars' }, week.map((d) => h('i', { class: d.m ? '' : 'z', style: { height: `${Math.max(6, Math.round((100 * d.m) / max))}%` } }))),
      h('div', { class: 'kids-blabels' }, week.map((d) => h('span', {}, Array.isArray(days) ? days[(new Date(`${d.d}T12:00:00`).getDay() + 6) % 7] : '')))),
    h('div', { class: 'kids-wlist' }, (st.recent || []).map((r) =>
      h('div', {}, picOfWord.get(r.i) ? picBox(picOfWord.get(r.i), style, 'none', 'sm') : h('span', { class: 'pic-box pic-sm' }),
        h('b', {}, r.u), h('span', { class: 'spacer' }, r.r), h('small', {}, r.b >= 3 ? t('kidsKnows') : t('kidsLearning')))))));
}
