import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { KitProvider, presets } from '@gntik-ai/ui';
import { Sandbox } from './App';
import type { BrandId } from './protocol';
import './index.css';

function Root() {
  const [brand, setBrand] = useState<BrandId>('gntik');
  return (
    <KitProvider theme={{ brand: presets[brand] }}>
      <Sandbox brand={brand} onBrand={setBrand} />
    </KitProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
