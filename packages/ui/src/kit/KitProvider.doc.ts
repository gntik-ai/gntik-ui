import type { ComponentDoc } from '../doc';

/**
 * Prop-to-provider table (rendered in the catalog configuration example):
 * | Prop | Provider |
 * | --- | --- |
 * | theme | ThemeProvider |
 * | i18n | I18nProvider |
 * | density | DensityProvider |
 * | link | LinkProvider |
 * | tooltip | TooltipProvider |
 * | toast | ToastProvider + Toaster |
 * | announcer | LiveAnnouncer |
 * | csp | CSPProvider |
 * | portalContainer | PortalContainerContext |
 * | scoped | ThemeProvider target, wrapper and portal host |
 */
/** Catalog documentation for the root application provider. */
export const doc: ComponentDoc = {
  name: 'KitProvider',
  group: 'Theme',
  status: 'stable',
  description:
    'One app root for theme, locale, density, router links, tooltips, toasts, dialogs, CSP and live announcements. useApp() exposes toast, confirm and announce inside React. By default: dark with the gntik preset, tooltips, one ToastProvider and Toaster, DialogsProvider and LiveAnnouncer. Optional i18n, density, link and csp props add their providers only when supplied; no wrapper is added by default. Nested KitProviders apply only supplied settings and reuse the outer toast queue, stack, dialogs and live regions. Inner toast options (including toaster props) and announcer switches have no effect; configure them on the outer provider. A nested theme prop automatically targets a subtree wrapper, even without scoped; its target setting is overridden. Portal destinations still inherit unless scoped or portalContainer is supplied. Pass toast={false} if you keep your own ToastProvider or Toaster; useApp then requires that ToastProvider above its caller. tooltip={false} and announcer={false} also keep app-owned providers. portalContainer supplies the shared overlay destination, including the full-screen Dropzone; an explicit overlay container wins. Scoped mode targets a wrapper for theme, motion, palette, lang, dir and density, with an inner portal host. The host attaches on mount: overlays already open on the first commit briefly use the inherited destination before moving inside the scope. It does not isolate CSS: :root tokens and Tailwind preflight remain global, and hosts must scope their own --primary/--background tokens. For SSR, pass theme={{ initialMode }} from a cookie and keep themeScript() settings consistent. Separate providers remain supported.',
  anatomy: '<KitProvider theme={{ initialMode }} i18n={{ locale: "en" }} density="compact"><App /></KitProvider>',
  tokens: ['background', 'foreground', 'border'],
};
