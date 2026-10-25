/** Named type roles and their catalog previews. */
export const typographyEn = {
  'typography.display': 'Display',
  'typography.heading-xl': 'Heading xl',
  'typography.heading-lg': 'Heading lg',
  'typography.heading-md': 'Heading md',
  'typography.heading-sm': 'Heading sm',
  'typography.heading-xs': 'Heading xs',
  'typography.heading-2xs': 'Heading 2xs',
  'typography.body': 'Body',
  'typography.label': 'Label',
  'typography.supporting': 'Supporting',
  'typography.caption': 'Caption',
  'typography.code': 'Inline code',
  'typography.boldCaption': 'Caption inherits bold',
  'typography.boldHeading': 'Heading with bold override',
  'typography.tightBody': 'Body with tight leading',
  'typography.description':
    'Text uses text-body, text-label, text-supporting, text-caption and text-display; code stays relative at 0.92em. Heading sizes display, xl, lg, md, sm, xs and 2xs use text-display and text-heading-* independently of semantic level 1–6 (level 2 defaults to text-heading-lg). Eleven roles come from typography.css, also exported as DTCG typography, Figma type/* variables and typeScale with pixel dimensions and unitless leading. font-*, leading-* and tracking-* utilities override role defaults; body, supporting and caption inherit weight and tracking. Both components support contrast-safe tones, truncation, line clamping and as / render.',
} as const;

export const typographyEs = {
  'typography.display': 'Destacado',
  'typography.heading-xl': 'Encabezado xl',
  'typography.heading-lg': 'Encabezado lg',
  'typography.heading-md': 'Encabezado md',
  'typography.heading-sm': 'Encabezado sm',
  'typography.heading-xs': 'Encabezado xs',
  'typography.heading-2xs': 'Encabezado 2xs',
  'typography.body': 'Cuerpo',
  'typography.label': 'Etiqueta',
  'typography.supporting': 'Texto de apoyo',
  'typography.caption': 'Leyenda',
  'typography.code': 'Código en línea',
  'typography.boldCaption': 'La leyenda hereda la negrita',
  'typography.boldHeading': 'Encabezado con negrita explícita',
  'typography.tightBody': 'Cuerpo con interlineado ajustado',
  'typography.description':
    'Text usa text-body, text-label, text-supporting, text-caption y text-display; code conserva el tamaño relativo de 0.92em. Los tamaños de Heading display, xl, lg, md, sm, xs y 2xs usan text-display y text-heading-* independientemente del nivel semántico 1–6 (el nivel 2 usa text-heading-lg por defecto). Los once roles provienen de typography.css y se exportan como tipografía DTCG, variables Figma type/* y typeScale con dimensiones en píxeles e interlineado sin unidad. Las utilidades font-*, leading-* y tracking-* reemplazan los valores del rol; body, supporting y caption heredan peso y espaciado. Ambos componentes admiten tonos con contraste seguro, truncamiento, límite de líneas y as / render.',
} satisfies Record<keyof typeof typographyEn, string>;
