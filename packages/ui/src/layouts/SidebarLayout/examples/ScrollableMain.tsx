import { useState } from 'react';
import { Button } from '../../../components/Button';
import { SidebarLayout } from '../SidebarLayout';

export default function ScrollableMain() {
  const [long, setLong] = useState(true);
  return (
    <div className="h-[320px] overflow-hidden rounded-lg border border-border">
      <SidebarLayout
        sidebar={<p className="text-sm">Navigation</p>}
        mainLabel="Reading area"
        collapsible={false}
        topbar={<Button onClick={() => setLong(!long)}>{long ? 'Show short content' : 'Show long content'}</Button>}
      >
        <div className="space-y-4 p-6">
          <h1 className="text-xl font-semibold">Keyboard scrolling</h1>
          <p>Tab to the overflowing main, then use the arrow keys to scroll.</p>
          {long && Array.from({ length: 20 }, (_, i) => <p key={i}>Content section {i + 1}</p>)}
        </div>
      </SidebarLayout>
    </div>
  );
}
