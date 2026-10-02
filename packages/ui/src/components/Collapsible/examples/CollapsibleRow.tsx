import { useState } from 'react';
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '../Collapsible';

export default function CollapsibleRow() {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible variant="row" open={open} onOpenChange={setOpen} className="max-w-xl">
      <CollapsibleTrigger>Billing details</CollapsibleTrigger>
      <CollapsiblePanel>
        Invoices are sent on the first day of each month to the billing contact of the workspace.
      </CollapsiblePanel>
    </Collapsible>
  );
}
