import { Carousel } from '../Carousel';

const projects = [
  { name: 'support-triage', env: 'production', note: 'Routes inbound tickets to the right queue.' },
  { name: 'invoice-sync', env: 'staging', note: 'Mirrors invoices into the ledger every hour.' },
  { name: 'usage-reports', env: 'production', note: 'Builds the monthly usage summary per workspace.' },
  { name: 'member-import', env: 'development', note: 'Bulk-imports members from a CSV upload.' },
  { name: 'deploy-gate', env: 'production', note: 'Blocks deployments while an incident is open.' },
];

export default function CarouselProjects() {
  return (
    <Carousel label="Recent projects" title="Recent projects" perView={3} showDots className="max-w-3xl">
      {projects.map((p) => (
        <article key={p.name} className="h-full rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="font-mono text-[13px] font-semibold text-foreground">{p.name}</h3>
          <p className="mt-0.5 text-[11.5px] tracking-wide text-muted-foreground uppercase">{p.env}</p>
          <p className="mt-3 text-[12.5px] leading-5 text-muted-foreground">{p.note}</p>
        </article>
      ))}
    </Carousel>
  );
}
