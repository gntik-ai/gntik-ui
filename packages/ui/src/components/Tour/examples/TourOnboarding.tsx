import { Bell, Plus, Search } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button, IconButton } from '../../Button';
import { Tour, type TourStep } from '../Tour';

export default function TourOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<string | null>(null);
  const newProject = useRef<HTMLButtonElement>(null);

  const steps: TourStep[] = [
    { target: '#tour-search', title: 'Find anything', content: 'Search projects, members and invoices from one place. ⌘K opens it anywhere.' },
    { target: newProject, title: 'Create a project', content: 'Projects group deployments, members and billing. Start with one per product.', side: 'bottom', align: 'end' },
    { target: '#tour-alerts', title: 'Stay informed', content: 'Failed deployments and invoice reminders land here.', side: 'left' },
  ];

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm">
        <Button id="tour-search" variant="ghost" size="sm" icon={Search}>
          Search
        </Button>
        <span className="flex-1" />
        <IconButton id="tour-alerts" size="sm" icon={Bell} label="Notifications" />
        <Button ref={newProject} size="sm" icon={Plus}>
          New project
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => {
            setStep(0);
            setOpen(true);
          }}
        >
          Start tour
        </Button>
        {done && <span className="text-[12.5px] text-muted-foreground">{done}</span>}
      </div>
      <Tour
        steps={steps}
        open={open}
        onOpenChange={setOpen}
        step={step}
        onStepChange={setStep}
        onFinish={(completed) => setDone(completed ? 'Tour completed.' : 'Tour skipped.')}
      />
    </div>
  );
}
