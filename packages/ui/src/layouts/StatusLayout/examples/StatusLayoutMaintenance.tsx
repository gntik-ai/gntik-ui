import { RefreshCw, Wrench } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/Button';
import { Link } from '../../../components/Link';
import { Logo } from '../../../theme/Logo';
import { StatusLayout } from '../StatusLayout';

export default function StatusLayoutMaintenance() {
  const [checked, setChecked] = useState(false);
  return (
    <div className="h-[480px] overflow-hidden rounded-lg border border-border">
      <StatusLayout
        tone="warning"
        header={<Logo size={24} wordmark />}
        icon={Wrench}
        code="Scheduled maintenance"
        title="We’ll be back shortly"
        description="We are upgrading the database. Deployments keep running; the dashboard is read-only until 14:30 UTC."
        primaryAction={
          <Button icon={RefreshCw} onClick={() => setChecked(true)}>
            Check again
          </Button>
        }
        secondaryAction={
          <Button variant="secondary" render={<a href="#status" />} nativeButton={false}>
            View status page
          </Button>
        }
        footer={<span className="font-mono">Started 13:00 UTC · <Link href="#updates">Subscribe to updates</Link></span>}
      >
        <p aria-live="polite" className="h-4 text-[12.5px] text-muted-foreground">
          {checked ? 'Still in maintenance. Try again in a few minutes.' : ''}
        </p>
      </StatusLayout>
    </div>
  );
}
