// Готовит приложение к сборке для одного языка:
//   app/src/langs/<code>/  →  app/src/lang/   (папка lang/ создаётся заново, в репозиторий не попадает)
//   + app/src/lang/info.js — описание языка и список всех включённых языков (для экрана «Языки»).
// Запуск: node scripts/use_lang.mjs <code> [путь к langs.json]
import { readFileSync, writeFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const code = process.argv[2];
const langsFile = process.argv[3] ? resolve(process.argv[3]) : join(ROOT, 'langs.json');
const { langs } = JSON.parse(readFileSync(langsFile, 'utf8'));

const lang = langs.find((l) => l.code === code);
if (!lang) {
  console.error(`Язык «${code}» не найден в ${langsFile}`);
  process.exit(1);
}
const src = join(ROOT, 'app', 'src', 'langs', code);
if (!existsSync(src)) {
  console.error(`Нет папки ${src}`);
  process.exit(1);
}
const dst = join(ROOT, 'app', 'src', 'lang');
rmSync(dst, { recursive: true, force: true });
cpSync(src, dst, { recursive: true });

const pick = (l) => ({ code: l.code, flag: l.flag, name: l.name });
const all = langs.filter((l) => l.enabled || l.code === code).map(pick);
writeFileSync(join(dst, 'info.js'),
  '// Создаётся scripts/use_lang.mjs — не редактировать.\n' +
  `export const LANG = ${JSON.stringify({ ...pick(lang), timezone: lang.timezone }, null, 2)};\n` +
  `export const LANGS = ${JSON.stringify(all, null, 2)};\n`);
console.log(`app/src/lang ← langs/${code}`);
