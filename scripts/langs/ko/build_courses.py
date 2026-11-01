#!/usr/bin/env python3
"""Курсы «Грамматика», «История», «Обществознание», «Культура», «Диалоги»: xlsx → SQL (повторный запуск безопасен, прогресс сохраняется).
Корейская версия: колонки «… (한국어)», разделы — корейские; внутренние поля *_uz = корейский текст.
Уровень темы (A1–B2) берётся из колонки «Уровень» (её пишет ko/courses_to_xlsx.py из заголовков «## n | раздел | уровень»).

Запуск:  python3 scripts/langs/ko/build_courses.py data/ko/source data/ko/build/courses.sql
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_vocab import key_uz  # noqa: E402  ключ корейского слова — как в словаре

SOURCES = {'grammar': 'grammar.xlsx', 'history': 'history.xlsx', 'civics': 'civics.xlsx', 'culture': 'culture.xlsx'}

# Разделы: название RU (как в xlsx) → (корейское, английское)
SECTION_TR = {
    'Хангыль': ('한글', 'Hangul'),
    'Морфология: имя': ('형태론: 체언과 조사', 'Morphology: nouns and particles'),
    'Морфология: местоимения': ('형태론: 대명사', 'Morphology: pronouns'),
    'Морфология: глагол': ('형태론: 용언', 'Morphology: the verb'),
    'Синтаксис': ('통사론', 'Syntax'),
    'Живой язык': ('살아 있는 언어', 'Living language'),
    'История': ('역사', 'History'),
    'Государство и право': ('국가와 법', 'State and law'),
    'Право в повседневной жизни': ('생활 속의 법', 'Law in everyday life'),
    'Для иностранцев в Корее': ('한국에 사는 외국인을 위하여', 'For foreigners in Korea'),
    'Обществознание': ('사회', 'Social studies'),
    'Повседневная жизнь': ('일상생활', 'Everyday life'),
    'Праздники': ('명절과 기념일', 'Holidays'),
    'Семья и обряды': ('가족과 의례', 'Family and rites'),
    'Искусство и наследие': ('예술과 유산', 'Art and heritage'),
    # диалоги
    'Знакомство и общение': ('만남과 대화', 'Meeting people'),
    'Город и транспорт': ('도시와 교통', 'City and transport'),
    'Покупки и еда': ('쇼핑과 음식', 'Shopping and food'),
    'Быт и услуги': ('생활과 서비스', 'Everyday life and services'),
    'Работа и учёба': ('일과 공부', 'Work and study'),
    'Здоровье': ('건강', 'Health'),
    'Праздники и гости': ('명절과 손님', 'Holidays and guests'),
}
SECTION_ORDER = {
    'dialogs': ['Знакомство и общение', 'Город и транспорт', 'Покупки и еда', 'Быт и услуги', 'Работа и учёба',
                'Здоровье', 'Праздники и гости'],
    'grammar': ['Хангыль', 'Морфология: имя', 'Морфология: местоимения', 'Морфология: глагол', 'Синтаксис', 'Живой язык'],
    'civics': ['Государство и право', 'Право в повседневной жизни', 'Для иностранцев в Корее', 'Обществознание'],
    'culture': ['Повседневная жизнь', 'Праздники', 'Семья и обряды', 'Искусство и наследие'],
}

# Уровень темы, если в xlsx нет колонки «Уровень».
DEFAULT_CEFR = {'grammar': 'A1', 'culture': 'A2', 'history': 'B1', 'civics': 'B1'}
CEFR_OK = {'A1', 'A2', 'B1', 'B2'}

# Корейские термины темы: «아이 (ребёнок)» — слово хангылем перед переводом в скобках, и «(한복)» — хангыль в скобках.
# Те, что есть в словаре, после прочтения темы попадают в ближайшую очередь заучивания.
GLOSS_RE = re.compile(r'([가-힣]{2,12})\s?\(([^()]{1,80})\)')
TERM_RE = re.compile(r'\(([^()]{2,80})\)')
CYR = re.compile(r'[А-Яа-яЁё]')
HANGUL = re.compile(r'^[가-힣 ]+$')


def unit_terms(*texts):
    out = set()
    for text in texts:
        text = text or ''
        for m in GLOSS_RE.finditer(text):
            if CYR.search(m.group(2)):
                out.add(key_uz(m.group(1)))
        for m in TERM_RE.finditer(text):
            for part in re.split(r'[,;/]| или | и ', m.group(1)):
                part = part.strip(' «»"\'.')
                if part and HANGUL.match(part) and len(part) <= 20:
                    out.add(key_uz(part))
    return sorted(k for k in out if k and len(k) >= 2)


# Шаблоны поиска примеров в словаре (регулярные выражения PostgreSQL). Граница слова — «не хангыль» (B … E).
_B = '(^|[^가-힣])'
_E = '([^가-힣]|$)'
H = '[가-힣]'
GRAMMAR_PATTERNS = {
    1: r'^[가-힣]+ [가-힣]+[.?!]$',
    2: _B + r'(아이|오이|우유|아우|여우)',
    3: _B + r'(나무|바다|가구|가방|사자|모자|지도|어머니|나라|하나|하마)',
    4: _B + r'(야구|요리|유리|휴지|노래|시계|세계|얘기|여기|여자)',
    5: _B + r'(커피|토마토|기타|포도|피자|치마|고추|친구|택시|컴퓨터|카드)',
    6: _B + r'(아빠|오빠|아저씨|비싸|싸요|짜요|토끼|꼬리|빵)',
    7: _B + r'(과일|사과|화장실|뭐|더워|쉬워|의자|왜|돼지|회사)',
    8: _B + r'(한국어|음악|있어요|없어요|먹어요|읽어요|앉아요|좋아요|같이|많이|국물|입니다|합니다)',
    9: r'(수 있|수 없|적이 있|적이 없|' + H + r' 씨' + _E + ')',
    10: _B + r'(편의점|약국|은행|출구|입구|지하철|버스|호텔|인터넷|핸드폰|노래방|아이스크림)',
    11: r'(이에요|예요|입니다|이 아니|가 아니|아니에요|아닙니다)',
    12: H + r'(은|는|이|가) ',
    13: H + r'(을|를) ',
    14: H + r'(에서|에) ',
    15: H + r'(아요|어요|해요|워요|와요|봐요|져요)[.?!]',
    16: H + r'(았|었|했|웠|왔|봤|졌)(어요|습니다|어|다)',
    17: r'(거예요|거야|겠어요|겠습니다|' + H + r'게요)',
    18: _B + r'(안|못) ' + H + '|' + H + r'지 (않|못)',
    19: _B + r'(저는|저도|제가|나는|내가|너는|우리|저희|그는|그녀|이것|그것|저것|이거|그거|저거|여기|거기|저기)',
    20: _B + r'(한|두|세|네|다섯|여섯|일곱|여덟|아홉|열) (개|명|마리|병|잔|권|장|시|살|번|사람)' + '|' + r'[0-9]+ ?(원|개|명|시|분|살|번|층|월|일|년)',
    21: _B + r'(누구|누가|무엇|뭐|어디|언제|왜|어떻게|어느|어떤|몇|얼마)',
    22: r'고 싶',
    23: r'(수 있|수 없|줄 알|줄 몰)',
    24: r'(야 해|야 돼|야 합니다|야 했|도 돼|도 됩니다|면 안 )',
    25: r'(주세요|세요[.!]|십시오)',
    26: r'(까요[?]|' + H + r'시다[.!])',
    27: r'(고 있|아 있|어 있|여 있)',
    28: H + r'(고|지만|아서|어서|해서|워서|와서|봐서) ',
    29: r'(니까|때문에)',
    30: H + r'(면|아도|어도|해도|워도) ',
    31: H + r'(는|던|을|할|갈|볼|올|간|온|본|한|산|된|큰|작은|좋은) (사람|것|곳|때|날|분|집|음식|시간|친구|거|적|수)' + _E,
    32: r'^[가-힣]+(은|는|이|가) [가-힣]+(을|를) [가-힣]+(요|다)[.]$',
    33: r'(니다[.?]|' + H + r'(어|아|야|지|자|해|냐)[.?!]$)',
    34: r'(셨|세요|십니다|께서|드세요|주무|계세|계십|드려|드립|말씀|진지|댁)',
    35: H + r'(도|만|의|와|과|하고|랑|으로|로|에게|한테|께) ',
    36: r'(보다|더 |제일|가장|만큼)',
    37: r'(적이 있|적이 없|어 보|아 보|해 보|워 보)',
    38: r'(더워|추워|어려워|쉬워|가까워|매워|무거워|들어요|걸어|물어|들었|나아|지어|그래요|어때요|몰라|빨라|달라|불러|만들어|바빠|아파|예뻐|써요|커요|기뻐)',
    39: r'(안녕하세요|안녕히|감사합니다|고맙습니다|죄송합니다|미안합니다|괜찮아요|실례합니다|반갑습니다|잘 먹겠습니다|수고하셨습니다)',
    40: _B + r'(진짜|대박|완전|헐|짱|뭐해|고마워|미안해|어떡해|알았어|괜찮아|있잖아|그치)',
    41: r'(다고|냐고|자고|라고)' + _E + '|' + r'(는대|한대|간대|온대|있대|없대|좋대|이래|거래)요',
}


def clean(v):
    if v is None:
        return None
    s = str(v).strip()
    if not s or s in ('—', '-'):
        return None
    return s


def uz_apostrophes(s, uz=False):
    """В узбекской версии здесь приводились апострофы oʻ gʻ ʼ. Для корейского текста — только NFC и пробелы."""
    if s is None:
        return None
    import unicodedata
    return re.sub(r'[ \t]+', ' ', unicodedata.normalize('NFC', s))


def num(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


def q(v):
    """SQL-литерал."""
    if v is None:
        return 'null'
    if isinstance(v, int):
        return str(v)
    s = str(v)
    assert '$q$' not in s
    return f'$q${s}$q$'


def main_rows(path):
    ws = openpyxl.load_workbook(path, data_only=True).worksheets[0]
    rows = list(ws.iter_rows(values_only=True))
    header = [clean(h) for h in rows[3]]
    out = []
    for r in rows[4:]:
        if num(r[0]) is None:
            continue
        out.append(dict(zip(header, r)))
    return header, out


def col(row, *names):
    for n in names:
        if n in row:
            return clean(row[n])
    raise KeyError(names)


def unit_cefr(course, r):
    v = clean(r.get('Уровень')) or DEFAULT_CEFR[course]
    if v not in CEFR_OK:
        raise SystemExit(f'{course} {r.get("№")}: уровень «{v}»')
    return v


def build(src: Path):
    sql = ['-- Сгенерировано scripts/build_courses.py — не править вручную.', 'begin;']
    stats = {}

    for course, fname in SOURCES.items():
        header, rows = main_rows(src / fname)
        stats[course] = {'units': len(rows), 'tasks': 0}
        # разделы
        if course in SECTION_ORDER:
            for i, title in enumerate(SECTION_ORDER[course], 1):
                uz, en = SECTION_TR[title]
                sql.append(
                    f"insert into public.course_sections (course_id, title_ru, title_uz, title_en, sort_order) "
                    f"values ({q(course)}, {q(title)}, {q(uz)}, {q(en)}, {i}) "
                    f"on conflict (course_id, title_ru) do update set title_uz = excluded.title_uz, title_en = excluded.title_en, sort_order = excluded.sort_order;")
            known = set(SECTION_ORDER[course])
            for r in rows:
                sec = col(r, 'Раздел')
                if sec not in known:
                    raise SystemExit(f'{course}: неизвестный раздел «{sec}» — добавьте в SECTION_ORDER и SECTION_TR')

        for r in rows:
            n = num(r['№'])
            title_ru = col(r, 'Тема (русский)')
            title_uz = col(r, '주제 (한국어)')
            title_en = col(r, 'Topic (English)')
            ex = ('Экспресс-объяснение (русский)', '간단한 설명 (한국어)', 'Express explanation (English)')
            de = ('Подробное объяснение (русский)', '자세한 설명 (한국어)', 'Detailed explanation (English)')
            tasks = [(f'Задание {k} (русский)', f'과제 {k} (한국어)', f'Task {k} (English)') for k in range(1, 6)]
            period = (col(r, 'Период'), None, None) if course == 'history' else (None, None, None)

            section = col(r, 'Раздел') if 'Раздел' in r else None
            section_sql = (f"(select id from public.course_sections where course_id = {q(course)} and title_ru = {q(section)})"
                           if section else 'null')
            vals = {
                'title_ru': uz_apostrophes(title_ru), 'title_uz': uz_apostrophes(title_uz, True), 'title_en': uz_apostrophes(title_en),
                'express_ru': uz_apostrophes(clean(r[ex[0]])), 'express_uz': uz_apostrophes(clean(r[ex[1]]), True),
                'express_en': uz_apostrophes(clean(r[ex[2]])),
                'detailed_ru': uz_apostrophes(clean(r[de[0]])), 'detailed_uz': uz_apostrophes(clean(r[de[1]]), True),
                'detailed_en': uz_apostrophes(clean(r[de[2]])),
                'source': clean(r.get('Источник / материал')),
                'period': period[0],
                'example_pattern': GRAMMAR_PATTERNS.get(n) if course == 'grammar' else None,
                'cefr': unit_cefr(course, r),
            }
            cols = ', '.join(vals)
            sql.append(
                f"insert into public.course_units (course_id, source_no, section_id, sort_order, {cols}) values "
                f"({q(course)}, {n}, {section_sql}, {n}, {', '.join(q(v) for v in vals.values())}) "
                f"on conflict (course_id, source_no) do update set section_id = excluded.section_id, sort_order = excluded.sort_order, "
                + ', '.join(f'{k} = excluded.{k}' for k in vals) + ';')
            unit_sql = f"(select id from public.course_units where course_id = {q(course)} and source_no = {n})"
            sql.append(f"delete from public.unit_terms where unit_id = {unit_sql};")
            for k in unit_terms(vals['express_ru'], vals['detailed_ru']):
                sql.append(f"insert into public.unit_terms (unit_id, term_key) values ({unit_sql}, {q(k)}) on conflict do nothing;")
            for k, (ru, uz, en) in enumerate(tasks, 1):
                pr, pu, pe = clean(r.get(ru)), clean(r.get(uz)), clean(r.get(en))
                if not pr:
                    continue
                stats[course]['tasks'] += 1
                sql.append(
                    f"insert into public.unit_tasks (unit_id, n, kind, prompt_ru, prompt_uz, prompt_en, origin, status) values "
                    f"({unit_sql}, {k}, 'open', {q(uz_apostrophes(pr))}, {q(uz_apostrophes(pu, True))}, {q(uz_apostrophes(pe))}, 'source', 'approved') "
                    f"on conflict (unit_id, n) do update set prompt_ru = excluded.prompt_ru, prompt_uz = excluded.prompt_uz, prompt_en = excluded.prompt_en "
                    f"where public.unit_tasks.origin = 'source';")
            # лишние темы, удалённые из файла, остаются в базе — удаляйте вручную, чтобы не потерять прогресс

    # ---- хронология истории
    wb = openpyxl.load_workbook(src / SOURCES['history'], data_only=True)
    ws = wb['Хронология (сводная таблица)']
    n_tl = 0
    for r in list(ws.iter_rows(values_only=True))[1:]:
        k = num(r[0])
        if k is None:
            continue
        n_tl += 1
        sql.append(
            f"insert into public.timeline_events (course_id, date_label, text_ru, text_uz, text_en, sort_order) values "
            f"('history', {q(clean(r[1]))}, {q(uz_apostrophes(clean(r[2])))}, {q(uz_apostrophes(clean(r[3]), True))}, {q(uz_apostrophes(clean(r[4])))}, {k}) "
            f"on conflict (course_id, sort_order) do update set date_label = excluded.date_label, text_ru = excluded.text_ru, "
            f"text_uz = excluded.text_uz, text_en = excluded.text_en;")
    stats['history']['timeline'] = n_tl

    # ---- справочник контактов (обществознание)
    ws = openpyxl.load_workbook(src / SOURCES['civics'], data_only=True)['Справочник контактов']
    n_c = 0
    for r in list(ws.iter_rows(values_only=True))[1:]:
        k = num(r[0])
        if k is None:
            continue
        n_c += 1
        sql.append(
            f"insert into public.reference_items (course_id, kind, title_ru, title_uz, title_en, value, sort_order) values "
            f"('civics', 'contact', {q(clean(r[1]))}, {q(uz_apostrophes(clean(r[2]), True))}, {q(clean(r[3]))}, {q(clean(r[4]))}, {k}) "
            f"on conflict (course_id, kind, sort_order) do update set title_ru = excluded.title_ru, title_uz = excluded.title_uz, "
            f"title_en = excluded.title_en, value = excluded.value;")
    stats['civics']['contacts'] = n_c

    # ---- базовая лексика (грамматика)
    ws = openpyxl.load_workbook(src / SOURCES['grammar'], data_only=True)['Базовая лексика (уроки 1–6)']
    n_v = 0
    for r in list(ws.iter_rows(values_only=True))[1:]:
        k = num(r[0])
        if k is None:
            continue
        n_v += 1
        extra = {'transcription': clean(r[2]), 'example': uz_apostrophes(clean(r[5]))}
        sql.append(
            f"insert into public.reference_items (course_id, kind, title_ru, title_uz, title_en, value, extra, sort_order) values "
            f"('grammar', 'vocab', {q(clean(r[3]))}, {q(uz_apostrophes(clean(r[1]), True))}, {q(clean(r[4]))}, {q(uz_apostrophes(clean(r[1]), True))}, "
            f"{q(json.dumps(extra, ensure_ascii=False))}::jsonb, {k}) "
            f"on conflict (course_id, kind, sort_order) do update set title_ru = excluded.title_ru, title_uz = excluded.title_uz, "
            f"title_en = excluded.title_en, value = excluded.value, extra = excluded.extra;")
    stats['grammar']['vocab'] = n_v

    # ---- вопросы для тестов по темам (черновики; публикует администратор в приложении)
    qpath = src.parent / 'quiz' / 'questions.json'
    n_q = 0
    if qpath.exists():
        for qq in json.loads(qpath.read_text(encoding='utf-8')):
            n_q += 1
            unit_sql = f"(select id from public.course_units where course_id = {q(qq['course'])} and source_no = {int(qq['n'])})"
            options = json.dumps({'ru': qq['options_ru'], 'uz': qq['options_uz'], 'en': qq['options_en']}, ensure_ascii=False)
            sql.append(
                f"insert into public.unit_tasks (unit_id, n, kind, prompt_ru, prompt_uz, prompt_en, options, answer, source_quote, origin, status) values "
                f"({unit_sql}, {100 + int(qq['k'])}, 'choice', {q(qq['q_ru'])}, {q(qq['q_uz'])}, {q(qq['q_en'])}, {q(options)}::jsonb, '0'::jsonb, "
                f"{q(qq['quote_ru'])}, 'generated', 'draft') "
                # изменился текст вопроса — снова на проверку; не изменился — статус сохраняется
                f"on conflict (unit_id, n) do update set "
                f"status = case when public.unit_tasks.prompt_ru is distinct from excluded.prompt_ru "
                f"or public.unit_tasks.options is distinct from excluded.options then 'draft' else public.unit_tasks.status end, "
                f"prompt_ru = excluded.prompt_ru, prompt_uz = excluded.prompt_uz, prompt_en = excluded.prompt_en, "
                f"options = excluded.options, answer = excluded.answer, source_quote = excluded.source_quote, kind = excluded.kind;")
    stats['quiz'] = {'questions': n_q}

    # ---- диалоги (data/source/dialogs.json)
    dpath = src / 'dialogs.json'
    if dpath.exists():
        dialogs = json.loads(dpath.read_text(encoding='utf-8'))
        stats['dialogs'] = {'units': len(dialogs), 'lines': 0}
        for i, title in enumerate(SECTION_ORDER['dialogs'], 1):
            uz, en = SECTION_TR[title]
            sql.append(
                f"insert into public.course_sections (course_id, title_ru, title_uz, title_en, sort_order) "
                f"values ('dialogs', {q(title)}, {q(uz)}, {q(en)}, {i}) "
                f"on conflict (course_id, title_ru) do update set title_uz = excluded.title_uz, title_en = excluded.title_en, sort_order = excluded.sort_order;")
        for d in dialogs:
            n = int(d['n'])
            if d['section'] not in SECTION_ORDER['dialogs']:
                raise SystemExit(f"dialogs.json: неизвестный раздел «{d['section']}»")
            stats['dialogs']['lines'] += len(d['lines'])
            extra = {'speakers': d['speakers'], 'lines': [{k: uz_apostrophes(v, True) if k == 'uz' else v for k, v in ln.items()} for ln in d['lines']],
                     'vocab': [uz_apostrophes(v, True) for v in d.get('vocab', [])]}
            vals = {
                'title_ru': d['title_ru'], 'title_uz': uz_apostrophes(d['title_uz'], True), 'title_en': d['title_en'],
                'express_ru': d['intro_ru'], 'express_uz': uz_apostrophes(d['intro_uz'], True), 'express_en': d['intro_en'],
                'detailed_ru': d.get('note_ru'), 'detailed_uz': uz_apostrophes(d.get('note_uz'), True), 'detailed_en': d.get('note_en'),
                'cefr': d['cefr'], 'extra': json.dumps(extra, ensure_ascii=False),
            }
            section_sql = f"(select id from public.course_sections where course_id = 'dialogs' and title_ru = {q(d['section'])})"
            sql.append(
                f"insert into public.course_units (course_id, source_no, section_id, sort_order, {', '.join(vals)}) values "
                f"('dialogs', {n}, {section_sql}, {n}, {', '.join(q(v) for v in vals.values())}) "
                f"on conflict (course_id, source_no) do update set section_id = excluded.section_id, sort_order = excluded.sort_order, "
                + ', '.join(f'{k} = excluded.{k}' for k in vals) + ';')
            unit_sql = f"(select id from public.course_units where course_id = 'dialogs' and source_no = {n})"
            sql.append(f"delete from public.unit_terms where unit_id = {unit_sql};")
            for v in d.get('vocab', []):
                k = key_uz(v)
                if k:
                    sql.append(f"insert into public.unit_terms (unit_id, term_key) values ({unit_sql}, {q(k)}) on conflict do nothing;")

    sql.append('select public.refresh_unit_words();')
    sql.append('commit;')
    return '\n'.join(sql) + '\n', stats


if __name__ == '__main__':
    src = Path(sys.argv[1] if len(sys.argv) > 1 else 'data/source')
    out = Path(sys.argv[2] if len(sys.argv) > 2 else 'data/build/courses.sql')
    out.parent.mkdir(parents=True, exist_ok=True)
    text, stats = build(src)
    out.write_text(text, encoding='utf-8')
    for c, s in stats.items():
        print(c, ', '.join(f'{k}: {v}' for k, v in s.items()))
    print(f'→ {out} ({len(text) // 1024} КБ)')
