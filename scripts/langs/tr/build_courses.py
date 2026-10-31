#!/usr/bin/env python3
"""Курсы «Грамматика», «История», «Обществознание», «Культура»: xlsx → SQL (повторный запуск безопасен, прогресс сохраняется).
Турецкая версия: колонки «… (Türkçe)», разделы и уровни тем — турецкие; внутренние поля *_uz = турецкий текст.
У всех курсов, включая грамматику, отдельные колонки «Тема (русский)», «Konu (Türkçe)», «Topic (English)».

Запуск:  python3 scripts/langs/tr/build_courses.py data/tr/source data/tr/build/courses.sql
Файлы:   data/tr/source/grammar.xlsx, history.xlsx, civics.xlsx, culture.xlsx (имена — как ниже в SOURCES).

Что делает:
  • темы (кратко / подробно на RU-SV-EN, источник), 5 заданий на тему (без ответов → «открытые»);
  • разделы, периоды истории, хронология, справочник контактов, базовая лексика грамматики;
  • к темам грамматики — шаблоны поиска примеров в словаре (GRAMMAR_PATTERNS), их можно менять.
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_vocab import key_uz  # noqa: E402  ключ турецкого слова — как в словаре

SOURCES = {'grammar': 'grammar.xlsx', 'history': 'history.xlsx', 'civics': 'civics.xlsx', 'culture': 'culture.xlsx'}

# Разделы: название RU (как в xlsx) → (турецкое, английское)
SECTION_TR = {
    'Фонетика': ('Ses bilgisi', 'Phonetics'),
    'Морфология: имя': ('Biçim bilgisi: isim, sıfat ve sayı', 'Morphology: nominals'),
    'Морфология: местоимения': ('Biçim bilgisi: zamirler', 'Morphology: pronouns'),
    'Морфология: глагол': ('Biçim bilgisi: fiil', 'Morphology: the verb'),
    'Синтаксис': ('Cümle bilgisi', 'Syntax'),
    'Живой язык': ('Yaşayan dil', 'Living language'),
    'История': ('Tarih', 'History'),
    'Государство и право': ('Devlet ve hukuk', 'State and law'),
    'Право в повседневной жизни': ('Gündelik hayatta hukuk', 'Law in everyday life'),
    'Для иностранцев в Турции': ("Türkiye'deki yabancılar için", 'For foreigners in Turkey'),
    'Обществознание': ('Toplum bilgisi', 'Social studies'),
    'Повседневная жизнь': ('Gündelik hayat', 'Everyday life'),
    'Праздники': ('Bayramlar', 'Holidays'),
    'Семья и обряды': ('Aile ve gelenekler', 'Family and rites'),
    'Искусство и наследие': ('Sanat ve miras', 'Art and heritage'),
    # диалоги
    'Знакомство и общение': ('Tanışma ve sohbet', 'Meeting people'),
    'Город и транспорт': ('Şehir ve ulaşım', 'City and transport'),
    'Покупки и еда': ('Alışveriş ve yemek', 'Shopping and food'),
    'Быт и услуги': ('Gündelik işler ve hizmetler', 'Everyday life and services'),
    'Работа и учёба': ('İş ve eğitim', 'Work and study'),
    'Здоровье': ('Sağlık', 'Health'),
    'Праздники и гости': ('Bayramlar ve misafirler', 'Holidays and guests'),
}
SECTION_ORDER = {
    'dialogs': ['Знакомство и общение', 'Город и транспорт', 'Покупки и еда', 'Быт и услуги', 'Работа и учёба',
                'Здоровье', 'Праздники и гости'],
    'grammar': ['Фонетика', 'Морфология: имя', 'Морфология: местоимения', 'Морфология: глагол', 'Синтаксис', 'Живой язык'],
    'civics': ['Государство и право', 'Право в повседневной жизни', 'Для иностранцев в Турции', 'Обществознание'],
    'culture': ['Повседневная жизнь', 'Праздники', 'Семья и обряды', 'Искусство и наследие'],
}

# Уровень тем (A1–B2): как в разметке курсов (заголовок «## n | раздел | уровень»). Не указано — DEFAULT_CEFR.
UNIT_CEFR = {
    'grammar': {6: 'A2', 14: 'A2', 16: 'A2', 17: 'A2', 18: 'A2', 20: 'A2', 21: 'B1', 22: 'B1', 23: 'B1', 25: 'A2',
                27: 'A2', 28: 'B1', 29: 'B1', 30: 'A2', 32: 'A2', 33: 'B1'},
    'culture': {13: 'B1', 15: 'B1', 16: 'B1', 19: 'B1', 20: 'B1', 21: 'B1'},
}
DEFAULT_CEFR = {'grammar': 'A1', 'culture': 'A2', 'history': 'B1', 'civics': 'B1'}

# Турецкие термины темы: слова в скобках в русском тексте — «назар (nazar)», «(komşuluk)».
# Те, что есть в словаре, после прочтения темы попадают в ближайшую очередь заучивания.
TERM_RE = re.compile(r'\(([^()]{2,80})\)')
CYR = re.compile(r'[А-Яа-яЁё]')
SV = re.compile(r'[a-zçğıöşüâîûA-ZÇĞİÖŞÜ]')


def unit_terms(*texts):
    out = set()
    for text in texts:
        for m in TERM_RE.finditer(text or ''):
            for part in re.split(r'[,;/]| или | и ', m.group(1)):
                part = part.strip(' «»"\'.')
                if not part or CYR.search(part) or not SV.search(part) or re.search(r'\d', part) or len(part) > 40:
                    continue
                k = key_uz(part)
                if k and len(k) >= 2:
                    out.add(k)
    return sorted(out)


# Шаблоны поиска примеров в словаре (регулярные выражения PostgreSQL, без учёта регистра).
# Границы слова — явно через «не турецкая буква» (B … E), чтобы не зависеть от локали базы.
_L = 'a-zçğıöşüâîû'
_B = f'(^|[^{_L}])'
_E = f'([^{_L}]|$)'
W = '[' + _L + ']'
GRAMMAR_PATTERNS = {
    1: r'[çğıöşü]',
    2: _B + r'(ben|sen|biz|siz|onlar|beni|seni|onu|bizi|sizi|onları|bana|sana|ona|bize|size|onlara)' + _E,
    3: W + r'{2,}yor' + W + '*' + _E,
    4: _B + r'(mı|mi|mu|mü)(yım|yim|yum|yüm|sın|sin|sun|sün|yız|yiz|yuz|yüz|sınız|siniz|sunuz|sünüz)?' + _E,
    5: W + r'{3,}(dı|di|du|dü|tı|ti|tu|tü)(m|n|k|nız|niz|nuz|nüz|lar|ler)?' + _E,
    6: _B + r'(?!altmış)' + W + r'{2,}(mış|miş|muş|müş)(ım|im|um|üm|sın|sin|sun|sün|ız|iz|uz|üz|sınız|siniz|sunuz|sünüz|lar|ler|tı|ti|tu|tü|tım|tim|tum|tüm)?' + _E,
    7: W + r'{2,}(acak|ecek|acağ|eceğ)' + W + '*' + _E,
    8: _B + r'(değil|yok)' + W + '*' + _E + '|' + W + r'{2,}(mıyor|miyor|muyor|müyor|madı|medi|mayacak|meyecek|maz|mez)' + W + '*' + _E,
    9: W + r'{3,}(da|de|ta|te|dan|den|tan|ten)' + _E,
    10: _B + r'(benim|senin|onun|bizim|sizin|onların) ' + W + r'{2,}' + _E,
    11: W + r'{2,}(lar|ler)' + W + '*' + _E,
    12: _B + r'(daha|en) ' + W + r'{3,}' + _E,
    13: _B + r'(iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on|yirmi|otuz|kırk|elli|altmış|yüz|bin)' + _E,
    14: _B + r'(için|ile|gibi|kadar|göre|önce|sonra|beri|doğru|karşı)' + _E,
    15: _B + r'(bu|şu|ne|kim|nerede|nereye|nereden|nasıl|neden|niçin|hangi|kaç)' + _E,
    16: W + r'{2,}(arım|erim|ırım|irim|urum|ürüm|arsın|ersin|ırsın|irsin|ursun|ürsün|arız|eriz|ırız|iriz|uruz|ürüz|maz|mez|mayız|meyiz)' + _E,
    17: W + r'{2,}(alım|elim|asın|esin|sınlar|sinler)' + _E + '|' + _B + r'(lütfen|hadi|haydi|gel|git|bak|otur|dur|kalk|ver|yap|söyle|bekle|dinle|oku|yaz|gelin|gidin|bakın|oturun|buyurun|söyleyin|bekleyin|dinleyin|unutma|unutmayın|merak etme|merak etmeyin)' + _E,
    18: W + r'{1,}(abil|ebil|ama[dyz]|eme[dyz])' + W + '*' + _E,
    19: W + r'{3,}(dır|dir|dur|dür|tır|tir|tur|tür)' + _E + '|' + _B + r'(var|yok)' + _E,
    20: W + r'{2,}(malı|meli)' + W + '*' + _E + '|' + _B + r'(lazım|gerek|gerekiyor)' + _E,
    21: W + r'{2,}(ırsa|irse|ursa|ürse|arsa|erse|dıysa|diyse|duysa|düyse|saydı|seydi)(m|n|k|nız|niz|lar|ler)?' + _E + '|' + W + r'{2,}(ırs|irs|urs|ürs|ars|ers)(am|em|an|en|ak|ek|anız|eniz)' + _E + '|' + _B + r'(eğer|keşke|olsa|olsaydı)' + _E,
    22: W + r'{2,}(ıl|il|ul|ül|ın|in|un|ün|ış|iş|uş|üş|t|dır|dir|dur|dür|tır|tir|tur|tür)(dı|di|du|dü|ıyor|iyor|uyor|üyor|acak|ecek|mış|miş|muş|müş)' + W + '*' + _E,
    23: W + r'{2,}(yordu|mıştı|mişti|muştu|müştü|acaktı|ecekti|ardı|erdi|ırdı|irdi|urdu|ürdü)' + W + '*' + _E,
    24: r'^[^ ]+ [^ ]+ [^ ]+(yor|dı|di|du|dü|tı|ti|tu|tü)[^ ]*[.]$',
    25: W + r'{2,}(ıp|ip|up|üp|arak|erek|ken|ınca|ince|unca|ünce|yınca|yince)' + _E,
    26: _B + r'(ve|ama|çünkü|fakat|ya da|veya|ki|de|da)' + _E,
    27: W + r'{2,}(yan|yen) ' + W + r'{3,}' + _E + '|' + _B + r'(olan|gelen|giden|yapan|eden|veren|alan|bilen|seven|çalışan|oturan|yaşayan|konuşan|duran|kalan|bekleyen|okuyan|yazan|satan|yiyen|içen|bilmeyen|gelmeyen) ' + W + r'{3,}' + _E,
    28: W + r'{2,}(dığ|diğ|duğ|düğ|tığ|tiğ|tuğ|tüğ|acağ|eceğ)(ı|i|u|ü|ım|im|um|üm|ın|in|un|ün|ımız|imiz|umuz|ümüz)' + W + '*' + _E,
    29: W + r'{2,}(ması|mesi|mayı|meyi|masını|mesini|mak|mek|makta|mekte)' + _E + '|' + _B + r'(dedi|söyledi)' + _E,
    30: W + r'{2,}(lı|li|lu|lü|sız|siz|suz|süz|cı|ci|cu|cü|çı|çi|çu|çü|lık|lik|luk|lük)' + _E,
    31: _B + r'(lütfen|teşekkür|teşekkürler|sağ ol|rica ederim|kolay gelsin|geçmiş olsun|afiyet olsun|buyurun|affedersiniz|özür dilerim)' + _E,
    32: _B + r'(naber|abi|abla|hadi|yani|tamam|valla|vallahi|aynen|kanka|harbiden|bi|napıyorsun|nası)' + _E,
    33: W + r'{2,}(daki|deki|taki|teki)' + _E + '|' + _B + r'(benimki|seninki|onunki|bugünkü|dünkü|yarınki|türkçe|ingilizce|rusça|almanca|fransızca|arapça|yavaşça|güzelce|açıkça|kolayca|sessizce|dikkatlice|bence|sence|bizce|yüzlerce|binlerce|saatlerce|yıllarca)' + _E,
}


def clean(v):
    if v is None:
        return None
    s = str(v).strip()
    if not s or s in ('—', '-'):
        return None
    return s


def uz_apostrophes(s, uz=False):
    """В узбекской версии здесь приводились апострофы oʻ gʻ ʼ. Для турецкого текста — только NFC и пробелы."""
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
            title_uz = col(r, 'Konu (Türkçe)')
            title_en = col(r, 'Topic (English)')
            ex = ('Экспресс-объяснение (русский)', 'Kısa açıklama (Türkçe)', 'Express explanation (English)')
            de = ('Подробное объяснение (русский)', 'Ayrıntılı açıklama (Türkçe)', 'Detailed explanation (English)')
            tasks = [(f'Задание {k} (русский)', f'Görev {k} (Türkçe)', f'Task {k} (English)') for k in range(1, 6)]
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
                'cefr': UNIT_CEFR.get(course, {}).get(n, DEFAULT_CEFR[course]),
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
