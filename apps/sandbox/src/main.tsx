import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, ToastProvider, Toaster, TooltipProvider, presets } from '@gntik-ai/ui';
import { Sandbox } from './App';
import type { BrandId } from './protocol';
import './index.css';

function Root() {
  const [brand, setBrand] = useState<BrandId>('gntik');
  return (
    <ThemeProvider brand={presets[brand]}>
      <TooltipProvider>
        <ToastProvider>
          <Sandbox brand={brand} onBrand={setBrand} />
          <Toaster />
        </ToastProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
