import type { FlowNodeKind } from './tones';

const PATHS: Record<FlowNodeKind, string[]> = {
  trigger: ['M13 2 3 14h9l-1 8 10-12h-9l1-8z'],
  step: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M9 9h6v6H9z'],
  router: ['M16 3h5v5', 'M8 3H3v5', 'M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3', 'm15 9 6-6'],
  output: ['M20 6 9 17l-5-5'],
};

/** Default decorative icon for a node kind (stroke = currentColor). */
export function KindGlyph({ kind, size = 16 }: { kind: FlowNodeKind; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[kind].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
