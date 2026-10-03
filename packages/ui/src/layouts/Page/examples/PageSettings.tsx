import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Page } from '../Page';

export default function PageSettings() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="h-[420px] overflow-y-auto rounded-lg border border-border bg-background">
      <Page
        width="narrow"
        title="Project settings"
        description="General configuration of web-frontend."
        actions={<Button variant="secondary" icon={Plus}>Add domain</Button>}
        actionBar={
          <>
            <span aria-live="polite" className="me-auto text-[12px] text-muted-foreground">
              {saved ? 'Changes saved' : 'Unsaved changes'}
            </span>
            <Button variant="ghost" onClick={() => setSaved(false)}>
              Discard
            </Button>
            <Button onClick={() => setSaved(true)}>Save changes</Button>
          </>
        }
      >
        {['General', 'Domains', 'Environment variables', 'Danger zone'].map((section) => (
          <section key={section} aria-labelledby={`page-example-${section}`} className="rounded-[10px] border border-border bg-card p-4">
            <h2 id={`page-example-${section}`} className="text-[14px] font-semibold">
              {section}
            </h2>
            <p className="mt-1 text-[12.5px] text-muted-foreground">Settings for {section.toLowerCase()}.</p>
          </section>
        ))}
      </Page>
    </div>
  );
}
