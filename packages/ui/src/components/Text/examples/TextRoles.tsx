import { Heading, Text } from '../Text';

export default function TextRoles() {
  return (
    <div className="grid max-w-[560px] gap-3">
      <Text variant="display">2.4k</Text>
      <Heading level={2}>Project overview</Heading>
      <Text>
        Deployments roll out region by region. Run <Text variant="code">deploy --canary</Text> to ship to a
        single region first.
      </Text>
      <Text variant="label">Billing email</Text>
      <Text variant="supporting">Invoices and receipts are sent to this address.</Text>
      <Text variant="caption">Updated 3 minutes ago</Text>
      <div className="flex flex-wrap gap-4">
        <Text variant="label" tone="primary">Active</Text>
        <Text variant="label" tone="success">Paid</Text>
        <Text variant="label" tone="warning">Due soon</Text>
        <Text variant="label" tone="destructive">Overdue</Text>
      </div>
    </div>
  );
}
