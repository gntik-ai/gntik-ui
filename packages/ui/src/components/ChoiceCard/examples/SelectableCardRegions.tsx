import { Globe } from 'lucide-react';
import { SelectableCard, SelectableCardGroup } from '../SelectableCard';

const REGIONS = [
  { value: 'eu-west', title: 'Europe West', description: 'Dublin · lowest latency for EU users' },
  { value: 'us-east', title: 'US East', description: 'Virginia · default region' },
  { value: 'ap-south', title: 'Asia Pacific', description: 'Singapore · added in beta' },
];

export default function SelectableCardRegions() {
  return (
    <div className="w-full max-w-3xl">
      <p id="regions-label" className="mb-3 text-[13px] font-semibold text-foreground">
        Replicate to regions
      </p>
      <SelectableCardGroup type="checkbox" aria-labelledby="regions-label" defaultValue={['us-east']} columns={3}>
        {REGIONS.map((r) => (
          <SelectableCard key={r.value} value={r.value} title={r.title} description={r.description} icon={<Globe aria-hidden />} />
        ))}
      </SelectableCardGroup>
    </div>
  );
}
