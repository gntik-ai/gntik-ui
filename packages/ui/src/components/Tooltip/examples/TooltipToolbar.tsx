import { Download, Pause, RotateCw, Search, Settings, Trash2 } from 'lucide-react';
import { IconButton } from '../../Button';
import { SimpleTooltip, TooltipProvider } from '../Tooltip';

export default function TooltipToolbar() {
  return (
    <TooltipProvider>
      <div role="toolbar" aria-label="Deployment actions" className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1.5 shadow-sm">
        <SimpleTooltip content="Search" kbd="⌘K">
          <IconButton icon={Search} label="Search" />
        </SimpleTooltip>
        <SimpleTooltip content="Pause deployment">
          <IconButton icon={Pause} label="Pause deployment" />
        </SimpleTooltip>
        <SimpleTooltip content="Retry">
          <IconButton icon={RotateCw} label="Retry" />
        </SimpleTooltip>
        <SimpleTooltip content="Download logs">
          <IconButton icon={Download} label="Download logs" />
        </SimpleTooltip>
        <span aria-hidden className="mx-0.5 h-5 w-px bg-border" />
        <SimpleTooltip content="Settings" side="bottom">
          <IconButton icon={Settings} label="Settings" />
        </SimpleTooltip>
        <SimpleTooltip content="Delete" side="bottom">
          <IconButton icon={Trash2} label="Delete" />
        </SimpleTooltip>
      </div>
    </TooltipProvider>
  );
}
