import { useEffect, useRef } from 'react';
import { Button } from '../../../components/Button';
import { StatusLayout } from '../StatusLayout';

export default function StatusLayoutHeading() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { titleRef.current?.focus(); }, []);

  return (
    <StatusLayout
      fullScreen
      code="404 · Not found"
      heading={<h1 ref={titleRef} tabIndex={-1} className="text-2xl font-semibold text-foreground">Page not found</h1>}
      description="Check the address or head back to the dashboard."
      primaryAction={<Button render={<a href="#dashboard" />} nativeButton={false}>Go to dashboard</Button>}
      secondaryAction={<Button variant="secondary" onClick={() => window.history.back()}>Go back</Button>}
    />
  );
}
