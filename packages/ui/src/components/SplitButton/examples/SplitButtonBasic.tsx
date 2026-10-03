import { CalendarClock, FileDown, Rocket, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { SplitButton } from '../SplitButton';

export default function SplitButtonBasic() {
  const [last, setLast] = useState('Nothing yet');
  return (
    <div className="flex flex-col items-start gap-3">
      <SplitButton
        aria-label="Deploy"
        icon={Rocket}
        onClick={() => setLast('Deployed now')}
        menuLabel="More deploy options"
        actions={[
          { label: 'Schedule deploy', icon: CalendarClock, onSelect: () => setLast('Deploy scheduled') },
          { label: 'Export manifest', icon: FileDown, onSelect: () => setLast('Manifest exported') },
          { label: 'Discard draft', icon: Trash2, destructive: true, separator: true, onSelect: () => setLast('Draft discarded') },
        ]}
      >
        Deploy
      </SplitButton>
      <p className="text-[12.5px] text-muted-foreground">
        Last action: <span className="text-foreground">{last}</span>
      </p>
    </div>
  );
}
