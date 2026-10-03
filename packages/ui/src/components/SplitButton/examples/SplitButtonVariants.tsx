import { SplitButton } from '../SplitButton';

const actions = [{ label: 'Save as draft' }, { label: 'Save and close' }];

export default function SplitButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SplitButton actions={actions} menuLabel="More save options (primary)">Save</SplitButton>
      <SplitButton variant="secondary" actions={actions} menuLabel="More save options (secondary)">Save</SplitButton>
      <SplitButton variant="soft" actions={actions} menuLabel="More save options (soft)">Save</SplitButton>
      <SplitButton variant="ghost" size="sm" actions={actions} menuLabel="More save options (ghost)">Save</SplitButton>
      <SplitButton variant="destructive" size="lg" actions={[{ label: 'Delete and archive logs' }]} menuLabel="More delete options">Delete</SplitButton>
      <SplitButton disabled actions={actions} menuLabel="More save options (disabled)">Save</SplitButton>
    </div>
  );
}
