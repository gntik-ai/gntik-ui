import { Link } from '../Link';

export default function LinkVariants() {
  return (
    <div className="grid gap-3 text-[13px] text-foreground">
      <p>
        Read the <Link href="/docs/deployments">deployment guide</Link> before going live.
      </p>
      <p>
        Questions about invoices? See <Link href="https://example.com/billing" external>billing help</Link>.
      </p>
      <p className="flex gap-4">
        <Link href="/settings" tone="muted">Settings</Link>
        <Link href="/members" underline="always">Members</Link>
      </p>
    </div>
  );
}
