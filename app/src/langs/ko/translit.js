// Транскрипция корейского под словами и примерами (по произношению): при русском интерфейсе — кириллица по системе
// Концевича (안녕하세요 → аннёнхасеё), при английском и корейском — латиница Revised Romanization (annyeonghaseyo).
import { transcribe } from './hangul.js';

export function translitFor(text, uiLang) {
  if (!/[가-힣]/.test(String(text || ''))) return '';
  return transcribe(text, uiLang === 'ru' ? 'cyr' : 'lat');
}
