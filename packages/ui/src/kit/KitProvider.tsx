import { useRender } from '@base-ui/react/use-render';
import { createContext, useContext, useCallback, useRef, useState, type Ref, type ReactNode } from 'react';
import { ThemeProvider, useTheme, type ThemeProviderProps } from '../theme/ThemeProvider';
import { I18nProvider, useI18n, type I18nProviderProps } from '../i18n/I18nProvider';
import { DensityProvider, type DensityProviderProps } from '../density/DensityProvider';
import { DensityContext, useDensity, type Density } from '../density/density-context';
import { LinkProvider, type LinkProviderProps } from '../components/Link';
import { TooltipProvider, type TooltipProviderProps } from '../components/Tooltip';
import { ToastProvider, Toaster, type ToastProviderProps, type ToasterProps, useToast } from '../components/Toast';
import { DialogsProvider, useDialogs } from '../components/DialogsProvider';
import { LiveAnnouncer, useAnnounce, useHasLiveAnnouncer, type Announce } from '../components/LiveAnnouncer';
import { CSPProvider, type CSPProviderProps } from '../csp/CSPProvider';

import { cn } from '../utils/cn';
import { PortalContainerContext, usePortalContainer } from '../utils/portal';

const KitContext = createContext(false);

/** Typed settings for the providers composed by KitProvider. */
export interface KitProviderProps {
  /** Application content. */
  children?: ReactNode;
  /** Theme and persistence settings; defaults to dark and the gntik preset. */
  theme?: Omit<ThemeProviderProps, 'children'>;
  /** Locale, translations and direction; omitted preserves the parent context. */
  i18n?: Omit<I18nProviderProps, 'children'>;
  /** Subtree density or full DensityProvider settings. */
  density?: Density | Omit<DensityProviderProps, 'children'>;
  /** Router adapter for internal kit links. */
  link?: LinkProviderProps['component'];
  /** Tooltip timing; false keeps an app-owned provider. */
  tooltip?: Omit<TooltipProviderProps, 'children'> | false;
  /** Toast queue and stack settings; false keeps an app-owned setup. */
  toast?: (Omit<ToastProviderProps, 'children'> & { toaster?: ToasterProps }) | false;
  /** Whether to supply live announcement regions. Defaults to true. */
  announcer?: boolean;
  /** Nonce and inline-style policy, supplied by the app server. */
  csp?: Omit<CSPProviderProps, 'children'>;
  /** Default portal destination; explicit overlay containers take precedence. Null uses the body. */
  portalContainer?: HTMLElement | null;
  /** Apply theme, locale and density to a wrapper and portal host, leaving html untouched. No CSS isolation. */
  scoped?: boolean;
}

function Scope({
  children,
  wrapperRef,
  portalRef,
  densityProps,
}: {
  children: ReactNode;
  wrapperRef: Ref<HTMLDivElement>;
  portalRef: Ref<HTMLDivElement>;
  densityProps?: Omit<DensityProviderProps, 'children'>;
}) {
  const { locale, dir } = useI18n();
  const density = useDensity();
  const { resolved } = useTheme();
  return useRender({
    defaultTagName: 'div',
    ref: [wrapperRef, densityProps?.ref ?? null],
    props: {
      'data-kit-scope': '',
      className: cn('contents', densityProps?.className, resolved),
      lang: locale,
      dir,
      'data-density': density,
      children: (
        <>
          {children}
          <div ref={portalRef} data-kit-portal="" />
        </>
      ),
    },
  });
}

/** Composes the kit's providers and a single toast stack. */
export function KitProvider({
  children,
  theme,
  i18n,
  density,
  link,
  tooltip,
  toast,
  announcer = true,
  csp,
  portalContainer,
  scoped = false,
}: KitProviderProps) {
  const nested = useContext(KitContext);
  const inheritedTheme = useTheme();
  const inheritedPortal = usePortalContainer();
  const wrapper = useRef<HTMLDivElement>(null);
  const target = useCallback(() => wrapper.current, []);
  const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null);
  const hasAnnouncer = useHasLiveAnnouncer();
  const { toaster, ...toastProps } = toast || {};
  let content = (
    <>
      {children}
      {!nested && toast !== false && <Toaster {...toaster} />}
    </>
  );
  if (announcer && !nested && !hasAnnouncer) content = <LiveAnnouncer>{content}</LiveAnnouncer>;
  if (!nested) content = <DialogsProvider>{content}</DialogsProvider>;
  if (!nested && toast !== false) content = <ToastProvider {...toastProps}>{content}</ToastProvider>;
  if (tooltip !== false && (!nested || tooltip !== undefined))
    content = <TooltipProvider {...tooltip}>{content}</TooltipProvider>;
  if (portalContainer !== undefined || scoped)
    content = (
      <PortalContainerContext.Provider
        value={portalContainer === undefined ? (portalHost ?? inheritedPortal) : (portalContainer ?? undefined)}
      >
        {content}
      </PortalContainerContext.Provider>
    );
  if (scoped)
    content = (
      <Scope
        wrapperRef={wrapper}
        portalRef={setPortalHost}
        densityProps={typeof density === 'object' ? density : undefined}
      >
        {content}
      </Scope>
    );
  if (link) content = <LinkProvider component={link}>{content}</LinkProvider>;
  if (density) {
    const settings = typeof density === 'string' ? { density } : density;
    content = scoped ? (
      <DensityContext.Provider value={settings.density}>{content}</DensityContext.Provider>
    ) : (
      <DensityProvider {...settings}>{content}</DensityProvider>
    );
  }
  if (i18n)
    content = (
      <I18nProvider {...i18n} applyTo={scoped ? 'none' : i18n.applyTo}>
        {content}
      </I18nProvider>
    );
  if (!nested || theme || scoped) {
    const inherited = nested
      ? {
          defaultMode: inheritedTheme.mode,
          forcedMode: theme?.defaultMode || theme?.initialMode ? undefined : inheritedTheme.resolved,
          brand: inheritedTheme.brand,
          palette: inheritedTheme.palette,
          defaultMotion: inheritedTheme.motion,
          storageKey: null,
          motionStorageKey: null,
        }
      : {};
    content = (
      <ThemeProvider {...inherited} {...theme} target={scoped ? target : theme?.target}>
        {content}
      </ThemeProvider>
    );
  }
  if (csp) content = <CSPProvider {...csp}>{content}</CSPProvider>;
  return <KitContext.Provider value={true}>{content}</KitContext.Provider>;
}

/** App actions from the nearest KitProvider. With toast=false, supply your own ToastProvider. */
export function useApp(): {
  toast: ReturnType<typeof useToast>;
  confirm: ReturnType<typeof useDialogs>['confirm'];
  announce: Announce;
} {
  const provided = useContext(KitContext);
  if (!provided) throw new Error('useApp must be used within a KitProvider.');
  const toast = useToast();
  const { confirm } = useDialogs();
  const announce = useAnnounce();
  return { toast, confirm, announce };
}
