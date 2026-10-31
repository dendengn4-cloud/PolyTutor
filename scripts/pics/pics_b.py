# Рисунки к словам, часть 2: дом, природа, транспорт, одежда, тело, люди, школа.
D = {}

D['house'] = ('''<path d="M12 30h40v24H12Z" fill="#FFE2A8"{S}/>
<path d="M7 32 32 10l25 22" fill="#E94B4B"{S}/>
<path d="M42 18V10h6v13" fill="#C9C2B8"{S}/>
<path d="M27 54V40h10v14" fill="#9C6B45"{S}/>
<rect x="16" y="36" width="8" height="8" rx="1.5" fill="#BFE0FF" stroke="#2B2D42" stroke-width="2"/>
<rect x="40" y="36" width="8" height="8" rx="1.5" fill="#BFE0FF" stroke="#2B2D42" stroke-width="2"/>''', ['дом', 'домик'], 'nk')

D['door'] = ('''<path d="M16 58V10c0-2 2-4 4-4h24c2 0 4 2 4 4v48" fill="#B5764A"{S}/>
<path d="M22 14h20v18H22ZM22 38h20v14H22Z" fill="none" stroke="#8B5A3C" stroke-width="2.2"/>
<circle cx="41" cy="34" r="2.4" fill="#FFC23D"{S}/><path d="M10 58h44" fill="none"{S}/>''', ['дверь'], 'nk')

D['window'] = ('''<rect x="10" y="10" width="44" height="44" rx="3" fill="#BFE0FF"{S}/>
<path d="M32 10v44M10 32h44" fill="none"{S}/>
<path d="M16 24l6-8M38 24l8-10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
<path d="M6 54h52" fill="none"{S}/>''', ['окно'], 'nk')

D['table'] = ('''<path d="M6 24h52v6H6Z" fill="#C8956D"{S}/>
<path d="M12 30v26M52 30v26M20 30v18M44 30v18" fill="none"{S}/>''', ['стол'], 'nk')

D['chair'] = ('''<path d="M18 8h22v26H18Z" fill="#C8956D"{S}/>
<path d="M14 34h30v6H14Z" fill="#B5764A"{S}/>
<path d="M17 40v18M41 40v18M18 14h22M18 22h22" fill="none"{S}/>''', ['стул'], 'nk')

D['bed'] = ('''<path d="M6 22v34M58 36v20" fill="none"{S}/>
<path d="M6 40h52v10H6Z" fill="#8E7CC3"{S}/>
<rect x="10" y="30" width="14" height="10" rx="4" fill="#fff"{S}/>
<path d="M24 34h30c2 0 4 2 4 4v2H24Z" fill="#B9A9E6"{S}/>''', ['кровать'], 'nk')

D['lamp'] = ('''<path d="M20 30 26 8h12l6 22Z" fill="#FFD166"{S}/>
<path d="M32 30v22M22 56h20" fill="none"{S}/>
<path d="M18 34l-4 4M46 34l4 4M32 36v3" stroke="#FFC23D" stroke-width="2.4" stroke-linecap="round"/>''', ['лампа', 'светильник'], 'n')

D['key'] = ('''<circle cx="20" cy="32" r="11" fill="#FFC23D"{S}/>
<circle cx="20" cy="32" r="4" fill="#fff" stroke="#2B2D42" stroke-width="2"/>
<path d="M31 29h25v6h-4v6h-5v-6h-3v4h-5v-4h-8Z" fill="#FFC23D"{S}/>''', ['ключ'], 'nk')

D['clock'] = ('''<circle cx="32" cy="34" r="22" fill="#fff"{S}/>
<path d="M32 34V20M32 34l9 6" fill="none"{S}/>
<g fill="#2B2D42"><circle cx="32" cy="16" r="1.6"/><circle cx="50" cy="34" r="1.6"/><circle cx="32" cy="52" r="1.6"/><circle cx="14" cy="34" r="1.6"/></g>
<circle cx="32" cy="34" r="2.4" fill="#E94B4B"/>''', ['часы', 'будильник'], 'nk')

D['phone'] = ('''<rect x="18" y="6" width="28" height="52" rx="5" fill="#3B4252"{S}/>
<rect x="21" y="12" width="22" height="36" rx="2" fill="#7CC0F5"/>
<circle cx="32" cy="53" r="2" fill="#C9CFD8"/>''', ['телефон', 'мобильный телефон', 'смартфон'], 'nk')

D['book'] = ('''<path d="M32 16c-6-4-16-5-24-3v38c8-2 18-1 24 3 6-4 16-5 24-3V13c-8-2-18-1-24 3Z" fill="#fff"{S}/>
<path d="M32 16v38" fill="none"{S}/>
<path d="M14 22c4-1 9-1 13 1M14 30c4-1 9-1 13 1M37 23c4-2 9-2 13-1M37 31c4-2 9-2 13-1" stroke="#9AA4B2" stroke-width="2" stroke-linecap="round"/>''', ['книга', 'книжка'], 'nk')

D['pencil'] = ('''<path d="M44 8l12 12-32 32-14 4 4-14Z" fill="#FFC23D"{S}/>
<path d="M14 42l8 8M40 12l12 12" fill="none"{S}/>
<path d="M10 56l4-14 8 8Z" fill="#F1D3A8"{S}/><path d="M10 56l2-5 3 3Z" fill="#2B2D42"/>''', ['карандаш'], 'nk')

D['pen'] = ('''<path d="M46 6l12 12-34 34-10 2 2-10Z" fill="#3E8EDE"{S}/>
<path d="M16 44l6 6" fill="none"{S}/><path d="M14 56l2-8 6 6Z" fill="#2B2D42"/>''', ['ручка'], 'n')

D['bag'] = ('''<path d="M10 22h44l-4 34H14Z" fill="#E94B4B"{S}/>
<path d="M22 22v-6a10 10 0 0 1 20 0v6" fill="none"{S}/>
<path d="M10 22h44" fill="none"{S}/>''', ['сумка', 'пакет'], 'nk')

D['backpack'] = ('''<path d="M16 22c0-8 7-14 16-14s16 6 16 14v30c0 3-2 5-5 5H21c-3 0-5-2-5-5Z" fill="#5AA9F0"{S}/>
<path d="M22 36h20v14H22Z" fill="#3E8EDE"{S}/><path d="M26 8v-3h12v3" fill="none"{S}/>''', ['рюкзак', 'портфель'], 'nk')

D['cup'] = ('''<path d="M12 18h34v20c0 10-8 18-17 18S12 48 12 38Z" fill="#5AA9F0"{S}/>
<path d="M46 24h4c4 0 6 3 6 7s-2 7-6 7h-5" fill="none"{S}/>
<path d="M18 26c0 6 2 12 6 16" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>''', ['чашка', 'кружка'], 'nk')

D['plate'] = ('''<ellipse cx="32" cy="36" rx="26" ry="16" fill="#fff"{S}/>
<ellipse cx="32" cy="35" rx="16" ry="9" fill="none" stroke="#C9CFD8" stroke-width="2.2"/>''', ['тарелка'], 'nk')

D['spoon'] = ('''<ellipse cx="22" cy="20" rx="9" ry="12" transform="rotate(-35 22 20)" fill="#C9CFD8"{S}/>
<path d="M28 28 54 56" fill="none" stroke="#2B2D42" stroke-width="6" stroke-linecap="round"/><path d="M28 28 54 56" stroke="#C9CFD8" stroke-width="2.4" stroke-linecap="round"/>''', ['ложка'], 'nk')

D['fork'] = ('''<path d="M14 8v12c0 6 4 8 8 8l26 28" fill="none" stroke="#2B2D42" stroke-width="6" stroke-linecap="round"/>
<path d="M14 8v12c0 6 4 8 8 8l26 28" fill="none" stroke="#C9CFD8" stroke-width="2.4" stroke-linecap="round"/>
<path d="M20 6v14M26 8v14" stroke="#2B2D42" stroke-width="2.4" stroke-linecap="round"/>''', ['вилка'], 'nk')

D['knife'] = ('''<path d="M10 52 44 10c4 2 6 6 4 10L22 52Z" fill="#E3E6EA"{S}/>
<path d="M22 52l-6 8-8-4 6-8Z" fill="#8B5A3C"{S}/>''', ['нож'], 'n')

D['tv'] = ('''<rect x="6" y="14" width="52" height="34" rx="4" fill="#3B4252"{S}/>
<rect x="11" y="19" width="42" height="24" rx="2" fill="#7CC0F5"/>
<path d="M22 56h20M32 48v8M24 6l8 8 8-8" fill="none"{S}/>''', ['телевизор'], 'n')

D['computer'] = ('''<rect x="10" y="10" width="44" height="30" rx="3" fill="#3B4252"{S}/>
<rect x="14" y="14" width="36" height="22" rx="1" fill="#7CC0F5"/>
<path d="M4 50h56l-4 6H8Z" fill="#C9CFD8"{S}/><path d="M10 40l-6 10M54 40l6 10" fill="none"{S}/>''', ['компьютер', 'ноутбук'], 'n')

D['car'] = ('''<path d="M6 42v-8l6-2 8-12h22l10 12 6 2v8Z" fill="#E94B4B"{S}/>
<path d="M22 22h8v10H16ZM34 22h7l8 10H34Z" fill="#BFE0FF"{S}/>
<circle cx="18" cy="44" r="6" fill="#3B4252"{S}/><circle cx="46" cy="44" r="6" fill="#3B4252"{S}/>
<circle cx="18" cy="44" r="2" fill="#C9CFD8"/><circle cx="46" cy="44" r="2" fill="#C9CFD8"/>''', ['машина', 'автомобиль'], 'nk')

D['bus'] = ('''<rect x="8" y="10" width="48" height="38" rx="5" fill="#FFC23D"{S}/>
<path d="M12 16h40v14H12Z" fill="#BFE0FF"{S}/><path d="M32 16v14" fill="none"{S}/>
<circle cx="18" cy="48" r="5" fill="#3B4252"{S}/><circle cx="46" cy="48" r="5" fill="#3B4252"{S}/>
<path d="M14 38h6M44 38h6" stroke="#fff" stroke-width="3" stroke-linecap="round"/>''', ['автобус'], 'nk')

D['bicycle'] = ('''<circle cx="16" cy="42" r="10" fill="none"{S}/><circle cx="48" cy="42" r="10" fill="none"{S}/>
<path d="M16 42l10-18h16l6 18M26 24l8 18h-18M34 42l8-18M24 18h8M42 24l-2-6h6" fill="none" stroke="#E94B4B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>''', ['велосипед'], 'nk')

D['plane'] = ('''<path d="M6 34 56 18c4-1 6 3 2 6L12 40Z" fill="#E3E6EA"{S}/>
<path d="M26 28 18 12h6l14 12M30 36l-4 14h6l10-18" fill="#5AA9F0"{S}/>
<path d="M8 34l-2-10h5l6 8" fill="#5AA9F0"{S}/>''', ['самолёт', 'самолет'], 'nk')

D['train'] = ('''<rect x="12" y="8" width="40" height="40" rx="8" fill="#E94B4B"{S}/>
<rect x="17" y="14" width="30" height="14" rx="2" fill="#BFE0FF"{S}/>
<circle cx="22" cy="38" r="3" fill="#FFE14D"{S}/><circle cx="42" cy="38" r="3" fill="#FFE14D"{S}/>
<path d="M20 48l-6 10M44 48l6 10M16 54h32" fill="none"{S}/>''', ['поезд'], 'nk')

D['ship'] = ('''<path d="M6 40h52l-8 14H14Z" fill="#3E8EDE"{S}/>
<path d="M16 40V28h28v12" fill="#fff"{S}/><path d="M26 28V18h10v10" fill="#E94B4B"{S}/>
<circle cx="24" cy="34" r="2" fill="#5AA9F0"/><circle cx="32" cy="34" r="2" fill="#5AA9F0"/><circle cx="40" cy="34" r="2" fill="#5AA9F0"/>
<path d="M4 58c4-2 8-2 12 0s8 2 12 0 8-2 12 0 8 2 12 0" fill="none" stroke="#5AA9F0" stroke-width="2.4" stroke-linecap="round"/>''', ['корабль', 'пароход', 'теплоход', 'паром'], 'nk')

D['boat'] = ('''<path d="M8 40h48l-8 12H16Z" fill="#C8956D"{S}/>
<path d="M32 8v32M32 10l16 24H32Z" fill="#fff"{S}/>
<path d="M4 58c4-2 8-2 12 0s8 2 12 0 8-2 12 0 8 2 12 0" fill="none" stroke="#5AA9F0" stroke-width="2.4" stroke-linecap="round"/>''', ['лодка'], 'nk')

D['ball'] = ('''<circle cx="32" cy="32" r="22" fill="#fff"{S}/>
<path d="M12 24c10 4 30 4 40 0l1.6 6c-12 5-31 5-43 0Z" fill="#FF6F4E"/>
<path d="M11 38c12 5 30 5 42 0l-2.5 6c-11 4-26 4-37 0Z" fill="#5AA9F0"/>
<circle cx="32" cy="32" r="22" fill="none"{S}/>''', ['мяч'], 'nk')

D['doll'] = ('''<circle cx="32" cy="18" r="10" fill="#FFD7B8"{S}/>
<path d="M22 16c0-8 6-12 10-12s10 4 10 12c-4-4-8-5-10-5s-6 1-10 5Z" fill="#E6A15A"{S}/>
<path d="M18 58l6-26h16l6 26Z" fill="#FF9FB5"{S}/>
<circle cx="28.5" cy="19" r="1.6" fill="#2B2D42"/><circle cx="35.5" cy="19" r="1.6" fill="#2B2D42"/>
<path d="M29.5 23c1.5 1 3.5 1 5 0" fill="none" stroke="#2B2D42" stroke-width="1.6" stroke-linecap="round"/>''', ['кукла'], 'nk')

D['toy'] = ('''<path d="M14 30h36v24H14Z" fill="#5AA9F0"{S}/><path d="M14 30 24 20h36L50 30" fill="#7CC0F5"{S}/>
<path d="M50 30l10-10v24l-10 10" fill="#3E8EDE"{S}/>
<text x="32" y="48" text-anchor="middle" font-size="16" font-weight="800" font-family="sans-serif" fill="#fff">A</text>''', ['игрушка', 'кубик'], 'nk')

# ---------------------------------------------------------------- природа
D['sun'] = ('''<g stroke="#F2A33A" stroke-width="3.2" stroke-linecap="round"><path d="M32 4v8M32 52v8M4 32h8M52 32h8M12 12l6 6M46 46l6 6M12 52l6-6M46 18l6-6"/></g>
<circle cx="32" cy="32" r="15" fill="#FFC23D"{S}/>''', ['солнце'], 'nk')

D['moon'] = ('''<path d="M40 8a24 24 0 1 0 16 38A20 20 0 0 1 40 8Z" fill="#FFE07A"{S}/>
<circle cx="26" cy="30" r="3" fill="#F2C94C"/><circle cx="34" cy="44" r="2" fill="#F2C94C"/>''', ['луна', 'месяц'], 'nk')

D['star'] = ('''<path d="M32 6l7.6 16.2 17.6 2.2-13 12.2 3.4 17.4L32 45.4 16.4 54l3.4-17.4-13-12.2 17.6-2.2Z" fill="#FFC23D"{S}/>''', ['звезда'], 'nk')

D['cloud'] = ('''<path d="M16 46c-7 0-11-5-10-11 1-6 7-9 12-7 1-8 8-14 16-14 9 0 15 6 16 14 6-1 11 4 11 9 0 5-4 9-10 9Z" fill="#fff"{S}/>''', ['облако', 'туча'], 'nk')

D['rain'] = ('''<path d="M16 34c-7 0-11-5-10-11 1-6 7-9 12-7 1-8 8-12 16-12 9 0 15 6 16 12 6-1 11 4 11 9 0 5-4 9-10 9Z" fill="#C9D6E3"{S}/>
<path d="M18 42l-3 8M30 42l-3 8M42 42l-3 8M24 50l-3 8M36 50l-3 8" stroke="#3E8EDE" stroke-width="2.6" stroke-linecap="round"/>''', ['дождь'], 'nk')

D['snow'] = ('''<g stroke="#5AA9F0" stroke-width="3" stroke-linecap="round" fill="none"><path d="M32 6v52M9.5 19l45 26M9.5 45l45-26"/>
<path d="M26 10l6 6 6-6M26 54l6-6 6 6M10 27l8 2-2-8M54 37l-8-2 2 8M10 37l8-2-2 8M54 27l-8 2 2-8"/></g>''', ['снег', 'снежинка'], 'nk')

D['tree'] = ('''<path d="M28 58V38h8v20" fill="#9C6B45"{S}/>
<path d="M32 6c10 0 16 8 15 15 7 2 10 8 8 14-2 7-9 9-15 7-3 3-11 3-16 0-6 2-13 0-15-7-2-6 1-12 8-14-1-7 5-15 15-15Z" fill="#45B36B"{S}/>''', ['дерево'], 'nk')

D['flower'] = ('''<path d="M32 36v22M32 48c-6-6-12-6-16-2 4 5 10 5 16 2ZM32 52c6-6 12-6 16-2-4 5-10 5-16 2Z" fill="#45B36B"{S}/>
<g fill="#FF8FB1" stroke="#2B2D42" stroke-width="2.2"><circle cx="32" cy="12" r="7"/><circle cx="43" cy="20" r="7"/><circle cx="39" cy="32" r="7"/><circle cx="25" cy="32" r="7"/><circle cx="21" cy="20" r="7"/></g>
<circle cx="32" cy="23" r="6" fill="#FFC23D"{S}/>''', ['цветок', 'цветы', 'роза'], 'nk')

D['leaf'] = ('''<path d="M10 54C10 26 26 10 54 10c0 28-16 44-44 44Z" fill="#6CC56B"{S}/>
<path d="M10 54 44 20M24 40h10M30 34V24M36 28h8" fill="none" stroke="#2E7D32" stroke-width="2.2" stroke-linecap="round"/>''', ['лист', 'листок', 'листья'], 'nk')

D['sea'] = ('''<path d="M4 28c5-4 9-4 14 0s9 4 14 0 9-4 14 0 9 4 14 0v30H4Z" fill="#5AA9F0"{S}/>
<path d="M4 42c5-4 9-4 14 0s9 4 14 0 9-4 14 0 9 4 14 0" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="46" cy="14" r="7" fill="#FFC23D"{S}/>''', ['море', 'океан'], 'nk')

D['mountain'] = ('''<path d="M4 54 24 18l10 16 6-8 20 28Z" fill="#8FA3B8"{S}/>
<path d="M24 18l-6 11 4 2 3-3 3 3 4-2Z" fill="#fff"{S}/>''', ['гора', 'горы'], 'nk')

D['river'] = ('''<path d="M20 4c8 10-12 16-4 28s-10 16-2 28h18c-8-12 10-16 2-28s12-18 4-28Z" fill="#7CC0F5"{S}/>
<path d="M30 14c-2 4-6 6-4 10M26 40c2 4-2 8 0 12" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>''', ['река'], 'n')

D['fire'] = ('''<path d="M32 58c-12 0-18-8-18-18 0-12 10-16 12-28 6 6 6 12 6 14 4-2 6-6 6-10 8 6 12 14 12 22 0 12-8 20-18 20Z" fill="#FF8A2E"{S}/>
<path d="M32 58c-6 0-9-4-9-9 0-6 5-8 6-14 6 4 12 8 12 15 0 5-4 8-9 8Z" fill="#FFD84D"/>''', ['огонь', 'костёр', 'костер'], 'nk')

D['rainbow'] = ('''<path d="M6 50a26 26 0 0 1 52 0" fill="none" stroke="#E94B4B" stroke-width="5"/>
<path d="M12 50a20 20 0 0 1 40 0" fill="none" stroke="#FFC23D" stroke-width="5"/>
<path d="M18 50a14 14 0 0 1 28 0" fill="none" stroke="#45B36B" stroke-width="5"/>
<path d="M24 50a8 8 0 0 1 16 0" fill="none" stroke="#5AA9F0" stroke-width="5"/>''', ['радуга'], 'nk')

D['grass'] = ('''<path d="M6 56c2-10 4-18 8-24 0 8 1 16 4 24M18 56c1-14 4-26 10-34-2 12-1 24 2 34M30 56c2-10 6-20 12-26-3 10-4 18-2 26M42 56c2-8 6-14 12-18-3 6-4 12-2 18" fill="#6CC56B"{S}/>''', ['трава'], 'nk')

D['garden'] = ('''<path d="M4 46h56v12H4Z" fill="#9C6B45"{S}/>
<path d="M14 46V34M14 38c-4-4-8-4-10 0 3 3 7 3 10 0ZM32 46V30M32 36c4-6 10-6 12-2-4 4-8 4-12 2ZM50 46V34" fill="#45B36B"{S}/>
<circle cx="14" cy="30" r="5" fill="#FF8FB1"{S}/><circle cx="50" cy="30" r="5" fill="#FFC23D"{S}/>''', ['сад', 'огород'], 'n')

# ---------------------------------------------------------------- одежда
D['shirt'] = ('''<path d="M22 8l10 6 10-6 16 8-6 12-6-3v31H18V25l-6 3-6-12Z" fill="#5AA9F0"{S}/>
<path d="M26 10l6 10 6-10" fill="none"{S}/>''', ['рубашка', 'футболка', 'кофта'], 'nk')

D['dress'] = ('''<path d="M24 6h16l-2 14 14 36H12l14-36Z" fill="#FF8FB1"{S}/>
<path d="M24 20h16" fill="none"{S}/>''', ['платье'], 'nk')

D['trousers'] = ('''<path d="M16 6h32l4 52H38L32 22l-6 36H12Z" fill="#3E5C8A"{S}/>
<path d="M16 12h32" fill="none"{S}/>''', ['брюки', 'штаны', 'джинсы'], 'nk')

D['shoes'] = ('''<path d="M6 40c0-8 4-14 8-14 2 6 8 8 14 8 8 0 12 4 14 10H6Z" fill="#8B5A3C"{S}/>
<path d="M6 44h36v4H6Z" fill="#3B4252"{S}/>
<path d="M30 40c0-8 4-14 8-14 2 6 8 8 14 8" fill="none" stroke="#8B5A3C" stroke-width="0"/>''', ['обувь', 'туфли', 'ботинки', 'кроссовки', 'туфля'], 'nk')

D['hat'] = ('''<ellipse cx="32" cy="44" rx="26" ry="7" fill="#C8956D"{S}/>
<path d="M18 44c0-14 4-24 14-24s14 10 14 24" fill="#C8956D"{S}/>
<path d="M18.5 38c8 3 19 3 27 0" fill="none" stroke="#E94B4B" stroke-width="4"/>''', ['шляпа', 'шапка', 'кепка'], 'nk')

D['glasses'] = ('''<circle cx="18" cy="34" r="11" fill="#DDEFFF"{S}/><circle cx="46" cy="34" r="11" fill="#DDEFFF"{S}/>
<path d="M29 32c2-2 4-2 6 0M7 30 4 22M57 30l3-8" fill="none"{S}/>''', ['очки'], 'nk')

D['umbrella'] = ('''<path d="M6 32C6 18 18 8 32 8s26 10 26 24c-4-3-9-3-13 0-4-3-9-3-13 0-4-3-9-3-13 0-4-3-9-3-13 0Z" fill="#E94B4B"{S}/>
<path d="M32 32v20c0 4-6 4-6 0" fill="none"{S}/>''', ['зонт', 'зонтик'], 'nk')

D['coat'] = ('''<path d="M22 6h20l14 10-4 14-4-2v30H16V28l-4 2-4-14Z" fill="#8B5A3C"{S}/>
<path d="M32 10v48M24 6l8 10 8-10" fill="none"{S}/>
<circle cx="36" cy="26" r="1.6" fill="#2B2D42"/><circle cx="36" cy="36" r="1.6" fill="#2B2D42"/><circle cx="36" cy="46" r="1.6" fill="#2B2D42"/>''', ['пальто', 'куртка'], 'nk')

D['sock'] = ('''<path d="M22 6h16v28l12 10c4 4 2 12-4 12-3 0-6-2-8-4L24 42c-2-2-2-4-2-6Z" fill="#FFC23D"{S}/>
<path d="M22 14h16M22 20h16" stroke="#E94B4B" stroke-width="3"/>''', ['носок', 'носки'], 'nk')

# ---------------------------------------------------------------- тело
D['hand'] = ('''<path d="M20 58c-6-6-10-14-10-20l2-6c2-2 5-1 6 2l2 6V12c0-2 2-4 4-4s4 2 4 4v18V8c0-2 2-4 4-4s4 2 4 4v22V10c0-2 2-4 4-4s4 2 4 4v22-14c0-2 2-4 4-4s4 2 4 4v22c0 12-6 22-16 26Z" fill="#FFD7B8"{S}/>''', ['рука', 'ладонь', 'кисть'], 'nk')

D['eye'] = ('''<path d="M4 32c8-12 18-18 28-18s20 6 28 18c-8 12-18 18-28 18S12 44 4 32Z" fill="#fff"{S}/>
<circle cx="32" cy="32" r="10" fill="#5AA9F0"{S}/><circle cx="32" cy="32" r="4.5" fill="#2B2D42"/><circle cx="35" cy="29" r="2" fill="#fff"/>''', ['глаз', 'глаза'], 'nk')

D['ear'] = ('''<path d="M22 22c0-10 6-16 14-16s14 6 14 16c0 8-6 10-8 16-2 8-4 18-14 18-6 0-10-4-10-8" fill="#FFD7B8"{S}/>
<path d="M28 24c0-5 3-8 8-8s8 4 8 8-4 6-6 8" fill="none"{S}/>''', ['ухо', 'уши'], 'nk')

D['nose'] = ('''<path d="M34 6c-2 12-4 20-10 30-4 6-2 12 4 12 2 4 8 4 10 0 6 0 8-6 4-12" fill="#FFD7B8"{S}/>
<circle cx="29" cy="46" r="2" fill="#C47A5A"/><circle cx="39" cy="46" r="2" fill="#C47A5A"/>''', ['нос'], 'nk')

D['mouth'] = ('''<path d="M6 30c8-6 16-8 26-4 10-4 18-2 26 4-8 12-16 16-26 16S14 42 6 30Z" fill="#E87A6A"{S}/>
<path d="M10 31c8 4 14 5 22 5s14-1 22-5" fill="none"{S}/>
<path d="M16 33c6 2 10 3 16 3s10-1 16-3v4c-6 2-10 3-16 3s-10-1-16-3Z" fill="#fff"/>''', ['рот', 'губы'], 'nk')

D['foot'] = ('''<path d="M22 8c-6 8-6 22-4 32 2 10 6 18 16 18s14-6 12-14c-2-10-10-12-12-22 0-6 2-10-2-14-3-3-7-3-10 0Z" fill="#FFD7B8"{S}/>''', ['нога', 'ступня', 'стопа'], 'nk')

D['tooth'] = ('''<path d="M18 10c6-4 10 0 14 0s8-4 14 0c6 4 4 14 2 20-2 8-2 24-6 24-4 0-4-14-10-14s-6 14-10 14-4-16-6-24c-2-6-4-16 2-20Z" fill="#fff"{S}/>''', ['зуб', 'зубы'], 'nk')

D['heart'] = ('''<path d="M32 56C14 44 6 34 6 22 6 14 12 8 20 8c5 0 9 3 12 7 3-4 7-7 12-7 8 0 14 6 14 14 0 12-8 22-26 34Z" fill="#E94B4B"{S}/>
<path d="M16 20c0-4 3-6 6-6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>''', ['сердце'], 'nk')

D['head'] = ('''<circle cx="32" cy="30" r="20" fill="#FFD7B8"{S}/>
<path d="M12 28c0-14 8-20 20-20s20 6 20 20c-6-6-12-8-20-8s-14 2-20 8Z" fill="#6F4E37"{S}/>
<circle cx="25" cy="32" r="2" fill="#2B2D42"/><circle cx="39" cy="32" r="2" fill="#2B2D42"/>
<path d="M27 40c3 2 7 2 10 0" fill="none" stroke="#2B2D42" stroke-width="2" stroke-linecap="round"/>''', ['голова', 'лицо'], 'nk')

D['hair'] = ('''<path d="M10 40C8 20 18 8 32 8s24 12 22 32c-2-6-6-10-10-12-2 4-8 6-12 6s-10-2-12-6c-4 2-8 6-10 12Z" fill="#6F4E37"{S}/>
<path d="M18 46c0-8 2-12 6-14M46 46c0-8-2-12-6-14" fill="none" stroke="#6F4E37" stroke-width="5" stroke-linecap="round"/>''', ['волосы'], 'nk')

# ---------------------------------------------------------------- люди
def person(skin, hair, cloth, hair_path, extra=''):
    return (f'<path d="M14 60c0-12 8-18 18-18s18 6 18 18" fill="{cloth}"{{S}}/>'
            f'<circle cx="32" cy="28" r="12" fill="{skin}"{{S}}/>'
            f'<path d="{hair_path}" fill="{hair}"{{S}}/>'
            '<circle cx="27.5" cy="29" r="1.8" fill="#2B2D42"/><circle cx="36.5" cy="29" r="1.8" fill="#2B2D42"/>'
            '<path d="M28.5 34c2 2 5 2 7 0" fill="none" stroke="#2B2D42" stroke-width="1.8" stroke-linecap="round"/>' + extra)

D['mother'] = (person('#FFD7B8', '#7A4A2A', '#8A6CF0', 'M18 34c-2-16 6-24 14-24s16 8 14 24c-3-2-4-6-4-10H22c0 4-1 8-4 10Z'), ['мама', 'мать'], 'nk')
D['father'] = (person('#F1C49B', '#3B2A1E', '#3E8EDE', 'M20 26c0-10 6-14 12-14s12 4 12 14c-4-3-8-4-12-4s-8 1-12 4Z',
               '<path d="M27 38c3 2 7 2 10 0" fill="none" stroke="#3B2A1E" stroke-width="2.4" stroke-linecap="round"/>'), ['папа', 'отец'], 'nk')
D['grandmother'] = (person('#FFD7B8', '#D9D9DE', '#C8956D', 'M20 28c0-10 6-16 12-16s12 6 12 16c-3-3-7-6-12-6s-9 3-12 6ZM28 12c0-4 8-4 8 0',
                    '<circle cx="27.5" cy="29" r="4" fill="none" stroke="#2B2D42" stroke-width="1.4"/><circle cx="36.5" cy="29" r="4" fill="none" stroke="#2B2D42" stroke-width="1.4"/>'), ['бабушка'], 'nk')
D['grandfather'] = (person('#F1C49B', '#D9D9DE', '#6F8F5A', 'M21 22c2-6 6-8 11-8s9 2 11 8c-3-1-6-2-11-2s-8 1-11 2Z',
                    '<path d="M24 36c2 6 6 8 8 8s6-2 8-8c-3 2-5 2-8 2s-5 0-8-2Z" fill="#E3E6EA" stroke="#2B2D42" stroke-width="1.6"/>'), ['дедушка'], 'nk')
D['baby'] = ('''<circle cx="32" cy="30" r="16" fill="#FFE0C7"{S}/>
<path d="M30 14c0-4 4-6 6-4" fill="none"{S}/>
<circle cx="26" cy="30" r="2" fill="#2B2D42"/><circle cx="38" cy="30" r="2" fill="#2B2D42"/>
<ellipse cx="22" cy="35" rx="2.4" ry="1.4" fill="#FF9F9F"/><ellipse cx="42" cy="35" rx="2.4" ry="1.4" fill="#FF9F9F"/>
<circle cx="32" cy="38" r="3" fill="#7CC0F5"{S}/><path d="M16 58c2-8 8-12 16-12s14 4 16 12" fill="#BFE0FF"{S}/>''', ['малыш', 'младенец', 'ребёнок', 'ребенок'], 'nk')
D['boy'] = (person('#F1C49B', '#3B2A1E', '#45B36B', 'M20 26c0-10 6-15 12-15s12 5 12 15c-2-4-6-7-12-7s-10 3-12 7Z'), ['мальчик', 'сын'], 'nk')
D['girl'] = (person('#FFD7B8', '#E6A15A', '#FF8FB1', 'M20 28c0-10 6-16 12-16s12 6 12 16c-3-4-6-6-12-6s-9 2-12 6ZM18 26c-4 4-4 10 0 12M46 26c4 4 4 10 0 12'), ['девочка', 'дочь', 'дочка'], 'nk')
D['brother'] = (person('#F1C49B', '#6F4E37', '#5AA9F0', 'M20 26c0-10 6-15 12-15s12 5 12 15c-2-4-6-7-12-7s-10 3-12 7Z'), ['брат'], 'nk')
D['sister'] = (person('#FFD7B8', '#3B2A1E', '#FFC23D', 'M18 34c-2-16 6-24 14-24s16 8 14 24c-3-2-4-6-4-10H22c0 4-1 8-4 10Z'), ['сестра'], 'nk')
D['friend'] = ('''<path d="M4 60c0-10 6-15 14-15s14 5 14 15" fill="#5AA9F0"{S}/><circle cx="18" cy="32" r="10" fill="#F1C49B"{S}/>
<path d="M32 60c0-10 6-15 14-15s14 5 14 15" fill="#FF8FB1"{S}/><circle cx="46" cy="32" r="10" fill="#FFD7B8"{S}/>
<circle cx="15" cy="32" r="1.5" fill="#2B2D42"/><circle cx="21" cy="32" r="1.5" fill="#2B2D42"/><circle cx="43" cy="32" r="1.5" fill="#2B2D42"/><circle cx="49" cy="32" r="1.5" fill="#2B2D42"/>
<path d="M15 36c2 1.5 4 1.5 6 0M43 36c2 1.5 4 1.5 6 0" fill="none" stroke="#2B2D42" stroke-width="1.6" stroke-linecap="round"/>
<path d="M28 52l8 0" stroke="#2B2D42" stroke-width="2.4" stroke-linecap="round"/>''', ['друг', 'подруга', 'друзья'], 'nk')
D['doctor'] = (person('#F1C49B', '#3B2A1E', '#fff', 'M20 26c0-10 6-14 12-14s12 4 12 14c-4-3-8-4-12-4s-8 1-12 4Z',
               '<path d="M26 44c0 6 2 8 6 8M38 44v6" fill="none" stroke="#3E8EDE" stroke-width="2"/><circle cx="38" cy="52" r="2.4" fill="#3E8EDE"/><path d="M44 50h6M47 47v6" stroke="#E94B4B" stroke-width="2.4"/>'), ['врач', 'доктор'], 'n')
D['teacher'] = (person('#FFD7B8', '#7A4A2A', '#45B36B', 'M18 34c-2-16 6-24 14-24s16 8 14 24c-3-2-4-6-4-10H22c0 4-1 8-4 10Z',
                '<circle cx="27.5" cy="29" r="4" fill="none" stroke="#2B2D42" stroke-width="1.4"/><circle cx="36.5" cy="29" r="4" fill="none" stroke="#2B2D42" stroke-width="1.4"/><path d="M48 20l12-8" stroke="#8B5A3C" stroke-width="2.4" stroke-linecap="round"/>'), ['учитель', 'учительница', 'преподаватель'], 'n')

# ---------------------------------------------------------------- места
D['school'] = ('''<path d="M8 28h48v28H8Z" fill="#FFE2A8"{S}/><path d="M4 30 32 12l28 18" fill="#E94B4B"{S}/>
<path d="M28 56V44h8v12" fill="#9C6B45"{S}/>
<rect x="13" y="34" width="8" height="7" rx="1" fill="#BFE0FF" stroke="#2B2D42" stroke-width="2"/><rect x="43" y="34" width="8" height="7" rx="1" fill="#BFE0FF" stroke="#2B2D42" stroke-width="2"/>
<circle cx="32" cy="26" r="4" fill="#fff"{S}/><path d="M32 4v8M32 4h8v4h-8" fill="#45B36B" stroke="#2B2D42" stroke-width="1.8"/>''', ['школа'], 'nk')
D['hospital'] = ('''<path d="M10 16h44v40H10Z" fill="#fff"{S}/><path d="M26 22h12v8h8v12h-8v8H26v-8h-8V30h8Z" fill="#E94B4B"{S}/>''', ['больница', 'поликлиника'], 'n')
D['shop'] = ('''<path d="M8 28h48v28H8Z" fill="#fff"{S}/>
<path d="M6 18h52l-2 10c-2 4-8 4-10 0-2 4-8 4-10 0-2 4-8 4-10 0-2 4-8 4-10 0-2 4-8 4-10 0Z" fill="#45B36B"{S}/>
<path d="M14 36h14v20H14Z" fill="#9C6B45"{S}/><rect x="34" y="36" width="16" height="12" rx="1" fill="#BFE0FF" stroke="#2B2D42" stroke-width="2"/>''', ['магазин', 'лавка'], 'n')
D['city'] = ('''<path d="M4 58V30h14v28M18 58V14h16v44M34 58V24h12v34M46 58V36h14v22" fill="#C9D6E3"{S}/>
<g fill="#FFE07A"><rect x="8" y="36" width="4" height="4"/><rect x="22" y="20" width="4" height="4"/><rect x="28" y="28" width="4" height="4"/><rect x="22" y="36" width="4" height="4"/><rect x="38" y="30" width="4" height="4"/><rect x="50" y="42" width="4" height="4"/></g>''', ['город'], 'n')
D['bridge'] = ('''<path d="M4 34h56v6H4Z" fill="#C8956D"{S}/><path d="M10 40v18M54 40v18" fill="none"{S}/>
<path d="M10 34c8-14 36-14 44 0" fill="none" stroke="#E94B4B" stroke-width="3"/>
<path d="M4 58c4-2 8-2 12 0s8 2 12 0 8-2 12 0 8 2 12 0" fill="none" stroke="#5AA9F0" stroke-width="2.4" stroke-linecap="round"/>''', ['мост'], 'n')
D['money'] = ('''<rect x="6" y="16" width="52" height="30" rx="4" fill="#9BD39A"{S}/>
<circle cx="32" cy="31" r="8" fill="#6CC56B"{S}/><path d="M12 22h6M46 40h6" stroke="#2E7D32" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="46" cy="50" r="8" fill="#FFC23D"{S}/>''', ['деньги'], 'n')
D['gift'] = ('''<path d="M10 26h44v10H10Z" fill="#E94B4B"{S}/><path d="M14 36h36v20H14Z" fill="#FF6F6F"{S}/>
<path d="M32 26v30" stroke="#FFC23D" stroke-width="5"/><path d="M32 26c-6-10-16-10-14-2 2 4 10 2 14 2Zm0 0c6-10 16-10 14-2-2 4-10 2-14 2Z" fill="#FFC23D"{S}/>''', ['подарок'], 'nk')
D['letter'] = ('''<rect x="6" y="14" width="52" height="36" rx="3" fill="#fff"{S}/><path d="M6 16l26 20 26-20" fill="none"{S}/>''', ['письмо', 'конверт'], 'n')
D['map'] = ('''<path d="M6 14l16-6 20 6 16-6v42l-16 6-20-6-16 6Z" fill="#FFF1C9"{S}/><path d="M22 8v42M42 14v42" fill="none"{S}/>
<path d="M30 30c0-4 6-4 6 0s-3 6-3 6-3-2-3-6Z" fill="#E94B4B" stroke="#2B2D42" stroke-width="1.6"/>''', ['карта'], 'n')
D['ticket'] = ('''<path d="M6 20h52v8a4 4 0 0 0 0 8v8H6v-8a4 4 0 0 0 0-8Z" fill="#FFC23D"{S}/><path d="M40 20v24" stroke="#2B2D42" stroke-width="2" stroke-dasharray="3 3"/>''', ['билет'], 'n')
