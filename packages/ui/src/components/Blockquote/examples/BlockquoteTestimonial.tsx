import { Avatar } from '../../Avatar';
import { Blockquote } from '../Blockquote';

export default function BlockquoteTestimonial() {
  return (
    <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
      <Blockquote variant="card" source="Dana Whitfield" sourceDetail="Head of Operations, Northwind" avatar={<Avatar fallback="DW" size="sm" />}>
        We moved forty projects in a weekend. Billing, members and deployments came across without a single ticket.
      </Blockquote>
      <Blockquote variant="pull" source="Release notes" sourceDetail="Version 4.2" className="sm:col-span-2">
        Faster builds, quieter alerts, and invoices your finance team can read.
      </Blockquote>
    </div>
  );
}
