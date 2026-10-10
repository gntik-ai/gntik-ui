import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Mounted inside the dialog portal so focus runs after its body exists. */
export function WizardOverlayBody({ id, current, announcement, className, children }: {
  id: string;
  current: number;
  announcement: string;
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState('');
  useEffect(() => {
    const body = ref.current;
    if (!body) return;
    const visible = (element: HTMLElement) => {
      for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (ancestor.hidden || ancestor.inert || style.display === 'none' || style.visibility === 'hidden') return false;
        if (ancestor === body) break;
      }
      return element.getAttribute('aria-disabled') !== 'true';
    };
    const heading = [...body.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6, [role="heading"]')].find(visible);
    const control = [...body.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]')].find(visible);
    const target = heading ?? control ?? body;
    if (heading && !heading.hasAttribute('tabindex')) heading.tabIndex = -1;
    target.focus();
    // Announce after the focus event, outside the focused element's subtree.
    const frame = requestAnimationFrame(() => setLive(announcement));
    return () => cancelAnimationFrame(frame);
  }, [current, announcement]);
  return <>
    <div id={id} ref={ref} tabIndex={-1} className={className}>{children}</div>
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{live}</div>
  </>;
}
