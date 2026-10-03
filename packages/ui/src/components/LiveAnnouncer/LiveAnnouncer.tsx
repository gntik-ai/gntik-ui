import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { liveAnnouncerVariants } from './live-announcer.variants';

export type AnnouncePoliteness = 'polite' | 'assertive';
/** Sends a message to the nearest LiveAnnouncer region. */
export type Announce = (message: string, politeness?: AnnouncePoliteness) => void;

const AnnounceContext = createContext<Announce | null>(null);
const noop: Announce = () => {};

export interface LiveAnnouncerProps {
  children?: ReactNode;
  /** Classes for the (screen-reader only) region. */
  className?: string;
}

/**
 * Screen-reader announcements for interactions that have no visible text change (drag and drop,
 * reorder, background saves). Renders polite and assertive `aria-live` regions and gives its
 * subtree `useAnnounce()`. Repeating the same message re-announces it.
 */
export function LiveAnnouncer({ children, className }: LiveAnnouncerProps) {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');
  const announce = useCallback<Announce>((message, politeness = 'polite') => {
    // A trailing no-break space makes an identical message a DOM change, so it is read again.
    const next = (prev: string) => (prev === message ? `${message}\u00A0` : message);
    if (politeness === 'assertive') setAssertive(next);
    else setPolite(next);
  }, []);
  const region = cn(liveAnnouncerVariants(), className);
  return (
    <AnnounceContext.Provider value={announce}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className={region} data-live-announcer="polite">
        {polite}
      </div>
      <div aria-live="assertive" aria-atomic="true" className={region} data-live-announcer="assertive">
        {assertive}
      </div>
    </AnnounceContext.Provider>
  );
}

/**
 * The `announce(message, politeness?)` function of the nearest LiveAnnouncer. Outside one it is
 * a no-op, so components can call it unconditionally.
 */
export function useAnnounce(): Announce {
  return useContext(AnnounceContext) ?? noop;
}

/** True when a LiveAnnouncer is already above this component (so it need not render its own). */
export function useHasLiveAnnouncer(): boolean {
  return useContext(AnnounceContext) !== null;
}
