import { CreditCard, FolderKanban, Home, Menu, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../Button';
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../Drawer';

const NAV = [
  { label: 'Overview', icon: Home },
  { label: 'Projects', icon: FolderKanban },
  { label: 'Members', icon: Users },
  { label: 'Billing', icon: CreditCard },
  { label: 'Settings', icon: Settings },
];

export default function DrawerNavigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('Projects');
  return (
    <Drawer side="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={<Button variant="secondary" icon={Menu} />}>Open menu</DrawerTrigger>
      <DrawerContent size="sm">
        <DrawerHeader className="px-4">
          <DrawerTitle>Workspace</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="px-2.5 py-3">
          <nav aria-label="Workspace">
            {NAV.map(({ label, icon: Icon }) => {
              const current = label === active;
              return (
                <button
                  key={label}
                  type="button"
                  aria-current={current ? 'page' : undefined}
                  onClick={() => {
                    setActive(label);
                    setOpen(false);
                  }}
                  className={
                    'relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-[13.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ' +
                    (current
                      ? 'bg-accent font-semibold text-accent-foreground'
                      : 'font-medium text-muted-foreground hover:bg-accent/45 hover:text-foreground')
                  }
                >
                  {current && <span aria-hidden className="absolute top-2 bottom-2 left-0 w-[3px] rounded-r bg-primary" />}
                  <Icon size={17} aria-hidden className="shrink-0" />
                  {label}
                </button>
              );
            })}
          </nav>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
