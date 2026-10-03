/**
 * Writes text to the clipboard. Uses the async Clipboard API when it exists and falls back to
 * a hidden textarea + `document.execCommand('copy')` when the API is missing or refuses
 * (insecure context, old browsers, some embedded webviews). Rejects when both fail.
 */
export async function copyToClipboard(text: string): Promise<void> {
  const api = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
  if (api?.writeText) {
    try {
      await api.writeText(text);
      return;
    } catch (error) {
      if (legacyCopy(text)) return;
      throw error;
    }
  }
  if (!legacyCopy(text)) throw new Error('Clipboard unavailable');
}

/** The pre-Clipboard-API path. Restores focus and selection afterwards. */
function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false;
  const active = document.activeElement as HTMLElement | null;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.setAttribute('aria-hidden', 'true');
  area.tabIndex = -1;
  area.style.position = 'fixed';
  area.style.insetBlockStart = '0';
  area.style.opacity = '0';
  area.style.pointerEvents = 'none';
  document.body.appendChild(area);
  area.select();
  let ok: boolean;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  active?.focus?.();
  return ok;
}
