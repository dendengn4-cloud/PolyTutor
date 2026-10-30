// Разделы, которые зависят от изучаемого языка.
//   MORPH          — «Формы глагола» и «Формы существительного» (conj.js, decl.js; формы — sv_forms.py) — включено;
//   GRAMMAR_FORMS  — блок «Как образуется» в темах грамматики (grammar-forms.js) — включено;
//   DIALOGS        — раздел «Диалоги» (data/sv/source/dialogs.json) — включено;
//   COLLOQUIAL     — разговорная лексика и настройка «Сначала разговорные формы» — включено;
//   CIVICS_EXAM    — пробный экзамен на гражданство (40 вопросов, 70%) — включено.
export const FEATURES = {
  MORPH: true,
  GRAMMAR_FORMS: true,
  DIALOGS: true,
  COLLOQUIAL: true,
  CIVICS_EXAM: true,     // «Пробный экзамен на гражданство» в курсе обществознания (civics_exam)
};
