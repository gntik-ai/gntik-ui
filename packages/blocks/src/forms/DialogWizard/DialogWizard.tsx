import { useI18n, WizardLayout, type WizardLayoutProps } from '@gntik-ai/ui';
import type { ReactNode } from 'react';

export interface DialogWizardProps extends Omit<WizardLayoutProps, 'mode' | 'steps' | 'current'> {
  steps?: WizardLayoutProps['steps'];
  current?: number;
  /** Step-local validation surface, normally a ValidationSummary with consumer copy. */
  stepError?: ReactNode;
  /** Replaces the last step body, normally a DescriptionListCard with consumer copy. */
  reviewStep?: ReactNode;
}

/** Modal variant of create-wizard for a flow over its parent page. State stays consumer-owned. */
export function DialogWizard({ steps, current = 0, size = 'dialog', stepError, reviewStep, children, title, ...props }: DialogWizardProps) {
  const { t } = useI18n();
  const items = steps ?? [{ label: t('wizard.details') }, { label: t('wizard.review') }];
  return (
    <WizardLayout {...props} mode="overlay" size={size} steps={items} current={current} title={title ?? t('wizard.title')}>
      {stepError}
      {current >= items.length - 1 && reviewStep != null ? reviewStep : children}
    </WizardLayout>
  );
}
