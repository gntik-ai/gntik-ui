import { Copy, ExternalLink, FolderInput, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { MenuItem, MenuSeparator, MenuSub, MenuSubContent, MenuSubTrigger } from '../../Menu';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '../ContextMenu';

export default function ContextMenuCard() {
  const [last, setLast] = useState('');
  return (
    <div className="flex flex-col items-center gap-4">
      <ContextMenu>
        <ContextMenuTrigger
          role="group"
          aria-label="Project billing-api"
          className="grid h-36 w-full max-w-72 place-items-center border border-dashed border-border bg-card p-4 text-center"
        >
          <span className="text-[13px] font-medium text-foreground">billing-api</span>
          <span className="font-mono text-[11px] text-muted-foreground">Right click or long press</span>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <MenuItem icon={ExternalLink} onClick={() => setLast('Opened billing-api')}>
            Open
          </MenuItem>
          <MenuItem icon={Pencil} shortcut="F2" onClick={() => setLast('Renaming billing-api')}>
            Rename
          </MenuItem>
          <MenuItem icon={Copy} shortcut="⌘D" onClick={() => setLast('Duplicated billing-api')}>
            Duplicate
          </MenuItem>
          <MenuSub>
            <MenuSubTrigger icon={FolderInput}>Move to</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem onClick={() => setLast('Moved to Platform')}>Platform</MenuItem>
              <MenuItem onClick={() => setLast('Moved to Archive')}>Archive</MenuItem>
            </MenuSubContent>
          </MenuSub>
          <MenuSeparator />
          <MenuItem icon={Trash2} destructive onClick={() => setLast('Deleted billing-api')}>
            Delete project
          </MenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <p aria-live="polite" className="h-4 font-mono text-[11px] text-muted-foreground">
        {last}
      </p>
    </div>
  );
}
