/* ============================================================================
   Gntik UI · avatars.jsx — avatars ("Elements" group).
   The brand initials avatar: five sizes, square or round, in tones to tell
   people apart and an icon for bots/services; with a corner status indicator
   and stacked in a group with +N overflow. Tokens only, no images.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock, Icon } = window;

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

/* ── Brand avatar ────────────────────────────────────────────────────────── */
const AV = {
  xs: { box: 'size-6',  fs: 'text-[10px]', r: 'rounded-md',     dot: 'size-2',   ico: 13 },
  sm: { box: 'size-8',  fs: 'text-[11px]', r: 'rounded-lg',     dot: 'size-2.5', ico: 16 },
  md: { box: 'size-10', fs: 'text-[13px]', r: 'rounded-[10px]', dot: 'size-3',   ico: 20 },
  lg: { box: 'size-12', fs: 'text-[15px]', r: 'rounded-xl',     dot: 'size-3.5', ico: 24 },
  xl: { box: 'size-16', fs: 'text-[20px]', r: 'rounded-2xl',    dot: 'size-4',   ico: 30 },
};
const AV_TONE = {
  primary:   'bg-primary text-primary-foreground',
  accent:    'bg-accent text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  rose:      'bg-category-rose/18 text-category-rose',
  violet:    'bg-category-violet/20 text-category-violet',
  cyan:      'bg-category-cyan/18 text-category-cyan',
  amber:     'bg-category-amber/22 text-category-amber',
};
const AV_STATUS = { online: 'bg-primary', idle: 'bg-warning', busy: 'bg-destructive', offline: 'bg-muted-foreground' };

function Avatar({ size = 'md', round, tone = 'primary', initials, icon, status, ring }) {
  const s = AV[size];
  return (
    <span className="relative inline-flex shrink-0">
      <span className={"inline-flex items-center justify-center font-bold tracking-tight " + s.box + ' ' + s.fs + ' ' + (round ? 'rounded-full' : s.r) + ' ' + AV_TONE[tone] + (ring ? ' ring-2 ring-card' : '')}>
        {icon ? <Icon name={icon} size={s.ico} stroke={1.8} /> : initials}
      </span>
      {status && <span className={"absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-card " + s.dot + ' ' + AV_STATUS[status]} />}
    </span>
  );
}

/* ── 1 · SIZES AND SHAPE ─────────────────────────────────────────────────── */
function SizesShape() {
  return (
    <div className="flex flex-col items-center gap-7">
      <div className="flex flex-wrap items-end justify-center gap-x-6 gap-y-4">
        {['xs', 'sm', 'md', 'lg', 'xl'].map(sz => (
          <div key={sz} className="flex flex-col items-center gap-2"><Avatar size={sz} tone="primary" initials="MR" /><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">{sz}</span></div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2"><Avatar size="lg" tone="primary" initials="MR" /><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">rounded</span></div>
        <div className="flex flex-col items-center gap-2"><Avatar size="lg" round tone="primary" initials="MR" /><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">round</span></div>
      </div>
    </div>
  );
}

/* ── 2 · TONES AND ICON ──────────────────────────────────────────────────── */
function TonesIcons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
      <Avatar size="md" tone="primary" initials="MR" />
      <Avatar size="md" tone="accent" initials="JL" />
      <Avatar size="md" tone="violet" initials="SK" />
      <Avatar size="md" tone="rose" initials="AT" />
      <Avatar size="md" tone="cyan" initials="DN" />
      <Avatar size="md" tone="amber" initials="VG" />
      <div className="mx-1 h-8 w-px bg-border" />
      <Avatar size="md" tone="secondary" icon="bot" />
      <Avatar size="md" round tone="secondary" icon="user" />
    </div>
  );
}

/* ── 3 · WITH STATUS ─────────────────────────────────────────────────────── */
const STATUSES = [['online', 'online', 'primary', 'MR'], ['idle', 'idle', 'violet', 'JL'], ['busy', 'busy', 'cyan', 'SK'], ['offline', 'offline', 'secondary', 'VG']];
function WithStatus() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
      {STATUSES.map(([st, label, tone, ini]) => (
        <div key={st} className="flex flex-col items-center gap-2.5">
          <Avatar size="lg" round tone={tone} initials={ini} status={st} />
          <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground/80">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── 4 · STACKED GROUP ───────────────────────────────────────────────────── */
const TEAM = [
  { initials: 'MR', tone: 'primary' }, { initials: 'JL', tone: 'violet' }, { initials: 'SK', tone: 'cyan' },
  { initials: 'AT', tone: 'rose' }, { initials: 'VG', tone: 'amber' }, { initials: 'DN', tone: 'accent' }, { initials: 'PL', tone: 'secondary' },
];
const Group = ({ size, max }) => {
  const shown = TEAM.slice(0, max);
  const extra = TEAM.length - shown.length;
  const s = AV[size];
  return (
    <div className="flex -space-x-2.5">
      {shown.map((p, i) => <Avatar key={i} size={size} round ring tone={p.tone} initials={p.initials} />)}
      {extra > 0 && <span className={"relative inline-flex items-center justify-center rounded-full bg-secondary font-semibold text-muted-foreground ring-2 ring-card " + s.box + ' ' + s.fs}>+{extra}</span>}
    </div>
  );
};
function Stacked() {
  return (
    <div className="flex flex-col items-center gap-7">
      <div className="flex flex-col items-center gap-2.5"><Group size="md" max={4} /><span className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground/80">team · 7</span></div>
      <div className="flex flex-wrap items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-2"><Group size="sm" max={5} /><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">sm</span></div>
        <div className="flex flex-col items-center gap-2"><Group size="lg" max={3} /><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">lg</span></div>
      </div>
    </div>
  );
}

/* ── snippets ────────────────────────────────────────────────────────────── */
const CODE_AV = `// Brand avatar — size × tone; icon for bots, initials for people
const SIZE = {
  xs: "size-6 text-[10px] rounded-md",   sm: "size-8 text-[11px] rounded-lg",
  md: "size-10 text-[13px] rounded-[10px]", lg: "size-12 text-[15px] rounded-xl",
  xl: "size-16 text-[20px] rounded-2xl",
};
const TONE = {
  primary: "bg-primary text-primary-foreground", accent: "bg-accent text-accent-foreground",
  violet:  "bg-category-violet/20 text-category-violet", cyan: "bg-category-cyan/18 text-category-cyan",
};
function Avatar({ size = "md", round, tone = "primary", initials, icon: Glyph }) {
  return (
    <span className={"inline-flex items-center justify-center font-bold " +
      SIZE[size] + " " + (round ? "rounded-full" : "") + " " + TONE[tone]}>
      {Glyph ? <Glyph /> : initials}
    </span>
  );
}`;

const CODE_STATUS = `// Status indicator — corner dot with a ring in the background colour
<span className="relative inline-flex">
  <Avatar size="lg" round initials="MR" />
  <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-primary ring-2 ring-card" />
</span>
// online → bg-primary · idle → bg-warning · busy → bg-destructive · offline → bg-muted-foreground`;

const CODE_GROUP = `// Stacked group — overlap with -space-x + ring, and +N overflow
<div className="flex -space-x-2.5">
  {people.slice(0, max).map((p) => <Avatar key={p.id} round ring {...p} />)}
  {extra > 0 && (
    <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary
                     font-semibold text-muted-foreground ring-2 ring-card">+{extra}</span>
  )}
</div>`;

/* ── section ─────────────────────────────────────────────────────────────── */
function AvatarsSection() {
  return (
    <div>
      <SectionHead kicker="Elements" title="Avatars" status="done"
        intro="The brand initials avatar: five sizes (xs–xl), square by default or round, in tones to tell people apart and an icon to represent bots and services. With a corner status indicator and stacked in a group with +N overflow. No images — everything from tokens, legible in any theme." />

      <Variant title="Sizes and shape"
        desc="Five sizes with the radius scaling with the box; round turns it into a circle. md is the general-purpose size; xl is for profile headers."
        code={CODE_AV}>
        <SizesShape />
      </Variant>

      <Variant title="Tones and icon"
        desc="Solid tones (primary, accent) and soft categoricals to tell people apart at a glance; the icon (bot / user) marks automated accounts versus people.">
        <TonesIcons />
      </Variant>

      <Variant title="With status"
        desc="A dot in the bottom corner with a ring in the surface colour so it stands apart from the avatar: green online, amber idle, red busy, grey offline."
        code={CODE_STATUS}>
        <WithStatus />
      </Variant>

      <Variant title="Stacked group"
        desc="Avatars overlapped with -space-x and a ring that separates them; when there are more than fit, a +N chip closes the group."
        code={CODE_GROUP}>
        <Stacked />
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['avatars'] = AvatarsSection;
})();

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
