import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useId, useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode, type Ref, type RefObject } from 'react';
import { cn } from '../../utils/cn';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/AlertDialog';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/Dialog';
import { Button } from '../../components/Button';
import { Stepper, type StepItem } from '../../components/Stepper';
import { SkipLink } from '../../components/VisuallyHidden';
import { useI18n } from '../../i18n/I18nProvider';
import { WizardOverlayBody } from './WizardOverlayBody';
import { wizardLayoutVariants, type WizardLayoutVariantProps } from './wizard-layout.variants';

export interface WizardLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title' | 'children'> {
  /** Page by default; overlay keeps the parent page mounted. */
  mode?: 'page' | 'overlay';
  /** Overlay-only; defaults to fullscreen. Dialog fills the viewport below sm. */
  size?: 'fullscreen' | 'dialog';
  /** Controlled visibility in overlay mode. Closing does not reset current. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  description?: ReactNode;
  /** Defaults to the element focused before opening. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Outside presses are ignored by default in overlay mode. */
  closeOnInteractOutside?: boolean;
  cancelLabel?: string;
  stepsSummaryLabel?: string;
  /** Label is the active step label; position is one-based. */
  stepAnnouncement?: (step: { position: number; total: number; label: ReactNode }) => string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
  steps: StepItem[];
  /** Zero-based index of the current step. */
  current: number;
  /** Called by Back, Next and by clicking a completed step. */
  onStepChange?: (index: number) => void;
  /** Called by the primary button on the last step. */
  onFinish?: () => void;
  /** Called after the exit is confirmed (or directly when `confirmExit` is false). */
  onExit?: () => void;
  /** Name of the flow, in the top bar (e.g. "New project"). */
  title?: ReactNode;
  /** Mark before the title (a Logo). */
  logo?: ReactNode;
  /** The current step's content. */
  children?: ReactNode;
  /** Left side of the footer (e.g. "Draft saved"). */
  footerStart?: ReactNode;
  /** Replaces the whole default footer (Back / Next). */
  footer?: ReactNode;
  backLabel?: string;
  nextLabel?: string;
  finishLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  finishPending?: boolean;
  pendingLabel?: string;
  exitLabel?: string;
  /** Ask before leaving (AlertDialog). */
  confirmExit?: boolean;
  exitTitle?: ReactNode;
  exitDescription?: ReactNode;
  exitConfirmLabel?: string;
  exitCancelLabel?: string;
  /** Accessible name of the Stepper. */
  stepsLabel?: string;
  /** Max width of the step column. */
  width?: WizardLayoutVariantProps['width'];
  mainId?: string;
  skipLinkLabel?: string;
  fullScreen?: boolean;
}

/**
 * Focus-mode shell for multi-step flows: no sidebar · top bar with title and Exit · Stepper ·
 * step body · Back/Next footer. Exit (or Escape anywhere in the layout) asks for confirmation in
 * an AlertDialog. Below `lg` the Stepper collapses to "Step 2 of 5".
 */
export function WizardLayout({
  mode = 'page',
  size = 'fullscreen',
  open = false,
  onOpenChange,
  description,
  returnFocusRef,
  closeOnInteractOutside = false,
  cancelLabel: cancelLabelProp,
  stepsSummaryLabel: stepsSummaryLabelProp,
  stepAnnouncement,
  steps,
  current,
  onStepChange,
  onFinish,
  onExit,
  title,
  logo,
  children,
  footerStart,
  footer,
  backLabel: backLabelProp,
  nextLabel: nextLabelProp,
  finishLabel: finishLabelProp,
  nextDisabled = false,
  nextLoading = false,
  finishPending = false,
  pendingLabel: pendingLabelProp,
  exitLabel: exitLabelProp,
  confirmExit = true,
  exitTitle: exitTitleProp,
  exitDescription: exitDescriptionProp,
  exitConfirmLabel: exitConfirmLabelProp,
  exitCancelLabel: exitCancelLabelProp,
  stepsLabel: stepsLabelProp,
  width,
  mainId = 'main',
  skipLinkLabel: skipLinkLabelProp,
  fullScreen = false,
  className,
  onKeyDown,
  ...props
}: WizardLayoutProps) {
  const { t } = useI18n();
  const id = useId();
  const overlay = mode === 'overlay';
  const bodyId = overlay ? `${id}-step` : mainId;
  const previousFocus = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (overlay && open && document.activeElement instanceof HTMLElement) previousFocus.current = document.activeElement;
  }, [overlay, open]);
  const activeStep = { position: current + 1, total: steps.length, label: steps[current]?.label ?? '' };
  const announcement = stepAnnouncement?.(activeStep) ?? t('wizard.stepAnnouncement', { ...activeStep, label: typeof activeStep.label === 'string' ? activeStep.label : '' });
  const cancelLabel = cancelLabelProp ?? t('common.cancel');
  const backLabel = backLabelProp ?? t('common.back');
  const nextLabel = nextLabelProp ?? t('common.next');
  const pendingLabel = pendingLabelProp ?? t('wizard.finishing');
  const finishLabel = finishLabelProp ?? t('common.finish');
  const exitLabel = exitLabelProp ?? t('common.exit');
  const exitTitle = exitTitleProp ?? t('wizard.exitTitle');
  const exitDescription = exitDescriptionProp ?? t('wizard.exitDescription');
  const exitConfirmLabel = exitConfirmLabelProp ?? t('wizard.leave');
  const exitCancelLabel = exitCancelLabelProp ?? t('wizard.stay');
  const stepsLabel = stepsLabelProp ?? t('common.progress');
  const stepsSummaryLabel = stepsSummaryLabelProp ?? t('wizard.progressSummary', { label: stepsLabel });
  const skipLinkLabel = skipLinkLabelProp ?? t('skip.step');
  const [exitOpen, setExitOpen] = useState(false);
  const s = wizardLayoutVariants({ width, fullScreen: overlay ? false : fullScreen });
  const last = current >= steps.length - 1;

  const exit = () => {
    if (overlay) onOpenChange?.(false);
    onExit?.();
  };
  const requestExit = () => {
    if (confirmExit) setExitOpen(true);
    else exit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    // Only keys pressed inside the layout's own DOM: portalled popups (Select, Menu, this dialog) handle their own Escape.
    if (event.key !== 'Escape' || event.defaultPrevented || exitOpen) return;
    if (!(event.target instanceof Node) || !event.currentTarget.contains(event.target)) return;
    event.preventDefault();
    requestExit();
  };

  const content = (
    <div className={cn(s.root(), className)} onKeyDown={overlay ? onKeyDown : handleKeyDown} {...props}>
      {!overlay && <SkipLink targetId={bodyId} className={s.skipLink()}>
        {skipLinkLabel}
      </SkipLink>}
      <header className={s.header()}>
        <div className={s.headerRow()}>
          {logo}
          {overlay ? <DialogTitle className={s.title()}>{title}</DialogTitle> : <div className={s.title()}>{title}</div>}
          <Button variant="ghost" size="sm" icon={X} onClick={requestExit}>
            {exitLabel}
          </Button>
        </div>
        <div className={s.steps()}>
          <Stepper className={s.stepsFull()} label={stepsLabel} steps={steps} current={current} onStepClick={onStepChange} />
          <Stepper className={s.stepsCompact()} label={stepsSummaryLabel} steps={steps} current={current} compact />
        </div>
      </header>
      {overlay && description && <DialogDescription className="sr-only">{description}</DialogDescription>}
      {overlay ? (
        <WizardOverlayBody id={bodyId} current={current} announcement={announcement} className={s.main()}>
          <div className={s.body()}>{children}</div>
        </WizardOverlayBody>
      ) : (
        <main id={bodyId} tabIndex={-1} className={s.main()}><div className={s.body()}>{children}</div></main>
      )}
      {footer ?? (
        <footer className={s.footer()}>
          <div className={s.footerRow()}>
            <div className={s.footerAside()}>{footerStart}</div>
            <Button variant="secondary" icon={ChevronLeft} disabled={!overlay && current <= 0} onClick={() => overlay && current === 0 ? requestExit() : onStepChange?.(current - 1)}>
              {overlay && current === 0 ? cancelLabel : backLabel}
            </Button>
            <Button
              trailingIcon={last ? Check : ChevronRight}
              disabled={nextDisabled || (overlay && last && finishPending)}
              loading={nextLoading || (overlay && last && finishPending)}
              onClick={() => {
                if (nextDisabled || nextLoading || (overlay && last && finishPending)) return;
                if (last) onFinish?.();
                else onStepChange?.(current + 1);
              }}
            >
              {overlay && last && (finishPending || nextLoading) ? pendingLabel : last ? finishLabel : nextLabel}
            </Button>
          </div>
        </footer>
      )}
      {confirmExit && (
        <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
          <AlertDialogContent>
            <AlertDialogHeader tone="warning">
              <AlertDialogTitle>{exitTitle}</AlertDialogTitle>
              <AlertDialogDescription>{exitDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{exitCancelLabel}</AlertDialogCancel>
              <AlertDialogAction onClick={exit}>{exitConfirmLabel}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
  if (!overlay) return content;
  return (
    <Dialog open={open} disablePointerDismissal={!closeOnInteractOutside} onOpenChange={(nextOpen, details) => {
      if (nextOpen) onOpenChange?.(true);
      else {
        details.cancel();
        if (!exitOpen) requestExit();
      }
    }}>
      <DialogContent aria-modal="true" showClose={false} size="xl" presentation={size === 'fullscreen' ? 'fullscreen' : 'responsive'}
        finalFocus={() => returnFocusRef?.current ?? previousFocus.current ?? true}>{content}</DialogContent>
    </Dialog>
  );
}
