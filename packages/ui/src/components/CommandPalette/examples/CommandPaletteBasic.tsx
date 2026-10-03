import { BarChart3, CreditCard, Download, FolderKanban, FolderPlus, Home, Rocket, Settings, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { CommandPalette, CommandPaletteTrigger } from '../CommandPalette';
import type { CommandGroup, CommandItem } from '../command-filter';

export default function CommandPaletteBasic() {
  const [last, setLast] = useState('');
  const go = (label: string) => () => setLast(label);
  const groups: CommandGroup[] = [
    {
      label: 'Actions',
      items: [
        { id: 'new-project', label: 'Create project', icon: FolderPlus, shortcut: ['⌘', 'N'], keywords: ['new'], onSelect: go('Create project') },
        { id: 'deploy', label: 'Deploy to production', icon: Rocket, shortcut: ['⌘', 'D'], description: 'Promote the latest build of the current project', onSelect: go('Deploy to production') },
        { id: 'invite', label: 'Invite member', icon: UserPlus, keywords: ['team', 'people'], onSelect: go('Invite member') },
        { id: 'export', label: 'Export usage (CSV)', icon: Download, onSelect: go('Export usage (CSV)') },
      ],
    },
    {
      label: 'Go to',
      items: [
        { id: 'overview', label: 'Overview', icon: Home, shortcut: ['G', 'O'], onSelect: go('Overview') },
        { id: 'projects', label: 'Projects', icon: FolderKanban, shortcut: ['G', 'P'], onSelect: go('Projects') },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, onSelect: go('Analytics') },
        { id: 'members', label: 'Members', icon: Users, onSelect: go('Members') },
        { id: 'billing', label: 'Billing', icon: CreditCard, keywords: ['invoices', 'plan'], onSelect: go('Billing') },
        { id: 'settings', label: 'Settings', icon: Settings, shortcut: ['⌘', ','], onSelect: go('Settings') },
      ],
    },
  ];
  const recent: CommandItem[] = [
    { id: 'web-frontend', label: 'web-frontend', icon: FolderKanban, mono: true, description: 'Project', onSelect: go('web-frontend') },
    { id: 'billing-api', label: 'billing-api', icon: FolderKanban, mono: true, description: 'Project', onSelect: go('billing-api') },
  ];
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <CommandPalette groups={groups} recent={recent}>
        <CommandPaletteTrigger />
      </CommandPalette>
      <p aria-live="polite" className="text-[12px] text-muted-foreground">
        {last ? (
          <>
            Last command: <span className="font-mono text-foreground">{last}</span>
          </>
        ) : (
          'Press ⌘K (Ctrl+K) or the button to open'
        )}
      </p>
    </div>
  );
}
