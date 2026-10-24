import { CSPProvider as BaseCSPProvider } from '@base-ui/react/csp-provider';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

/** CSP settings shared by kit-owned inline elements. The app server owns the nonce. */
export interface CSPConfig {
  nonce: string | undefined;
  disableStyleElements: boolean;
}

export interface CSPProviderProps {
  /** Per-response nonce matching the app's Content-Security-Policy header. */
  nonce?: string;
  /** Omit inline style elements. Supply static CSS, including any PrintLayout @page rule. */
  disableStyleElements?: boolean;
  children?: ReactNode;
}

const CSPContext = createContext<CSPConfig>({ nonce: undefined, disableStyleElements: false });

/** Forward CSP settings to Base UI and kit-owned inline styles and scripts. Adds no DOM element. */
export function CSPProvider({ nonce, disableStyleElements = false, children }: CSPProviderProps) {
  const value = useMemo(() => ({ nonce, disableStyleElements }), [nonce, disableStyleElements]);
  return (
    <CSPContext.Provider value={value}>
      <BaseCSPProvider nonce={nonce} disableStyleElements={disableStyleElements}>
        {children}
      </BaseCSPProvider>
    </CSPContext.Provider>
  );
}

/** CSP settings for custom inline elements; outside a provider: no nonce, styles enabled. */
export function useCSP(): CSPConfig {
  return useContext(CSPContext);
}
