import { useState } from 'react';
import { Button } from '../../Button';
import { Alert } from '../Alert';

export default function AlertDismissible() {
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Show alert again
      </Button>
    );
  }
  return (
    <Alert
      tone="warning"
      title="Your trial ends in 3 days"
      description="Add a payment method to keep your projects running without interruption."
      onDismiss={() => setOpen(false)}
      actions={
        <>
          <Button size="sm">Add payment method</Button>
          <Button size="sm" variant="ghost">View plans</Button>
        </>
      }
      className="max-w-2xl"
    />
  );
}
