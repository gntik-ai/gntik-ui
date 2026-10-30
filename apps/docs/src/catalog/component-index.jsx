import { useState } from 'react';
import { GROUP_ORDER } from './package-docs.jsx';
import { routeHash } from './routes.js';

export function ComponentIndex({ entries }) {
  const { SectionHead } = window;
  const [group, setGroup] = useState('All');
  const groups = GROUP_ORDER.filter((g) => entries.some((c) => c.group === g));
  return (
    <div>
      <SectionHead
        kicker="Library"
        title="@gntik-ai/ui"
        status="done"
        intro={`${entries.length} documented components, hooks and utilities. Open a component for live examples and its API reference.`}
      />
      <div className="mb-8 flex flex-wrap gap-1.5" role="group" aria-label="Filter by group">
        {['All', ...groups].map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={group === g}
            onClick={() => setGroup(g)}
            className={
              'h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors focus-ring ' +
              (group === g
                ? 'bg-primary/14 text-primary-text'
                : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground')
            }
          >
            {g}
          </button>
        ))}
      </div>
      {groups
        .filter((g) => group === 'All' || group === g)
        .map((g) => (
          <section key={g} className="mb-8" aria-labelledby={`group-${g}`}>
            <h2 id={`group-${g}`} className="mb-3 text-[15px] font-semibold text-foreground">
              {g}
            </h2>
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {entries
                .filter((c) => c.group === g)
                .map((c) => (
                  <li key={c.id}>
                    <a
                      href={routeHash('ui-components', c.id)}
                      className="flex items-baseline gap-4 px-4 py-3 hover:bg-secondary/60 focus-ring-inset"
                    >
                      <span className="min-w-36 font-semibold text-[13px] text-primary-text underline underline-offset-4">
                        {c.name}
                      </span>
                      <span className="flex-1 text-[12.5px] text-muted-foreground">
                        {c.description.split(/(?<=\.)\s/)[0]}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{c.status}</span>
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
