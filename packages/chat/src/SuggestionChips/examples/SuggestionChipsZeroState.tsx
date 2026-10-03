import { CreditCard, Rocket, Users, FileSearch } from 'lucide-react';
import { useState } from 'react';
import { SuggestionChips } from '../SuggestionChips';

export default function SuggestionChipsZeroState() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <SuggestionChips
        heading="Try asking"
        onSelect={setPicked}
        suggestions={[
          { label: 'Summarise deployments', description: 'What shipped this week across projects', icon: Rocket },
          { label: 'Find unpaid invoices', description: 'List invoices still open from last month', icon: CreditCard },
          { label: 'Review member access', description: 'Who has admin rights and since when', icon: Users },
          { label: 'Explain an error', description: 'Paste a log line and get a likely cause', icon: FileSearch },
        ]}
      />
      <SuggestionChips layout="chips" label="Follow-up suggestions" onSelect={setPicked} suggestions={['Show only failed ones', 'Compare with last week', 'Export as CSV']} />
      <p className="text-[12.5px] text-muted-foreground" aria-live="polite">
        {picked ? `Selected: ${picked}` : 'Pick a suggestion.'}
      </p>
    </div>
  );
}
