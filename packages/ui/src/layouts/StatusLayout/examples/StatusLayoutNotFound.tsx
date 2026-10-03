import { ArrowLeft, FileQuestion, Home } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Link } from '../../../components/Link';
import { Logo } from '../../../theme/Logo';
import { StatusLayout } from '../StatusLayout';

export default function StatusLayoutNotFound() {
  return (
    <div className="h-[480px] overflow-hidden rounded-lg border border-border">
      <StatusLayout
        header={<Logo size={24} wordmark />}
        icon={FileQuestion}
        code="404 · Not found"
        title="We can’t find that page"
        description="The project may have been renamed or deleted, or the link is out of date."
        primaryAction={
          <Button icon={Home} render={<a href="#dashboard" />} nativeButton={false}>
            Go to dashboard
          </Button>
        }
        secondaryAction={
          <Button variant="secondary" icon={ArrowLeft}>
            Go back
          </Button>
        }
        footer={
          <>
            <Link href="#status">System status</Link>
            <Link href="#support">Contact support</Link>
          </>
        }
      />
    </div>
  );
}
