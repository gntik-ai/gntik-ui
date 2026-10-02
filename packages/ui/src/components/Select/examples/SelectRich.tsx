import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger } from '../Select';

const members = [
  { value: 'emma', name: 'Emma Crown', email: 'emma@example.com', initials: 'EC' },
  { value: 'leo', name: 'Leo Park', email: 'leo@example.com', initials: 'LP' },
  { value: 'mara', name: 'Mara Vidal', email: 'mara@example.com', initials: 'MV' },
];

const environments = [
  { value: 'production', label: 'Production', tone: 'bg-primary', note: '12 services' },
  { value: 'staging', label: 'Staging', tone: 'bg-warning', note: '4 services' },
  { value: 'development', label: 'Development', tone: 'bg-info', note: '7 services' },
];

function Avatar({ initials }: { initials: string }) {
  return (
    <span aria-hidden className="grid size-[22px] shrink-0 place-items-center rounded-full bg-accent text-[9px] font-semibold text-accent-foreground">
      {initials}
    </span>
  );
}

export default function SelectRich() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <div>
        <Select items={members.map((m) => ({ value: m.value, label: m.name }))} defaultValue="emma">
          <SelectLabel>Assign reviewer</SelectLabel>
          <SelectTrigger>
            {(value: string) => {
              const m = members.find((x) => x.value === value);
              return m ? (<><Avatar initials={m.initials} /><span className="truncate">{m.name}</span></>) : null;
            }}
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.value} value={m.value} label={m.name}>
                <Avatar initials={m.initials} />
                <span className="flex min-w-0 flex-col leading-tight">
                  <span className="truncate font-medium">{m.name}</span>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">{m.email}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select items={environments} defaultValue="production">
          <SelectLabel>Active environment</SelectLabel>
          <SelectTrigger>
            {(value: string) => {
              const e = environments.find((x) => x.value === value);
              return e ? (<><span aria-hidden className={`size-2 shrink-0 rounded-full ${e.tone}`} />{e.label}</>) : null;
            }}
          </SelectTrigger>
          <SelectContent>
            {environments.map((e) => (
              <SelectItem key={e.value} value={e.value} label={e.label}>
                <span aria-hidden className={`size-2 shrink-0 rounded-full ${e.tone}`} />
                <span className="font-medium">{e.label}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{e.note}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
