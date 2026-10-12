import { SimpleSelect } from '@gntik-ai/ui';
import { useState } from 'react';
import { ChartCard } from '../ChartCard';
import { REQUEST_DATA, REQUEST_RANGES } from './custom-ranges';

/** The page toolbar owns the only range control; each card follows its controlled window. */
export default function ToolbarOwnedRangeChartCard() {
  const [range, setRange] = useState('24h');
  return (
    <div className="grid gap-4">
      <SimpleSelect
        label="Page window"
        items={REQUEST_RANGES}
        value={range}
        onValueChange={(value) => {
          if (value !== null) setRange(value);
        }}
      />
      <ChartCard
        title="Requests"
        description="Request volume over the page window"
        ranges={REQUEST_RANGES}
        range={range}
        showRangeToggle={false}
        dataByRange={REQUEST_DATA}
        index="time"
        categories={['Requests']}
        valueFormatter={(value) => `${value.toLocaleString('en-US')} requests`}
        emptyMessage="No requests in this window"
        errorMessage="Request volume unavailable"
      />
    </div>
  );
}
