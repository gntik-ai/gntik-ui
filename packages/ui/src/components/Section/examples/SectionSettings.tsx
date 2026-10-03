import { Button } from '../../Button';
import { Switch } from '../../Switch';
import { Section } from '../Section';

const ROWS = [
  ['Email digests', 'A weekly summary of activity in your projects.'],
  ['Deployment alerts', 'Notify me when a deployment fails or rolls back.'],
  ['Invoice reminders', 'Send a reminder three days before an invoice is due.'],
] as const;

export default function SectionSettings() {
  return (
    <Section
      variant="card"
      padding="md"
      divided
      title="Notifications"
      description="Choose what reaches your inbox."
      actions={<Button variant="secondary" size="sm">Reset</Button>}
      className="max-w-[560px]"
    >
      {ROWS.map(([label, hint]) => (
        <div key={label} className="flex items-start justify-between gap-4">
          <span>
            <span className="block text-[13px] font-medium text-foreground">{label}</span>
            <span className="block text-[12.5px] text-muted-foreground">{hint}</span>
          </span>
          <Switch aria-label={label} defaultChecked={label !== 'Invoice reminders'} />
        </div>
      ))}
    </Section>
  );
}
