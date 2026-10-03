/* ============================================================================
   Gntik UI · calendars.jsx — the scheduler calendar.
   Not meetings with people: schedulers — cron jobs, deploys, audits,
   backups and maintenance windows. Four views sharing one event map
   (EVENTS, by ISO date) and the brand tokens. No avatars: each task
   carries a type tile. Tokens only.
   Variants: month · week · day (with scrolling agenda) · borderless side-by-side.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState, useEffect, useRef, useClickOutside } = window;

/* ── time constants / labels ─────────────────────────────────────────────── */
const HOUR = 52;                 // px per hour in the time grid
const NOW = 10 + 20 / 60;        // fixed "now" line (10:20) for a stable position
const TODAY = new Date(2026, 3, 15);   // Wed 15 Apr 2026 — the catalog's "today"
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WD1 = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WD_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* ── task types (categorical · tokens; primary green = job) ──────────────── */
const KIND = {
  run:    { label: 'Job',        icon: 'refresh',  dot: 'bg-primary',          soft: 'bg-primary/12',          text: 'text-primary',          sub: 'text-primary/70' },
  deploy: { label: 'Deploy',     icon: 'upload',   dot: 'bg-category-violet',  soft: 'bg-category-violet/14',  text: 'text-category-violet',  sub: 'text-category-violet/70' },
  audit:  { label: 'Audit',  icon: 'shield',   dot: 'bg-category-cyan',    soft: 'bg-category-cyan/14',    text: 'text-category-cyan',    sub: 'text-category-cyan/70' },
  backup: { label: 'Backup',     icon: 'database', dot: 'bg-category-amber',   soft: 'bg-category-amber/16',   text: 'text-category-amber',   sub: 'text-category-amber/70' },
  maint:  { label: 'Maint.',  icon: 'cog',      dot: 'bg-muted-foreground', soft: 'bg-secondary',           text: 'text-muted-foreground', sub: 'text-muted-foreground/70' },
};

/* ── date utilities ──────────────────────────────────────────────────────── */
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(d.getDate() + n); return x; };
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const weekDates = (d) => { const mon = addDays(d, -((d.getDay() + 6) % 7)); return Array.from({ length: 7 }, (_, i) => addDays(mon, i)); };
const monthGrid = (y, m) => { const first = new Date(y, m, 1); const off = (first.getDay() + 6) % 7; const start = addDays(first, -off); return Array.from({ length: 42 }, (_, i) => addDays(start, i)); };
const hhmm = (h) => `${pad(Math.floor(h))}:${pad(Math.round((h % 1) * 60))}`;
const fmtDM = (d) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
const fmtFull = (d) => `${WD_LONG[(d.getDay() + 6) % 7]}, ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;

/* ── event map (start = decimal hour · dur = hours) ──────────────────────── */
const EVENTS = {
  '2026-04-03': [{ kind: 'deploy', name: 'support-triage v3.1', start: 10, dur: 1, place: 'eu-west-1' }],
  '2026-04-07': [
    { kind: 'run', name: 'data-enricher batch', start: 6.5, dur: 2 },
    { kind: 'audit', name: 'PII scan · EU', start: 14, dur: 1, place: 'eu-west-1' },
  ],
  '2026-04-09': [{ kind: 'backup', name: 'Snapshot · vector store', start: 11, dur: 1.5 }],
  '2026-04-13': [
    { kind: 'run', name: 'support-triage · sync', start: 7, dur: 0.5 },
    { kind: 'deploy', name: 'billing-bot v2.4 rollout', start: 9.5, dur: 1.5, place: 'us-east-1' },
    { kind: 'audit', name: 'PII scan · EU', start: 14, dur: 1, place: 'eu-west-1' },
  ],
  '2026-04-14': [
    { kind: 'run', name: 'data-enricher batch', start: 6.5, dur: 2 },
    { kind: 'backup', name: 'Snapshot · vector store', start: 11, dur: 1.5 },
    { kind: 'run', name: 'usage rollup', start: 21, dur: 0.5 },
  ],
  '2026-04-15': [
    { kind: 'run', name: 'support-triage · cron', start: 6, dur: 0.5 },
    { kind: 'run', name: 'lead-router · cron', start: 7, dur: 0.5 },
    { kind: 'deploy', name: 'fraud-scan hotfix', start: 9, dur: 1, place: 'eu-west-1' },
    { kind: 'audit', name: 'Compliance review', start: 10.5, dur: 1.5, place: 'all regions' },
    { kind: 'backup', name: 'Snapshot · prod DB', start: 13, dur: 1 },
    { kind: 'run', name: 'churn-watch · weekly', start: 15, dur: 0.5 },
    { kind: 'maint', name: 'Maintenance window', start: 16, dur: 2, place: 'ap-south-1' },
    { kind: 'run', name: 'doc-indexer · reindex', start: 19, dur: 1 },
    { kind: 'run', name: 'usage rollup', start: 21.5, dur: 0.5 },
  ],
  '2026-04-16': [
    { kind: 'run', name: 'support-triage · sync', start: 7, dur: 0.5 },
    { kind: 'deploy', name: 'lead-router v1.8', start: 13.5, dur: 1, place: 'us-east-1' },
    { kind: 'maint', name: 'Node pool upgrade', start: 22, dur: 1.5 },
  ],
  '2026-04-17': [
    { kind: 'audit', name: 'Weekly cost audit', start: 10, dur: 1 },
    { kind: 'backup', name: 'Full backup', start: 23, dur: 1 },
  ],
  '2026-04-18': [{ kind: 'run', name: 'Weekend health check', start: 9, dur: 0.5 }],
  '2026-04-19': [{ kind: 'maint', name: 'Certificate rotation', start: 3, dur: 1 }],
  '2026-04-22': [
    { kind: 'run', name: 'support-triage · cron', start: 7, dur: 0.5 },
    { kind: 'deploy', name: 'billing-bot v2.5', start: 11, dur: 1, place: 'us-east-1' },
    { kind: 'audit', name: 'Policy review', start: 15, dur: 1 },
  ],
  '2026-04-24': [{ kind: 'run', name: 'data-enricher batch', start: 6.5, dur: 2 }],
  '2026-04-28': [{ kind: 'maint', name: 'Maintenance window', start: 16, dur: 2, place: 'eu-west-1' }],
  '2026-04-30': [
    { kind: 'audit', name: 'Month-end audit', start: 9, dur: 2 },
    { kind: 'backup', name: 'Full backup', start: 23, dur: 1 },
  ],
};
const evFor = (d) => (EVENTS[iso(d)] || []).slice().sort((a, b) => a.start - b.start);

/* ── view switcher (month · week · day) ──────────────────────────────────── */
function ViewMenu({ view, onView }) {
  const VIEWS = [['month', 'Month'], ['week', 'Week'], ['day', 'Day']];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const label = (VIEWS.find((v) => v[0] === view) || VIEWS[2])[1];
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
        className="inline-flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-md border border-border bg-card text-[12.5px] font-semibold text-foreground hover:bg-secondary/60 transition-colors">
        <Icon name="calendar" size={15} className="text-muted-foreground" />
        <span>{label}</span>
        <Icon name="chevron" size={14} className={"text-muted-foreground transition-transform duration-200 " + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-30 w-44 rounded-md border border-border bg-popover text-popover-foreground shadow-md p-1">
          {VIEWS.map(([val, lab]) => {
            const active = val === view;
            return (
              <button key={val} role="menuitemradio" aria-checked={active} onClick={() => { onView(val); setOpen(false); }}
                className={"flex items-center justify-between w-full px-2.5 h-9 rounded-[6px] text-[12.5px] text-left transition-colors " + (active ? 'bg-accent/50 text-foreground font-semibold' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground')}>
                <span>{lab}</span>
                {active && <Icon name="check" size={15} className="text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── shared header: navigation + switcher + "Schedule" ───────────────────── */
function CalHeader({ title, sub, view, onView, onPrev, onToday, onNext }) {
  const [added, setAdded] = useState(false);
  return (
    <div className="flex items-center justify-between gap-4 px-4 sm:px-5 h-16 border-b border-border">
      <div className="min-w-0">
        <h3 className="font-sans font-semibold text-[15px] text-foreground tracking-tight truncate">{title}</h3>
        {sub && <div className="font-mono text-[11px] text-muted-foreground mt-0.5 truncate">{sub}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center rounded-md border border-border bg-card overflow-hidden">
          <button onClick={onPrev} aria-label="Previous" className="w-9 h-9 inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"><Icon name="chevronLeft" size={16} /></button>
          <button onClick={onToday} className="hidden sm:block px-3 h-9 text-[12.5px] font-semibold text-foreground border-x border-border hover:bg-secondary/60 transition-colors">Today</button>
          <button onClick={onNext} aria-label="Next" className="w-9 h-9 inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"><Icon name="chevronRight" size={16} /></button>
        </div>
        {view && onView && <ViewMenu view={view} onView={onView} />}
        <button onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1500); }}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-primary text-primary-foreground text-[12.5px] font-semibold hover:bg-primary/90 transition-colors">
          <Icon name={added ? 'check' : 'plus'} size={15} />{added ? 'Scheduled' : 'Schedule'}
        </button>
      </div>
    </div>
  );
}

/* ── agenda row (no avatar · type tile) ──────────────────────────────────── */
function EventRow({ e }) {
  const k = KIND[e.kind];
  return (
    <li className="group flex items-center gap-3.5 px-4 sm:px-5 py-3 hover:bg-accent/30 transition-colors">
      <span className={"w-9 h-9 rounded-lg inline-flex items-center justify-center shrink-0 " + k.soft + ' ' + k.text}><Icon name={k.icon} size={17} /></span>
      <div className="min-w-0 flex-1">
        <div className="font-sans font-semibold text-[13px] text-foreground truncate">{e.name}</div>
        <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11.5px] text-muted-foreground">
          <Icon name="clock" size={12} className="shrink-0" />
          <span>{hhmm(e.start)}–{hhmm(e.start + e.dur)}</span>
          {e.place && <><span className="text-muted-foreground/40">·</span><span className="truncate">{e.place}</span></>}
        </div>
      </div>
      <span className={"hidden sm:inline-flex items-center h-[22px] px-2 rounded-md font-mono text-[10px] font-semibold shrink-0 " + k.soft + ' ' + k.text}>{k.label}</span>
      <Icon name="chevronRight" size={16} className="shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
    </li>
  );
}

/* ── scrolling agenda list + empty state ─────────────────────────────────── */
function ScheduleList({ events, maxH = 360 }) {
  if (!events.length) {
    return (
      <div className="px-6 py-12 flex flex-col items-center text-center">
        <span className="w-11 h-11 rounded-xl bg-secondary text-muted-foreground inline-flex items-center justify-center mb-3"><Icon name="calendar" size={20} /></span>
        <div className="text-[13px] text-foreground font-medium">No scheduled tasks</div>
        <div className="text-[12px] text-muted-foreground mt-0.5">This day has no active schedulers.</div>
      </div>
    );
  }
  return <ul role="list" className="divide-y divide-border overflow-y-auto" style={{ maxHeight: maxH }}>{events.map((e, i) => <EventRow key={i} e={e} />)}</ul>;
}

/* ── time grid (shared by week and day) ──────────────────────────────────── */
function TimeGrid({ days, showNow, height = 480 }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = 7 * HOUR - 8; }, []);
  const hours = Array.from({ length: 24 }, (_, h) => h);
  const lines = `repeating-linear-gradient(to bottom, hsl(var(--border) / 0.7) 0, hsl(var(--border) / 0.7) 1px, transparent 1px, transparent ${HOUR}px)`;
  return (
    <div ref={ref} className="overflow-y-auto" style={{ maxHeight: height }}>
      <div className="relative flex" style={{ height: 24 * HOUR }}>
        <div className="relative w-14 shrink-0 border-r border-border/70">
          {hours.map((h) => (
            <div key={h} className="absolute right-2 font-mono text-[10px] text-muted-foreground/80" style={{ top: h * HOUR - 6 }}>{h === 0 ? '' : pad(h) + ':00'}</div>
          ))}
        </div>
        <div className="relative flex-1" style={{ backgroundImage: lines }}>
          <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0,1fr))` }}>
            {days.map((day, ci) => (
              <div key={ci} className="relative border-l border-border/70 first:border-l-0">
                {evFor(day).map((e, i) => {
                  const k = KIND[e.kind];
                  return (
                    <a key={i} href="#" onClick={(ev) => ev.preventDefault()}
                      className={"absolute left-1 right-1 rounded-md px-2 py-1 overflow-hidden ring-1 ring-inset ring-transparent hover:ring-current/40 transition " + k.soft + ' ' + k.text}
                      style={{ top: e.start * HOUR + 1, height: Math.max(e.dur * HOUR - 2, 18) }}>
                      <div className={"font-sans font-semibold text-[11px] leading-tight truncate " + k.text}>{e.name}</div>
                      <div className={"font-mono text-[10px] truncate " + k.sub}>{hhmm(e.start)}</div>
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
          {showNow && (
            <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top: NOW * HOUR }}>
              <span className="w-2 h-2 rounded-full bg-primary shrink-0 -ml-1" />
              <div className="h-px flex-1 bg-primary/70" />
              <span className="font-mono text-[9px] text-primary-foreground bg-primary rounded px-1 shrink-0">now</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── compact mini-month · day picker for the day view ────────────────────── */
function MiniMonth({ cursor, selected, onSelect, onShift }) {
  const dates = monthGrid(cursor.y, cursor.m);
  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3.5">
        <button onClick={() => onShift(-1)} aria-label="Previous month" className="w-7 h-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"><Icon name="chevronLeft" size={15} /></button>
        <h4 className="font-sans font-semibold text-[13px] text-foreground tracking-tight">{MONTHS[cursor.m]} {cursor.y}</h4>
        <button onClick={() => onShift(1)} aria-label="Next month" className="w-7 h-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"><Icon name="chevronRight" size={15} /></button>
      </div>
      <div className="grid grid-cols-7">
        {WD1.map((d, i) => <div key={i} className="text-center pb-2 text-[10.5px] font-medium text-muted-foreground">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 border-t border-l border-border/60 rounded-md overflow-hidden">
        {dates.map((d, i) => {
          const inM = d.getMonth() === cursor.m, today = sameDay(d, TODAY), on = sameDay(d, selected), has = evFor(d).length > 0;
          return (
            <button key={i} onClick={() => onSelect(new Date(d))} aria-label={iso(d)}
              className={"relative h-9 flex items-center justify-center border-b border-r border-border/60 transition-colors hover:bg-accent/35 focus:outline-none focus:bg-accent/45 " + (inM ? '' : 'bg-secondary/20')}>
              <span className={"inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] transition-colors " +
                (on ? (today ? 'bg-primary text-primary-foreground font-semibold' : 'bg-foreground text-background font-semibold')
                    : today ? 'text-primary font-semibold'
                    : inM ? 'text-foreground' : 'text-muted-foreground/45')}>{d.getDate()}</span>
              {has && !on && <span className={"absolute bottom-1 w-1 h-1 rounded-full " + (today ? 'bg-primary' : 'bg-muted-foreground/55')} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── view bodies (no header — the shell provides it) ─────────────────────── */
function MonthBody({ cursor, selected, onSelect }) {
  const dates = monthGrid(cursor.y, cursor.m);
  return (
    <div>
      <div className="grid grid-cols-7 border-b border-border bg-secondary/30">
        {WD.map((d) => <div key={d} className="text-center py-2 font-sans text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{d}</div>)}
      </div>
      <div className="grid grid-cols-7" style={{ gridAutoRows: 'minmax(92px, 1fr)' }}>
        {dates.map((d, i) => {
          const inM = d.getMonth() === cursor.m, today = sameDay(d, TODAY), on = sameDay(d, selected), evs = evFor(d);
          return (
            <button key={i} onClick={() => onSelect(new Date(d))}
              className={"group relative text-left p-2 border-b border-r border-border/70 transition-colors hover:bg-accent/30 focus:outline-none focus:bg-accent/40 " + (inM ? 'bg-card' : 'bg-secondary/20')}>
              <div className="flex items-center justify-between">
                <span className={"inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-medium " +
                  (today ? 'bg-primary text-primary-foreground font-semibold' : on ? 'bg-secondary text-foreground ring-1 ring-border' : (inM ? 'text-foreground' : 'text-muted-foreground/55'))}>{d.getDate()}</span>
                {on && !today && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </div>
              <div className="mt-1.5 space-y-1">
                {evs.slice(0, 2).map((e, j) => (
                  <div key={j} className="flex items-center gap-1.5 min-w-0">
                    <span className={"w-1.5 h-1.5 rounded-full shrink-0 " + KIND[e.kind].dot} />
                    <span className="truncate text-[11px] text-foreground/80">{e.name}</span>
                    <span className="hidden xl:block ml-auto font-mono text-[10px] text-muted-foreground shrink-0">{hhmm(e.start)}</span>
                  </div>
                ))}
                {evs.length > 2 && <div className="text-[10.5px] text-muted-foreground pl-3">+ {evs.length - 2} more</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekBody({ days }) {
  const hasToday = days.some((d) => sameDay(d, TODAY));
  return (
    <div>
      <div className="flex border-b border-border">
        <div className="w-14 shrink-0 border-r border-border/70" />
        <div className="flex-1 grid grid-cols-7">
          {days.map((d, i) => {
            const today = sameDay(d, TODAY);
            return (
              <div key={i} className="flex flex-col items-center justify-center py-2 border-l border-border/70 first:border-l-0">
                <span className="text-[11px] text-muted-foreground">{WD[i]}</span>
                <span className={"mt-1 inline-flex items-center justify-center w-7 h-7 rounded-full text-[13px] " + (today ? 'bg-primary text-primary-foreground font-semibold' : 'text-foreground font-medium')}>{d.getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>
      <TimeGrid days={days} showNow={hasToday} height={480} />
    </div>
  );
}

function DayBody({ date, cursor, onSelect, onShift }) {
  const evs = evFor(date);
  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_336px] lg:divide-x lg:divide-border">
      <div className="min-w-0 border-b border-border lg:border-b-0">
        <TimeGrid days={[date]} showNow={sameDay(date, TODAY)} height={576} />
      </div>
      <div className="flex flex-col min-w-0">
        <MiniMonth cursor={cursor} selected={date} onSelect={onSelect} onShift={onShift} />
        <div className="flex flex-col min-h-0 border-t border-border">
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-secondary/30 border-b border-border">
            <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Scheduled for this day</span>
            <span className="font-mono text-[11px] text-muted-foreground/70">{evs.length}</span>
          </div>
          <ScheduleList events={evs} maxH={224} />
        </div>
      </div>
    </div>
  );
}

/* ── shell with view switcher (month · week · day) ──────────────────────── */
function SwitchableCalendar() {
  const [view, setView] = useState('day');
  const [date, setDate] = useState(new Date(2026, 3, 15));
  const [cursor, setCursor] = useState({ y: 2026, m: 3 });
  const monthOf = (d) => ({ y: d.getFullYear(), m: d.getMonth() });
  const selectDate = (d) => { setDate(d); setCursor(monthOf(d)); };
  const shiftMonth = (delta) => setCursor((c) => { const x = new Date(c.y, c.m + delta, 1); return { y: x.getFullYear(), m: x.getMonth() }; });
  const changeView = (v) => { setView(v); if (v !== 'month') setCursor(monthOf(date)); };
  const onPrev = () => { if (view === 'month') shiftMonth(-1); else selectDate(addDays(date, view === 'week' ? -7 : -1)); };
  const onNext = () => { if (view === 'month') shiftMonth(1); else selectDate(addDays(date, view === 'week' ? 7 : 1)); };
  const onToday = () => selectDate(new Date(TODAY));

  const week = weekDates(date);
  let title, sub;
  if (view === 'month') { title = `${MONTHS[cursor.m]} ${cursor.y}`; sub = 'All schedulers'; }
  else if (view === 'week') { title = `${fmtDM(week[0])} – ${fmtDM(week[6])} ${week[6].getFullYear()}`; sub = 'Time grid · all schedulers'; }
  else { title = `${WD_LONG[(date.getDay() + 6) % 7]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`; sub = `${evFor(date).length} scheduled tasks`; }

  return (
    <div className="bg-card">
      <CalHeader title={title} sub={sub} view={view} onView={changeView} onPrev={onPrev} onToday={onToday} onNext={onNext} />
      {view === 'month' && <MonthBody cursor={cursor} selected={date} onSelect={selectDate} />}
      {view === 'week' && <WeekBody days={week} />}
      {view === 'day' && <DayBody date={date} cursor={cursor} onSelect={selectDate} onShift={shiftMonth} />}
    </div>
  );
}

/* ── borderless side-by-side ─────────────────────────────────────────────── */
function BorderlessView() {
  const [cur, setCur] = useState({ y: 2026, m: 3 });
  const [sel, setSel] = useState(new Date(2026, 3, 15));
  const shift = (delta) => setCur((c) => { const d = new Date(c.y, c.m + delta, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const dates = monthGrid(cur.y, cur.m);
  const evs = evFor(sel);
  return (
    <div className="grid md:grid-cols-2 md:divide-x md:divide-border">
      {/* mini calendar */}
      <div className="p-5 sm:p-6">
        <div className="flex items-center">
          <h4 className="flex-auto font-sans font-semibold text-[14px] text-foreground">{MONTHS[cur.m]} {cur.y}</h4>
          <button onClick={() => shift(-1)} aria-label="Previous month" className="w-7 h-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"><Icon name="chevronLeft" size={15} /></button>
          <button onClick={() => shift(1)} aria-label="Next month" className="w-7 h-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"><Icon name="chevronRight" size={15} /></button>
        </div>
        <div className="mt-5 grid grid-cols-7 text-center">
          {WD1.map((d, i) => <div key={i} className="text-[10.5px] text-muted-foreground py-1">{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7">
          {dates.map((d, i) => {
            const inM = d.getMonth() === cur.m, today = sameDay(d, TODAY), on = sameDay(d, sel), has = evFor(d).length > 0;
            return (
              <div key={i} className={"flex justify-center py-1 " + (i >= 7 ? 'border-t border-border/60' : '')}>
                <button onClick={() => setSel(new Date(d))} className="relative flex flex-col items-center">
                  <span className={"inline-flex items-center justify-center w-8 h-8 rounded-full text-[12.5px] transition-colors " +
                    (on ? (today ? 'bg-primary text-primary-foreground font-semibold' : 'bg-foreground text-background font-semibold')
                        : today ? 'text-primary font-semibold hover:bg-accent/50'
                        : inM ? 'text-foreground hover:bg-accent/50' : 'text-muted-foreground/45 hover:bg-accent/40')}>{d.getDate()}</span>
                  {has && !on && <span className={"absolute -bottom-0.5 w-1 h-1 rounded-full " + (today ? 'bg-primary' : 'bg-muted-foreground/50')} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {/* agenda for the selected day */}
      <div className="flex flex-col">
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3">
          <h4 className="font-sans font-semibold text-[14px] text-foreground">Agenda · {fmtFull(sel)}</h4>
          <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{evs.length} scheduled tasks</p>
        </div>
        <ScheduleList events={evs} maxH={320} />
      </div>
    </div>
  );
}

/* ── variant wrapper ─────────────────────────────────────────────────────── */
const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card overflow-hidden">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── snippets to paste ───────────────────────────────────────────────────── */
const CODE_CAL = `// View switcher — a single surface; the dropdown switches month/week/day.
function ViewMenu({ view, onView }) {
  const VIEWS = [['month','Month'], ['week','Week'], ['day','Day']];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold">
        <Icon name="calendar" size={15} className="text-muted-foreground" />
        {VIEWS.find(v => v[0] === view)[1]}
        <Icon name="chevron" size={14} className={open ? 'rotate-180' : ''} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-md border border-border bg-popover shadow-md p-1 z-30">
          {VIEWS.map(([val, lab]) => (
            <button key={val} onClick={() => { onView(val); setOpen(false); }}
              className={"flex items-center justify-between w-full px-2.5 h-9 rounded-md text-[12.5px] " +
                (val === view ? 'bg-accent/50 font-semibold' : 'text-muted-foreground hover:bg-accent/40')}>
              {lab}{val === view && <Icon name="check" size={15} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Day view — grid on the left · mini-month + agenda on the right.
<div className="grid lg:grid-cols-[minmax(0,1fr)_336px] lg:divide-x lg:divide-border">
  <TimeGrid days={[date]} height={576} />

  <div className="flex flex-col">
    <MiniMonth cursor={cursor} selected={date} onSelect={setDate} onShift={shiftMonth} />

    <div className="border-t border-border">
      <div className="flex items-center justify-between px-5 py-2.5 bg-secondary/30 border-b border-border">
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">Scheduled for this day</span>
        <span className="font-mono text-[11px] text-muted-foreground/70">{events.length}</span>
      </div>
      <ScheduleList events={events} maxH={224} />
    </div>
  </div>
</div>`;

const CODE_BORDERLESS = `// Borderless side-by-side — mini-month (left) + day agenda (right), divided
const [sel, setSel] = useState(TODAY);

<div className="grid md:grid-cols-2 md:divide-x md:divide-border">
  <div className="p-6">
    {/* mini calendar: clicking a day updates the agenda */}
    <div className="grid grid-cols-7">
      {monthGrid(y, m).map((d) => {
        const on = sameDay(d, sel), has = evFor(d).length > 0;
        return (
          <button key={iso(d)} onClick={() => setSel(d)} className="relative py-1">
            <span className={"mx-auto flex w-8 h-8 items-center justify-center rounded-full text-[12.5px] " +
              (on ? "bg-foreground text-background" : "text-foreground hover:bg-accent/50")}>
              {d.getDate()}
            </span>
            {has && !on && <span className="absolute -bottom-0.5 inset-x-0 mx-auto w-1 h-1 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  </div>
  <div>
    <div className="px-6 pt-6 pb-3">
      <h4 className="text-[14px] font-semibold text-foreground">Agenda · {fmtFull(sel)}</h4>
      <p className="font-mono text-[11px] text-muted-foreground">{evFor(sel).length} scheduled tasks</p>
    </div>
    <ScheduleList events={evFor(sel)} maxH={320} />   {/* type tile + name + time, no avatar */}
  </div>
</div>`;

function CalendarsSection() {
  return (
    <div>
      <SectionHead kicker="Data" title="Calendars" status="done"
        intro="The scheduler calendar — not meetings with people, but schedulers: cron jobs, deploys, audits, backups and maintenance windows. A single surface with a view switcher (month · week · day) in the header: the full month, the week with a time grid, and the day with a navigable mini-month on the right and the agenda right below. Plus the borderless mini-calendar + agenda view. No avatars — each task carries its type tile." />

      <Variant title="Calendar with view switcher" desc="A single surface with a view dropdown (month · week · day) in the header. The day view puts the time grid on the left, a navigable mini-month on the right and, right below, what is scheduled for that day — click any day in the mini-month to move the detail. Prev / “Today” / next adapt to the active view." code={CODE_CAL}>
        <SwitchableCalendar />
      </Variant>

      <Variant title="Borderless side-by-side" desc="Mini calendar on the left and agenda on the right, separated only by a divider. Click any day in the mini-month and the agenda updates instantly; days with tasks carry a dot. The list scrolls and falls back to an empty state when nothing is scheduled." code={CODE_BORDERLESS}>
        <BorderlessView />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['calendars'] = CalendarsSection;
})();
