import { Button } from '../../Button';
import { ToastProvider, Toaster, useToast } from '../Toast';
import type { ToastOptions } from '../Toast';

const SAMPLES: Array<{ label: string; toast: ToastOptions }> = [
  { label: 'Success', toast: { tone: 'success', title: 'Deployment complete', description: 'support-triage is serving traffic in eu-west-1.' } },
  { label: 'Info', toast: { tone: 'info', title: 'New version available', description: 'Projects update tonight during the maintenance window.' } },
  { label: 'Warning', toast: { tone: 'warning', title: 'Budget at 92%', description: '$9.2k of $10k used this month.' } },
  { label: 'Error', toast: { tone: 'destructive', title: 'Deployment failed', description: 'us-east-1 has not responded for 4 minutes.' } },
  { label: 'Neutral', toast: { title: 'Settings saved' } },
];

function Buttons() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SAMPLES.map(({ label, toast: options }) => (
        <Button key={label} variant="secondary" size="sm" onClick={() => toast.add(options)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

export default function ToastTones() {
  return (
    <ToastProvider>
      <Buttons />
      <Toaster />
    </ToastProvider>
  );
}
