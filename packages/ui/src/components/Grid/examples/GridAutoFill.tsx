import { Grid } from '../Grid';

const PROJECTS = ['Billing API', 'Search', 'Mobile app', 'Data pipeline', 'Docs site', 'Status page'];

export default function GridAutoFill() {
  return (
    <Grid as="ul" minChildWidth="12rem" gap={3} aria-label="Projects">
      {PROJECTS.map((p) => (
        <li key={p} className="rounded-lg border border-border bg-card px-4 py-3 text-[13px] font-medium text-foreground">
          {p}
        </li>
      ))}
    </Grid>
  );
}
