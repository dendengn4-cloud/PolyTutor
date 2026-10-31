# Рисунки к словам, часть 1: животные, еда. Поле 64×64, контур — {S} (тёмная линия 2.4), тонкая — {T}.
# ключ: (рисунок, [русские значения], тег)  тег: n — существительное, v — глагол, a — прилагательное; k — в детском наборе
D = {}

D['cat'] = ('''<path d="M44 52c9 0 12-6 9-11" fill="none"{S}/>
<ellipse cx="32" cy="46" rx="14" ry="12" fill="#F4A259"{S}/>
<path d="M20 22 18 9l9 6M44 22l2-13-9 6" fill="#F4A259"{S}/>
<circle cx="32" cy="27" r="13" fill="#F4A259"{S}/>
<path d="M27 16c2 3 8 3 10 0" fill="none" stroke="#D97C2B" stroke-width="2.2" stroke-linecap="round"/>
<circle cx="27" cy="27" r="2.3" fill="#2B2D42"/><circle cx="37" cy="27" r="2.3" fill="#2B2D42"/>
<path d="M30.5 31h3l-1.5 1.7Z" fill="#E87A6A"/>
<path d="M22 31h-6M22 33.5l-5 2M42 31h6M42 33.5l5 2"{T}/>
<ellipse cx="32" cy="49" rx="7" ry="6" fill="#FFE2C2"/>''', ['кошка', 'кот', 'котёнок', 'котенок'], 'nk')

D['dog'] = ('''<ellipse cx="32" cy="50" rx="15" ry="9" fill="#C8956D"{S}/>
<circle cx="32" cy="30" r="15" fill="#E2B88E"{S}/>
<path d="M18 22c-6 2-8 12-4 17 3 1 6-3 6-8" fill="#9C6B45"{S}/>
<path d="M46 22c6 2 8 12 4 17-3 1-6-3-6-8" fill="#9C6B45"{S}/>
<ellipse cx="32" cy="37" rx="8" ry="6" fill="#FFF3E4" stroke="#2B2D42" stroke-width="2"/>
<ellipse cx="32" cy="34.5" rx="3.2" ry="2.3" fill="#2B2D42"/>
<circle cx="26" cy="27" r="2.3" fill="#2B2D42"/><circle cx="38" cy="27" r="2.3" fill="#2B2D42"/>
<path d="M32 37v3M29 41c2 1.5 4 1.5 6 0" fill="none" stroke="#2B2D42" stroke-width="1.8" stroke-linecap="round"/>''', ['собака', 'пёс', 'пес', 'щенок'], 'nk')

D['bird'] = ('''<path d="M14 34 4 30l8 8" fill="#3E8EDE"{S}/>
<circle cx="32" cy="34" r="17" fill="#5AA9F0"{S}/>
<ellipse cx="35" cy="41" rx="10" ry="8" fill="#DDEFFF"/>
<path d="M20 34c4-6 12-6 14 2-6 4-11 3-14-2Z" fill="#3E8EDE"{S}/>
<path d="M48 28 57 31 48 35Z" fill="#FFC23D"{S}/>
<circle cx="41" cy="27" r="2.4" fill="#2B2D42"/>
<path d="M28 51v5M36 51v5M25 56h6M33 56h6" stroke="#F2A33A" stroke-width="2.4" stroke-linecap="round"/>''', ['птица', 'птичка', 'воробей'], 'nk')

D['fish'] = ('''<path d="M46 32 58 22v20Z" fill="#FF8A5B"{S}/>
<ellipse cx="28" cy="32" rx="21" ry="14" fill="#FFA36C"{S}/>
<path d="M22 19c4 6 4 20 0 26" fill="none"{S}/>
<path d="M31 26c3 2 3 10 0 12M38 27c2 2 2 8 0 10" fill="none" stroke="#E0743E" stroke-width="2" stroke-linecap="round"/>
<circle cx="14" cy="29" r="2.6" fill="#2B2D42"/>
<path d="M9 36c2 1 4 1 5 0" fill="none" stroke="#2B2D42" stroke-width="1.8" stroke-linecap="round"/>''', ['рыба', 'рыбка'], 'nk')

D['horse'] = ('''<path d="M18 58V40c0-10 6-20 14-24l4-8 4 9c6 3 10 9 10 15l-3 3-9-4-4 6v21Z" fill="#B5764A"{S}/>
<path d="M33 9c-6 4-10 10-12 18" fill="none" stroke="#5A3A22" stroke-width="4" stroke-linecap="round"/>
<circle cx="41" cy="24" r="2.2" fill="#2B2D42"/>
<path d="M45 32c2 0 3-1 3-2" fill="none" stroke="#2B2D42" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="47.5" cy="30.5" r="1" fill="#2B2D42"/>''', ['лошадь', 'конь'], 'nk')

D['cow'] = ('''<path d="M12 22c-4-1-6 1-6 4 4 1 7 0 9-2M52 22c4-1 6 1 6 4-4 1-7 0-9-2" fill="#fff"{S}/>
<path d="M22 14c-2-4 0-7 3-7M42 14c2-4 0-7-3-7" fill="none" stroke="#C9A36B" stroke-width="3" stroke-linecap="round"/>
<path d="M14 26c0-9 8-14 18-14s18 5 18 14v10c0 12-8 20-18 20s-18-8-18-20Z" fill="#fff"{S}/>
<path d="M17 24c3-6 8-6 9 0-2 5-7 5-9 0Z M41 30c4-3 7 0 6 4-3 2-6 0-6-4Z" fill="#2B2D42"/>
<ellipse cx="32" cy="45" rx="12" ry="9" fill="#F7B7C0"{S}/>
<circle cx="27" cy="45" r="2" fill="#2B2D42"/><circle cx="37" cy="45" r="2" fill="#2B2D42"/>
<circle cx="25" cy="31" r="2.3" fill="#fff"/><circle cx="25" cy="31" r="1.6" fill="#2B2D42"/><circle cx="39" cy="31" r="2.3" fill="#2B2D42"/>''', ['корова'], 'nk')

D['sheep'] = ('''<path d="M14 36c-6-2-6-10 0-12 0-7 8-9 11-5 3-5 11-5 14 0 3-4 11-2 11 5 6 2 6 10 0 12 1 7-7 10-11 6-3 4-11 4-14 0-4 4-12 1-11-6Z" fill="#fff"{S}/>
<ellipse cx="32" cy="34" rx="8" ry="10" fill="#4A4A55"{S}/>
<circle cx="29" cy="32" r="1.6" fill="#fff"/><circle cx="35" cy="32" r="1.6" fill="#fff"/>
<path d="M23 30l-5 2M41 30l5 2" stroke="#4A4A55" stroke-width="3" stroke-linecap="round"/>
<path d="M24 50v7M40 50v7" stroke="#4A4A55" stroke-width="3" stroke-linecap="round"/>''', ['овца', 'баран', 'ягнёнок', 'ягненок'], 'nk')

D['chicken'] = ('''<path d="M44 20c-2-5 2-9 4-6 1-4 6-3 5 1 3 0 3 4 0 5" fill="#E94B4B"{S}/>
<path d="M18 30c0 14 8 24 20 24 9 0 14-6 14-14V28c0-6-4-10-9-10s-9 4-9 9v6c-4-4-10-6-16-3Z" fill="#fff"{S}/>
<path d="M52 30l7 3-7 3Z" fill="#FFC23D"{S}/>
<path d="M51 36c2 3 1 6-1 6" fill="#E94B4B"{S}/>
<circle cx="46" cy="28" r="2" fill="#2B2D42"/>
<path d="M24 38c4 4 10 4 13 0" fill="none" stroke="#C9CFD8" stroke-width="2.2" stroke-linecap="round"/>
<path d="M32 54v5M40 54v5" stroke="#F2A33A" stroke-width="2.4" stroke-linecap="round"/>''', ['курица', 'петух', 'цыплёнок', 'цыпленок'], 'nk')

D['mouse'] = ('''<path d="M48 46c8 0 10 6 4 9" fill="none"{S}/>
<circle cx="16" cy="24" r="8" fill="#C9CFD8"{S}/><circle cx="16" cy="24" r="4" fill="#F7B7C0"/>
<path d="M12 46c0-12 8-20 20-20 10 0 18 8 18 20Z" fill="#C9CFD8"{S}/>
<circle cx="34" cy="24" r="8" fill="#C9CFD8"{S}/><circle cx="34" cy="24" r="4" fill="#F7B7C0"/>
<circle cx="20" cy="37" r="2" fill="#2B2D42"/><circle cx="12.5" cy="44" r="2" fill="#F7B7C0" stroke="#2B2D42" stroke-width="1.6"/>''', ['мышь', 'мышка'], 'nk')

D['rabbit'] = ('''<path d="M24 26c-4-10-4-20 1-21s6 10 5 20M40 26c4-10 4-20-1-21s-6 10-5 20" fill="#fff"{S}/>
<path d="M26 22c-2-6-2-12 0-13M38 22c2-6 2-12 0-13" fill="none" stroke="#F7B7C0" stroke-width="2.4" stroke-linecap="round"/>
<ellipse cx="32" cy="48" rx="14" ry="11" fill="#fff"{S}/>
<circle cx="32" cy="32" r="12" fill="#fff"{S}/>
<circle cx="27.5" cy="31" r="2" fill="#2B2D42"/><circle cx="36.5" cy="31" r="2" fill="#2B2D42"/>
<path d="M30.5 35.5h3l-1.5 1.6Z" fill="#E87A6A"/>''', ['заяц', 'кролик'], 'nk')

D['bear'] = ('''<circle cx="18" cy="18" r="7" fill="#8B5A3C"{S}/><circle cx="46" cy="18" r="7" fill="#8B5A3C"{S}/>
<circle cx="32" cy="34" r="20" fill="#A86D47"{S}/>
<ellipse cx="32" cy="41" rx="9" ry="7" fill="#E2B88E"{S}/>
<ellipse cx="32" cy="38" rx="3.4" ry="2.4" fill="#2B2D42"/>
<circle cx="25" cy="29" r="2.3" fill="#2B2D42"/><circle cx="39" cy="29" r="2.3" fill="#2B2D42"/>
<path d="M29 44c2 1.5 4 1.5 6 0" fill="none" stroke="#2B2D42" stroke-width="1.8" stroke-linecap="round"/>''', ['медведь', 'мишка'], 'nk')

D['lion'] = ('''<path d="M32 6l5 6 7-3 1 7 7 1-2 7 6 4-5 5 4 6-7 2 0 7-7-1-3 7-6-4-6 4-3-7-7 1v-7l-7-2 4-6-5-5 6-4-2-7 7-1 1-7 7 3Z" fill="#E08A2E"{S}/>
<circle cx="32" cy="33" r="15" fill="#FFC86B"{S}/>
<circle cx="26" cy="30" r="2.2" fill="#2B2D42"/><circle cx="38" cy="30" r="2.2" fill="#2B2D42"/>
<path d="M29 36h6l-3 3Z" fill="#2B2D42"/>
<path d="M32 39v3M28 42c2 2 6 2 8 0" fill="none" stroke="#2B2D42" stroke-width="1.8" stroke-linecap="round"/>''', ['лев'], 'nk')

D['elephant'] = ('''<path d="M12 50V32c0-12 9-20 20-20s20 8 20 20v18h-8v-8H40v8h-8v-8h-4v8h-8Z" fill="#A9B4C2"{S}/>
<path d="M12 30c-6 2-8 10-4 16 4-1 6-4 6-8" fill="#C3CCD6"{S}/>
<path d="M44 26c0 10 4 16 10 18 3 1 5-1 4-3-4-2-6-6-6-12" fill="#A9B4C2"{S}/>
<circle cx="36" cy="24" r="2.3" fill="#2B2D42"/>
<path d="M22 22c-5 2-6 10-2 13 4 1 7-3 7-8" fill="#C3CCD6"{S}/>''', ['слон'], 'nk')

D['monkey'] = ('''<circle cx="13" cy="30" r="7" fill="#C8956D"{S}/><circle cx="51" cy="30" r="7" fill="#C8956D"{S}/>
<circle cx="32" cy="30" r="18" fill="#8B5A3C"{S}/>
<path d="M20 34c0-8 5-12 12-8 7-4 12 0 12 8 0 9-6 14-12 14s-12-5-12-14Z" fill="#E8C29A"{S}/>
<circle cx="27" cy="31" r="2.2" fill="#2B2D42"/><circle cx="37" cy="31" r="2.2" fill="#2B2D42"/>
<path d="M28 41c2 2 6 2 8 0" fill="none" stroke="#2B2D42" stroke-width="2" stroke-linecap="round"/>''', ['обезьяна'], 'nk')

D['duck'] = ('''<path d="M10 40c4 12 14 16 26 16 12 0 20-6 20-16-6 2-12 0-16-4-2 6-8 8-14 6-6-2-10-4-16-2Z" fill="#FFD84D"{S}/>
<circle cx="40" cy="24" r="10" fill="#FFD84D"{S}/>
<path d="M49 25c4 0 8 1 9 3-3 2-7 2-10 1" fill="#F28C28"{S}/>
<circle cx="42" cy="22" r="2" fill="#2B2D42"/>
<path d="M20 44c6 3 12 3 16 0" fill="none" stroke="#E6B800" stroke-width="2.2" stroke-linecap="round"/>''', ['утка', 'утёнок', 'утенок'], 'nk')

D['pig'] = ('''<path d="M16 18l-2-8 9 4M48 18l2-8-9 4" fill="#F7A8B8"{S}/>
<circle cx="32" cy="34" r="20" fill="#FBC1CC"{S}/>
<ellipse cx="32" cy="40" rx="9" ry="6.5" fill="#F7A8B8"{S}/>
<ellipse cx="29" cy="40" rx="1.6" ry="2.2" fill="#2B2D42"/><ellipse cx="35" cy="40" rx="1.6" ry="2.2" fill="#2B2D42"/>
<circle cx="25" cy="29" r="2.2" fill="#2B2D42"/><circle cx="39" cy="29" r="2.2" fill="#2B2D42"/>''', ['свинья', 'поросёнок', 'поросенок'], 'nk')

D['frog'] = ('''<circle cx="21" cy="20" r="8" fill="#6CC56B"{S}/><circle cx="43" cy="20" r="8" fill="#6CC56B"{S}/>
<circle cx="21" cy="20" r="3" fill="#2B2D42"/><circle cx="43" cy="20" r="3" fill="#2B2D42"/>
<path d="M8 40c0-12 10-18 24-18s24 6 24 18c0 10-10 16-24 16S8 50 8 40Z" fill="#6CC56B"{S}/>
<path d="M20 40c6 5 18 5 24 0" fill="none"{S}/>
<ellipse cx="18" cy="35" rx="3" ry="1.8" fill="#F7A8B8"/><ellipse cx="46" cy="35" rx="3" ry="1.8" fill="#F7A8B8"/>''', ['лягушка'], 'nk')

D['butterfly'] = ('''<path d="M31 30c-8-16-24-16-24-4 0 8 10 10 24 6ZM33 30c8-16 24-16 24-4 0 8-10 10-24 6Z" fill="#B48CF0"{S}/>
<path d="M31 34c-12 0-20 4-18 12 2 6 12 4 18-8ZM33 34c12 0 20 4 18 12-2 6-12 4-18-8Z" fill="#FF9FB5"{S}/>
<rect x="30" y="22" width="4" height="24" rx="2" fill="#2B2D42"/>
<path d="M31 22c-2-4-5-6-8-6M33 22c2-4 5-6 8-6" fill="none" stroke="#2B2D42" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="18" cy="24" r="3" fill="#fff" opacity=".7"/><circle cx="46" cy="24" r="3" fill="#fff" opacity=".7"/>''', ['бабочка'], 'nk')

D['bee'] = ('''<ellipse cx="22" cy="20" rx="9" ry="7" fill="#DDEFFF"{S}/><ellipse cx="38" cy="18" rx="9" ry="7" fill="#DDEFFF"{S}/>
<ellipse cx="30" cy="36" rx="18" ry="13" fill="#FFC23D"{S}/>
<path d="M24 24c-3 7-3 17 0 24M34 23c-3 8-3 18 0 26" fill="none" stroke="#2B2D42" stroke-width="4"/>
<path d="M48 36l7 0" stroke="#2B2D42" stroke-width="2.4" stroke-linecap="round"/>
<circle cx="15" cy="33" r="2.2" fill="#2B2D42"/>''', ['пчела'], 'nk')

D['goat'] = ('''<path d="M22 16c-6-6-12-4-12 2M42 16c6-6 12-4 12 2" fill="none" stroke="#9C8B74" stroke-width="3.4" stroke-linecap="round"/>
<path d="M18 22c0-6 6-10 14-10s14 4 14 10l-2 18c-1 8-6 12-12 12s-11-4-12-12Z" fill="#F1ECE2"{S}/>
<path d="M12 26c-4 0-6 3-5 5 3 0 6-1 8-3M52 26c4 0 6 3 5 5-3 0-6-1-8-3" fill="#F1ECE2"{S}/>
<path d="M28 52c1 5 3 8 4 8s3-3 4-8" fill="#F1ECE2"{S}/>
<circle cx="26" cy="28" r="2.2" fill="#2B2D42"/><circle cx="38" cy="28" r="2.2" fill="#2B2D42"/>
<ellipse cx="32" cy="42" rx="5" ry="3" fill="#F7B7C0"/>''', ['коза', 'козёл', 'козел'], 'nk')

# ---------------------------------------------------------------- еда
D['apple'] = ('''<path d="M32 18c-6-5-20-4-21 12-1 14 9 26 17 26 2 0 3-1 4-1s2 1 4 1c8 0 18-12 17-26-1-16-15-17-21-12Z" fill="#E94B4B"{S}/>
<path d="M32 18c0-5 1-8 4-11" fill="none" stroke="#2B2D42" stroke-width="2.6" stroke-linecap="round"/>
<path d="M35 13c4-6 11-6 14-3-3 5-10 6-14 3Z" fill="#45B36B"{S}/>
<path d="M19 28c1-4 4-6 7-6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>''', ['яблоко'], 'nk')

D['pear'] = ('''<path d="M32 14c-5 0-8 5-8 11 0 5-10 9-10 19 0 8 8 14 18 14s18-6 18-14c0-10-10-14-10-19 0-6-3-11-8-11Z" fill="#C5D94E"{S}/>
<path d="M32 14c0-4 1-6 3-8" fill="none" stroke="#2B2D42" stroke-width="2.6" stroke-linecap="round"/>
<path d="M34 11c4-4 9-3 11 0-3 3-8 3-11 0Z" fill="#45B36B"{S}/>
<path d="M22 40c0-4 2-7 4-8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>''', ['груша'], 'nk')

D['banana'] = ('''<path d="M14 18c-2 18 8 34 30 36 6 0 10-2 12-5-14 0-28-8-34-31Z" fill="#FFD84D"{S}/>
<path d="M14 18c-1-4 0-7 2-8l4 2c-1 3-1 6 2 6" fill="#9C8B3C"{S}/>
<path d="M22 22c4 14 14 24 28 27" fill="none" stroke="#E6B800" stroke-width="2" stroke-linecap="round"/>''', ['банан'], 'nk')

D['orange'] = ('''<circle cx="32" cy="36" r="20" fill="#FF9A2E"{S}/>
<path d="M32 16c0-3 1-5 3-6" fill="none" stroke="#2B2D42" stroke-width="2.4" stroke-linecap="round"/>
<path d="M34 14c4-5 10-4 12-1-3 4-9 4-12 1Z" fill="#45B36B"{S}/>
<circle cx="24" cy="30" r="1.1" fill="#E07A10"/><circle cx="38" cy="42" r="1.1" fill="#E07A10"/><circle cx="30" cy="46" r="1.1" fill="#E07A10"/><circle cx="40" cy="30" r="1.1" fill="#E07A10"/>
<path d="M20 34c1-5 4-8 8-9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>''', ['апельсин'], 'nk')

D['lemon'] = ('''<path d="M8 34c4-2 6-6 10-9 8-6 20-6 28 0 4 3 6 7 10 9-4 2-6 6-10 9-8 6-20 6-28 0-4-3-6-7-10-9Z" fill="#FFE14D"{S}/>
<path d="M20 30c2-3 5-5 9-6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>
<path d="M40 22c3-5 9-6 12-3-3 4-8 5-12 3Z" fill="#45B36B"{S}/>''', ['лимон'], 'nk')

D['grapes'] = ('''<path d="M32 12c0-4 2-6 4-7" fill="none" stroke="#2B2D42" stroke-width="2.4" stroke-linecap="round"/>
<path d="M34 10c5-4 11-2 12 2-4 3-9 2-12-2Z" fill="#45B36B"{S}/>
<g fill="#8E5BD1" stroke="#2B2D42" stroke-width="2"><circle cx="24" cy="20" r="6"/><circle cx="36" cy="20" r="6"/><circle cx="30" cy="30" r="6"/><circle cx="18" cy="30" r="6"/><circle cx="42" cy="30" r="6"/><circle cx="24" cy="40" r="6"/><circle cx="36" cy="40" r="6"/><circle cx="30" cy="50" r="6"/></g>''', ['виноград'], 'nk')

D['strawberry'] = ('''<path d="M32 58C18 50 12 38 14 28c1-6 8-8 18-8s17 2 18 8c2 10-4 22-18 30Z" fill="#E94B4B"{S}/>
<path d="M20 20l6 2 6-6 6 6 6-2-2 6H22Z" fill="#45B36B"{S}/>
<g fill="#FFE2A8"><ellipse cx="24" cy="32" rx="1.2" ry="1.8"/><ellipse cx="32" cy="30" rx="1.2" ry="1.8"/><ellipse cx="40" cy="32" rx="1.2" ry="1.8"/><ellipse cx="28" cy="40" rx="1.2" ry="1.8"/><ellipse cx="36" cy="40" rx="1.2" ry="1.8"/><ellipse cx="32" cy="48" rx="1.2" ry="1.8"/></g>''', ['клубника', 'земляника'], 'nk')

D['watermelon'] = ('''<path d="M6 26h52c0 15-12 28-26 28S6 41 6 26Z" fill="#2FAE6A"{S}/>
<path d="M10 26h44c0 12-10 23-22 23S10 38 10 26Z" fill="#FF6B6B"/>
<g fill="#2B2D42"><ellipse cx="22" cy="33" rx="1.3" ry="2"/><ellipse cx="32" cy="38" rx="1.3" ry="2"/><ellipse cx="42" cy="33" rx="1.3" ry="2"/><ellipse cx="27" cy="42" rx="1.3" ry="2"/><ellipse cx="37" cy="42" rx="1.3" ry="2"/></g>
<path d="M6 26h52" fill="none"{S}/>''', ['арбуз'], 'nk')

D['cherry'] = ('''<path d="M22 40c4-14 10-24 22-30M42 42c-2-12-1-22 2-32" fill="none" stroke="#5A8A3A" stroke-width="2.6" stroke-linecap="round"/>
<path d="M44 10c5-3 11-1 12 3-5 2-10 1-12-3Z" fill="#45B36B"{S}/>
<circle cx="20" cy="46" r="10" fill="#C8102E"{S}/><circle cx="42" cy="48" r="10" fill="#C8102E"{S}/>
<circle cx="17" cy="43" r="2.4" fill="#fff" opacity=".6"/><circle cx="39" cy="45" r="2.4" fill="#fff" opacity=".6"/>''', ['вишня', 'черешня'], 'nk')

D['tomato'] = ('''<circle cx="32" cy="36" r="20" fill="#F0453A"{S}/>
<path d="M22 18l6 4 4-6 4 6 6-4-2 7-8 2-8-2Z" fill="#45B36B"{S}/>
<path d="M20 32c1-5 4-8 8-9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>''', ['помидор', 'томат'], 'nk')

D['cucumber'] = ('''<path d="M10 46C8 38 16 24 34 14c10-5 20-3 20 3 0 8-10 20-26 30-8 5-16 6-18-1Z" fill="#4CAF50"{S}/>
<g fill="#2E7D32"><circle cx="20" cy="38" r="1.3"/><circle cx="30" cy="30" r="1.3"/><circle cx="40" cy="22" r="1.3"/><circle cx="26" cy="40" r="1.3"/><circle cx="36" cy="32" r="1.3"/><circle cx="46" cy="22" r="1.3"/></g>''', ['огурец'], 'nk')

D['carrot'] = ('''<path d="M44 14 14 52c-2 3 1 6 4 4L50 24Z" fill="#FF8A2E"{S}/>
<path d="M44 14c0-6 4-10 10-10-1 5-3 8-6 10 6-2 10 0 12 4-5 2-10 2-14 0" fill="#45B36B"{S}/>
<path d="M30 30l5 3M24 38l4 2M36 24l4 2" fill="none" stroke="#D96A12" stroke-width="2" stroke-linecap="round"/>''', ['морковь', 'морковка'], 'nk')

D['potato'] = ('''<path d="M12 34c-2-12 8-20 22-20 12 0 20 8 18 18-2 12-12 20-24 20-10 0-15-8-16-18Z" fill="#D9A866"{S}/>
<g fill="#A8783E"><circle cx="24" cy="28" r="1.6"/><circle cx="38" cy="26" r="1.6"/><circle cx="32" cy="40" r="1.6"/><circle cx="42" cy="38" r="1.6"/><circle cx="20" cy="40" r="1.6"/></g>''', ['картофель', 'картошка'], 'nk')

D['onion'] = ('''<path d="M32 12c4 8 18 14 18 28 0 10-8 16-18 16s-18-6-18-16c0-14 14-20 18-28Z" fill="#E6A15A"{S}/>
<path d="M32 12c-1-4 0-7 2-9M28 56c-1 2-1 4 0 5M36 56c1 2 1 4 0 5" fill="none"{S}/>
<path d="M32 20c-6 8-8 18-4 32M32 20c6 8 8 18 4 32" fill="none" stroke="#C47A30" stroke-width="2" stroke-linecap="round"/>''', ['лук', 'луковица'], 'n')

D['bread'] = ('''<path d="M8 30c0-10 10-16 24-16s24 6 24 16c0 3-2 5-4 5v15c0 3-2 5-5 5H17c-3 0-5-2-5-5V35c-2 0-4-2-4-5Z" fill="#D9A866"{S}/>
<path d="M20 26l5 6M29 24l5 6M38 24l5 6" fill="none" stroke="#A8783E" stroke-width="2.4" stroke-linecap="round"/>''', ['хлеб', 'батон'], 'nk')

D['cheese'] = ('''<path d="M6 30 44 14l14 16v20H6Z" fill="#FFD166"{S}/>
<path d="M6 30h52" fill="none"{S}/>
<g fill="#F2B33D" stroke="#2B2D42" stroke-width="1.6"><circle cx="18" cy="40" r="4"/><circle cx="34" cy="44" r="3"/><circle cx="46" cy="38" r="3.5"/><circle cx="38" cy="24" r="2.5"/></g>''', ['сыр'], 'nk')

D['egg'] = ('''<path d="M32 8c10 0 18 16 18 28 0 12-8 20-18 20s-18-8-18-20C14 24 22 8 32 8Z" fill="#FFF8EC"{S}/>
<path d="M22 28c1-6 4-11 8-13" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>''', ['яйцо', 'яйца'], 'nk')

D['milk'] = ('''<path d="M22 18h20v6l5 8v24H17V32l5-8Z" fill="#fff"{S}/>
<path d="M22 10h20v8H22Z" fill="#5AA9F0"{S}/>
<path d="M17 38h30v12H17Z" fill="#BFE0FF"/>
<path d="M24 44c2-2 4-2 6 0s4 2 6 0 4-2 6 0" fill="none" stroke="#3E8EDE" stroke-width="2" stroke-linecap="round"/>
<path d="M17 32v24h30V32" fill="none"{S}/>''', ['молоко'], 'nk')

D['water'] = ('''<path d="M16 12h32l-4 44H20Z" fill="#E8F4FF"{S}/>
<path d="M18.5 26h27l-2.5 30H21Z" fill="#7CC0F5"/>
<path d="M16 12h32l-4 44H20Z" fill="none"{S}/>
<path d="M24 32v14" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>''', ['вода', 'стакан воды'], 'nk')

D['tea'] = ('''<ellipse cx="32" cy="54" rx="20" ry="5" fill="#E94B4B"{S}/>
<path d="M22 14h20c0 6-4 9-4 15s5 9 5 15c0 5-5 8-11 8s-11-3-11-8c0-6 5-9 5-15s-4-9-4-15Z" fill="#fff"{S}/>
<path d="M25 24h14c-1 2-1.5 3-1.5 5 0 6 5 9 5 15 0 4-4 6-10.5 6S21 48 21 44c0-6 5-9 5-15 0-2-.5-3-1-5Z" fill="#C8452B"/>
<path d="M22 14h20c0 6-4 9-4 15s5 9 5 15c0 5-5 8-11 8s-11-3-11-8c0-6 5-9 5-15s-4-9-4-15Z" fill="none"{S}/>
<path d="M28 8c-2 2 2 3 0 5M36 7c-2 2 2 3 0 5" fill="none" stroke="#9AA4B2" stroke-width="1.8" stroke-linecap="round"/>''', ['чай'], 'nk')

D['coffee'] = ('''<path d="M12 22h34v18c0 9-7 16-16 16h-2c-9 0-16-7-16-16Z" fill="#fff"{S}/>
<path d="M46 26h4c4 0 6 3 6 6s-2 6-6 6h-4" fill="none"{S}/>
<path d="M14 26h30" fill="none" stroke="#6F4E37" stroke-width="5"/>
<path d="M24 8c-2 3 2 5 0 8M32 8c-2 3 2 5 0 8" fill="none" stroke="#9AA4B2" stroke-width="2" stroke-linecap="round"/>
<path d="M8 58h40" fill="none"{S}/>''', ['кофе'], 'nk')

D['cake'] = ('''<path d="M10 34h44v20H10Z" fill="#FFD9E0"{S}/>
<path d="M10 34c4 6 8 6 11 0 3 6 8 6 11 0 3 6 8 6 11 0 3 6 8 6 11 0" fill="#fff"{S}/>
<path d="M10 44h44" stroke="#E87A9A" stroke-width="3"/>
<rect x="30" y="18" width="4" height="14" rx="1" fill="#5AA9F0"{S}/>
<path d="M32 8c3 4 3 7 0 8-3-1-3-4 0-8Z" fill="#FFC23D"{S}/>''', ['торт', 'пирог', 'пирожное'], 'nk')

D['icecream'] = ('''<path d="M22 30h20L32 60Z" fill="#E8B26A"{S}/>
<path d="M26 34l10 10M38 34l-12 12" stroke="#C48A3E" stroke-width="1.8"/>
<circle cx="32" cy="22" r="12" fill="#FFB3C7"{S}/>
<path d="M22 28c3 3 6 1 8 3s6 2 8-1 4-1 5-2" fill="none" stroke="#2B2D42" stroke-width="2" stroke-linecap="round"/>
<circle cx="30" cy="10" r="3" fill="#E94B4B"{S}/>''', ['мороженое'], 'nk')

D['soup'] = ('''<path d="M8 30h48c0 13-10 22-24 22S8 43 8 30Z" fill="#fff"{S}/>
<ellipse cx="32" cy="30" rx="24" ry="5" fill="#F2A33A"{S}/>
<circle cx="24" cy="30" r="2" fill="#45B36B"/><circle cx="36" cy="29" r="2" fill="#FF8A2E"/>
<path d="M24 12c-2 3 2 5 0 8M32 10c-2 3 2 5 0 8M40 12c-2 3 2 5 0 8" fill="none" stroke="#9AA4B2" stroke-width="2" stroke-linecap="round"/>''', ['суп'], 'nk')

D['honey'] = ('''<path d="M18 20h28v4c4 4 6 10 6 16 0 10-8 16-20 16s-20-6-20-16c0-6 2-12 6-16Z" fill="#F2B233"{S}/>
<rect x="16" y="12" width="32" height="8" rx="2" fill="#C9A36B"{S}/>
<path d="M22 38h20" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>''', ['мёд', 'мед'], 'nk')

D['rice'] = ('''<path d="M8 32h48c0 12-10 20-24 20S8 44 8 32Z" fill="#5AA9F0"{S}/>
<path d="M12 32c2-10 10-16 20-16s18 6 20 16Z" fill="#fff"{S}/>
<g fill="#E3E6EA"><ellipse cx="24" cy="26" rx="2" ry="1"/><ellipse cx="32" cy="22" rx="2" ry="1"/><ellipse cx="40" cy="26" rx="2" ry="1"/><ellipse cx="30" cy="28" rx="2" ry="1"/></g>''', ['рис'], 'n')

D['meat'] = ('''<path d="M14 26c4-10 18-14 28-8 10 6 12 18 6 26-6 8-20 10-28 4-8-6-10-14-6-22Z" fill="#D9534F"{S}/>
<path d="M22 30c4-6 12-8 18-4 4 3 5 9 2 12" fill="none" stroke="#F7C6C0" stroke-width="3" stroke-linecap="round"/>
<path d="M44 44l8 8" stroke="#F1ECE2" stroke-width="6" stroke-linecap="round"/><circle cx="54" cy="54" r="4" fill="#F1ECE2"{S}/>''', ['мясо'], 'n')

D['salt'] = ('''<path d="M20 22h24l-2 34H22Z" fill="#fff"{S}/>
<path d="M20 22c0-8 5-12 12-12s12 4 12 12Z" fill="#C9CFD8"{S}/>
<g fill="#2B2D42"><circle cx="28" cy="16" r="1"/><circle cx="32" cy="14" r="1"/><circle cx="36" cy="16" r="1"/></g>''', ['соль'], 'n')

D['sugar'] = ('''<g fill="#fff" stroke="#2B2D42" stroke-width="2.2" stroke-linejoin="round"><path d="M10 34l14-6 14 6-14 6Z"/><path d="M10 34v14l14 6V40Z"/><path d="M38 34v14l-14 6V40Z"/><path d="M30 20l14-6 14 6-14 6Z"/><path d="M30 20v14l14 6V26Z"/><path d="M58 20v14l-14 6V26Z"/></g>''', ['сахар'], 'n')
