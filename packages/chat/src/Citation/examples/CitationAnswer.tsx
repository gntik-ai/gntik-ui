import { Citation, CitationList, type CitationSource } from '../Citation';

const SOURCES: CitationSource[] = [
  {
    title: 'Deployment limits and quotas',
    url: 'https://docs.example.com/deployments/limits',
    snippet: 'Each project can run up to 20 deployments a day. Limits reset at midnight UTC.',
  },
  {
    title: 'Billing FAQ: seats and invoices',
    url: 'https://help.example.com/billing/faq',
    snippet: 'Invoices are issued on the first business day of the month and list every seat that was active.',
  },
];

export default function CitationAnswer() {
  return (
    <div className="flex max-w-2xl flex-col gap-4 text-[14px] leading-[1.7] text-foreground">
      <p>
        A project can run up to 20 deployments a day
        <Citation index={1} source={SOURCES[0]!} />, and invoices list every seat that was active during the month
        <Citation index={2} source={SOURCES[1]!} />.
      </p>
      <CitationList sources={SOURCES} />
    </div>
  );
}
