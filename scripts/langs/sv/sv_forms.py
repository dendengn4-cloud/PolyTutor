"""Формы шведских слов для таблиц «Спряжение» и «Склонение».

Глаголы: инфинитив, презенс, претерит, супин, императив (+ «sig»/частицы сохраняются: tycker om, satte sig).
  Группы: 1 (-ar/-ade/-at), 2a (-er/-de/-t), 2b (-er/-te/-t), 3 (bor/bodde/bott), 4 — сильные и неправильные
  (формы заданы явно), отложительные -s (hoppas/hoppades/hoppats).
Существительные: род (en/ett), неопр. ед., опр. ед., неопр. мн., опр. мн.
  Склонения: 1 (-or), 2 (-ar), 3 (-er/-r), 4 (-n), 5 (без окончания); исключения заданы явно.

Используется scripts/langs/sv/build_vocab.py (колонка words.morph) и проверкой sv/forms_check.
"""
import re

# ---------------------------------------------------------------- глаголы
# сильные и неправильные: презенс, претерит, супин, императив ('' — нет)
STRONG = {
    'vara': ('är', 'var', 'varit', 'var'), 'ha': ('har', 'hade', 'haft', 'ha'), 'gå': ('går', 'gick', 'gått', 'gå'),
    'komma': ('kommer', 'kom', 'kommit', 'kom'), 'säga': ('säger', 'sa', 'sagt', 'säg'), 'se': ('ser', 'såg', 'sett', 'se'),
    'äta': ('äter', 'åt', 'ätit', 'ät'), 'dricka': ('dricker', 'drack', 'druckit', 'drick'),
    'skriva': ('skriver', 'skrev', 'skrivit', 'skriv'), 'sova': ('sover', 'sov', 'sovit', 'sov'),
    'veta': ('vet', 'visste', 'vetat', 'vet'), 'stå': ('står', 'stod', 'stått', 'stå'), 'ge': ('ger', 'gav', 'gett', 'ge'),
    'ta': ('tar', 'tog', 'tagit', 'ta'), 'göra': ('gör', 'gjorde', 'gjort', 'gör'), 'kunna': ('kan', 'kunde', 'kunnat', ''),
    'vilja': ('vill', 'ville', 'velat', ''), 'bli': ('blir', 'blev', 'blivit', 'bli'), 'be': ('ber', 'bad', 'bett', 'be'),
    'bjuda': ('bjuder', 'bjöd', 'bjudit', 'bjud'), 'bryta': ('bryter', 'bröt', 'brutit', 'bryt'),
    'dra': ('drar', 'drog', 'dragit', 'dra'), 'dö': ('dör', 'dog', 'dött', 'dö'), 'falla': ('faller', 'föll', 'fallit', 'fall'),
    'flyga': ('flyger', 'flög', 'flugit', 'flyg'), 'frysa': ('fryser', 'frös', 'frusit', 'frys'), 'få': ('får', 'fick', 'fått', 'få'),
    'försvinna': ('försvinner', 'försvann', 'försvunnit', 'försvinn'), 'gripa': ('griper', 'grep', 'gripit', 'grip'),
    'gråta': ('gråter', 'grät', 'gråtit', 'gråt'), 'hinna': ('hinner', 'hann', 'hunnit', 'hinn'),
    'hålla': ('håller', 'höll', 'hållit', 'håll'), 'le': ('ler', 'log', 'lett', 'le'), 'ligga': ('ligger', 'låg', 'legat', 'ligg'),
    'lägga': ('lägger', 'la', 'lagt', 'lägg'), 'rinna': ('rinner', 'rann', 'runnit', 'rinn'), 'riva': ('river', 'rev', 'rivit', 'riv'),
    'sjunga': ('sjunger', 'sjöng', 'sjungit', 'sjung'), 'skjuta': ('skjuter', 'sköt', 'skjutit', 'skjut'),
    'skära': ('skär', 'skar', 'skurit', 'skär'), 'sticka': ('sticker', 'stack', 'stuckit', 'stick'),
    'stiga': ('stiger', 'steg', 'stigit', 'stig'), 'stryka': ('stryker', 'strök', 'strukit', 'stryk'),
    'svika': ('sviker', 'svek', 'svikit', 'svik'), 'springa': ('springer', 'sprang', 'sprungit', 'spring'),
    'undvika': ('undviker', 'undvek', 'undvikit', 'undvik'), 'växa': ('växer', 'växte', 'vuxit', 'väx'),
    'skryta': ('skryter', 'skröt', 'skrutit', 'skryt'), 'sprida': ('sprider', 'spred', 'spridit', 'sprid'),
    'sälja': ('säljer', 'sålde', 'sålt', 'sälj'), 'välja': ('väljer', 'valde', 'valt', 'välj'),
    'vänja': ('vänjer', 'vande', 'vant', 'vänj'), 'sätta': ('sätter', 'satte', 'satt', 'sätt'),
    'glädja': ('gläder', 'gladde', 'glatt', 'gläd'), 'skilja': ('skiljer', 'skilde', 'skilt', 'skilj'),
    'leda': ('leder', 'ledde', 'lett', 'led'), 'reda': ('reder', 'redde', 'rett', 'red'),
    'stödja': ('stöder', 'stödde', 'stött', 'stöd'), 'mäta': ('mäter', 'mätte', 'mätt', 'mät'),
    'lyda': ('lyder', 'lydde', 'lytt', 'lyd'), 'klä': ('klär', 'klädde', 'klätt', 'klä'), 'så': ('sår', 'sådde', 'sått', 'så'),
    'gifta': ('gifter', 'gifte', 'gift', 'gift'), 'fästa': ('fäster', 'fäste', 'fäst', 'fäst'),
    'lyfta': ('lyfter', 'lyfte', 'lyft', 'lyft'), 'byta': ('byter', 'bytte', 'bytt', 'byt'),
    'sköta': ('sköter', 'skötte', 'skött', 'sköt'), 'smälta': ('smälter', 'smälte', 'smält', 'smält'),
    'heta': ('heter', 'hette', 'hetat', 'het'), 'låta': ('låter', 'lät', 'låtit', 'låt'), 'sitta': ('sitter', 'satt', 'suttit', 'sitt'),
    'slå': ('slår', 'slog', 'slagit', 'slå'), 'bära': ('bär', 'bar', 'burit', 'bär'), 'vinna': ('vinner', 'vann', 'vunnit', 'vinn'),
    'finna': ('finner', 'fann', 'funnit', 'finn'), 'binda': ('binder', 'band', 'bundit', 'bind'),
    'skina': ('skiner', 'sken', 'skinit', 'skin'), 'bita': ('biter', 'bet', 'bitit', 'bit'), 'njuta': ('njuter', 'njöt', 'njutit', 'njut'),
    'sjunka': ('sjunker', 'sjönk', 'sjunkit', 'sjunk'), 'bjuda': ('bjuder', 'bjöd', 'bjudit', 'bjud'),
    'ljuga': ('ljuger', 'ljög', 'ljugit', 'ljug'), 'välja': ('väljer', 'valde', 'valt', 'välj'),
    'måste': ('måste', 'måste', 'måst', ''), 'böra': ('bör', 'borde', 'bort', ''), 'skola': ('ska', 'skulle', 'skolat', ''),
    'töras': ('törs', 'tordes', 'torts', ''),
}
# составные с сильным глаголом: приставка + сильный корень
PREFIXED = {
    'anta': 'ta', 'beskriva': 'skriva', 'bestrida': 'strida', 'föreslå': 'slå', 'förlåta': 'låta', 'förutsäga': 'säga',
    'ingå': 'gå', 'missta': 'ta', 'uppstå': 'stå', 'utse': 'se', 'övervinna': 'vinna', 'återvinna': 'vinna',
    'förstå': 'stå', 'tillsätta': 'sätta', 'fortsätta': 'sätta', 'bosätta': 'sätta', 'ersätta': 'sätta',
    'genomföra': 'föra', 'jämföra': 'föra', 'förbereda': 'reda', 'upphöra': 'höra', 'erkänna': 'känna',
    'frikänna': 'känna', 'invända': 'vända', 'återvända': 'vända', 'påminna': 'minna', 'beställa': 'ställa',
    'återställa': 'ställa', 'säkerställa': 'ställa', 'anmäla': 'mäla', 'förlöpa': 'löpa', 'uttrycka': 'trycka',
    'upptäcka': 'täcka', 'bestämma': 'stämma', 'berömma': 'römma', 'förutbestämma': 'stämma', 'bedöma': 'döma',
}
STRONG['strida'] = ('strider', 'stred', 'stridit', 'strid')
# группа 2a (-er/-de/-t) и 2b (-er/-te/-t); остальное на -a — группа 1, если не в этих списках
G2A = set('använda bygga drömma följa fylla glömma hälla känna köra minna ringa röra spillas stänga styra ställa sända sörja '
          'vända väga äga kräva mäla döma stämma römma skämma höra föra gräva'.split())
G2B = set('hjälpa köpa leka läsa lösa resa söka tänka stärka sänka steka löpa trycka täcka'.split())
G3 = {'bo': ('bor', 'bodde', 'bott', 'bo'), 'tro': ('tror', 'trodde', 'trott', 'tro'), 'nå': ('når', 'nådde', 'nått', 'nå')}
# отложительные (-s): презенс, претерит, супин
DEPONENT = {
    'hoppas': ('hoppas', 'hoppades', 'hoppats'), 'lyckas': ('lyckas', 'lyckades', 'lyckats'),
    'misslyckas': ('misslyckas', 'misslyckades', 'misslyckats'), 'träffas': ('träffas', 'träffades', 'träffats'),
    'födas': ('föds', 'föddes', 'fötts'), 'åldras': ('åldras', 'åldrades', 'åldrats'), 'envisas': ('envisas', 'envisades', 'envisats'),
    'avundas': ('avundas', 'avundades', 'avundats'), 'försonas': ('försonas', 'försonades', 'försonats'),
    'utvecklas': ('utvecklas', 'utvecklades', 'utvecklats'), 'förändras': ('förändras', 'förändrades', 'förändrats'),
    'försämras': ('försämras', 'försämrades', 'försämrats'), 'spridas': ('sprids', 'spreds', 'spridits'),
    'spillas': ('spills', 'spilldes', 'spillts'), 'skämmas': ('skäms', 'skämdes', 'skämts'), 'skiljas': ('skiljs', 'skildes', 'skilts'),
    'ryckas': ('rycks', 'rycktes', 'ryckts'), 'lysas': ('lyses', 'lystes', 'lysts'),
}
NOT_VERB = set('fem sex nio tio elva tolv tretton fjorton femton sexton sjutton arton nitton tjugo trettio midnatt artighet '
               'btw det i kanske lätt nästan godis förresten trevlig trevligt välkommen valborg ull makt industri nationell '
               'virtuell traditionella tolerans vegetation förlåt brottslighet cybersäkerhet effektivitet fattigdom '
               'gruvindustri klimatneutralitet luftfuktighet produktivitet rättvisa smidighet småpengar studieresultat '
               'svaghet sysselsättning säkerhet tillgänglighet trötthet uthållighet välgörenhet'.split())


def _strong(head):
    if head in STRONG:
        return STRONG[head]
    for full, base in PREFIXED.items():
        if head == full:
            pre = full[: len(full) - len(base)]
            f = _strong(base) if (base in STRONG or base in PREFIXED) else _weak(base)
            if not f:
                return None
            pres, pret, sup, imp = f
            return (pre + pres, pre + pret, pre + sup, pre + imp if imp else '')
    return None


def _weak(inf):
    if inf in G3:
        return G3[inf]
    if not inf.endswith('a'):
        return None
    stem = inf[:-1]
    if inf in G2A or inf in G2B:
        pres = stem if stem.endswith('r') else stem + 'er'
        if inf in G2B:
            pret = stem + 'e' if stem.endswith('t') else stem + 'te'
            sup = stem if stem.endswith('t') else stem + 't'
        else:
            if stem.endswith(('mm', 'nn')):
                base = stem[:-1]
            else:
                base = stem
            if stem.endswith('nd'):
                pret, sup = stem + 'e', stem[:-1] + 't'          # använde, använt
            elif stem.endswith('d'):
                pret, sup = stem + 'de', stem[:-1] + 'tt'
            else:
                pret = base + 'de'
                sup = base + 't'
        imp = stem[:-1] if stem.endswith('mm') else stem
        return (pres, pret, sup, imp)
    return (inf + 'r', inf + 'de', inf + 't', inf)              # группа 1


# фразы, где меняется не первое слово, и безличные (без повелительного)
PHRASES = {
    'gå och lägga sig': ('går och lägger sig', 'gick och lade sig', 'gått och lagt sig', 'gå och lägg dig'),
}
NO_IMP = {'äga rum', 'ta slut', 'följa av', 'förlöpa', 'ingå i', 'leda till'}


def verb_forms(word):
    """'tycka om' → {'inf':..., 'pres':..., 'pret':..., 'sup':..., 'imp':...} или None (не глагол)."""
    w = re.sub(r'\s*\(.*?\)', '', word).strip()
    if w in PHRASES:
        pres, pret, sup, imp = PHRASES[w]
        return {'inf': w, 'pres': pres, 'pret': pret, 'sup': sup, 'imp': imp}
    parts = w.split()
    head, rest = parts[0], parts[1:]
    if head in NOT_VERB or not re.fullmatch(r'[a-zåäöé]+', head):
        return None
    if head in DEPONENT:
        pres, pret, sup = DEPONENT[head]
        imp = ''
    else:
        f = _strong(head) or _weak(head)
        if not f:
            return None
        pres, pret, sup, imp = f
    tail = ' '.join(rest)
    def j(x, imper=False):
        if not x:
            return ''
        t = tail
        if imper:
            t = ' '.join({'sig': 'dig', 'sitt': 'ditt'}.get(x2, x2) for x2 in rest)
        return (x + ' ' + t).strip()
    return {'inf': w, 'pres': j(pres), 'pret': j(pret), 'sup': j(sup), 'imp': '' if w in NO_IMP else j(imp, True)}


# ---------------------------------------------------------------- существительные
# явные формы: опр. ед., неопр. мн., опр. мн. ('' — нет множественного)
NOUN_EXC = {
    'man': ('mannen', 'män', 'männen'), 'mus': ('musen', 'möss', 'mössen'), 'bok': ('boken', 'böcker', 'böckerna'),
    'fot': ('foten', 'fötter', 'fötterna'), 'hand': ('handen', 'händer', 'händerna'), 'stad': ('staden', 'städer', 'städerna'),
    'land': ('landet', 'länder', 'länderna'), 'natt': ('natten', 'nätter', 'nätterna'), 'tand': ('tanden', 'tänder', 'tänderna'),
    'bror': ('brodern', 'bröder', 'bröderna'), 'mor': ('modern', 'mödrar', 'mödrarna'), 'far': ('fadern', 'fäder', 'fäderna'),
    'dotter': ('dottern', 'döttrar', 'döttrarna'), 'son': ('sonen', 'söner', 'sönerna'), 'gås': ('gåsen', 'gäss', 'gässen'),
    'ko': ('kon', 'kor', 'korna'), 'sko': ('skon', 'skor', 'skorna'), 'öga': ('ögat', 'ögon', 'ögonen'), 'öra': ('örat', 'öron', 'öronen'),
    'tå': ('tån', 'tår', 'tårna'), 'and': ('anden', 'änder', 'änderna'), 'rot': ('roten', 'rötter', 'rötterna'),
    'bonde': ('bonden', 'bönder', 'bönderna'), 'strand': ('stranden', 'stränder', 'stränderna'),
    'kväll': ('kvällen', 'kvällar', 'kvällarna'), 'morgon': ('morgonen', 'morgnar', 'morgnarna'), 'sommar': ('sommaren', 'somrar', 'somrarna'),
    'vinter': ('vintern', 'vintrar', 'vintrarna'), 'syster': ('systern', 'systrar', 'systrarna'), 'fågel': ('fågeln', 'fåglar', 'fåglarna'),
    'nyckel': ('nyckeln', 'nycklar', 'nycklarna'), 'cykel': ('cykeln', 'cyklar', 'cyklarna'), 'regel': ('regeln', 'regler', 'reglerna'),
    'muskel': ('muskeln', 'muskler', 'musklerna'), 'kusin': ('kusinen', 'kusiner', 'kusinerna'), 'museum': ('museet', 'museer', 'museerna'),
    'centrum': ('centrumet', 'centrum', 'centrumen'), 'gymnasium': ('gymnasiet', 'gymnasier', 'gymnasierna'),
    'program': ('programmet', 'program', 'programmen'), 'rum': ('rummet', 'rum', 'rummen'), 'lärare': ('läraren', 'lärare', 'lärarna'),
    'öken': ('öknen', 'öknar', 'öknarna'), 'finger': ('fingret', 'fingrar', 'fingrarna'), 'vatten': ('vattnet', 'vatten', 'vattnen'),
    'kök': ('köket', 'kök', 'köken'), 'barn': ('barnet', 'barn', 'barnen'), 'mjölk': ('mjölken', '', ''), 'kaffe': ('kaffet', '', ''),
    'te': ('teet', 'teer', 'teerna'), 'människa': ('människan', 'människor', 'människorna'),
    'mamma': ('mamman', 'mammor', 'mammorna'), 'pappa': ('pappan', 'pappor', 'papporna'), 'pojke': ('pojken', 'pojkar', 'pojkarna'),
    'timme': ('timmen', 'timmar', 'timmarna'), 'gubbe': ('gubben', 'gubbar', 'gubbarna'), 'vecka': ('veckan', 'veckor', 'veckorna'),
    'vän': ('vännen', 'vänner', 'vännerna'), 'fiende': ('fienden', 'fiender', 'fienderna'), 'polis': ('polisen', 'poliser', 'poliserna'),
    'kritik': ('kritiken', '', ''), 'musik': ('musiken', '', ''), 'pengar': ('pengarna', 'pengar', 'pengarna'),
    'glass': ('glassen', 'glassar', 'glassarna'), 'öl': ('ölet', 'öl', 'ölen'), 'vin': ('vinet', 'viner', 'vinerna'),
    'fisk': ('fisken', 'fiskar', 'fiskarna'), 'film': ('filmen', 'filmer', 'filmerna'), 'park': ('parken', 'parker', 'parkerna'),
    'tid': ('tiden', 'tider', 'tiderna'), 'färg': ('färgen', 'färger', 'färgerna'), 'sak': ('saken', 'saker', 'sakerna'),
    'plats': ('platsen', 'platser', 'platserna'), 'gäst': ('gästen', 'gäster', 'gästerna'), 'stol': ('stolen', 'stolar', 'stolarna'),
}


# en-слова, у которых множественное на -er/-r (или -ar) вопреки окончанию; без множественного; на -or
# последняя часть слова → множественное на -er (bild → bilder, arbetsgivaravgift → -avgifter)
EN_ER_LAST = set('''avgift arkitekt algoritm ankomst atom attack avsikt dräkt ort balkong bank mark flod bild bredd medalj brosch vals
börs chef bas debatt dejt dialekt diet dikt dryck skap ekonom elev epok expert familj fest flöjt form fresk makt fåtölj följd fart
förlust garderob giraff gitarr grund gränd gräns vakt tjänst led skrift infarkt horisont roll hypotes höjd inkomst insekt kamel
kastrull katt kavaj kebab kines kirurg kod kommentar kommun kompromiss konflikt konkurs konsert konsult kontakt kontroll kris kräm
kund kurs latitud legend leopard standard lins longitud lunch längd anstalt lögn lön rätt klass metod miljard molekyl mustasch
myt narciss katastrof nerv norm not paj period perrong färd planet poet protest präst psalm rabatt rapport reform relief reträtt
risk rutt rytm röst salong scen sed sekund skatt skuld sats släkt slätt smak panel souvenir sport strejk stäpp stöld syren säsong
tapet trend trottoar trumpet upptäckt utflykt uppgift uppsats utgift ven vers vikt vinst gas åsikt sorg rast stund patrull bön'''.split())
EN_OR_LAST = {'ros', 'våg', 'myr'}
# -ar вопреки окончанию (точное слово)
EN_AR = set('''dal skog sol svan kran lag sik vik tjur kniv spik kjol säng äng sal blus bonus tallrik storlek mullvad val stil robot
t-shirt bil elbil väntsal läsesal grundlag'''.split())
EN_AR_LAST = {'dag', 'duk', 'säng', 'krans', 'frans'}
EN_NOPL = set('''avund entusiasm export import nåd respekt rök röntgen skam värnplikt ånger panik metodik ornamentik kärlek
lantbruksturism läsk efterfrågan beundran förtvivlan längtan uppfostran'''.split())
SKIP = set('''bekant tilltalad underordnad överordnad utexaminerad misstänkt jämnårig kristen reel transfer whiteboard tv'''.split())
NOUN_EXC.update({
    'dröm': ('drömmen', 'drömmar', 'drömmarna'), 'kam': ('kammen', 'kammar', 'kammarna'), 'stam': ('stammen', 'stammar', 'stammarna'),
    'mun': ('munnen', 'munnar', 'munnarna'), 'get': ('geten', 'getter', 'getterna'), 'nöt': ('nöten', 'nötter', 'nötterna'),
    'stång': ('stången', 'stänger', 'stängerna'), 'ledamot': ('ledamoten', 'ledamöter', 'ledamöterna'), 'tång': ('tången', 'tänger', 'tängerna'),
    'sång': ('sången', 'sånger', 'sångerna'), 'afton': ('aftonen', 'aftnar', 'aftnarna'), 'muffin': ('muffinen', 'muffins', 'muffinsen'),
    'officer': ('officeren', 'officerare', 'officerarna'), 'meter': ('metern', 'meter', 'metrarna'), 'liter': ('litern', 'liter', 'litrarna'),
    'musiker': ('musikern', 'musiker', 'musikerna'), 'politiker': ('politikern', 'politiker', 'politikerna'),
    'kritiker': ('kritikern', 'kritiker', 'kritikerna'), 'elektriker': ('elektrikern', 'elektriker', 'elektrikerna'),
    'perser': ('persern', 'perser', 'perserna'), 'georgier': ('georgiern', 'georgier', 'georgierna'), 'partner': ('partnern', 'partner', 'partnerna'),
    'rubel': ('rubeln', 'rubel', 'rublerna'), 'psykiater': ('psykiatern', 'psykiatrer', 'psykiatrerna'), 'pyjamas': ('pyjamasen', 'pyjamasar', 'pyjamasarna'),
    'poäng': ('poängen', 'poäng', 'poängen'), 'marshmallow': ('marshmallown', 'marshmallows', 'marshmallowsen'),
    'ansökan': ('ansökan', 'ansökningar', 'ansökningarna'), 'inbjudan': ('inbjudan', 'inbjudningar', 'inbjudningarna'),
    'önskan': ('önskan', 'önskningar', 'önskningarna'), 'förfrågan': ('förfrågan', 'förfrågningar', 'förfrågningarna'),
    'befordran': ('befordran', 'befordringar', 'befordringarna'), 'examen': ('examen', 'examina', 'examina'),
    'roller': ('rollern', 'rollrar', 'rollrarna'), 'chilipeppar': ('chilipepparn', '', ''), 'peppar': ('pepparn', '', ''),
    'dollar': ('dollarn', 'dollar', 'dollarna'), 'sommar': ('sommaren', 'somrar', 'somrarna'),
})
SKIP |= {'cv', 'sms', 'fan', 'godkänt'}
NOUN_EXC.update({
    'antibiotikum': ('antibiotikumet', 'antibiotika', 'antibiotikan'), 'bi': ('biet', 'bin', 'bina'), 'frö': ('fröet', 'frön', 'fröna'),
    'knä': ('knäet', 'knän', 'knäna'), 'paraply': ('paraplyet', 'paraplyer', 'paraplyerna'), 'kafé': ('kaféet', 'kaféer', 'kaféerna'),
    'hem': ('hemmet', 'hem', 'hemmen'), 'universum': ('universumet', '', ''), 'visum': ('visumet', 'visum', 'visumen'),
    'trädgårdsland': ('trädgårdslandet', 'trädgårdsland', 'trädgårdslanden'), 'ton': ('tonnet', 'ton', 'tonnen'),
    'vaccin': ('vaccinet', 'vacciner', 'vaccinerna'), 'vitamin': ('vitaminet', 'vitaminer', 'vitaminerna'),
    'hormon': ('hormonet', 'hormoner', 'hormonerna'), 'fenomen': ('fenomenet', 'fenomen', 'fenomenen'),
    'pronomen': ('pronomenet', 'pronomen', 'pronomenen'), 'väsen': ('väsendet', 'väsen', 'väsendena'),
    'bagage': ('bagaget', '', ''), 'handbagage': ('handbagaget', '', ''), 'nummer': ('numret', 'nummer', 'numren'),
})
NOUN_EXC.update({
    'spel': ('spelet', 'spel', 'spelen'), 'fel': ('felet', 'fel', 'felen'), 'ben': ('benet', 'ben', 'benen'),
    'deadline': ('deadlinen', 'deadlines', 'deadlinesen'), 'hare': ('haren', 'harar', 'hararna'), 'stare': ('staren', 'starar', 'stararna'),
    'guide': ('guiden', 'guider', 'guiderna'), 'platå': ('platån', 'platåer', 'platåerna'),
})
EN_ER_LAST |= {'aubergine', 'trainee'}
EN_NOPL |= {'fasta', 'torka', 'grönska', 'ilska', 'ondska', 'svartsjuka', 'viljestyrka', 'glädje', 'service', 'lycka'}
SKIP |= {'samtida'}
EN_5 = set()
COMPOUND_EXCLUDE = {'and', 'son', 'tå', 'vin', 'te', 'ko', 'sko', 'öl'}
EN_ER_LAST |= {'roman', 'person', 'doktorand', 'genre', 'frände'}
EN_AR_LAST |= {'hjort'}
EN_AR |= {'fördel', 'nackdel', 'femtedel', 'fjärdedel', 'hundradel', 'tiondel', 'tredjedel', 'del'}
EN_AR |= {'fjäril'}
NOUN_EXC.update({
    'brorson': ('brorsonen', 'brorsöner', 'brorsönerna'), 'svärson': ('svärsonen', 'svärsöner', 'svärsönerna'),
    'adoptivson': ('adoptivsonen', 'adoptivsöner', 'adoptivsönerna'), 'kö': ('kön', 'köer', 'köerna'),
})


def _last(n, keys):
    return any(n == k or (n.endswith(k) and len(n) - len(k) >= 2) for k in keys)


def noun_forms(word):
    """'en bil' → {'g':'en','sg':'bil','def':'bilen','pl':'bilar','defpl':'bilarna'} (поле 'decl' — склонение)."""
    m = re.fullmatch(r'(en|ett) ([a-zåäöé-]+)', word.strip())
    if not m:
        return None
    g, n = m.group(1), m.group(2)
    if n in SKIP:
        return None
    if n in NOUN_EXC:
        d, pl, dpl = NOUN_EXC[n]
        return {'g': g, 'sg': n, 'def': d, 'pl': pl, 'defpl': dpl, 'decl': 0}
    # сложное слово: склоняется по последней части (en storebror → bröder, en arbetsplats → platser)
    listed = g == 'en' and (n in EN_AR or _last(n, EN_AR_LAST) or _last(n, EN_ER_LAST) or _last(n, EN_OR_LAST))
    for k in ([] if listed else sorted(NOUN_EXC, key=len, reverse=True)):
        if len(k) >= 3 and k not in COMPOUND_EXCLUDE and n.endswith(k) and len(n) - len(k) >= 2:
            pre = n[: len(n) - len(k)]
            d, pl, dpl = NOUN_EXC[k]
            return {'g': g, 'sg': n, 'def': pre + d, 'pl': pre + pl if pl else '', 'defpl': pre + dpl if dpl else '', 'decl': 0}
    v = 'aeiouyåäö'
    if g == 'en':
        F = lambda d, pl, dpl, k: {'g': g, 'sg': n, 'def': d, 'pl': pl, 'defpl': dpl, 'decl': k}
        if n in EN_AR or _last(n, EN_AR_LAST):
            return F(n + 'en', n + 'ar', n + 'arna', 2)
        if _last(n, EN_ER_LAST):
            if n.endswith('e'):
                return F(n + 'n', n + 'r', n + 'rna', 3)
            return F(n + 'en', n + 'er', n + 'erna', 3)
        if _last(n, EN_OR_LAST):
            return F(n + 'en', n + 'or', n + 'orna', 1)
        if n in EN_NOPL:
            return F(n + ('n' if n[-1] in v or n.endswith(('el', 'er', 'ar')) else 'en'), '', '', 0)
        if n.endswith('a'):
            st = n[:-1]
            return F(n + 'n', st + 'or', st + 'orna', 1)
        if n.endswith(('ie', 'je', 'else')):                      # bakterie, linje, händelse
            return F(n + 'n', n + 'r', n + 'rna', 3)
        if n.endswith(('are', 'ande', 'ende')):                   # lärare, studerande
            if n.endswith('are'):
                return F(n[:-1] + 'en', n, n[:-1] + 'na', 5)
            return F(n + 'n', n, n + 'na', 4)
        if n.endswith('e'):                                       # pojke, timme
            st = n[:-1]
            return F(n + 'n', st + 'ar', st + 'arna', 2)
        if n.endswith(('é', 'i', 'y', 'ä')):                      # kupé, teori, hobby, essä
            return F(n + 'n', n + 'er', n + 'erna', 3)
        if n.endswith(('ö', 'å')):                                # sjö, ö
            return F(n + 'n', n + 'ar', n + 'arna', 2)
        if n.endswith(('o', 'u')):
            return F(n + 'n', n + 'r', n + 'rna', 3)
        if re.search(r'[^aeiouyåäö](or|ör)$', n) and len(n) > 4 and n.endswith('or'):   # dator, doktor
            return F(n + 'n', n + 'er', n + 'erna', 3)
        if n.endswith(('el', 'er')) and re.search(r'[aeiouyåäö].*[^aeiouyåäö]e[lr]$', n):  # fågel, vinter
            st = n[:-2] + n[-1]
            if n.endswith(('ler', 'ter', 'der', 'ner', 'ker', 'per')) and n.endswith('er') and n in EN_5:
                pass
            return F(n + 'n', st + 'ar', st + 'arna', 2)
        if n.endswith(('het', 'tion', 'sion', 'tet', 'ism', 'ist', 'ör', 'ent', 'ant', 'ik', 'ur', 'at', 'ett', 'in', 'an',
                       'on', 'al', 'ell', 'iv', 'ess', 'ens', 'ans', 'ad', 'ut', 'em', 'yr', 'eri', 'ri', 'ol', 'il',
                       'ur', 'it', 'ät', 'är', 'ep', 'ek', 'og', 'ip', 'id', 'ut', 'ys', 'os', 'us', 'ier', 'ör', 'uk', 'ym', 'äng', 'ang')):
            return F(n + 'en', n + 'er', n + 'erna', 3)
        if n.endswith(('ing', 'ning', 'dom', 'else', 'nad', 'ung', 'ling')):
            return F(n + 'en', n + 'ar', n + 'arna', 2)
        return F(n + 'en', n + 'ar', n + 'arna', 2)
    # ett
    if n.endswith('age'):                                        # garage — мн. как ед.
        return {'g': g, 'sg': n, 'def': n + 't', 'pl': n, 'defpl': n + 'n', 'decl': 5}
    if n.endswith('i') and len(n) > 3:                           # ett parti, ett batteri
        return {'g': g, 'sg': n, 'def': n + 'et', 'pl': n + 'er', 'defpl': n + 'erna', 'decl': 3}
    if n[-1] in v:
        return {'g': g, 'sg': n, 'def': n + 't', 'pl': n + 'n', 'defpl': n + 'na', 'decl': 4}
    if n.endswith('um'):
        st = n[:-2]
        return {'g': g, 'sg': n, 'def': st + 'et', 'pl': st + 'er', 'defpl': st + 'erna', 'decl': 3}
    if n.endswith(('eri', 'ri')):
        return {'g': g, 'sg': n, 'def': n + 'et', 'pl': n + 'er', 'defpl': n + 'erna', 'decl': 3}
    if re.search(r'[aeiouyåäö][^aeiouyåäö]*[^aeiouyåäö]e[lnr]$', n):   # ett fönster, ett exempel (не ben, fel, spel)
        return {'g': g, 'sg': n, 'def': n[:-2] + n[-1] + 'et', 'pl': n, 'defpl': n[:-2] + n[-1] + 'en', 'decl': 5}
    if n.endswith('m') and len(n) <= 4 and re.search(r'[aeiouyåäö]m$', n):   # rum → rummet
        return {'g': g, 'sg': n, 'def': n + 'met', 'pl': n, 'defpl': n + 'men', 'decl': 5}
    return {'g': g, 'sg': n, 'def': n + 'et', 'pl': n, 'defpl': n + 'en', 'decl': 5}


INF_RU = re.compile(r'(ть|ться|чь|чься|ти|тись)(\s*\(.*\))?$')


def word_morph(uz, ru, tr=None):
    """Значение колонки words.morph: {'v': формы[, 'tr': {ru, en} — переводы форм]} или {'n': формы} или None."""
    if uz.startswith(('en ', 'ett ')):
        f = noun_forms(uz)
        return {'n': f} if f else None
    first = ru.split(',')[0].split(';')[0].strip()
    if not INF_RU.search(first):
        return None
    f = verb_forms(uz)
    if not f:
        return None
    out = {'v': f}
    if tr:
        out['tr'] = tr
    return out
