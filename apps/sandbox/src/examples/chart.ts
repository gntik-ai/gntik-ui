export const chart = `import { useState } from 'react';
import { AreaChart, BarList, chartFmt } from '@gntik-ai/charts';
import { Card, CardBody, CardHeader, CardTitle, ToggleGroup, Toggle } from '@gntik-ai/ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const requests = DAYS.map((day, i) => ({
  day,
  api: 1200 + Math.round(Math.sin(i) * 300) + i * 90,
  web: 800 + Math.round(Math.cos(i) * 200) + i * 40,
}));

const routes = [
  { name: '/v1/deployments', value: 18420 },
  { name: '/v1/projects', value: 12310 },
  { name: '/v1/members', value: 6120 },
  { name: '/v1/invoices', value: 2480 },
];

export default function App() {
  const [stacked, setStacked] = useState(['stacked']);
  return (
    <div className="grid gap-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Requests this week</CardTitle>
          <ToggleGroup aria-label="Layout" size="sm" value={stacked} onValueChange={(v) => setStacked(v.length ? v : ['overlap'])}>
            <Toggle value="stacked">Stacked</Toggle>
            <Toggle value="overlap">Overlap</Toggle>
          </ToggleGroup>
        </CardHeader>
        <CardBody>
          <AreaChart
            data={requests}
            index="day"
            categories={['api', 'web']}
            stacked={stacked[0] === 'stacked'}
            valueFormatter={chartFmt.compact}
            aria-label="Requests per day, API and web"
          />
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top routes</CardTitle>
        </CardHeader>
        <CardBody>
          <BarList data={routes} index="name" category="value" valueFormatter={chartFmt.num} aria-label="Requests per route" />
        </CardBody>
      </Card>
    </div>
  );
}
`;
