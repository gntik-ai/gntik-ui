
/** Mirrors a directional glyph (chevron, arrow) in right-to-left text. */
export const RTL_FLIP = 'rtl:-scale-x-100';

const DIRECTIONAL = /^(?:Chevrons?(?:Left|Right)|Arrow(?:Left|Right)\w*|Move(?:Left|Right)|Panel(?:Left|Right)\w*|Undo\d?|Redo\d?|Corner\w+(?:Left|Right)|Indent\w*|Outdent\w*)$/;

/**
 * True for lucide icons that point along the inline axis (ChevronLeft, ArrowRight,
 * PanelLeftClose…), which mirror under RTL. Detected from the icon's displayName.
 */
export function isDirectionalIcon(icon: unknown): boolean {
  const name = (icon as { displayName?: unknown } | null | undefined)?.displayName;
  return typeof name === 'string' && DIRECTIONAL.test(name);
}

/** `RTL_FLIP` for a directional icon, else undefined. */
export const rtlIconClass = (icon: unknown) => (isDirectionalIcon(icon) ? RTL_FLIP : undefined);
