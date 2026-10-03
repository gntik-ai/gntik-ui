import { ChevronDown, Monitor, PanelLeft, PanelRight } from 'lucide-react';
import { useId, useState, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { IconButton } from '../../components/Button';
import { SkipLink } from '../../components/VisuallyHidden';
import { canvasLayoutVariants } from './canvas-layout.variants';

/** Controlled-or-uncontrolled boolean (open state of a panel). */
function usePanelState(value: boolean | undefined, defaultValue: boolean, onChange?: (open: boolean) => void) {
  const [inner, setInner] = useState(defaultValue);
  const open = value ?? inner;
  const set = (next: boolean) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  return [open, set] as const;
}

export interface CanvasLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** The full-bleed canvas (a flow editor, a code editor, a map…). Rendered inside `<main>`. */
  children?: ReactNode;
  /** Top bar content (title, breadcrumb, run/save actions). The panel toggles sit on its right. */
  header?: ReactNode;
  /** Floating toolbar centred over the canvas (large screens). */
  toolbar?: ReactNode;
  /** Left palette (node/shape library). */
  palette?: ReactNode;
  paletteLabel?: string;
  paletteOpen?: boolean;
  defaultPaletteOpen?: boolean;
  onPaletteOpenChange?: (open: boolean) => void;
  /** Right inspector (properties of the selection). */
  inspector?: ReactNode;
  inspectorLabel?: string;
  inspectorOpen?: boolean;
  defaultInspectorOpen?: boolean;
  onInspectorOpenChange?: (open: boolean) => void;
  /** Bottom console (logs, problems, run output). Collapsible from its own bar. */
  console?: ReactNode;
  consoleLabel?: string;
  /** Extra controls on the right of the console bar (clear, filter…). */
  consoleActions?: ReactNode;
  consoleOpen?: boolean;
  defaultConsoleOpen?: boolean;
  onConsoleOpenChange?: (open: boolean) => void;
  /** Shown over the canvas below `lg`, where palette and inspector are hidden. Pass `null` to hide. */
  smallScreenNotice?: ReactNode;
  /**
   * Inside an app shell that already owns <main> and the skip link (SidebarLayout, StackedLayout):
   * render the content region as a plain <div> and drop this layout's skip link.
   */
  embedded?: boolean;
  /** `id` of the `<main>` landmark (skip-link target). */
  mainId?: string;
  /** Accessible name of the canvas region. */
  mainLabel?: string;
  skipLinkLabel?: string;
  /** Fill the viewport (`h-dvh`) instead of the container. */
  fullScreen?: boolean;
}

/**
 * Editor shell for a full-bleed canvas: top bar · left palette · canvas with a floating toolbar ·
 * right inspector · collapsible bottom console. Palette and inspector toggle from the top bar
 * (aria-expanded). Below `lg` the side panels hide and a read-only notice shows over the canvas.
 */
export function CanvasLayout({
  children,
  header,
  toolbar,
  palette,
  paletteLabel = 'Palette',
  paletteOpen: paletteOpenProp,
  defaultPaletteOpen = true,
  onPaletteOpenChange,
  inspector,
  inspectorLabel = 'Inspector',
  inspectorOpen: inspectorOpenProp,
  defaultInspectorOpen = true,
  onInspectorOpenChange,
  console: consoleContent,
  consoleLabel = 'Console',
  consoleActions,
  consoleOpen: consoleOpenProp,
  defaultConsoleOpen = true,
  onConsoleOpenChange,
  smallScreenNotice = 'Open on a larger screen to edit. The canvas is read-only here.',
  embedded = false,
  mainId = 'main',
  mainLabel = 'Canvas',
  skipLinkLabel = 'Skip to canvas',
  fullScreen = false,
  className,
  ...props
}: CanvasLayoutProps) {
  const MainTag = embedded ? 'div' : 'main';
  const [paletteOpen, setPaletteOpen] = usePanelState(paletteOpenProp, defaultPaletteOpen, onPaletteOpenChange);
  const [inspectorOpen, setInspectorOpen] = usePanelState(inspectorOpenProp, defaultInspectorOpen, onInspectorOpenChange);
  const [consoleOpen, setConsoleOpen] = usePanelState(consoleOpenProp, defaultConsoleOpen, onConsoleOpenChange);
  const uid = useId();
  const paletteId = `${uid}-palette`;
  const inspectorId = `${uid}-inspector`;
  const consoleBodyId = `${uid}-console`;
  const s = canvasLayoutVariants({ fullScreen, consoleOpen });

  return (
    <div className={cn(s.root(), className)} {...props}>
      {!embedded && (
        <SkipLink targetId={mainId} className={s.skipLink()}>
          {skipLinkLabel}
        </SkipLink>
      )}
      <header className={s.header()}>
        <div className={s.headerContent()}>{header}</div>
        {(palette != null || inspector != null) && (
          <div className={s.toggles()}>
            {palette != null && (
              <IconButton
                icon={PanelLeft}
                size="sm"
                label={paletteLabel}
                aria-expanded={paletteOpen}
                aria-controls={paletteId}
                onClick={() => setPaletteOpen(!paletteOpen)}
              />
            )}
            {inspector != null && (
              <IconButton
                icon={PanelRight}
                size="sm"
                label={inspectorLabel}
                aria-expanded={inspectorOpen}
                aria-controls={inspectorId}
                onClick={() => setInspectorOpen(!inspectorOpen)}
              />
            )}
          </div>
        )}
      </header>
      <div className={s.body()}>
        {palette != null && (
          <aside id={paletteId} aria-label={paletteLabel} hidden={!paletteOpen} className={s.palette()}>
            <div className={s.panelTitle()} aria-hidden>
              {paletteLabel}
            </div>
            <div className={s.panelBody()}>{palette}</div>
          </aside>
        )}
        <div className={s.center()}>
          <MainTag id={mainId} tabIndex={-1} role={embedded ? 'region' : undefined} aria-label={mainLabel} className={s.main()}>
            {smallScreenNotice != null && (
              <p className={s.notice()}>
                <Monitor size={14} aria-hidden className="shrink-0" />
                {smallScreenNotice}
              </p>
            )}
            {toolbar != null && <div className={s.toolbar()}>{toolbar}</div>}
            {children}
          </MainTag>
          {consoleContent != null && (
            <section aria-label={consoleLabel} className={s.console()}>
              <div className={s.consoleBar()}>
                <button
                  type="button"
                  className={s.consoleToggle()}
                  aria-expanded={consoleOpen}
                  aria-controls={consoleBodyId}
                  onClick={() => setConsoleOpen(!consoleOpen)}
                >
                  <ChevronDown size={14} aria-hidden className={s.consoleChevron()} />
                  {consoleLabel}
                </button>
                {consoleActions != null && <div className={s.consoleActions()}>{consoleActions}</div>}
              </div>
              <div id={consoleBodyId} hidden={!consoleOpen} className={s.consoleBody()}>
                {consoleContent}
              </div>
            </section>
          )}
        </div>
        {inspector != null && (
          <aside id={inspectorId} aria-label={inspectorLabel} hidden={!inspectorOpen} className={s.inspector()}>
            <div className={s.panelTitle()} aria-hidden>
              {inspectorLabel}
            </div>
            <div className={s.panelBody()}>{inspector}</div>
          </aside>
        )}
      </div>
    </div>
  );
}
