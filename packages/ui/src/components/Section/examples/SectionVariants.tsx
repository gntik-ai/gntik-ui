import { Section } from '../Section';

export default function SectionVariants() {
  return (
    <div className="grid max-w-[560px] gap-5">
      <Section title="Plain" description="No surface — groups content on the page." headingLevel="h3">
        <p className="text-[13px] text-muted-foreground">Members can be invited from the project settings.</p>
      </Section>
      <Section variant="muted" padding="sm" title="Muted" headingLevel="h3">
        <p className="text-[13px] text-muted-foreground">Lower hierarchy, for secondary information.</p>
      </Section>
      <Section variant="card" padding="lg" title="Card" headingLevel="h3">
        <p className="text-[13px] text-muted-foreground">The primary surface for a block of settings.</p>
      </Section>
    </div>
  );
}
