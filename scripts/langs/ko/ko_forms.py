"""Формы корейских слов для колонки words.morph (приложение: app/src/langs/ko/forms.js).

Глагол и прилагательное (словарная форма на -다): {"v": {inf, stem, irr, adj, pres[3], past[3], fut[3], neg[3], nec[3],
  conn[3], cond[2], mod[1|3], hon[3], и только у глаголов: want[3], abil[3], imp[3], prog[3]}}.
  В массивах времён три стиля: [해요, 합니다, 반말]; hon — [наст. 해요, наст. 합니다, прош. 해요];
  conn — [-고, -지만, -아/어서]; cond — [-(으)면, -아/어도]; mod — глагол [наст. -는, прош. -(으)ㄴ, буд. -(으)ㄹ],
  прилагательное [-(으)ㄴ].
Существительное: {"n": {"p": [은/는, 이/가, 을/를, 이에요/예요, 와/과, (으)로, (이)랑]}}.

Неправильные основы: ㅂ (춥다 → 추워요), ㄷ (듣다 → 들어요), ㅅ (짓다 → 지어요), 르 (모르다 → 몰라요),
ㅎ (빨갛다 → 빨개요), ㄹ (살다 → 사는, 삽니다), ㅡ (쓰다 → 써요); 하다 → 해요.
Слова на 이다/아니다 и составные конструкции (할 수 있다) форм не получают.
"""
import re

BASE = 0xAC00
JUNG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"
# индексы конечных согласных (받침)
J_NONE, J_G, J_N, J_D, J_L, J_M, J_B, J_S, J_SS, J_NG, J_H = 0, 1, 4, 7, 8, 16, 17, 19, 20, 21, 27
CHO_L = 5   # ㄹ как начальная
CHO_NG = 11  # ㅇ как начальная
V = {c: i for i, c in enumerate(JUNG)}


def split(ch):
    o = ord(ch) - BASE
    if not 0 <= o < 11172:
        return None
    return o // 588, (o % 588) // 28, o % 28


def join(cho, jung, jong=0):
    return chr(BASE + (cho * 21 + jung) * 28 + jong)


def set_jong(s, jong):
    cho, jung, _ = split(s[-1])
    return s[:-1] + join(cho, jung, jong)


def jong_of(s):
    return split(s[-1])[2]


# ---------------------------------------------------------------- типы основ
# ㅂ: у прилагательных обычно неправильная, у глаголов — правильная; исключения списками
B_REGULAR = {"입", "잡", "씹", "접", "뽑", "업", "좁", "집", "수줍", "굽히", "뒤집", "붙잡", "사로잡", "씌웁"}
B_IRREGULAR_VERB = {"돕", "눕", "줍", "깁", "굽", "여쭙"}
B_WA = {"돕", "곱"}                 # 도와, 고와 (а не 도워)
D_IRREGULAR = {"듣", "걷", "묻", "싣", "깨닫", "붇", "일컫"}       # 묻다 «спрашивать»
S_IRREGULAR = {"낫", "짓", "붓", "잇", "젓", "긋"}
REU_REGULAR = {"따르", "치르", "들르", "우러르"}   # спрягаются как ㅡ: 따라, 치러
REO_IRREGULAR = {"푸르", "이르"}                 # 러-неправильные: 푸르러요, 이르러요 («достигать»)
HON_ADJ = {"바쁘", "아프", "괜찮", "배고프", "기쁘", "슬프", "춥", "덥", "젊"}   # прилагательные, у которых уместна вежливая форма
H_REGULAR = {"좋", "놓", "넣", "낳", "쌓", "닿", "땋", "찧", "괜찮", "많", "싫", "않", "끊", "잃", "옳"}


def stem_type(stem, adj):
    last = stem[-1]
    cho, jung, jong = split(last)
    if stem.endswith("하"):
        return "ha"
    if jong == J_B:
        if stem in B_REGULAR or stem[-1:] in {"입", "잡", "씹", "접", "뽑", "업", "집"}:
            return "reg"
        if adj or stem in B_IRREGULAR_VERB or stem[-1] in {"돕", "눕", "줍"}:
            return "b"
        return "reg"
    if jong == J_D:
        return "d" if (stem in D_IRREGULAR or stem[-1] in {"듣", "걷", "싣"} or stem.endswith("깨닫")) else "reg"
    if jong == J_S:
        return "s" if (stem in S_IRREGULAR or stem[-1] in {"낫", "짓", "붓", "잇", "젓", "긋"}) else "reg"
    if jong == J_H:
        return "reg" if (stem[-1] in H_REGULAR or not adj) else "h"
    if jong == J_L:
        return "l"
    if jong == J_NONE and last == "르" and len(stem) > 1:
        return "eu" if any(stem.endswith(x) for x in REU_REGULAR) else "reu"
    if jong == J_NONE and jung == V["ㅡ"]:
        return "eu"
    return "reg"


def bright(syl):
    """Светлая гласная (ㅏ, ㅗ, ㅑ) → -아, иначе -어."""
    return split(syl)[1] in (V["ㅏ"], V["ㅗ"], V["ㅑ"])


# ---------------------------------------------------------------- -아/어 (основа + 아/어)
def a_form(stem, t):
    """Форма на -아/어 без окончания: 가 → 가, 먹 → 먹어, 하 → 해, 춥 → 추워, 모르 → 몰라."""
    if t == "ha":
        return stem[:-1] + "해"
    last = stem[-1]
    cho, jung, jong = split(last)
    head = stem[:-1]
    if t == "b":
        base = head + join(cho, jung)
        return base + ("와" if stem[-1] in B_WA else "워")
    if t == "d":
        return head + join(cho, jung, J_L) + ("아" if bright(last) else "어")
    if t == "s":
        return head + join(cho, jung) + ("아" if bright(last) else "어")
    if t == "h":
        # 빨갛 → 빨개, 하얗 → 하얘, 그렇 → 그래
        nj = V["ㅒ"] if jung == V["ㅑ"] else V["ㅐ"]
        return head + join(cho, nj)
    if t == "reu":
        if any(stem.endswith(x) for x in REO_IRREGULAR):
            return stem + "러"                             # 푸르러, 이르러
        prev = stem[-2]
        pc, pj, _ = split(prev)
        return stem[:-2] + join(pc, pj, J_L) + ("라" if bright(prev) else "러")
    if t == "eu":
        if len(stem) == 1:
            return join(cho, V["ㅓ"])                     # 쓰 → 써, 크 → 커
        return head + join(cho, V["ㅏ"] if bright(stem[-2]) else V["ㅓ"])   # 바쁘 → 바빠, 예쁘 → 예뻐
    if jong:                                               # согласная на конце: 먹어, 앉아, 살아
        return stem + ("아" if bright(last) else "어")
    # гласная на конце — слияние
    if jung in (V["ㅏ"], V["ㅓ"], V["ㅐ"], V["ㅔ"], V["ㅕ"]):
        return stem                                        # 가, 서, 내, 세, 켜
    if jung == V["ㅗ"]:
        return head + join(cho, V["ㅘ"])                   # 보 → 봐, 오 → 와
    if jung == V["ㅜ"]:
        return head + join(cho, V["ㅝ"])                   # 주 → 줘, 배우 → 배워
    if jung == V["ㅣ"]:
        return head + join(cho, V["ㅕ"])                   # 마시 → 마셔, 기다리 → 기다려
    if jung == V["ㅚ"]:
        return head + join(cho, V["ㅙ"])                   # 되 → 돼
    return stem + "어"                                     # 쉬어, 띄어


def past_base(a):
    """Основа прошедшего: последнему слогу формы -아/어 добавляется ㅆ: 가 → 갔, 먹어 → 먹었."""
    return set_jong(a, J_SS)


# ---------------------------------------------------------------- основа для окончаний на -(으)
def eu_base(stem, t):
    """Основа перед -(으)면, -(으)세요, -(으)ㄴ, -(으)ㄹ: возвращает (основа, нужна ли 으)."""
    cho, jung, jong = split(stem[-1])
    head = stem[:-1]
    if t == "b":
        return head + join(cho, jung) + "우", False      # 추우면, 도우세요
    if t == "d":
        return head + join(cho, jung, J_L), True          # 들 + 으
    if t == "s":
        return head + join(cho, jung), True               # 지 + 으
    if t == "h":
        return head + join(cho, jung), False              # 빨가 + 면/ㄴ/ㄹ
    if t == "l":
        return stem, False                                # 살 + 면; ㄴ/ㄹ/세요 — особо
    return stem, bool(jong)


def with_eu(stem, t, ending):
    """ending ∈ {'면', '세요', '십시오', '셨어요', '십니다', 'N', 'L'} (N — -(으)ㄴ, L — -(으)ㄹ)."""
    base, eu = eu_base(stem, t)
    if t == "l":
        if ending == "면":
            return stem + "면"
        if ending == "L":
            return stem                                   # 살 → 살 (ㄹ уже есть)
        drop = set_jong(stem, 0)                          # 살 → 사
        if ending == "N":
            return set_jong(drop, J_N)                    # 사 → 산
        return drop + ending                              # 사세요, 사십시오
    if eu:
        base = base + "으"
    if ending == "N":
        return set_jong(base, J_N)
    if ending == "L":
        return set_jong(base, J_L)
    return base + ending


def formal(stem, t):
    """-ㅂ니다 / -습니다: 갑니다, 먹습니다, 삽니다 (ㄹ выпадает), 춥습니다."""
    if t == "l":
        return set_jong(set_jong(stem, 0), J_B) + "니다"
    if jong_of(stem):
        return stem + "습니다"
    return set_jong(stem, J_B) + "니다"


def modifier_present(stem, t, adj):
    if adj:
        if stem.endswith("있") or stem.endswith("없"):
            return stem + "는"                             # 재미있는, 맛없는
        return with_eu(stem, t, "N")                       # 큰, 추운, 빨간
    if t == "l":
        return set_jong(stem, 0) + "는"                    # 사는
    return stem + "는"


# ---------------------------------------------------------------- глагол / прилагательное
def conj_one(stem, adj):
    t = stem_type(stem, adj)
    a = a_form(stem, t)
    p = past_base(a)
    fut = with_eu(stem, t, "L")
    v = {
        "stem": stem, "irr": {"reg": "", "ha": ""}.get(t, t), "adj": adj,
        "pres": [a + "요", formal(stem, t), a],
        "past": [p + "어요", p + "습니다", p + "어"],
        "fut": [fut + " 거예요", fut + " 겁니다", fut + " 거야"],
        "neg": [stem + "지 않아요", stem + "지 않습니다", stem + "지 않아"],
        "nec": [a + "야 해요", a + "야 합니다", a + "야 해"],
        "conn": [stem + "고", stem + "지만", a + "서"],
        "cond": [with_eu(stem, t, "면"), a + "도"],
        "hon": [with_eu(stem, t, "세요"), with_eu(stem, t, "십니다"), with_eu(stem, t, "셨어요")],
    }
    if adj:
        v["mod"] = [modifier_present(stem, t, True)]
        if t != "ha" and stem not in HON_ADJ:
            del v["hon"]                                   # 빨가세요, 맛있으세요 — так не говорят
    else:
        v["mod"] = [modifier_present(stem, t, False), with_eu(stem, t, "N"), fut]
        v["want"] = [stem + "고 싶어요", stem + "고 싶습니다", stem + "고 싶어"]
        v["abil"] = [fut + " 수 있어요", fut + " 수 있습니다", fut + " 수 있어"]
        v["imp"] = [with_eu(stem, t, "세요"), with_eu(stem, t, "십시오"), a]
        v["prog"] = [stem + "고 있어요", stem + "고 있습니다", stem + "고 있어"]
    return v


VERBAL = ("되", "생기", "빠지")
SKIP_END = ("이다", "아니다")
SKIP_WORDS = {"할 수 있다", "할 수 없다", "이다", "아니다"}


def verb_morph(disp, adj):
    """disp — словарная форма («가다», «사진을 찍다», «재미있다»); adj — прилагательное (по русскому переводу)."""
    disp = disp.strip()
    if disp in SKIP_WORDS or not disp.endswith("다") or disp.endswith(SKIP_END) or len(disp) < 2:
        return None
    if not re.fullmatch(r"[가-힣 ]+", disp):
        return None
    head, _, last = disp.rpartition(" ")
    pre = head + " " if head else ""
    stem = last[:-1]
    if not stem or split(stem[-1]) is None:
        return None
    if stem.endswith("있") or stem.endswith("없") or stem.endswith("같") or stem.endswith("싶"):
        adj = True                     # 맛있다, 재미없다, 같다 — описательные
    if stem.endswith(VERBAL):
        adj = False                    # 오래되다, 잘생기다, 사랑에 빠지다 — глаголы, хотя перевод — прилагательное
    v = conj_one(stem, adj)
    # отрицание: 있다 → 없다, 알다 → 모르다
    if stem.endswith("있"):
        neg_stem = stem[:-1] + "없"
        n = conj_one(neg_stem, True)
        v["neg"] = n["pres"]
    elif stem == "알":
        n = conj_one("모르", False)
        v["neg"] = n["pres"]
    out = {k: ([pre + x for x in val] if isinstance(val, list) else val) for k, val in v.items()}
    out["inf"] = disp
    out["stem"] = pre + stem
    return {"v": out}


def noun_morph(disp):
    """Падежные частицы корейского существительного: 책 → 책은, 책이, 책을, 책이에요, 책과, 책으로, 책이랑."""
    disp = disp.strip()
    if not re.fullmatch(r"[가-힣]+", disp) or len(disp) > 6:
        return None
    j = jong_of(disp)
    if j:
        ro = disp + ("로" if j == J_L else "으로")
        p = [disp + "은", disp + "이", disp + "을", disp + "이에요", disp + "과", ro, disp + "이랑"]
    else:
        p = [disp + "는", disp + "가", disp + "를", disp + "예요", disp + "와", disp + "로", disp + "랑"]
    return {"n": {"p": p}}


def word_morph(disp, is_verb, is_noun, ru=""):
    if is_verb:
        first = re.sub(r"\([^)]*\)", "", ru).split(",")[0].split(";")[0].strip()
        w = first.split()[-1] if first else ""
        adj = bool(re.search(r"(ый|ий|ой|ая|яя|ое|ее|ые|ие)$", w))
        return verb_morph(disp, adj)
    if is_noun:
        return noun_morph(disp)
    return None
