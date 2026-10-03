import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;

export function DialogContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Popup className={cn('rounded-lg bg-card p-6', className)}>
        {children}
        <BaseDialog.Close aria-label="Close"><X size={16} /></BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
