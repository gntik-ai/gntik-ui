import { useId, type ReactNode } from 'react';
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger, cn } from '@gntik-ai/ui';
import { sampleFaqs } from './fixtures';

export interface FaqItem {
  id: string;
  question: string;
  answer: ReactNode;
}

export interface FaqProps {
  items?: FaqItem[];
  title?: ReactNode;
  description?: ReactNode;
  /** `stacked` (heading over the list) or `split` (heading left from `lg`). */
  layout?: 'stacked' | 'split';
  /** Ids of the items open on mount. */
  defaultOpen?: string[];
  /** Allow several items open at once. */
  multiple?: boolean;
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

/** Frequently asked questions in an accordion, with a heading block. */
export function Faq({
  items = sampleFaqs,
  title = 'Frequently asked questions',
  description = 'Can’t find what you’re looking for? Reach out to our support team.',
  layout = 'stacked',
  defaultOpen,
  multiple = false,
  headingLevel: Heading = 'h2',
  className,
}: FaqProps) {
  const titleId = useId();
  const split = layout === 'split';
  return (
    <section
      aria-labelledby={titleId}
      className={cn('px-4 py-16 sm:px-6 sm:py-20', split ? 'mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_2fr]' : 'mx-auto max-w-3xl', className)}
    >
      <div className={cn(!split && 'text-center')}>
        <Heading id={titleId} className="text-[28px] leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-[34px]">
          {title}
        </Heading>
        {description && <p className="mt-4 text-[15px] leading-relaxed text-pretty text-muted-foreground">{description}</p>}
      </div>
      <Accordion variant="flush" multiple={multiple} defaultValue={defaultOpen} className={cn(!split && 'mt-10')}>
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger headingLevel={Heading === 'h2' ? 3 : 4}>{item.question}</AccordionTrigger>
            <AccordionPanel>{item.answer}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
