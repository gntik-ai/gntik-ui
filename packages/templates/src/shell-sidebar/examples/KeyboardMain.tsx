import { useState } from 'react';
import { Button, THEME_OPTIONS } from '@gntik-ai/ui';
import { ConsoleShell } from '../../shared/ConsoleShell';

export default function KeyboardMain() {
  const [long, setLong] = useState(true);
  return (
    <ConsoleShell
      mainLabel="Reading area"
      nav={[]}
      workspaces={null}
      user={null}
      usage={null}
      helpHref=""
      topbar={{
        breadcrumb: <Button onClick={() => setLong(!long)}>{long ? 'Show short content' : 'Show long content'}</Button>,
        environment: null,
        search: null,
        notifications: null,
        themeOptions: THEME_OPTIONS.slice(0, 2),
      }}
    >
      <div className="space-y-4 p-6">
        <h1 className="text-xl font-semibold">Keyboard scrolling</h1>
        <p>The main becomes a named Tab stop when it overflows. The topbar offers only Light and Dark.</p>
        {long && Array.from({ length: 60 }, (_, i) => <p key={i}>Content section {i + 1}</p>)}
      </div>
    </ConsoleShell>
  );
}
