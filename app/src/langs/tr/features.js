// Разделы, которые зависят от изучаемого языка.
//   MORPH          — «Формы глагола» и «Формы существительного» — пока выключено (таблицы турецких форм — следующий шаг);
//   GRAMMAR_FORMS  — блок «Как образуется» в темах грамматики (grammar-forms.js) — включено;
//   DIALOGS        — раздел «Диалоги» (data/tr/source/dialogs.json) — включено;
//   COLLOQUIAL     — разговорная лексика и настройка «Сначала разговорные формы» — включено;
//   CIVICS_EXAM    — пробный экзамен на гражданство: в Турции такого экзамена нет — выключено.
export const FEATURES = {
  MORPH: false,
  GRAMMAR_FORMS: true,
  DIALOGS: true,
  COLLOQUIAL: true,
  CIVICS_EXAM: false,
};
