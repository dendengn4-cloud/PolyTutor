// Разделы, которые зависят от изучаемого языка.
//   MORPH          — «Формы глагола» и «Формы существительного» — включено (формы строит scripts/langs/tr/tr_forms.py);
//   GRAMMAR_FORMS  — блок «Как образуется» в темах грамматики (grammar-forms.js) — включено;
//   DIALOGS        — раздел «Диалоги» (data/tr/source/dialogs.json) — включено;
//   COLLOQUIAL     — разговорная лексика и настройка «Сначала разговорные формы» — включено;
//   CIVICS_EXAM    — пробный экзамен на гражданство: в Турции такого экзамена нет — выключено.
export const FEATURES = {
  MORPH: true,
  GRAMMAR_FORMS: true,
  DIALOGS: true,
  COLLOQUIAL: true,
  CIVICS_EXAM: false,
};
