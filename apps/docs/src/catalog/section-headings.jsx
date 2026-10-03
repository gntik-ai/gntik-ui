/* ============================================================================
   Gntik UI · section-headings.jsx — block headings inside the content.
   Same system as page headings: green mono kicker (optional) + title
   in foreground + bottom divider. No icons. Neutral fixtures · tokens.
   Variants: simple · with actions · with kicker · with count.
   ============================================================================ */
(function () {
const { SectionHead, CodeBlock } = window;

const SecBtn = ({ children }) => (
  <button className="h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold text-foreground hover:bg-secondary/60 transition-colors">{children}</button>
);
const SecLink = ({ children }) => (
  <button className="text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors">{children}</button>
);

const Variant = ({ title, desc, code, children }) => (
  <div className="mb-12">
    <div className="mb-3">
      <h2 className="font-sans font-semibold text-[15px] text-foreground tracking-tight">{title}</h2>
      {desc && <p className="font-sans text-[13px] text-muted-foreground mt-0.5 leading-snug" style={{ textWrap: 'pretty' }}>{desc}</p>}
    </div>
    <div className="rounded-lg border border-border bg-card">
      <div className="p-7">{children}</div>
    </div>
    {code && <CodeBlock code={code} lang="tsx" />}
  </div>
);

const CODE_SIMPLE = `// Simple — title + description, with bottom divider
<div className="pb-3 border-b border-border">
  <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Recent runs</h2>
  <p className="mt-1 text-[13px] text-muted-foreground">Last 24 hours across every service in this project.</p>
</div>`;

const CODE_ACTIONS = `// With actions — title + description on the left, action on the right
<div className="flex items-end justify-between gap-4 flex-wrap pb-3 border-b border-border">
  <div>
    <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Policies</h2>
    <p className="mt-1 text-[13px] text-muted-foreground">Guardrails applied to every run.</p>
  </div>
  <button className="h-8 px-3 rounded-md border border-border bg-card text-[12.5px] font-semibold">Add policy</button>
</div>`;

const CODE_COUNT = `// With count — title + total + text action
<div className="flex items-center justify-between gap-4 pb-3 border-b border-border">
  <div className="flex items-center gap-2.5">
    <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Members</h2>
    <span className="font-mono text-[11px] px-2 h-[20px] inline-flex items-center rounded-full bg-secondary text-muted-foreground">8</span>
  </div>
  <button className="text-[13px] font-semibold text-primary">Invite</button>
</div>`;

function SectionHeadingsSection() {
  return (
    <div>
      <SectionHead kicker="Headings" title="Section headings" status="done"
        intro="Block headings inside a view: they split the content into blocks (Health, Recent runs, Budget…). Unlike the page heading they carry no green kicker —green marks the page location— and they don't repeat the page name or the active tab. Foreground title at a smaller scale, no icons." />

      {/* 1 · Simple */}
      <Variant title="Simple" desc="Title and description with a bottom divider. The default block separator." code={CODE_SIMPLE}>
        <div className="pb-3 border-b border-border">
          <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Recent runs</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">Last 24 hours across every service in this project.</p>
        </div>
      </Variant>

      {/* 2 · With actions */}
      <Variant title="With actions" desc="Title and description on the left; a block action on the right." code={CODE_ACTIONS}>
        <div className="flex items-end justify-between gap-4 flex-wrap pb-3 border-b border-border">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Policies</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Guardrails applied to every run.</p>
          </div>
          <SecBtn>Add policy</SecBtn>
        </div>
      </Variant>

      {/* 3 · With count */}
      <Variant title="With count" desc="Title with the total beside it and a text action. For list or collection headers." code={CODE_COUNT}>
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Members</h2>
            <span className="font-mono text-[11px] px-2 h-[20px] inline-flex items-center rounded-full bg-secondary text-muted-foreground">8</span>
          </div>
          <SecLink>Invite</SecLink>
        </div>
      </Variant>
    </div>
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['section-headings'] = SectionHeadingsSection;
})();
