import { useState } from 'react';
import { Tabs, TabsList, TabsPanel, TabsTab } from '../Tabs';

const RANGES = [
  ['day', 'Day'],
  ['week', 'Week'],
  ['month', 'Month'],
  ['quarter', 'Quarter'],
] as const;

export default function TabsPills() {
  const [range, setRange] = useState<string>('week');
  return (
    <div className="grid gap-8">
      <Tabs variant="pills" value={range} onValueChange={(v) => setRange(String(v))}>
        <TabsList aria-label="Time range">
          {RANGES.map(([value, label]) => (
            <TabsTab key={value} value={value}>{label}</TabsTab>
          ))}
        </TabsList>
        {RANGES.map(([value, label]) => (
          <TabsPanel key={value} value={value} className="text-muted-foreground">
            Billing usage for the selected {label.toLowerCase()}.
          </TabsPanel>
        ))}
      </Tabs>
      <Tabs variant="pills" defaultValue="summary" className="max-w-xl">
        <TabsList aria-label="Report" fullWidth>
          <TabsTab value="summary">Summary</TabsTab>
          <TabsTab value="cost">Cost</TabsTab>
          <TabsTab value="latency">Latency</TabsTab>
          <TabsTab value="errors">Errors</TabsTab>
        </TabsList>
        <TabsPanel value="summary">Summary of the billing period.</TabsPanel>
        <TabsPanel value="cost">Cost by project.</TabsPanel>
        <TabsPanel value="latency">p50 and p95 latency.</TabsPanel>
        <TabsPanel value="errors">Error rate by deployment.</TabsPanel>
      </Tabs>
    </div>
  );
}
