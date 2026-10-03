import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, gntikPreset } from '@gntik-ai/ui';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider brand={gntikPreset}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
