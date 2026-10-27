import './styles.css';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@gntik-ai/ui';
import ChartExportExample from './examples/ChartExport';

// Keep this strict-CSP consumer independent of the catalog's eagerly loaded examples.
createRoot(document.getElementById('root')).render(
  <ThemeProvider defaultTheme="dark">
    <main className="mx-auto max-w-3xl p-6">
      <ChartExportExample />
    </main>
  </ThemeProvider>,
);
