import { Copy, Eye, Pause, RotateCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { MoreMenu } from '../MoreMenu';

export default function MenuRowActions() {
  const [last, setLast] = useState('');
  return (
    <div className="flex flex-col items-center gap-4">
      <MoreMenu
        label="Deployment actions"
        items={[
          { label: 'View logs', icon: Eye, shortcut: '⌘L', onSelect: () => setLast('Opening logs') },
          { label: 'Restart', icon: RotateCw, shortcut: '⌘R', onSelect: () => setLast('Restarted') },
          { label: 'Duplicate', icon: Copy, shortcut: '⌘D', onSelect: () => setLast('Duplicated') },
          'separator',
          { label: 'Pause', icon: Pause, onSelect: () => setLast('Paused') },
          'separator',
          { label: 'Delete deployment', icon: Trash2, destructive: true, onSelect: () => setLast('Deleted') },
        ]}
      />
      <p aria-live="polite" className="h-4 font-mono text-[11px] text-muted-foreground">
        {last}
      </p>
    </div>
  );
}
