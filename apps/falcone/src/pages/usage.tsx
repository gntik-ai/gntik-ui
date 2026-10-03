import { UsageAnalyticsPage } from '@gntik-ai/templates';
import { trafficByRange, trafficRanges, usageRows, usageViews } from '../data/usage';
import { shellFor } from '../shell';

export function Usage() {
  return (
    <UsageAnalyticsPage
      title="Usage & metering"
      description="Metered invocations, errors and cost per tenant, project and stage (prod → Production, staging → Staging, dev → Preview)."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Usage' }]}
      rows={usageRows}
      savedViews={usageViews}
      trafficByRange={trafficByRange}
      trafficRanges={trafficRanges}
      shell={shellFor('/usage')}
    />
  );
}
