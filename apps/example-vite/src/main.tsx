import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { KitProvider, gntikPreset } from '@gntik-ai/ui';
import App from './App';
import { RouterLink } from './router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KitProvider theme={{ brand: gntikPreset }} link={RouterLink}>
      <App />
    </KitProvider>
  </StrictMode>,
);
