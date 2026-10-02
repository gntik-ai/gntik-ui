import { useState } from 'react';
import { SimpleSelect } from '../Select';

const regions = [
  { value: 'eu-west', label: 'EU West · Frankfurt' },
  { value: 'us-east', label: 'US East · Virginia' },
  { value: 'us-west', label: 'US West · Oregon' },
  { value: 'ap-south', label: 'AP South · Singapore (soon)', disabled: true },
];

export default function SelectBasic() {
  const [region, setRegion] = useState<string | null>('eu-west');
  return (
    <div className="grid w-full max-w-sm gap-6">
      <div>
        <SimpleSelect label="Deployment region" items={regions} value={region} onValueChange={setRegion} />
      </div>
      <div>
        <SimpleSelect label="Billing plan" placeholder="Choose a plan…" size="sm" items={[
          { value: 'free', label: 'Free' },
          { value: 'team', label: 'Team' },
          { value: 'enterprise', label: 'Enterprise' },
        ]} />
      </div>
    </div>
  );
}
