"""Формы турецких слов для таблиц «Формы глагола» и «Формы существительного».

Глагол (инфинитив на -mak/-mek; у составных — изменяется последнее слово: teşekkür etmek → teşekkür ediyorum):
  pres  -(I)yor        настоящее            past  -DI      прошедшее
  mis   -mIş           заглазное прошедшее  fut   -(y)AcAk будущее
  aor   -(A/I)r        широкое время        neg   -mIyor   настоящее, отрицание
  cond  -sA            условное             nec   -mAlI    долженствование
  abil  -(y)Abilir     возможность          imp   повелительное: sen, o, biz, siz
  Лица: ben, sen, o, biz, siz, onlar. Особые основы: de- → di-yor / di-yecek, ye- → yi-yor / yi-yecek; git-, et-, tat-,
  güt-, dit- → gid-, ed-, tad-, güd-, did- перед гласной; широкое время односложных основ — -Ar, кроме 13 глаголов на -Ir.
Существительное: падежи ед. и мн. числа (именительный, винительный, родительный, дательный, местный, исходный)
  и принадлежность (benim … onların). Учитываются гармония гласных, буферные согласные, смягчение p ç t k → b c d ğ,
  выпадение гласной (ağız → ağzı), удвоение (hak → hakkı) и заимствования с «мягкими» окончаниями (saat → saati).
  Исключения — списки ниже; scripts/langs/tr/forms_check.py сверяет формы с примерами словаря.

Используется scripts/langs/tr/build_vocab.py (колонка words.morph).
"""
import re

VOW = 'aeıioöuü'
BACK = 'aıou'
VOICELESS = 'çfhkpsşt'
PERSONS = 6

# ---------------------------------------------------------------- гармония
LONG = {'â': 'a', 'î': 'i', 'û': 'u'}


def plain(s: str) -> str:
    return ''.join(LONG.get(c, c) for c in s)


def last_vowel(s: str, default='e') -> str:
    for c in reversed(plain(s)):
        if c in VOW:
            return c
    return default


def A(v: str) -> str:            # двухвариантная гармония
    return 'a' if v in BACK else 'e'


def I(v: str) -> str:            # четырёхвариантная гармония
    return {'a': 'ı', 'ı': 'ı', 'o': 'u', 'u': 'u', 'e': 'i', 'i': 'i', 'ö': 'ü', 'ü': 'ü'}[v]


def D(stem: str) -> str:         # d/t: после глухой согласной — t
    return 't' if plain(stem)[-1] in VOICELESS else 'd'


def ends_vowel(s: str) -> bool:
    return plain(s)[-1] in VOW


def syllables(s: str) -> int:
    return sum(1 for c in plain(s) if c in VOW)


# ---------------------------------------------------------------- глаголы
AOR_IR = {'al', 'bil', 'bul', 'dur', 'gel', 'gör', 'kal', 'ol', 'öl', 'san', 'ver', 'var', 'vur'}
T_TO_D = {'git', 'et', 'tat', 'güt', 'dit'}          # t → d перед гласной
# слитные глаголы с etmek: hissetmek → hissediyor (у yönetmek, üretmek, işletmek t не меняется)
T_TO_D |= set('affet hisset kastet kaybet kaydet keşfet reddet hallet sabret seyret şükret zannet emret naklet terket menet'.split())
NARROW = {'de': 'di', 'ye': 'yi'}                     # de- → diyor, diyecek; ye- → yiyor, yiyecek


def soft_verb(stem: str) -> str:
    """Основа перед гласной: git → gid."""
    return stem[:-1] + 'd' if stem in T_TO_D else stem


def copula(base: str, v: str = None):
    """Личные окончания 1-го типа (-(y)Im, -sIn, —, -(y)Iz, -sInIz, -lAr) после основы base."""
    v = v or last_vowel(base)
    i, a = I(v), A(v)
    y = 'y' if ends_vowel(base) else ''
    soft = base[:-1] + 'ğ' if base.endswith('k') and syllables(base) > 1 else base   # -acak → -acağım
    return [soft + y + i + 'm', base + 's' + i + 'n', base, soft + y + i + 'z', base + 's' + i + 'n' + i + 'z', base + 'l' + a + 'r']


def kpers(base: str):
    """Окончания 2-го типа (прошедшее на -DI, условное): -m, -n, —, -k, -nIz, -lAr."""
    v = last_vowel(base)
    return [base + 'm', base + 'n', base, base + 'k', base + 'n' + I(v) + 'z', base + 'l' + A(v) + 'r']


def verb_forms(word: str):
    """{'inf', 'stem', 'pres':[6], 'past', 'mis', 'fut', 'aor', 'neg', 'cond', 'nec', 'abil', 'imp':[sen, o, biz, siz]} или None."""
    w = word.strip()
    if not re.fullmatch(r"[a-zçğıöşüâîû]+( [a-zçğıöşüâîû]+)*", w) or not re.search(r'(mak|mek)$', w):
        return None
    parts = w.split(' ')
    pre = ' '.join(parts[:-1])
    last = parts[-1]
    stem = last[:-3]
    if not stem or syllables(stem) == 0:
        return None
    v = last_vowel(stem)
    sv = soft_verb(stem)                                  # перед гласной
    pv = lambda forms: [(pre + ' ' + f) if pre else f for f in forms]

    # настоящее -(I)yor
    if stem in NARROW:
        yor = NARROW[stem] + 'yor'
    elif ends_vowel(stem):
        if stem[-1] in 'ae':
            core = stem[:-1]
            yor = core + I(last_vowel(core, default=stem[-1])) + 'yor' if syllables(core) else I(stem[-1]) + 'yor'
        else:
            yor = stem + 'yor'
    else:
        yor = sv + I(v) + 'yor'
    pres = copula(yor, 'o')
    # отрицание настоящего: -mIyor
    neg = copula(stem + 'm' + I(v) + 'yor', 'o')
    # прошедшее -DI
    past = kpers(stem + D(stem) + I(v))
    # -mIş
    mis = copula(stem + 'm' + I(v) + 'ş')
    # будущее -(y)AcAk
    fstem = NARROW.get(stem, sv)
    fut_base = fstem + ('y' if ends_vowel(fstem) else '') + A(v) + 'c' + A(v) + 'k'
    fut = copula(fut_base)
    # широкое время
    if ends_vowel(stem):
        aor_base = stem + 'r'
    elif syllables(stem) == 1 and stem not in AOR_IR:
        aor_base = sv + A(v) + 'r'
    else:
        aor_base = sv + I(v) + 'r'
    aor = copula(aor_base)
    # условное -sA, долженствование -mAlI
    cond = kpers(stem + 's' + A(v))
    nec = copula(stem + 'm' + A(v) + 'l' + I(A(v)))
    # возможность -(y)Abilir
    ab = fstem + ('y' if ends_vowel(fstem) else '') + A(v) + 'bilir'
    abil = copula(ab, 'i')
    # повелительное: sen, o (-sIn), biz (-(y)AlIm), siz (-(y)In)
    yv = 'y' if ends_vowel(fstem) else ''
    imp = [stem, stem + 's' + I(v) + 'n', fstem + yv + A(v) + 'l' + I(A(v)) + 'm', fstem + yv + I(v) + 'n']
    if stem == 'de':
        imp[3] = 'deyin'
        imp[2] = 'diyelim'
    return {
        'inf': w, 'stem': (pre + ' ' + stem) if pre else stem,
        'pres': pv(pres), 'past': pv(past), 'mis': pv(mis), 'fut': pv(fut), 'aor': pv(aor), 'neg': pv(neg),
        'cond': pv(cond), 'nec': pv(nec), 'abil': pv(abil), 'imp': pv(imp),
    }


# ---------------------------------------------------------------- существительные
# Смягчение конечной согласной перед гласной (p ç t k → b c d ğ, nk → ng):
#   многосложные на -k, -p, -ç смягчаются (кроме SOFT_NO), на -t — нет (кроме SOFT_YES);
#   односложные не смягчаются (кроме SOFT_YES).
SOFT_YES = set('''kap dip uç güç genç borç taç kurt yurt dert tat renk denk grup kalp kanat armut umut yoğurt geçit
  kilit damat cilt vücut evlat hasat temerrüt teyit celp harç felç icat taklit mucit'''.split())
SOFT_YES = {x for x in SOFT_YES if '?' not in x}
SOFT_NO = set('''hukuk ahlak ittifak merak tebrik idrak sandviç kokteyl otopark tasdik teknopark stetoskop'''.split())
# Выпадение гласной последнего слога перед гласной окончания
DROP = set('''ağız burun oğul alın boyun gönül isim resim şehir fikir akıl vakit karın beyin ömür sabır zihin nehir kahır
  keyif kayıp emir hüküm şükür devir cisim kısım kasıt hapis ilim kabir göğüs bağır zehir asır nesil omuz ritim hüzün
  hacim kesir şekil keşif'''.split())
# Удвоение конечной согласной
DOUBLE = {'hak': 'hakk', 'his': 'hiss', 'ret': 'redd', 'sır': 'sırr', 'zan': 'zann', 'tıp': 'tıbb', 'hat': 'hatt', 'af': 'aff',
          'zıt': 'zıdd', 'hac': 'hacc', 'şık': 'şıkk', 'üs': 'üss', 'had': 'hadd', 'ser': 'serr',
          'kayıt': 'kayd'}   # kayıt → kaydı: выпадение гласной и смягчение
# Заимствования с «мягкой» гармонией (последняя гласная задняя, окончания — передние)
FRONT = set('''saat dikkat seyahat hakikat harf alkol gol rol kontrol petrol sembol protokol hal hayal ihtimal istikbal misal
  meal emsal terminal moral normal metal final sinyal sosyal kalp hilal ideal liberal general mineral festival sual istiklal
  ihmal ihtiyat lokal total global medikal amiral kriminal başrol şefkat kabahat'''.split())
# Заимствования на -er, которые произносятся с «ı» (blendır): окончания задние
BACK_LOAN = set('blender multicooker scooter hacker mixer laptop'.split()) - {'laptop'}
SPECIAL_NOUN = {
    'su': {'acc': 'suyu', 'gen': 'suyun', 'poss_stem': 'suy'},
    'ne': {'acc': 'neyi', 'gen': 'neyin', 'poss_stem': 'ney'},
}


def noun_parts(n: str):
    """Основа перед гласной окончания и гласная гармонии."""
    v = last_vowel(n)
    if n in BACK_LOAN:
        v = 'ı'
    if n in FRONT or any(n.endswith(f) and len(f) >= 3 and n != f for f in ('rol', 'gol', 'saat', 'kontrol', 'hal')):
        v = {'a': 'e', 'ı': 'i', 'o': 'ö', 'u': 'ü'}.get(v, v)
    if n in DOUBLE:
        return DOUBLE[n], v
    if n in DROP:
        return n[:-2] + n[-1], v                       # ağız → ağz-, burun → burn-
    if ends_vowel(n):
        return n, v
    c = n[-1]
    softens = n in SOFT_YES or (syllables(n) > 1 and c in 'kpç' and n not in SOFT_NO)
    if not softens:
        return n, v
    if n.endswith('nk'):
        return n[:-1] + 'g', v                         # renk → reng-
    return n[:-1] + {'p': 'b', 'ç': 'c', 't': 'd', 'k': 'ğ'}[c], v


def noun_forms(word: str):
    """{'sg': [nom, acc, gen, dat, loc, abl], 'pl': [...], 'poss': [benim … onların]} или None."""
    n = word.strip()
    if not re.fullmatch(r"[a-zçğıöşüâîû]+", n) or syllables(n) == 0:
        return None
    pre, v = noun_parts(n)
    a, i = A(v), I(v)
    vend = ends_vowel(n)
    d = 't' if plain(n)[-1] in VOICELESS else 'd'
    sp = SPECIAL_NOUN.get(n)
    acc = sp['acc'] if sp else (n + 'y' + i if vend else pre + i)
    gen = sp['gen'] if sp else (n + 'n' + i + 'n' if vend else pre + i + 'n')
    dat = n + 'y' + a if vend else pre + a
    sg = [n, acc, gen, dat, n + d + a, n + d + a + 'n']
    pl_stem = n + 'l' + a + 'r'
    pl = [pl_stem, pl_stem + 'ı' if a == 'a' else pl_stem + 'i', pl_stem + ('ın' if a == 'a' else 'in'),
          pl_stem + a, pl_stem + 'd' + a, pl_stem + 'd' + a + 'n']
    ps = sp['poss_stem'] if sp else (n if vend else pre)
    if vend or sp:
        poss = [ps + 'm', ps + 'n', (ps + i if sp else ps + 's' + i), ps + 'm' + i + 'z', ps + 'n' + i + 'z', n + 'l' + a + 'r' + ('ı' if a == 'a' else 'i')]
        if sp:
            poss = [ps + i + 'm', ps + i + 'n', ps + i, ps + i + 'm' + i + 'z', ps + i + 'n' + i + 'z', n + 'l' + a + 'r' + ('ı' if a == 'a' else 'i')]
    else:
        poss = [ps + i + 'm', ps + i + 'n', ps + i, ps + i + 'm' + i + 'z', ps + i + 'n' + i + 'z', n + 'l' + a + 'r' + ('ı' if a == 'a' else 'i')]
    return {'sg': sg, 'pl': pl, 'poss': poss}


def word_morph(uz: str, is_verb: bool, is_noun: bool):
    """Значение колонки words.morph: {'v': формы} у глаголов, {'n': формы} у существительных, иначе None."""
    if is_verb:
        f = verb_forms(uz)
        return {'v': f} if f else None
    if is_noun:
        f = noun_forms(uz)
        return {'n': f} if f else None
    return None
