import { useContext, useEffect, useRef, useState } from 'react';
import { TitleOverridesContext } from './title-context';

/**
 * Override the document title while the calling component is mounted. Inside a NavigationProvider
 * the text gets the provider's separator and `appTitle` (`Edit fn-42 · Console`) and the route's
 * title returns when the component unmounts; nested calls resolve to the innermost mounted one.
 * With `documentTitle={false}` on the provider nothing is written. Outside a provider the text is
 * written as is and the previous title is restored on unmount. `undefined` leaves the title alone.
 * Writes happen in effects only, so it is safe to render on the server.
 */
export function useDocumentTitle(title: string | undefined): void {
  const overrides = useContext(TitleOverridesContext);
  const owner = useRef<object>({});
  const [rank] = useState(() => overrides?.rank() ?? 0);

  useEffect(() => {
    const key = owner.current;
    return () => overrides?.remove(key);
  }, [overrides]);

  useEffect(() => {
    if (!overrides) return;
    if (title === undefined) overrides.remove(owner.current);
    else overrides.set(owner.current, rank, title);
  }, [overrides, rank, title]);

  useEffect(() => {
    if (overrides || title === undefined || typeof document === 'undefined') return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [overrides, title]);
}
