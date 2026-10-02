import { Pause, RefreshCw, Trash2 } from 'lucide-react';
import { Toolbar, ToolbarButton, ToolbarCenter, ToolbarEnd, ToolbarGroup, ToolbarLink, ToolbarSeparator, ToolbarStart } from '../Toolbar';

export default function ToolbarBulkActions() {
  return (
    <Toolbar aria-label="Bulk actions" className="rounded-lg border border-border">
      <ToolbarStart>
        <span className="text-[12.5px] font-semibold text-foreground">3 selected</span>
      </ToolbarStart>
      <ToolbarCenter>
        <ToolbarGroup aria-label="Selection">
          <ToolbarButton icon={Pause}>Pause</ToolbarButton>
          <ToolbarButton icon={RefreshCw}>Reassign</ToolbarButton>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarButton variant="ghost" icon={Trash2} className="text-destructive-text hover:text-destructive-text">
          Delete
        </ToolbarButton>
      </ToolbarCenter>
      <ToolbarEnd>
        <ToolbarLink href="#members">View members</ToolbarLink>
      </ToolbarEnd>
    </Toolbar>
  );
}
