import { EvaluationScorecard, PageHeader } from '@gntik-ai/blocks';
import { Play } from '@gntik-ai/icons';
import { ConsoleShell } from '@gntik-ai/templates';
import { Page, Stack } from '@gntik-ai/ui';
import { evalMetrics, evaluationSuites } from '../data/evaluations';
import { shellFor } from '../shell';

/** Evaluations: ConsoleShell + Page + one EvaluationScorecard per suite. */
export function Evaluations() {
  return (
    <ConsoleShell {...shellFor('/evaluations')} breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Evaluations' }]}>
      <Page
        width="wide"
        header={
          <PageHeader
            breadcrumbs={null}
            title="Evaluations"
            description="Candidate versions scored on their datasets against the version in production. A regression blocks promotion."
            status=""
            meta={[]}
            tabs={null}
            actions={[{ label: 'New evaluation', icon: Play, variant: 'primary' }]}
          />
        }
      >
        <Stack gap={6}>
          {evaluationSuites.map((suite) => (
            <EvaluationScorecard key={suite.id} title={suite.title} baselineLabel={suite.baselineLabel} metrics={evalMetrics} rows={suite.rows} />
          ))}
        </Stack>
      </Page>
    </ConsoleShell>
  );
}
