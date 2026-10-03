// Preview settings shared by the catalog: density (comfortable | compact) and text direction
// (ltr | rtl). The topbar owns the state; Library examples, kit Cards and the preview.html
// iframes follow it. Persisted per viewer in localStorage (best effort: storage can throw).
import { createContext, useContext } from 'react';
import { DensityProvider, I18nProvider } from '@gntik-ai/ui';

export const DENSITIES = [['comfortable', 'Comfortable'], ['compact', 'Compact']];
export const DIRECTIONS = [['ltr', 'LTR'], ['rtl', 'RTL']];
export const DEFAULT_PREVIEW = { density: 'comfortable', dir: 'ltr' };

export const PreviewSettingsContext = createContext(DEFAULT_PREVIEW);
export const usePreviewSettings = () => useContext(PreviewSettingsContext);

/** Stored value if it is one of `options` ([value, label] pairs), else the first option. */
export function readSetting(key, options) {
  try {
    const v = localStorage.getItem(key);
    return options.some(([o]) => o === v) ? v : options[0][0];
  } catch {
    return options[0][0];
  }
}

export function writeSetting(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

/** Extra preview.html query for non-default settings (default URLs stay unchanged). */
export const previewQuery = ({ density, dir }) =>
  (density !== DEFAULT_PREVIEW.density ? `&density=${density}` : '') + (dir !== DEFAULT_PREVIEW.dir ? `&dir=${dir}` : '');

/** Wraps a live kit preview so it follows the topbar density and direction. */
export function PreviewScope({ children }) {
  const { density, dir } = usePreviewSettings();
  return (
    <DensityProvider density={density}>
      <I18nProvider locale="en" dir={dir}>{children}</I18nProvider>
    </DensityProvider>
  );
}
