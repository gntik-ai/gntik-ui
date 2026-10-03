/* ============================================================================
   Gntik UI · date-time-picker.jsx — date and time picker ("Forms" group).
   Date AND time editable two ways: typing (DD/MM/YYYY and HH:MM fields with a
   stepper) or picking (month calendar + slots). Brand calendar: week starts
   on Monday, "today" with a ring, past disabled, primary green on the
   selection (scheduling a job / a window). Tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useEffect, useRef, useClickOutside } = window;

const Variant = ({ title, desc, code, children, minH = '' }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className={"preview-surface rounded-lg border border-border p-6 sm:p-8 " + minH}>{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── date · utilities ────────────────────────────────────────────────────── */
const pad = (n) => String(n).padStart(2, '0');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WD1 = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WD_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TODAY = new Date(2026, 5, 28);   // the catalog's "today": Sun 28 Jun 2026

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a, b) => a && b && startOfDay(a).getTime() === startOfDay(b).getTime();
const isBefore = (a, b) => startOfDay(a) < startOfDay(b);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const firstOf = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const monthMatrix = (y, m) => {
  const off = (new Date(y, m, 1).getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => new Date(y, m, 1 - off + i));
};
const fmtSlash = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const fmtLong = (d) => `${d.getDate()} ${MON3[d.getMonth()]} ${d.getFullYear()}`;
const fmtWeekday = (d) => `${WD_LONG[(d.getDay() + 6) % 7]}, ${d.getDate()}`;
const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/* ── time slots (static availability) ────────────────────────────────────── */
const SLOTS = (() => {
  const busy = new Set(['09:00', '09:30', '12:00', '14:30', '15:00', '18:30']);
  const out = [];
  for (let h = 9; h <= 21; h++) for (const mm of [0, 30]) {
    if (h === 21 && mm === 30) break;
    const t = pad(h) + ':' + pad(mm);
    out.push({ time: t, available: !busy.has(t) });
  }
  return out;
})();

/* ── compact month calendar ──────────────────────────────────────────────── */
function MiniCalendar({ month, setMonth, selected, onSelect, minDate }) {
  const y = month.getFullYear(), m = month.getMonth();
  const canPrev = !(y === minDate.getFullYear() && m === minDate.getMonth());
  const NavBtn = ({ dir, disabled }) => (
    <button type="button" disabled={disabled} onClick={() => setMonth(addMonths(month, dir === 'prev' ? -1 : 1))}
      className={"grid size-7 place-items-center rounded-md transition-colors " + (disabled ? 'text-muted-foreground/30 cursor-not-allowed' : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground')}>
      <Icon name={dir === 'prev' ? 'chevronLeft' : 'chevronRight'} size={16} />
    </button>
  );
  return (
    <div className="w-[256px] shrink-0 p-3">
      <div className="mb-2 flex items-center justify-between">
        <NavBtn dir="prev" disabled={!canPrev} />
        <div className="text-[13px] font-semibold text-foreground">{MONTHS[m]} {y}</div>
        <NavBtn dir="next" />
      </div>
      <div className="grid grid-cols-7">
        {WD1.map((d, i) => <div key={i} className="grid h-7 place-items-center font-mono text-[10.5px] text-muted-foreground/80">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {monthMatrix(y, m).map((d, i) => {
          const out = d.getMonth() !== m;
          const disabled = isBefore(d, minDate);
          const sel = sameDay(d, selected);
          const today = sameDay(d, TODAY);
          return (
            <button key={i} type="button" disabled={disabled} onClick={() => onSelect(d)}
              className={"mx-auto grid size-8 place-items-center rounded-md text-[12.5px] transition-colors " +
                (sel ? 'bg-primary font-semibold text-primary-foreground'
                  : disabled ? 'cursor-not-allowed text-muted-foreground/30'
                  : out ? 'text-muted-foreground/45 hover:bg-secondary/60'
                  : 'text-foreground hover:bg-secondary/70') +
                (today && !sel ? ' ring-1 ring-inset ring-primary/60' : '')}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── editable time field (type + stepper) ────────────────────────────────── */
function EditableTime({ value, onChange, className = '' }) {
  const [raw, setRaw] = useState(value);
  useEffect(() => { setRaw(value); }, [value]);
  const valid = TIME_RE.test(raw.trim());
  const commit = (s) => { const t = s.trim(); if (TIME_RE.test(t)) { const [h, mm] = t.split(':'); onChange(pad(+h) + ':' + pad(+mm)); } };
  const bump = (delta) => {
    const base = TIME_RE.test(raw.trim()) ? raw.trim() : value;
    const [h, mm] = base.split(':').map(Number);
    const tot = ((h * 60 + mm + delta) % 1440 + 1440) % 1440;
    onChange(pad(Math.floor(tot / 60)) + ':' + pad(tot % 60));
  };
  const bad = raw.trim() !== '' && !valid;
  return (
    <div className={"flex items-center rounded-md border bg-background pl-2.5 pr-1 shadow-sm transition-colors " +
      (bad ? 'border-destructive/70 focus-within:ring-2 focus-within:ring-destructive/25'
           : 'border-border focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25') + ' ' + className}>
      <Icon name="clock" size={15} className="shrink-0 text-muted-foreground" />
      <input value={raw} inputMode="numeric" placeholder="HH:MM" aria-label="Time"
        onChange={(e) => { setRaw(e.target.value); commit(e.target.value); }} onBlur={() => commit(raw)}
        className="h-9 w-full bg-transparent px-2 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
      <div className="flex shrink-0 flex-col">
        <button type="button" tabIndex={-1} aria-label="Increase" onClick={() => bump(15)} className="grid h-[15px] w-5 place-items-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"><Icon name="chevronUp" size={12} /></button>
        <button type="button" tabIndex={-1} aria-label="Decrease" onClick={() => bump(-15)} className="grid h-[15px] w-5 place-items-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"><Icon name="chevron" size={12} /></button>
      </div>
    </div>
  );
}

/* ── editable date field (DD/MM/YYYY) ────────────────────────────────────── */
function EditableDate({ value, onChange, minDate, className = '' }) {
  const [raw, setRaw] = useState(() => fmtSlash(value));
  useEffect(() => { setRaw(fmtSlash(value)); }, [value]);
  const parse = (s) => {
    const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (!m) return null;
    const d = new Date(+m[3], +m[2] - 1, +m[1]);
    return (d.getDate() === +m[1] && d.getMonth() === +m[2] - 1) ? d : null;
  };
  const parsed = parse(raw);
  const valid = parsed && !isBefore(parsed, minDate);
  const bad = raw.trim() !== '' && !valid;
  const commit = (s) => { const d = parse(s); if (d && !isBefore(d, minDate)) onChange(d); };
  return (
    <div className={"flex items-center rounded-md border bg-background pl-2.5 pr-2 shadow-sm transition-colors " +
      (bad ? 'border-destructive/70 focus-within:ring-2 focus-within:ring-destructive/25'
           : 'border-border focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/25') + ' ' + className}>
      <Icon name="calendar" size={15} className="shrink-0 text-muted-foreground" />
      <input value={raw} inputMode="numeric" placeholder="DD/MM/YYYY" aria-label="Date"
        onChange={(e) => { setRaw(e.target.value); commit(e.target.value); }} onBlur={() => commit(raw)}
        className="h-9 w-full bg-transparent px-2 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none" />
      {bad && <Icon name="alert" size={14} className="shrink-0 text-destructive" />}
    </div>
  );
}

/* ── time slots (scrolling list) ─────────────────────────────────────────── */
function TimeSlots({ value, onChange, dateLabel, cols = 'grid-cols-2 sm:grid-cols-1' }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-9 shrink-0 items-center px-4 text-[12.5px] font-medium text-foreground">{dateLabel}</div>
      <div className="max-h-[244px] overflow-y-auto px-3 pb-3">
        <div className={"grid gap-1.5 " + cols}>
          {SLOTS.map((s) => {
            const on = value === s.time;
            return (
              <button key={s.time} type="button" disabled={!s.available} onClick={() => onChange(s.time)}
                className={"h-8 rounded-md font-mono text-[12px] font-medium transition-colors " +
                  (on ? 'bg-primary text-primary-foreground shadow-sm'
                    : s.available ? 'border border-border bg-background text-foreground hover:border-muted-foreground/40 hover:bg-secondary/60'
                    : 'cursor-not-allowed border border-border/50 bg-secondary/20 text-muted-foreground/40 line-through')}>
                {s.time}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── generic popover (trigger + content, closes on outside click) ────────── */
function Popover({ render, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div ref={ref} className="relative inline-block">
      {render(open, () => setOpen((o) => !o))}
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

const Trigger = ({ open, toggle, filled, label, width = 'w-[280px]' }) => (
  <button type="button" onClick={toggle} aria-haspopup="dialog" aria-expanded={open}
    className={"flex h-9 items-center gap-2 rounded-md border bg-background pl-3 pr-2.5 text-[13px] shadow-sm transition-colors focus:outline-none " + width + " " +
      (open ? 'border-primary/60 ring-2 ring-ring/25' : 'border-border hover:border-muted-foreground/40')}>
    <Icon name="calendar" size={15} className="shrink-0 text-muted-foreground" />
    <span className={"truncate " + (filled ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
    <Icon name="chevron" size={15} className={"ml-auto shrink-0 text-muted-foreground transition-transform " + (open ? 'rotate-180' : '')} />
  </button>
);

/* ════════════════════════════════════════════════════════════════════════
   1 · POPOVER — calendar + time (typeable or by slots)
   ════════════════════════════════════════════════════════════════════════ */
function PopoverPicker() {
  const [month, setMonth] = useState(firstOf(TODAY));
  const [date, setDate] = useState(TODAY);
  const [time, setTime] = useState('10:00');
  const label = `${fmtLong(date)} · ${time}`;
  return (
    <div className="flex justify-center">
      <Popover render={(open, toggle) => <Trigger open={open} toggle={toggle} filled label={label} />}>
        {(close) => (
          <div className="flex max-sm:flex-col">
            <MiniCalendar month={month} setMonth={setMonth} selected={date} minDate={TODAY}
              onSelect={(d) => { setDate(d); setMonth(firstOf(d)); }} />
            <div className="flex w-full flex-col border-border sm:w-44 sm:border-l max-sm:border-t">
              <div className="px-4 pt-3">
                <div className="text-[12.5px] font-medium text-foreground">{fmtWeekday(date)}</div>
                <div className="mt-2"><EditableTime value={time} onChange={setTime} /></div>
              </div>
              <div className="mt-3 border-t border-border/60 pt-2.5">
                <TimeSlots value={time} onChange={setTime} dateLabel="Available slots" />
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border/60 px-3 py-2">
                <span className="font-mono text-[11px] text-muted-foreground">{fmtSlash(date)} {time}</span>
                <button type="button" onClick={close} className="inline-flex h-7 items-center rounded-md bg-primary px-3 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">Done</button>
              </div>
            </div>
          </div>
        )}
      </Popover>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   2 · INLINE — editable fields (typing) + calendar + chips
   ════════════════════════════════════════════════════════════════════════ */
const QUICK = [['Morning', '09:00'], ['Midday', '12:00'], ['Afternoon', '16:00'], ['Evening', '21:00']];
function InlinePicker() {
  const [month, setMonth] = useState(firstOf(TODAY));
  const [date, setDate] = useState(TODAY);
  const [time, setTime] = useState('10:30');
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-foreground">Date</label>
          <EditableDate value={date} minDate={TODAY} onChange={(d) => { setDate(d); setMonth(firstOf(d)); }} />
        </div>
        <div>
          <label className="mb-2 block text-[13px] font-medium text-foreground">Time</label>
          <EditableTime value={time} onChange={setTime} />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm sm:flex">
        <div className="border-border max-sm:border-b sm:border-r">
          <MiniCalendar month={month} setMonth={setMonth} selected={date} minDate={TODAY}
            onSelect={(d) => { setDate(d); setMonth(firstOf(d)); }} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-3">
          <div className="px-1 pb-2 text-[12.5px] font-medium text-foreground">{fmtWeekday(date)}</div>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK.map(([lbl, t]) => {
              const on = time === t;
              return (
                <button key={t} type="button" onClick={() => setTime(t)}
                  className={"flex h-9 flex-col items-start justify-center rounded-md border px-2.5 transition-colors " +
                    (on ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/25' : 'border-border bg-background hover:border-muted-foreground/40')}>
                  <span className={"text-[11px] leading-none " + (on ? 'text-primary' : 'text-muted-foreground')}>{lbl}</span>
                  <span className="mt-0.5 font-mono text-[12px] font-medium leading-none text-foreground">{t}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-auto flex items-center gap-2 pt-3 text-[12px] text-muted-foreground">
            <Icon name="check" size={14} className="text-primary" stroke={2.4} />
            <span className="font-mono text-foreground">{fmtSlash(date)} · {time}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground" style={{ textWrap: 'pretty' }}>Edit by typing in the fields (DD/MM/YYYY · HH:MM), with the time stepper, or by picking in the calendar and the chips — everything stays in sync.</p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   3 · TRIGGER STATES
   ════════════════════════════════════════════════════════════════════════ */
function TriggerStates() {
  const Box = ({ label, children }) => (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">{label}</div>
      {children}
    </div>
  );
  const Static = ({ filled, label, disabled }) => (
    <button type="button" disabled={disabled}
      className={"flex h-9 w-[240px] items-center gap-2 rounded-md border bg-background pl-3 pr-2.5 text-[13px] shadow-sm transition-colors " +
        (disabled ? 'cursor-not-allowed border-border opacity-55' : 'border-border hover:border-muted-foreground/40')}>
      <Icon name="calendar" size={15} className="shrink-0 text-muted-foreground" />
      <span className={"truncate " + (filled ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
      <Icon name="chevron" size={15} className="ml-auto shrink-0 text-muted-foreground" />
    </button>
  );
  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-3">
      <Box label="Placeholder"><Static label="Pick a date and time" /></Box>
      <Box label="With value"><Static filled label="28 Jun 2026 · 10:00" /></Box>
      <Box label="Disabled"><Static disabled filled label="Locked by policy" /></Box>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_CAL = `// Month calendar — week starts Monday, "today" with a ring, past disabled
const monthMatrix = (y, m) => {
  const off = (new Date(y, m, 1).getDay() + 6) % 7;        // 0 = Monday
  return Array.from({ length: 42 }, (_, i) => new Date(y, m, 1 - off + i));
};

{monthMatrix(y, m).map((d) => {
  const out = d.getMonth() !== m, disabled = isBefore(d, minDate);
  const sel = sameDay(d, selected), today = sameDay(d, TODAY);
  return (
    <button disabled={disabled} onClick={() => onSelect(d)}
      className={\`grid size-8 place-items-center rounded-md text-[12.5px] \${
        sel ? 'bg-primary text-primary-foreground font-semibold'
        : disabled ? 'text-muted-foreground/30 cursor-not-allowed'
        : out ? 'text-muted-foreground/45 hover:bg-secondary/60'
        : 'text-foreground hover:bg-secondary/70'}\${
        today && !sel ? ' ring-1 ring-inset ring-primary/60' : ''}\`}>
      {d.getDate()}
    </button>
  );
})}`;

const CODE_POP = `// Popover: calendar + time column (typeable field on top, slots below)
<Popover render={(open, toggle) => <Trigger open={open} toggle={toggle} label={\`\${fmtLong(date)} · \${time}\`} />}>
  {(close) => (
    <div className="flex max-sm:flex-col">
      <MiniCalendar selected={date} minDate={TODAY} onSelect={(d) => { setDate(d); setMonth(firstOf(d)); }} />
      <div className="sm:w-44 sm:border-l border-border">
        <div className="px-4 pt-3">
          <div className="text-[12.5px] font-medium">{fmtWeekday(date)}</div>
          <EditableTime value={time} onChange={setTime} />     {/* type or stepper */}
        </div>
        <TimeSlots value={time} onChange={setTime} />          {/* or pick a slot */}
      </div>
    </div>
  )}
</Popover>`;

const CODE_EDIT = `// Editable time — type HH:MM (validated) or use the ±15 min stepper
const TIME_RE = /^([01]?\\d|2[0-3]):([0-5]\\d)$/;
const commit = (s) => { if (TIME_RE.test(s.trim())) { const [h, m] = s.trim().split(':'); onChange(pad(+h)+':'+pad(+m)); } };
const bump = (delta) => {
  const [h, m] = (TIME_RE.test(raw) ? raw : value).split(':').map(Number);
  const tot = ((h*60 + m + delta) % 1440 + 1440) % 1440;
  onChange(pad(Math.floor(tot/60)) + ':' + pad(tot%60));
};
<input value={raw} inputMode="numeric" placeholder="HH:MM"
  onChange={(e) => { setRaw(e.target.value); commit(e.target.value); }} onBlur={() => commit(raw)} />

// Editable date — DD/MM/YYYY, rejects invalid dates or dates before minDate`;

/* ── section ─────────────────────────────────────────────────────────────── */
function DateTimePickerSection() {
  return (
    <div>
      <SectionHead kicker="Forms" title="Date & time picker" status="done"
        intro="A date and time picker where both are editable two ways: typing into validated fields (DD/MM/YYYY and HH:MM with a ±15 min stepper) or picking in the calendar and the slots — always in sync. The calendar is on-brand: week starting Monday, “today” with a green ring, past dates disabled and the selection in primary. Built for scheduling a job or a maintenance window." />

      <Variant title="Popover · date + time"
        desc="The reference pattern: a field that opens the calendar on the left and the time column on the right. The time is typed into the top field or picked from the slots (unavailable ones are struck through); both stay in sync."
        code={CODE_POP} minH="min-h-[120px]">
        <PopoverPicker />
      </Variant>

      <Variant title="Inline · editable fields"
        desc="No popover: the date and time fields are inputs typed and validated live (red if the date does not exist or is in the past), with the calendar and some quick chips bound to the same values."
        code={CODE_EDIT}>
        <InlinePicker />
      </Variant>

      <Variant title="Trigger states"
        desc="The anatomy of the field that opens the picker: empty (placeholder), with a date and time value, and disabled by policy."
        code={CODE_CAL}>
        <TriggerStates />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['date-time-picker'] = DateTimePickerSection;
})();
