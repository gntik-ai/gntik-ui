import { CopyButton } from '../CopyButton';

/** The value is produced on click, e.g. a share link built from current state. */
export default function CopyButtonGetter() {
  const buildLink = () => `https://example.com/share?view=board&at=${new Date().toISOString().slice(0, 10)}`;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <CopyButton value={buildLink} display="label" variant="soft" size="sm" label="Copy share link" copiedLabel="Link copied" announcement="Share link copied" />
      <CopyButton value="disabled" display="label" variant="secondary" size="sm" disabled label="Copy (disabled)" />
    </div>
  );
}
