export const textareaEn = {
  'textarea.prompt': 'System prompt',
  'textarea.boundsHint': 'Grows from three to twelve lines, then scrolls.',
  'textarea.placeholder': 'Describe how the assistant should respond…',
  'textarea.mediumPrompt': 'Medium prompt',
  'textarea.smallPrompt': 'Small prompt',
  'textarea.replace': 'Load a long prompt',
  'textarea.sampleLine': 'Respond clearly and include a helpful example.',
} as const;

export const textareaEs = {
  'textarea.prompt': 'Instrucciones del sistema',
  'textarea.boundsHint': 'Crece de tres a doce líneas y después se desplaza.',
  'textarea.placeholder': 'Describe cómo debe responder el asistente…',
  'textarea.mediumPrompt': 'Instrucciones medianas',
  'textarea.smallPrompt': 'Instrucciones pequeñas',
  'textarea.replace': 'Cargar instrucciones largas',
  'textarea.sampleLine': 'Responde con claridad e incluye un ejemplo útil.',
} satisfies Record<keyof typeof textareaEn, string>;
