import { falconePreset, KitProvider } from '@gntik-ai/ui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { RouterLink, useAnchorInterception } from './router';

/** Same key as the inlined themeScript (vite.config.ts). */
const THEME_KEY = 'falcone-theme';

function Root() {
  useAnchorInterception();
  return (
    <KitProvider theme={{ brand: falconePreset, defaultMode: 'dark', storageKey: THEME_KEY }} link={RouterLink}>
      <App />
    </KitProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
