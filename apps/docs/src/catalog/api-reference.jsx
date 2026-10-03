/* ============================================================================
   Gntik UI · api-reference.jsx — generated API docs for one kit component or
   layout: Props tables (from its exported *Props types), the Keyboard table and
   accessibility notes (from its *.doc.ts). Data comes from src/api-docs.js,
   built with import.meta.glob, so new folders appear with no registration.
   Every field is optional: a doc without keyboard rows or a folder without
   *Props types simply skips that block.
   ============================================================================ */
import { COMPONENT_API, LAYOUT_API } from '../api-docs.js';

const H = ({ level, className, children, id }) => {
  const Tag = `h${Math.min(level, 6)}`;
  return <Tag id={id} className={className}>{children}</Tag>;
};

/** Text with `inline code` spans. */
function Rich({ text }) {
  if (!text) return null;
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 2
      ? <code key={i} className="rounded bg-secondary px-1 py-px font-mono text-[11.5px] text-foreground">{part.slice(1, -1)}</code>
      : part);
}

const thApi = 'py-1.5 pr-4 text-left align-bottom font-medium';
const tdApi = 'py-2 pr-4 align-top';

function PropsTable({ type, level, idBase }) {
  const headingId = `${idBase}-${type.name}`;
  return (
    <div className="mt-5">
      <H level={level} id={headingId} className="font-mono text-[12.5px] font-semibold text-foreground">{type.name}</H>
      {type.bases.length > 0 && (
        <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
          Also accepts the props of <Rich text={type.bases.map((b) => '`' + b + '`').join(', ')} />.
        </p>
      )}
      {type.props.length === 0 ? (
        <p className="mt-2 text-[12.5px] text-muted-foreground">No props of its own.</p>
      ) : (
        <table aria-labelledby={headingId} className="mt-2 w-full table-fixed text-[12.5px]">
          <colgroup>
            <col className="w-[20%]" /><col className="w-[30%]" /><col className="w-[14%]" /><col />
          </colgroup>
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th scope="col" className={thApi}>Prop</th>
              <th scope="col" className={thApi}>Type</th>
              <th scope="col" className={thApi}>Default</th>
              <th scope="col" className={thApi + ' pr-0'}>Description</th>
            </tr>
          </thead>
          <tbody>
            {type.props.map((p) => (
              <tr key={p.name} className="border-b border-border/60 last:border-0">
                <th scope="row" className={tdApi + ' text-left font-normal [overflow-wrap:anywhere]'}>
                  <code className="font-mono text-[12px] font-semibold text-foreground">{p.name}</code>
                  {p.required && <span className="ms-1.5 font-mono text-[10.5px] text-warning-text">required</span>}
                </th>
                <td className={tdApi + ' font-mono text-[11.5px] text-muted-foreground [overflow-wrap:anywhere]'}>{p.type}</td>
                <td className={tdApi + ' font-mono text-[11.5px] text-foreground [overflow-wrap:anywhere]'}>
                  {p.default ?? <><span aria-hidden="true" className="text-muted-foreground">—</span><span className="sr-only">none</span></>}
                </td>
                <td className={tdApi + ' pr-0 leading-5 text-foreground'}>
                  {p.description ? <Rich text={p.description} /> : p.variant ? <span className="text-muted-foreground">Style variant.</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function KeyboardTable({ rows, label }) {
  return (
    <table aria-label={label} className="mt-2 w-full text-left text-[12.5px]">
      <thead>
        <tr className="border-b border-border text-muted-foreground">
          <th scope="col" className="py-1.5 pr-4 font-medium">Key</th>
          <th scope="col" className="py-1.5 font-medium">Behaviour</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([key, what], i) => (
          <tr key={i} className="border-b border-border/60 last:border-0">
            <td className="py-1.5 pr-4 align-top"><kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-foreground">{key}</kbd></td>
            <td className="py-1.5 text-foreground">{what}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Accessibility notes from the doc: pattern, primitive, optional free-form notes, keyboard coverage. */
function a11yNotes(api) {
  const notes = [];
  if (api.pattern) notes.push(<>Follows the <strong className="font-semibold">{api.pattern}</strong> pattern; the contract test checks its roles and names.</>);
  if (api.primitive) notes.push(<>Built on <code className="font-mono text-[11.5px]">{api.primitive}</code>, which handles focus management and ARIA state.</>);
  const extra = api.a11y ?? api.accessibility;
  for (const n of Array.isArray(extra) ? extra : extra ? [extra] : []) notes.push(<Rich text={n} />);
  if (api.keyboard?.length) notes.push(<>Every keyboard row above is covered by a test, and every example passes axe.</>);
  if (api.tokens?.length) notes.push(<>Reads the tokens <Rich text={api.tokens.map((t) => '`' + t + '`').join(', ')} />, so contrast holds in all three themes.</>);
  return notes;
}

/** Generated API reference. `folder` is the package folder (e.g. "Button"); `kind` is component | layout. */
function ApiReference({ folder, kind = 'component', level = 3 }) {
  const api = (kind === 'layout' ? LAYOUT_API : COMPONENT_API)[folder];
  if (!api) return null;
  const idBase = `api-${kind}-${folder}`;
  const [main, ...parts] = api.propTypes;
  const notes = a11yNotes(api);
  const sub = 'mt-6 text-[13px] font-semibold text-foreground';
  return (
    <div className="mt-8 border-t border-border pt-6">
      <H level={level} className="text-[14px] font-semibold tracking-tight text-foreground">API reference</H>
      {main && <>
        <H level={level + 1} className={sub}>Props</H>
        <PropsTable type={main} level={level + 2} idBase={idBase} />
        {parts.length > 0 && (
          <details className="group mt-4">
            <summary className="cursor-pointer select-none rounded text-[12.5px] font-medium text-primary-text underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
              {parts.length} more {parts.length === 1 ? 'part' : 'parts'}: {parts.map((t) => t.component).join(', ')}
            </summary>
            {parts.map((t) => <PropsTable key={t.name} type={t} level={level + 2} idBase={idBase} />)}
          </details>
        )}
      </>}
      {api.keyboard?.length > 0 && <>
        <H level={level + 1} className={sub}>Keyboard</H>
        <KeyboardTable rows={api.keyboard} label={`${api.name} keyboard interactions`} />
      </>}
      {notes.length > 0 && <>
        <H level={level + 1} className={sub}>Accessibility</H>
        <ul className="mt-2 list-disc space-y-1 ps-5 text-[12.5px] leading-5 text-foreground marker:text-muted-foreground">
          {notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      </>}
    </div>
  );
}

window.ApiReference = ApiReference;

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
