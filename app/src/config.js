// Настройки подключения. Всё подставляется при сборке из GitHub Variables (см. README, «Разовая настройка»):
//   SUPABASE_PROJECT_REF → адрес проекта, SUPABASE_PUBLISHABLE_KEY → публичный ключ, BOT_USERNAME → имя бота,
//   AUDIO_BASE → адрес папки с аудио (word_{id}.mp3, word_{id}_ex{n}.mp3); {lang} заменяется кодом языка,
//                например https://<логин>.github.io/audio-{lang}/audio/ → …/audio-hy/audio/.
import { LANG } from './lang/info.js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
export const SUPABASE_URL = env.VITE_SUPABASE_URL || '';
export const SUPABASE_KEY = env.VITE_SUPABASE_KEY || '';
export const BOT_USERNAME = (env.VITE_BOT_USERNAME || '').replace(/^@/, '');
export const AUDIO_BASE = env.VITE_AUDIO_BASE ? env.VITE_AUDIO_BASE.replaceAll('{lang}', LANG.code).replace(/\/?$/, '/') : '';
// Раздел базы (schema) изучаемого языка: все запросы к базе идут в него
export const DB_SCHEMA = LANG.code;
