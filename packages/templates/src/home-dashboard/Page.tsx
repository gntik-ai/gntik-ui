import { ActivityFeed, ChartCard, KpiRow, PageHeader, type ActivityItem, type ChartCardRange, type KpiItem, type PageChromeAction } from '@gntik-ai/blocks';
import { chartFmt } from '@gntik-ai/charts';
import { Plus, UserPlus } from '@gntik-ai/icons';
import { Button, ClickableCard, Grid, GridItem, Page, Section, Stack, type BreadcrumbItem } from '@gntik-ai/ui';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  homeActivity,
  homeBreadcrumbs,
  homeKpis,
  homeQuickActions,
  homeRequestRanges,
  homeRequestsByRange,
  type QuickAction,
  type RequestPoint,
} from './data';

export interface HomeDashboardProps {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  /** Header actions (the last one is the primary). */
  actions: PageChromeAction[];
  kpis: readonly KpiItem[];
  requestsByRange: Readonly<Record<string, readonly RequestPoint[]>>;
  requestRanges: readonly ChartCardRange[];
  activity: readonly ActivityItem[];
  quickActions: readonly QuickAction[];
  /** Called with the id of a quick action card (cards with `href` also navigate). */
  onQuickAction: (id: string) => void;
  onViewAllActivity: () => void;
  /** Console frame overrides (nav, user, workspaces, topbar). */
  shell: Omit<ConsoleShellProps, 'children'>;
}

/** Home dashboard: header, KPI row, two charts, recent activity and quick actions in the console shell. */
export default function HomeDashboardPage({
  title = 'Overview',
  description = 'How your workspace is doing across projects, traffic and spend.',
  breadcrumbs = homeBreadcrumbs,
  actions = [
    { label: 'Invite members', icon: UserPlus, variant: 'secondary' },
    { label: 'New project', icon: Plus, variant: 'primary' },
  ],
  kpis = homeKpis,
  requestsByRange = homeRequestsByRange,
  requestRanges = homeRequestRanges,
  activity = homeActivity,
  quickActions = homeQuickActions,
  onQuickAction,
  onViewAllActivity,
  shell,
}: Partial<HomeDashboardProps>) {
  return (
    <ConsoleShell currentHref="/overview" breadcrumbs={breadcrumbs} {...shell}>
      <Page
        width="wide"
        header={<PageHeader breadcrumbs={null} title={title} description={description} status="" meta={[]} tabs={null} actions={actions} />}
      >
        <Stack gap={6}>
          <KpiRow items={kpis} />
          <Section title="Trends" description="Spend and traffic over the selected range.">
            <Grid cols={{ base: 1, lg: 2 }} gap={6}>
              <ChartCard />
              <ChartCard<RequestPoint>
                title="Requests"
                description="Requests and errors per day"
                ranges={requestRanges}
                dataByRange={requestsByRange}
                index="day"
                categories={['Requests', 'Errors']}
                colors={['primary', 'rose']}
                kind="line"
                stacked={false}
                valueFormatter={chartFmt.num}
              />
            </Grid>
          </Section>
          <Grid cols={{ base: 1, lg: 3 }} gap={6} align="start">
            <GridItem span={{ base: 1, lg: 2 }}>
              <Section
                variant="card"
                padding="md"
                title="Recent activity"
                actions={
                  <Button variant="ghost" size="sm" onClick={onViewAllActivity}>
                    View all
                  </Button>
                }
              >
                <ActivityFeed items={activity} label="Activity, newest first" />
              </Section>
            </GridItem>
            <Section title="Quick actions" description="Common next steps.">
              <Stack gap={3}>
                {quickActions.map((qa) => {
                  const Icon = qa.icon;
                  return (
                    <ClickableCard
                      key={qa.id}
                      title={qa.title}
                      description={qa.description}
                      icon={<Icon aria-hidden />}
                      href={qa.href}
                      onClick={() => onQuickAction?.(qa.id)}
                    />
                  );
                })}
              </Stack>
            </Section>
          </Grid>
        </Stack>
      </Page>
    </ConsoleShell>
  );
}
