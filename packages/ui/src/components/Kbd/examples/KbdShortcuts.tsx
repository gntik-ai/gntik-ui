import { Kbd, KbdCombo } from '../Kbd';

export default function KbdShortcuts() {
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-2">Search <KbdCombo keys={['⌘', 'K']} /></span>
        <span className="inline-flex items-center gap-2">New project <KbdCombo keys={['Ctrl', 'Shift', 'N']} separator="+" /></span>
        <span className="inline-flex items-center gap-2">Close <Kbd>esc</Kbd></span>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Kbd size="sm">↑↓</Kbd>navigate</span>
        <span className="inline-flex items-center gap-1.5"><Kbd size="sm">↵</Kbd>select</span>
        <span className="inline-flex items-center gap-1.5"><Kbd size="lg">Tab</Kbd>next field</span>
      </div>
    </div>
  );
}
