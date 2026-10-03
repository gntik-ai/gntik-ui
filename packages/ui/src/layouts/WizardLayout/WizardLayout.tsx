import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, type HTMLAttributes, type KeyboardEvent, type ReactNode, type Ref } from 'react';
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
import { Button } from '../../components/Button';
import { Stepper, type StepItem } from '../../components/Stepper';
import { SkipLink } from '../../components/VisuallyHidden';
import { wizardLayoutVariants, type WizardLayoutVariantProps } from './wizard-layout.variants';

export interface WizardLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title' | 'children'> {
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
  backLabel = 'Back',
  nextLabel = 'Next',
  finishLabel = 'Finish',
  nextDisabled = false,
  nextLoading = false,
  exitLabel = 'Exit',
  confirmExit = true,
  exitTitle = 'Leave this setup?',
  exitDescription = 'Your progress on this step will be lost.',
  exitConfirmLabel = 'Leave',
  exitCancelLabel = 'Stay',
  stepsLabel = 'Progress',
  width,
  mainId = 'main',
  skipLinkLabel = 'Skip to step',
  fullScreen = false,
  className,
  onKeyDown,
  ...props
}: WizardLayoutProps) {
  const [exitOpen, setExitOpen] = useState(false);
  const s = wizardLayoutVariants({ width, fullScreen });
  const last = current >= steps.length - 1;

  const requestExit = () => {
    if (confirmExit) setExitOpen(true);
    else onExit?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    // Only keys pressed inside the layout's own DOM: portalled popups (Select, Menu, this dialog) handle their own Escape.
    if (event.key !== 'Escape' || event.defaultPrevented || exitOpen) return;
    if (!(event.target instanceof Node) || !event.currentTarget.contains(event.target)) return;
    event.preventDefault();
    requestExit();
  };

  return (
    <div className={cn(s.root(), className)} onKeyDown={handleKeyDown} {...props}>
      <SkipLink targetId={mainId} className={s.skipLink()}>
        {skipLinkLabel}
      </SkipLink>
      <header className={s.header()}>
        <div className={s.headerRow()}>
          {logo}
          <div className={s.title()}>{title}</div>
          <Button variant="ghost" size="sm" icon={X} onClick={requestExit}>
            {exitLabel}
          </Button>
        </div>
        <div className={s.steps()}>
          <Stepper className={s.stepsFull()} label={stepsLabel} steps={steps} current={current} onStepClick={onStepChange} />
          <Stepper className={s.stepsCompact()} label={`${stepsLabel} summary`} steps={steps} current={current} compact />
        </div>
      </header>
      <main id={mainId} tabIndex={-1} className={s.main()}>
        <div className={s.body()}>{children}</div>
      </main>
      {footer ?? (
        <footer className={s.footer()}>
          <div className={s.footerRow()}>
            <div className={s.footerAside()}>{footerStart}</div>
            <Button variant="secondary" icon={ChevronLeft} disabled={current <= 0} onClick={() => onStepChange?.(current - 1)}>
              {backLabel}
            </Button>
            <Button
              trailingIcon={last ? Check : ChevronRight}
              disabled={nextDisabled}
              loading={nextLoading}
              onClick={() => (last ? onFinish?.() : onStepChange?.(current + 1))}
            >
              {last ? finishLabel : nextLabel}
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
              <AlertDialogAction onClick={() => onExit?.()}>{exitConfirmLabel}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
