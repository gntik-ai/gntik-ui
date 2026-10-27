import { useState } from 'react';
import { ChartCard } from '@gntik-ai/blocks';
import { useChartExport, useChartLabels, useChartTheme } from '@gntik-ai/charts';
import { Button, Menu, MenuContent, MenuItem, MenuTrigger, ThemeScope } from '@gntik-ai/ui';

const rows = [
  { month: 'Jan', Value: 120 },
  { month: 'Feb', Value: 150 },
  { month: 'Mar', Value: 135 },
];

/** Composition only: the chart package does not depend on Menu or ChartCard. */
export default function ChartExportExample() {
  const chart = useChartExport();
  const labels = useChartLabels();
  const { theme } = useChartTheme();
  const [error, setError] = useState(false);
  const run = (action: () => Promise<void>) => {
    setError(false);
    void action().catch(() => setError(true));
  };
  return (
    <ThemeScope theme={theme} ref={chart.ref} data-chart-export-example>
      <ChartCard
        title={labels.barChart}
        kind="bar"
        dataByRange={{ all: rows }}
        ranges={[{ value: 'all', label: labels.value }]}
        index="month"
        categories={['Value']}
        stacked={false}
        valueFormatter={(value) => String(value)}
        showRangeToggle={false}
        dataTable
        action={
          <Menu>
            <MenuTrigger render={<Button variant="secondary" />}>{labels.exportChart}</MenuTrigger>
            <MenuContent>
              <MenuItem onClick={() => run(() => chart.downloadPng())}>{labels.exportPng}</MenuItem>
              <MenuItem onClick={() => run(chart.downloadSvg)}>{labels.exportSvg}</MenuItem>
              <MenuItem onClick={() => run(chart.downloadCsv)}>{labels.exportCsv}</MenuItem>
              <MenuItem onClick={chart.print}>{labels.printChart}</MenuItem>
            </MenuContent>
          </Menu>
        }
      />
      <p role="status" className="mt-2 text-sm text-destructive-text">
        {error ? labels.exportError : ''}
      </p>
    </ThemeScope>
  );
}
