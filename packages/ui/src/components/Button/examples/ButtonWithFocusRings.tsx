import { ThemeScope } from '@gntik-ai/ui';

/** Requires the @gntik-ai/tokens minor release that introduces focus-ring. */
export default function ButtonWithFocusRings() {
  return (
    <div className="space-y-4 text-[13px] text-foreground">
      <p>Tab to see the keyboard outline. Pointer focus leaves it hidden.</p>
      <button type="button" className="focus-ring rounded-md border border-border px-3 py-2">
        Start focus preview
      </button>
      <div>
        <button type="button" className="focus-ring rounded-md border border-border px-3 py-2">
          Outside outline
        </button>
      </div>
      <ul aria-label="Clipped focus rows" className="w-64 overflow-hidden rounded-md border border-border">
        <li>
          <button type="button" className="focus-ring-inset block w-full px-3 py-2 text-start hover:bg-secondary">
            Inside outline
          </button>
        </li>
      </ul>
      <ThemeScope theme="light">
        <button
          type="button"
          className="focus-ring rounded-md border border-border bg-background px-3 py-2 text-foreground"
        >
          Scoped outline
        </button>
      </ThemeScope>
    </div>
  );
}
