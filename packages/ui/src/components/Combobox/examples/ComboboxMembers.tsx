import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from '../Combobox';

interface Member {
  value: string;
  label: string;
  email: string;
  initials: string;
}

const members: Member[] = [
  { value: 'emma', label: 'Emma Crown', email: 'emma@example.com', initials: 'EC' },
  { value: 'leo', label: 'Leo Park', email: 'leo@example.com', initials: 'LP' },
  { value: 'mara', label: 'Mara Vidal', email: 'mara@example.com', initials: 'MV' },
  { value: 'noah', label: 'Noah Frey', email: 'noah@example.com', initials: 'NF' },
  { value: 'ines', label: 'Ines Roca', email: 'ines@example.com', initials: 'IR' },
];

export default function ComboboxMembers() {
  return (
    <div className="w-full max-w-sm">
      <Combobox items={members} defaultValue={members[2] ?? null}>
        <ComboboxInput label="On-call owner" placeholder="Search members…" />
        <ComboboxContent emptyText="No members found.">
          {(m: Member) => (
            <ComboboxItem key={m.value} value={m}>
              <span aria-hidden className="grid size-[22px] shrink-0 place-items-center rounded-full bg-accent text-[9px] font-semibold text-accent-foreground">
                {m.initials}
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate font-medium">{m.label}</span>
                <span className="truncate font-mono text-[11px] text-muted-foreground">{m.email}</span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
