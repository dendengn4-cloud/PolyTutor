# Рисунки к словам, часть 3: глаголы (символы действия), прилагательные (цвета, размер, свойства), числа.
D = {}

# ---------------------------------------------------------------- глаголы — символы действия
D['eat'] = ('''<ellipse cx="32" cy="40" rx="24" ry="14" fill="#fff"{S}/><ellipse cx="32" cy="39" rx="14" ry="8" fill="#FFD166" stroke="#2B2D42" stroke-width="2"/>
<path d="M12 6v14c0 3 2 5 4 5v30M8 6v10M16 6v10" fill="none" stroke="#2B2D42" stroke-width="2.6" stroke-linecap="round"/>
<path d="M52 6c-4 2-6 8-6 14h6v34" fill="none" stroke="#2B2D42" stroke-width="2.6" stroke-linecap="round"/>''', ['есть', 'кушать', 'поесть', 'съесть'], 'vk')

D['drink'] = ('''<path d="M16 16h28l-4 40H20Z" fill="#E8F4FF"{S}/><path d="M18 28h24l-3 28H21Z" fill="#7CC0F5"/>
<path d="M16 16h28l-4 40H20Z" fill="none"{S}/><path d="M36 4l-4 30" fill="none" stroke="#E94B4B" stroke-width="3" stroke-linecap="round"/>''', ['пить', 'выпить', 'попить'], 'vk')

D['sleep'] = ('''<path d="M30 10a20 20 0 1 0 22 26A16 16 0 0 1 30 10Z" fill="#8E7CC3"{S}/>
<path d="M40 8h10l-10 10h10M50 22h6l-6 7h6" fill="none" stroke="#5AA9F0" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>''', ['спать', 'поспать', 'уснуть'], 'vk')

D['run'] = ('''<circle cx="40" cy="10" r="6" fill="#FFD7B8"{S}/>
<path d="M36 18 26 32l10 6-4 16M30 24l-10 2M36 24l8 8 8-2M26 32l-10 12" fill="none" stroke="#3E8EDE" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 30h8M2 38h10M6 46h6" stroke="#9AA4B2" stroke-width="2.4" stroke-linecap="round"/>''', ['бегать', 'бежать', 'побежать'], 'vk')

D['walk'] = ('''<circle cx="32" cy="10" r="6" fill="#FFD7B8"{S}/>
<path d="M32 18v20l-8 18M32 38l8 18M32 24l-8 10M32 24l8 10" fill="none" stroke="#45B36B" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>''', ['ходить', 'идти', 'гулять', 'пойти', 'погулять'], 'vk')

D['read'] = ('''<path d="M32 18c-6-4-16-5-24-3v36c8-2 18-1 24 3 6-4 16-5 24-3V15c-8-2-18-1-24 3Z" fill="#fff"{S}/>
<path d="M32 18v36" fill="none"{S}/><circle cx="24" cy="8" r="3" fill="#2B2D42"/><circle cx="40" cy="8" r="3" fill="#2B2D42"/>
<path d="M24 11l-4 8M40 11l4 8" stroke="#9AA4B2" stroke-width="1.6" stroke-dasharray="2 2"/>''', ['читать', 'прочитать', 'почитать'], 'vk')

D['write'] = ('''<rect x="8" y="10" width="36" height="46" rx="3" fill="#fff"{S}/>
<path d="M14 22h22M14 30h22M14 38h14" stroke="#9AA4B2" stroke-width="2" stroke-linecap="round"/>
<path d="M50 14l8 8-20 20-10 2 2-10Z" fill="#FFC23D"{S}/>''', ['писать', 'написать'], 'vk')

D['speak'] = ('''<path d="M8 12h40c3 0 5 2 5 5v20c0 3-2 5-5 5H26l-12 10v-10H8c-3 0-5-2-5-5V17c0-3 2-5 5-5Z" fill="#7CC0F5"{S}/>
<circle cx="18" cy="27" r="3" fill="#fff"/><circle cx="28" cy="27" r="3" fill="#fff"/><circle cx="38" cy="27" r="3" fill="#fff"/>''', ['говорить', 'сказать', 'разговаривать', 'поговорить'], 'vk')

D['listen'] = ('''<path d="M22 22c0-10 6-16 14-16s14 6 14 16c0 8-6 10-8 16-2 8-4 18-14 18-6 0-10-4-10-8" fill="#FFD7B8"{S}/>
<path d="M8 22c2 4 2 8 0 12M2 18c4 6 4 14 0 20" fill="none" stroke="#5AA9F0" stroke-width="2.6" stroke-linecap="round"/>''', ['слушать', 'слышать', 'послушать', 'услышать'], 'vk')

D['see'] = ('''<path d="M4 32c8-12 18-18 28-18s20 6 28 18c-8 12-18 18-28 18S12 44 4 32Z" fill="#fff"{S}/>
<circle cx="32" cy="32" r="10" fill="#45B36B"{S}/><circle cx="32" cy="32" r="4.5" fill="#2B2D42"/>
<path d="M32 4v6M14 10l4 5M50 10l-4 5" stroke="#FFC23D" stroke-width="2.6" stroke-linecap="round"/>''', ['видеть', 'смотреть', 'увидеть', 'посмотреть'], 'vk')

D['give'] = ('''<path d="M4 46h14l14 4 22-12c3-1 5 3 2 5L34 56H4Z" fill="#FFD7B8"{S}/>
<path d="M22 18h22v18H22Z" fill="#E94B4B"{S}/><path d="M33 18v18" stroke="#FFC23D" stroke-width="4"/>
<path d="M33 18c-4-8-12-6-10-1 2 2 7 1 10 1Zm0 0c4-8 12-6 10-1-2 2-7 1-10 1Z" fill="#FFC23D" stroke="#2B2D42" stroke-width="1.8"/>''', ['давать', 'дать', 'подарить', 'дарить'], 'vk')

D['take'] = ('''<path d="M40 30c0-6 4-10 10-10" fill="none" stroke="#9AA4B2" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="3 4"/>
<circle cx="48" cy="14" r="8" fill="#E94B4B"{S}/>
<path d="M14 58c-4-4-6-10-6-14l2-4c2-1 4 0 4 2l2 4V24c0-2 2-3 3-3s3 1 3 3v14V20c0-2 2-3 3-3s3 1 3 3v18-14c0-2 2-3 3-3s3 1 3 3v22c0 8-4 14-10 16Z" fill="#FFD7B8"{S}/>''', ['брать', 'взять'], 'v')

D['open'] = ('''<path d="M10 58V8h24v50" fill="#C8956D"{S}/><path d="M34 8l18 6v40l-18 4Z" fill="#B5764A"{S}/>
<path d="M10 8h24" fill="none"{S}/><circle cx="38" cy="34" r="2" fill="#FFC23D"/><path d="M14 16h16v38H14Z" fill="#FFF1C9"/>''', ['открывать', 'открыть'], 'vk')

D['close'] = ('''<path d="M14 58V8h36v50" fill="#B5764A"{S}/><path d="M20 14h24v18H20ZM20 38h24v14H20Z" fill="none" stroke="#8B5A3C" stroke-width="2.2"/>
<circle cx="44" cy="35" r="2.4" fill="#FFC23D"{S}/><path d="M24 2l8 4 8-4" fill="none" stroke="#9AA4B2" stroke-width="2.4" stroke-linecap="round"/>''', ['закрывать', 'закрыть'], 'vk')

D['buy'] = ('''<path d="M4 10h8l6 30h32l6-22H16" fill="none"{S}/>
<path d="M17 18h39l-6 22H18Z" fill="#7CC0F5"{S}/>
<circle cx="22" cy="50" r="4" fill="#3B4252"{S}/><circle cx="46" cy="50" r="4" fill="#3B4252"{S}/>''', ['покупать', 'купить'], 'vk')

D['cook'] = ('''<path d="M8 28h48v6c0 12-10 20-24 20S8 46 8 34Z" fill="#9AA4B2"{S}/>
<path d="M4 30h8M52 30h8" fill="none"{S}/><path d="M8 28h48" fill="none"{S}/>
<path d="M22 8c-2 4 2 6 0 10M32 6c-2 4 2 6 0 10M42 8c-2 4 2 6 0 10" fill="none" stroke="#9AA4B2" stroke-width="2.4" stroke-linecap="round"/>
<path d="M18 58h28" stroke="#FF8A2E" stroke-width="4" stroke-linecap="round"/>''', ['готовить', 'варить', 'приготовить', 'сварить'], 'vk')

D['play'] = ('''<rect x="6" y="20" width="52" height="28" rx="14" fill="#8E7CC3"{S}/>
<path d="M18 28v12M12 34h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
<circle cx="44" cy="30" r="3" fill="#FFC23D"/><circle cx="50" cy="37" r="3" fill="#E94B4B"/>''', ['играть', 'поиграть'], 'vk')

D['swim'] = ('''<circle cx="44" cy="20" r="6" fill="#FFD7B8"{S}/>
<path d="M38 26 22 30M30 28l-8 10" fill="none" stroke="#E94B4B" stroke-width="4.5" stroke-linecap="round"/>
<path d="M4 44c5-4 9-4 14 0s9 4 14 0 9-4 14 0 9 4 14 0M4 54c5-4 9-4 14 0s9 4 14 0 9-4 14 0 9 4 14 0" fill="none" stroke="#5AA9F0" stroke-width="3" stroke-linecap="round"/>''', ['плавать', 'плыть'], 'vk')

D['sing'] = ('''<path d="M20 50V16l28-6v34" fill="none" stroke="#8E7CC3" stroke-width="4" stroke-linejoin="round"/>
<ellipse cx="15" cy="50" rx="7" ry="5.5" fill="#8E7CC3"{S}/><ellipse cx="43" cy="44" rx="7" ry="5.5" fill="#8E7CC3"{S}/>''', ['петь', 'спеть'], 'vk')

D['love'] = ('''<path d="M32 56C14 44 6 34 6 22 6 14 12 8 20 8c5 0 9 3 12 7 3-4 7-7 12-7 8 0 14 6 14 14 0 12-8 22-26 34Z" fill="#FF6F8E"{S}/>
<path d="M26 26c2-2 4-2 6 2 2-4 4-4 6-2" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>''', ['любить', 'полюбить'], 'vk')

D['think'] = ('''<path d="M14 28c0-10 8-18 18-18s18 8 18 18c0 6-3 10-6 13v9H26v-9c-3-3-6-7-6-13" fill="#FFE07A"{S}/>
<path d="M26 56h12M28 60h8" fill="none"{S}/><path d="M32 22v8M28 26h8" stroke="#F2A33A" stroke-width="2.6" stroke-linecap="round"/>''', ['думать', 'подумать'], 'vk')

D['work'] = ('''<rect x="6" y="20" width="52" height="34" rx="4" fill="#C8956D"{S}/>
<path d="M24 20v-6c0-2 2-4 4-4h8c2 0 4 2 4 4v6M6 34h52" fill="none"{S}/><rect x="28" y="30" width="8" height="8" rx="1" fill="#FFC23D"{S}/>''', ['работать', 'поработать'], 'v')

D['wash'] = ('''<path d="M14 30h36l-4 24H18Z" fill="#7CC0F5"{S}/>
<g fill="#fff" stroke="#9AA4B2" stroke-width="1.8"><circle cx="22" cy="24" r="6"/><circle cx="34" cy="20" r="8"/><circle cx="46" cy="26" r="5"/><circle cx="28" cy="10" r="3"/></g>''', ['мыть', 'стирать', 'помыть', 'умываться'], 'vk')

D['go_drive'] = ('''<path d="M6 44h52" stroke="#9AA4B2" stroke-width="3" stroke-dasharray="6 6"/>
<path d="M20 22h20l8 10v8H12v-8Z" fill="#45B36B"{S}/><circle cx="20" cy="42" r="5" fill="#3B4252"{S}/><circle cx="42" cy="42" r="5" fill="#3B4252"{S}/>
<path d="M50 20h10l-4-4M60 20l-4 4" fill="none" stroke="#2B2D42" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>''', ['ехать', 'ездить', 'поехать', 'водить'], 'v')

D['fly'] = ('''<path d="M10 40 54 22c4-1 6 3 2 6L14 46Z" fill="#E3E6EA"{S}/>
<path d="M28 32l-8-14h6l14 10M30 38l-4 12h6l10-16" fill="#5AA9F0"{S}/>
<path d="M4 52c6 0 10-2 14-6" fill="none" stroke="#9AA4B2" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 4"/>''', ['летать', 'лететь', 'полететь'], 'v')

D['sit'] = ('''<path d="M18 8h22v26H18Z" fill="#C8956D"{S}/><path d="M14 34h30v6H14Z" fill="#B5764A"{S}/><path d="M17 40v18M41 40v18" fill="none"{S}/>
<path d="M48 28l8 0-4-4M56 28l-4 4" fill="none" stroke="#45B36B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" transform="rotate(90 52 28)"/>''', ['сидеть', 'садиться', 'сесть'], 'v')

D['wait'] = ('''<path d="M18 6h28M18 58h28" fill="none"{S}/>
<path d="M20 6c0 14 12 18 12 26S20 44 20 58h24c0-14-12-18-12-26S44 20 44 6Z" fill="#FFF1C9"{S}/>
<path d="M24 52c2-6 6-8 8-8s6 2 8 8Z M27 16h10c-1 3-3 5-5 6-2-1-4-3-5-6Z" fill="#F2A33A"/>''', ['ждать', 'подождать'], 'v')

D['help'] = ('''<circle cx="32" cy="32" r="24" fill="#E94B4B"{S}/><circle cx="32" cy="32" r="11" fill="#fff"{S}/>
<path d="M14 18l8 8M50 18l-8 8M14 46l8-8M50 46l-8-8" stroke="#fff" stroke-width="7"/>''', ['помогать', 'помочь'], 'v')

D['call'] = ('''<path d="M18 6c4 0 8 8 8 12 0 3-4 4-4 6 0 6 10 16 16 16 2 0 3-4 6-4 4 0 12 4 12 8 0 6-6 10-12 10C26 54 10 38 10 20 10 12 14 6 18 6Z" fill="#45B36B"{S}/>
<path d="M40 8c8 2 14 8 16 16M40 16c4 1 7 4 8 8" fill="none" stroke="#2B2D42" stroke-width="2.4" stroke-linecap="round"/>''', ['звонить', 'позвонить'], 'v')

D['learn'] = ('''<path d="M4 24 32 12l28 12-28 12Z" fill="#3B4252"{S}/><path d="M16 30v12c4 4 10 6 16 6s12-2 16-6V30l-16 6Z" fill="#3B4252"{S}/>
<path d="M56 26v14" fill="none"{S}/><circle cx="56" cy="42" r="2.6" fill="#FFC23D"/>''', ['учить', 'учиться', 'изучать', 'выучить'], 'v')

D['know'] = ('''<path d="M14 28c0-10 8-18 18-18s18 8 18 18c0 6-3 10-6 13v9H26v-9c-3-3-6-7-6-13" fill="#FFE07A"{S}/>
<path d="M26 56h12M28 60h8" fill="none"{S}/><path d="M25 28l5 5 10-10" fill="none" stroke="#2FAE6A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>''', ['знать', 'узнать'], 'v')

D['laugh'] = ('''<circle cx="32" cy="32" r="24" fill="#FFC23D"{S}/>
<path d="M20 26c2-3 6-3 8 0M36 26c2-3 6-3 8 0" fill="none"{S}/><path d="M18 34h28c0 8-6 14-14 14s-14-6-14-14Z" fill="#fff"{S}/>''', ['смеяться', 'засмеяться'], 'v')

D['cry'] = ('''<circle cx="32" cy="32" r="24" fill="#FFC23D"{S}/>
<path d="M20 28c2 2 6 2 8 0M36 28c2 2 6 2 8 0M24 46c4-4 12-4 16 0" fill="none"{S}/>
<path d="M22 32c-2 6-3 8 0 10 3-2 2-4 0-10Z" fill="#5AA9F0"/>''', ['плакать', 'заплакать'], 'v')

D['draw'] = ('''<rect x="6" y="12" width="40" height="40" rx="3" fill="#fff"{S}/>
<path d="M14 40l8-10 6 6 8-12" fill="none" stroke="#45B36B" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="18" cy="20" r="4" fill="#FFC23D"/>
<path d="M50 10l8 8-16 16-8 2 2-8Z" fill="#E94B4B"{S}/>''', ['рисовать', 'нарисовать'], 'vk')

D['dance'] = ('''<circle cx="32" cy="10" r="6" fill="#FFD7B8"{S}/><path d="M32 18l-4 18 10 4-4 18M30 24 16 18M32 24l14-12M28 36l-12 10" fill="none" stroke="#FF6F8E" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M50 30c0 4-3 6-3 6M54 36c2 3 1 6 1 6" fill="none" stroke="#8E7CC3" stroke-width="2.4" stroke-linecap="round"/>''', ['танцевать', 'потанцевать'], 'vk')

# ---------------------------------------------------------------- прилагательные
def swatch(color, extra=''):
    return f'<path d="M12 36c-4-14 8-26 22-26s24 10 22 24-12 22-24 22S16 50 12 36Z" fill="{color}"{{S}}/>' + extra

D['red'] = (swatch('#E94B4B'), ['красный'], 'ak')
D['blue'] = (swatch('#3E8EDE'), ['синий', 'голубой'], 'ak')
D['green'] = (swatch('#45B36B'), ['зелёный', 'зеленый'], 'ak')
D['yellow'] = (swatch('#FFD84D'), ['жёлтый', 'желтый'], 'ak')
D['orange_c'] = (swatch('#FF9A2E'), ['оранжевый'], 'ak')
D['purple'] = (swatch('#8E5BD1'), ['фиолетовый', 'сиреневый'], 'ak')
D['pink'] = (swatch('#FF8FB1'), ['розовый'], 'ak')
D['brown'] = (swatch('#8B5A3C'), ['коричневый'], 'ak')
D['black'] = (swatch('#2B2D42'), ['чёрный', 'черный'], 'ak')
D['white'] = (swatch('#FFFFFF'), ['белый'], 'ak')
D['grey'] = (swatch('#9AA4B2'), ['серый'], 'ak')

D['big'] = ('''<circle cx="26" cy="34" r="20" fill="#5AA9F0"{S}/><circle cx="52" cy="48" r="6" fill="#C9D6E3"{S}/>''', ['большой', 'крупный'], 'ak')
D['small'] = ('''<circle cx="22" cy="46" r="6" fill="#5AA9F0"{S}/><circle cx="42" cy="28" r="16" fill="#C9D6E3"{S}/>''', ['маленький', 'небольшой'], 'ak')
D['hot'] = ('''<path d="M26 40V12a6 6 0 0 1 12 0v28a10 10 0 1 1-12 0Z" fill="#fff"{S}/><path d="M29 40V20h6v20" fill="#E94B4B"/><circle cx="32" cy="48" r="7" fill="#E94B4B"/>
<path d="M48 12c-2 4 2 6 0 10M54 14c-2 4 2 6 0 10" fill="none" stroke="#FF8A2E" stroke-width="2.4" stroke-linecap="round"/>''', ['горячий', 'жаркий', 'тёплый', 'теплый'], 'ak')
D['cold'] = ('''<path d="M26 40V12a6 6 0 0 1 12 0v28a10 10 0 1 1-12 0Z" fill="#fff"{S}/><path d="M29 40v-6h6v6" fill="#3E8EDE"/><circle cx="32" cy="48" r="7" fill="#3E8EDE"/>
<g stroke="#5AA9F0" stroke-width="2.4" stroke-linecap="round"><path d="M52 10v16M45 14l14 8M45 22l14-8"/></g>''', ['холодный', 'прохладный'], 'ak')
D['happy'] = ('''<circle cx="32" cy="32" r="24" fill="#FFC23D"{S}/><circle cx="24" cy="27" r="2.6" fill="#2B2D42"/><circle cx="40" cy="27" r="2.6" fill="#2B2D42"/>
<path d="M20 38c6 8 18 8 24 0" fill="none"{S}/>''', ['весёлый', 'веселый', 'счастливый', 'радостный', 'довольный'], 'ak')
D['sad'] = ('''<circle cx="32" cy="32" r="24" fill="#9CC6F0"{S}/><circle cx="24" cy="28" r="2.6" fill="#2B2D42"/><circle cx="40" cy="28" r="2.6" fill="#2B2D42"/>
<path d="M22 46c6-6 14-6 20 0" fill="none"{S}/>''', ['грустный', 'печальный'], 'ak')
D['angry'] = ('''<circle cx="32" cy="32" r="24" fill="#F07A5A"{S}/><path d="M18 22l10 4M46 22l-10 4" fill="none"{S}/>
<circle cx="24" cy="30" r="2.6" fill="#2B2D42"/><circle cx="40" cy="30" r="2.6" fill="#2B2D42"/><path d="M22 46c6-4 14-4 20 0" fill="none"{S}/>''', ['злой', 'сердитый'], 'ak')
D['good'] = ('''<path d="M10 30h10v26H10Z" fill="#45B36B"{S}/><path d="M20 30l10-20c4 0 6 3 5 8l-2 8h16c4 0 6 3 5 6l-5 18c-1 4-4 6-8 6H20Z" fill="#FFD7B8"{S}/>''', ['хороший', 'хорошо', 'отличный'], 'ak')
D['bad'] = ('''<g transform="rotate(180 32 32)"><path d="M10 30h10v26H10Z" fill="#E94B4B"{S}/><path d="M20 30l10-20c4 0 6 3 5 8l-2 8h16c4 0 6 3 5 6l-5 18c-1 4-4 6-8 6H20Z" fill="#FFD7B8"{S}/></g>''', ['плохой', 'плохо'], 'ak')
D['fast'] = ('''<path d="M28 18h18l10 14H40l4 18L22 26h12Z" fill="#FFC23D"{S}/><path d="M4 22h14M8 32h14M4 42h12" stroke="#9AA4B2" stroke-width="2.6" stroke-linecap="round"/>''', ['быстрый', 'быстро'], 'a')
D['slow'] = ('''<path d="M8 50c0-6 6-10 12-10h20c6 0 10-6 10-12 4 0 8 4 8 10 0 8-6 12-12 12Z" fill="#9BD39A"{S}/>
<circle cx="30" cy="34" r="12" fill="#C8956D"{S}/><path d="M30 34a5 5 0 1 1 5-5" fill="none" stroke="#8B5A3C" stroke-width="2"/>
<path d="M52 28l2-10M56 28l4-8" stroke="#2B2D42" stroke-width="2" stroke-linecap="round"/>''', ['медленный', 'медленно'], 'ak')
D['tall'] = ('''<rect x="14" y="6" width="14" height="52" rx="3" fill="#5AA9F0"{S}/><rect x="36" y="38" width="14" height="20" rx="3" fill="#C9D6E3"{S}/>''', ['высокий'], 'ak')
D['long'] = ('''<rect x="4" y="18" width="56" height="10" rx="5" fill="#45B36B"{S}/><rect x="4" y="38" width="20" height="10" rx="5" fill="#C9D6E3"{S}/>''', ['длинный', 'долгий'], 'a')
D['new'] = ('''<path d="M32 4l6 10 11-3-2 11 10 6-10 6 2 11-11-3-6 10-6-10-11 3 2-11-10-6 10-6-2-11 11 3Z" fill="#FFC23D"{S}/>
<text x="32" y="38" text-anchor="middle" font-size="12" font-weight="800" font-family="sans-serif" fill="#2B2D42">NEW</text>''', ['новый'], 'a')
D['beautiful'] = ('''<path d="M32 8l5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1Z" fill="#FFC23D"{S}/>
<path d="M10 46l3 6 6 2-6 2-3 6-3-6-6-2 6-2ZM52 44l2 4 4 1-4 1-2 4-2-4-4-1 4-1Z" fill="#FF8FB1"/>''', ['красивый', 'прекрасный'], 'ak')
D['clean'] = ('''<path d="M14 30h36l-4 24H18Z" fill="#BFE0FF"{S}/><path d="M24 10l3 7 7 3-7 3-3 7-3-7-7-3 7-3ZM44 6l2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" fill="#FFC23D"/>''', ['чистый'], 'a')
D['dirty'] = ('''<path d="M14 30h36l-4 24H18Z" fill="#C8B18E"{S}/><g fill="#8B5A3C"><circle cx="24" cy="40" r="3"/><circle cx="36" cy="46" r="4"/><circle cx="40" cy="36" r="2"/></g>''', ['грязный'], 'a')
D['sweet'] = ('''<path d="M20 32 8 24l4 8-4 8ZM44 32l12-8-4 8 4 8Z" fill="#FF8FB1"{S}/><circle cx="32" cy="32" r="13" fill="#FF6F8E"{S}/>
<path d="M24 28c4-4 12-4 16 4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>''', ['сладкий'], 'ak')

# ---------------------------------------------------------------- числа
def digit(n, color):
    return (f'<circle cx="32" cy="32" r="24" fill="{color}"{{S}}/>'
            f'<text x="32" y="43" text-anchor="middle" font-size="30" font-weight="800" font-family="sans-serif" fill="#fff">{n}</text>')
for n, ru, c in [(1, 'один', '#E94B4B'), (2, 'два', '#FF9A2E'), (3, 'три', '#F2B233'), (4, 'четыре', '#45B36B'), (5, 'пять', '#3E8EDE'),
                 (6, 'шесть', '#8E5BD1'), (7, 'семь', '#FF6F8E'), (8, 'восемь', '#2FAE6A'), (9, 'девять', '#5AA9F0'), (10, 'десять', '#C8956D')]:
    D[f'n{n}'] = (digit(n, c), [ru], 'nk')
