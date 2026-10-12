import { ChartCard, type ChartCardRange } from '../ChartCard';

export const REQUEST_RANGES: readonly ChartCardRange[] = [
  { value: '24h', label: '24h', summary: { value: '1,240 requests' } },
  { value: '7d', label: '7d', summary: { value: '8,680 requests' } },
  { value: '30d', label: '30d', summary: { value: '37,200 requests' } },
];

export const REQUEST_DATA = {
  '24h': [
    { time: '00:00', Requests: 580 },
    { time: '12:00', Requests: 660 },
  ],
  '7d': [
    { time: 'Mon', Requests: 4080 },
    { time: 'Sun', Requests: 4600 },
  ],
  '30d': [
    { time: 'Week 1', Requests: 18000 },
    { time: 'Week 4', Requests: 19200 },
  ],
};

/** Ordered consumer windows replace the default 7d/30d/90d options. */
export default function CustomRangeChartCard() {
  return (
    <ChartCard
      title="Requests"
      description="Request volume over the selected window"
      ranges={REQUEST_RANGES}
      dataByRange={REQUEST_DATA}
      index="time"
      categories={['Requests']}
      valueFormatter={(value) => `${value.toLocaleString('en-US')} requests`}
    />
  );
}
