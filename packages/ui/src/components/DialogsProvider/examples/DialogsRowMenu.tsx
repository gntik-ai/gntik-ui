import { Ellipsis, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { IconButton } from '../../Button';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../../Menu';
import { DialogsProvider, useDialogs } from '../index';

function KeyRow() {
  const { confirm } = useDialogs();
  const [status, setStatus] = useState('Active');
  return (
    <div className="flex w-full max-w-sm items-center justify-between gap-3 rounded-lg border border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <KeyRound size={16} aria-hidden className="text-muted-foreground" />
        <div>
          <p className="text-[13px] font-medium text-foreground">ci-deploy key</p>
          <p aria-live="polite" className="text-[12px] text-muted-foreground">
            {status}
          </p>
        </div>
      </div>
      <Menu>
        <MenuTrigger render={<IconButton icon={Ellipsis} label="Key actions" variant="ghost" />} />
        <MenuContent align="end">
          <MenuItem
            destructive
            onClick={async () => {
              const revoked = await confirm('This key stops working at once. Deployments that use it will fail.', {
                title: 'Revoke API key',
                confirmLabel: 'Revoke',
              });
              setStatus(revoked ? 'Revoked' : 'Active');
            }}
          >
            Revoke key
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}

/** A row menu item starts the confirmation; Cancel returns focus to the menu trigger. */
export default function DialogsRowMenu() {
  return (
    <DialogsProvider>
      <KeyRow />
    </DialogsProvider>
  );
}
