import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { AssistantCardGrid } from '../ai/AssistantCardGrid/AssistantCardGrid';
import { EvaluationScorecard } from '../ai/EvaluationScorecard/EvaluationScorecard';
import { ModelKeysList } from '../ai/ModelKeysList/ModelKeysList';
import { PromptEditor } from '../ai/PromptEditor/PromptEditor';
import { TokenCostCard } from '../ai/TokenCostCard/TokenCostCard';
import { TraceWaterfall } from '../ai/TraceWaterfall/TraceWaterfall';
import { CostBreakdown } from '../billing/CostBreakdown/CostBreakdown';
import { PaymentMethodCard } from '../billing/PaymentMethodCard/PaymentMethodCard';
import { PlanCard } from '../billing/PlanCard/PlanCard';
import { QuotaMeters } from '../billing/QuotaMeters/QuotaMeters';
import { SpendVsBudget } from '../billing/SpendVsBudget/SpendVsBudget';
import { LogViewer } from '../builders/LogViewer/LogViewer';
import { ActivityFeed } from '../data-display/ActivityFeed/ActivityFeed';
import { ChartCard } from '../data-display/ChartCard/ChartCard';
import { DescriptionListCard } from '../data-display/DescriptionListCard/DescriptionListCard';
import { ResourceCardGrid } from '../data-display/ResourceCardGrid/ResourceCardGrid';
import { StatCard } from '../data-display/StatCard/StatCard';
import { AgendaList } from '../scheduling/AgendaList/AgendaList';

/** Levels of every heading rendered, in document order. */
const levels = () => screen.queryAllByRole('heading').map((h) => Number(h.tagName.slice(1)));

const cases: Array<[string, (as: 'h2' | 'h4') => ReactElement]> = [
  ['ChartCard', (as) => <ChartCard titleAs={as} />],
  ['DescriptionListCard', (as) => <DescriptionListCard titleAs={as} />],
  ['StatCard', (as) => <StatCard titleAs={as} />],
  ['ResourceCardGrid', (as) => <ResourceCardGrid titleAs={as} />],
  ['PlanCard', (as) => <PlanCard titleAs={as} />],
  ['QuotaMeters', (as) => <QuotaMeters titleAs={as} />],
  ['CostBreakdown', (as) => <CostBreakdown titleAs={as} />],
  ['SpendVsBudget', (as) => <SpendVsBudget titleAs={as} />],
  ['PaymentMethodCard', (as) => <PaymentMethodCard titleAs={as} />],
  ['TokenCostCard', (as) => <TokenCostCard titleAs={as} />],
  ['ModelKeysList', (as) => <ModelKeysList titleAs={as} />],
  ['EvaluationScorecard', (as) => <EvaluationScorecard titleAs={as} />],
  ['LogViewer', (as) => <LogViewer titleAs={as} />],
  ['TraceWaterfall', (as) => <TraceWaterfall titleAs={as} />],
  ['PromptEditor', (as) => <PromptEditor titleAs={as} />],
  ['AgendaList', (as) => <AgendaList titleAs={as} />],
  ['ActivityFeed', (as) => <ActivityFeed groupHeadingAs={as} />],
];

describe('heading levels (titleAs)', () => {
  it.each(cases)('%s renders its title at the requested level', (_name, make) => {
    const { unmount } = render(make('h2'));
    const atTwo = levels();
    expect(atTwo[0]).toBe(2);
    expect(Math.max(...atTwo)).toBeLessThanOrEqual(3); // inner headings follow the title
    unmount();
    render(make('h4'));
    expect(levels()[0]).toBe(4);
  });

  it('AssistantCardGrid shifts its card names with the section title', () => {
    render(<AssistantCardGrid titleAs="h3" />);
    expect(levels()[0]).toBe(3);
    expect(new Set(levels().slice(1))).toEqual(new Set([4]));
  });

  it('keeps h3 as the default', () => {
    render(<ChartCard />);
    expect(levels()[0]).toBe(3);
  });
});
