/** Markdown labels and live-preview copy, composed into the built-in en/es catalogs. */
export const markdownEn = {
  'chat.image': 'Image: {alt}',
  'chat.untitled': 'untitled',
  'chat.markdownChart': 'Markdown chart',
  'chat.markdownComplete': 'Complete',
  'chat.markdownPartial': 'Still arriving',
  'chat.markdownReasoning': 'Reasoning',
  'chat.markdownCustomReply':
    '# Custom Markdown\n\n> Check the plan before continuing.\n\n<think kind="plan">\nPlan **steps** before running the task.\n</think>\n\n```chart\n72\n```\n\n```ts\nconst ready = true;\n```\n\n[Read the guide](https://example.com/docs)\n\n<details><summary>More</summary>Safe HTML formatting.</details>',
  'chat.markdownCustomPartial': '<think>\nPlanning **steps**\n\n```chart\n42',
};

export const markdownEs: Record<keyof typeof markdownEn, string> = {
  'chat.image': 'Imagen: {alt}',
  'chat.untitled': 'sin título',
  'chat.markdownChart': 'Gráfico de Markdown',
  'chat.markdownComplete': 'Completo',
  'chat.markdownPartial': 'Recibiendo contenido',
  'chat.markdownReasoning': 'Razonamiento',
  'chat.markdownCustomReply':
    '# Markdown personalizado\n\n> Revisa el plan antes de continuar.\n\n<think kind="plan">\nPlanifica los **pasos** antes de ejecutar la tarea.\n</think>\n\n```chart\n72\n```\n\n```ts\nconst ready = true;\n```\n\n[Lee la guía](https://example.com/docs)\n\n<details><summary>Más</summary>Formato HTML seguro.</details>',
  'chat.markdownCustomPartial': '<think>\nPlanificando los **pasos**\n\n```chart\n42',
};
