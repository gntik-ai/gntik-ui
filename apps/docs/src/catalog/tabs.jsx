/* ============================================================================
   Gntik UI · tabs.jsx — tabs ("Navigation" group).
   Underline with badges, pills in a container, with icons, and a justified
   full-width bar. Single selection; active in brand green. Different from the
   page header (which already has tabs) — here they live as block navigation.
   Neutral fixtures, all tokens.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon, useState } = window;

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-11">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card p-6 sm:p-8">{children}</div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

/* ── 1 · UNDERLINE with badges ───────────────────────────────────────────── */
const UNDER = [['overview', 'Overview'], ['runs', 'Runs', 1284], ['policies', 'Policies', 3], ['logs', 'Logs'], ['settings', 'Settings']];
function Underline() {
  const [active, setActive] = useState('overview');
  return (
    <div className="border-b border-border">
      <nav className="flex items-center gap-6">
        {UNDER.map(([id, label, badge]) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => setActive(id)}
              className={"relative flex items-center gap-2 h-10 -mb-px border-b-2 text-[13px] font-medium transition-colors " + (on ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              {label}
              {badge != null && <span className={"font-mono text-[10.5px] leading-none px-1.5 h-[18px] inline-flex items-center rounded-full " + (on ? 'bg-primary/14 text-primary' : 'bg-secondary text-muted-foreground')}>{badge.toLocaleString()}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ── 2 · PILLS in a container ────────────────────────────────────────────── */
const PILLS = [['day', 'Day'], ['week', 'Week'], ['month', 'Month'], ['quarter', 'Quarter']];
function Pills() {
  const [active, setActive] = useState('week');
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-border bg-secondary/40">
      {PILLS.map(([id, label]) => {
        const on = active === id;
        return (
          <button key={id} onClick={() => setActive(id)}
            className={"h-8 px-3.5 rounded-md text-[12.5px] font-medium transition-colors " + (on ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{label}</button>
        );
      })}
    </div>
  );
}

/* ── 3 · WITH ICONS (underline) ─────────────────────────────────────────── */
const ICONS = [['activity', 'Activity'], ['line', 'Metrics'], ['shield', 'Policies'], ['cog', 'Settings']];
function WithIcons() {
  const [active, setActive] = useState('activity');
  return (
    <div className="border-b border-border">
      <nav className="flex items-center gap-7">
        {ICONS.map(([ic, label]) => {
          const on = active === label;
          return (
            <button key={label} onClick={() => setActive(label)}
              className={"flex items-center gap-2 h-10 -mb-px border-b-2 text-[13px] font-medium transition-colors " + (on ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              <Icon name={ic} size={16} className={on ? 'text-primary' : ''} />{label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ── 4 · FULL-WIDTH justified ───────────────────────────────────────────── */
const FULL = [['summary', 'Summary'], ['cost', 'Cost'], ['latency', 'Latency'], ['errors', 'Errors']];
function FullWidth() {
  const [active, setActive] = useState('summary');
  return (
    <div className="w-full max-w-xl mx-auto grid grid-cols-4 p-1 rounded-lg border border-border bg-secondary/40">
      {FULL.map(([id, label]) => {
        const on = active === id;
        return (
          <button key={id} onClick={() => setActive(id)}
            className={"h-9 rounded-md text-[12.5px] font-medium transition-colors " + (on ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{label}</button>
        );
      })}
    </div>
  );
}

const CODE_UNDER = `// Underline — the active tab gets border-primary; badge in mono
<div className="border-b border-border">
  <nav className="flex items-center gap-6">
    {tabs.map((t) => {
      const on = active === t.id;
      return (
        <button key={t.id} onClick={() => setActive(t.id)}
          className={"relative flex items-center gap-2 h-10 -mb-px border-b-2 text-[13px] font-medium transition-colors " +
            (on ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          {t.label}
          {t.badge != null && (
            <span className={"font-mono text-[10.5px] px-1.5 h-[18px] inline-flex items-center rounded-full " +
              (on ? "bg-primary/14 text-primary" : "bg-secondary text-muted-foreground")}>{t.badge}</span>
          )}
        </button>
      );
    })}
  </nav>
</div>`;

const CODE_PILLS = `// Pills — bg-secondary container; the active pill lifts to bg-card with a shadow
<div className="inline-flex items-center gap-1 p-1 rounded-lg border border-border bg-secondary/40">
  {tabs.map((t) => (
    <button key={t.id} onClick={() => setActive(t.id)}
      className={"h-8 px-3.5 rounded-md text-[12.5px] font-medium transition-colors " +
        (active === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
      {t.label}
    </button>
  ))}
</div>`;

function TabsSection() {
  return (
    <div>
      <SectionHead kicker="Navigation" title="Tabs" status="done"
        intro="Tabs to move between views of the same block without leaving the screen. Underline with badges for resource detail, pills in a container for ranges, with icons, and a justified full-width bar. Single selection, with the active tab always in brand green." />

      <Variant title="Underline"
        desc="The default pattern: bottom line on the active tab and mono badges for counts. Same as the resource header, reusable as block navigation."
        code={CODE_UNDER}>
        <Underline />
      </Variant>

      <Variant title="Pills"
        desc="Compact, inside a container; the active pill lifts to bg-card with a shadow. For ranges and short views inside a card."
        code={CODE_PILLS}>
        <Pills />
      </Variant>

      <Variant title="With icons"
        desc="Underline with a leading icon; the icon turns brand green when active. Useful when the label alone is not enough.">
        <WithIcons />
      </Variant>

      <Variant title="Full-width"
        desc="Pills spread over equal columns to fill the full width — common in narrow panels and on mobile.">
        <FullWidth />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['tabs'] = TabsSection;
})();
