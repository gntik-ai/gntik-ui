import { Check, Circle, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { passwordInputVariants } from './password-input.variants';

export interface PasswordRequirementState {
  id: string;
  label: ReactNode;
  met: boolean;
}

export interface PasswordRequirementsProps {
  id: string;
  items: readonly PasswordRequirementState[];
  /** Nothing typed yet: every item is neutral. */
  empty: boolean;
  /** Changes whenever the user edits the value; restarts the announcement debounce. */
  value: string;
  size: 'auto' | 'sm' | 'md' | 'lg';
}

const ANNOUNCE_DELAY_MS = 700;

/**
 * Checklist of password requirements with a visually hidden polite summary. The summary is
 * announced once the value has been stable for 700 ms, and only when the met count changed.
 */
export function PasswordRequirements({ id, items, empty, value, size }: PasswordRequirementsProps) {
  const { t } = useI18n();
  const s = passwordInputVariants({ size });
  const met = items.filter((item) => item.met).length;
  const total = items.length;
  const summary = t('password.requirementsSummary', { met, total });
  const [announcement, setAnnouncement] = useState('');
  const announcedMet = useRef(met);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (announcedMet.current === met) return;
      announcedMet.current = met;
      setAnnouncement(summary);
    }, ANNOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [value, met, summary]);

  return (
    <>
      <ul id={id} role="list" aria-label={t('password.requirements')} className={s.list()}>
        {items.map((item, index) => {
          const state = empty ? 'neutral' : item.met ? 'met' : 'unmet';
          const Icon = state === 'neutral' ? Circle : state === 'met' ? Check : X;
          const v = passwordInputVariants({ size, state });
          return (
            <li key={`${index}:${item.id}`} className={v.item()}>
              <Icon aria-hidden className={v.icon()} />
              <span>{item.label}</span>
              {state === 'neutral' ? null : (
                <span className="sr-only">
                  {t(state === 'met' ? 'password.requirementMet' : 'password.requirementUnmet')}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </>
  );
}
