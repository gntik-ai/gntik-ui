import {
  ActivityFeed,
  DangerZone,
  DescriptionListCard,
  FormSection,
  PageHeader,
  StatusTimeline,
  type ActivityItem,
  type DangerZoneAction,
  type DescriptionItem,
  type PageChromeAction,
  type PageHeaderMetaItem,
  type StatusEvent,
} from '@gntik-ai/blocks';
import { FileText, RotateCw } from '@gntik-ai/icons';
import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Grid,
  Input,
  Page,
  Section,
  Stack,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Textarea,
  VisuallyHidden,
  type BreadcrumbItem,
} from '@gntik-ai/ui';
import { useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  detailActivity,
  detailBreadcrumbs,
  detailDangerActions,
  detailEvents,
  detailItems,
  detailMeta,
  detailResource,
  type ResourceSettings,
} from './data';

export type ResourceDetailTab = 'overview' | 'activity' | 'settings';

export interface ResourceDetailProps {
  name: string;
  description: string;
  /** StatusTag key next to the title. */
  status: string;
  breadcrumbs: BreadcrumbItem[];
  meta: PageHeaderMetaItem[];
  actions: PageChromeAction[];
  details: readonly DescriptionItem[];
  events: readonly StatusEvent[];
  activity: readonly ActivityItem[];
  dangerActions: DangerZoneAction[];
  defaultTab: ResourceDetailTab;
  onTabChange: (tab: ResourceDetailTab) => void;
  onEditDetails: () => void;
  onSaveSettings: (settings: ResourceSettings) => void;
  /** Confirmed Danger zone action id (e.g. `pause`, `delete`). */
  onDangerAction: (actionId: string) => void | Promise<void>;
  shell: Omit<ConsoleShellProps, 'children'>;
}

const TABS: Array<{ value: ResourceDetailTab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' },
  { value: 'settings', label: 'Settings' },
];

/** Resource detail: header with status and actions, then Overview / Activity / Settings tabs. */
export default function ResourceDetailPage({
  name = detailResource.name,
  description = detailResource.description,
  status = detailResource.status,
  breadcrumbs = detailBreadcrumbs,
  meta = detailMeta,
  actions = [
    { label: 'View logs', icon: FileText, variant: 'secondary' },
    { label: 'Redeploy', icon: RotateCw, variant: 'primary' },
  ],
  details = detailItems,
  events = detailEvents,
  activity = detailActivity,
  dangerActions = detailDangerActions,
  defaultTab = 'overview',
  onTabChange,
  onEditDetails,
  onSaveSettings,
  onDangerAction,
  shell,
}: Partial<ResourceDetailProps>) {
  const [tab, setTab] = useState<ResourceDetailTab>(defaultTab);
  const [settings, setSettings] = useState<ResourceSettings>({ name, description });
  const [saved, setSaved] = useState<ResourceSettings>({ name, description });
  const dirty = settings.name !== saved.name || settings.description !== saved.description;

  return (
    <ConsoleShell currentHref="/deployments" breadcrumbs={breadcrumbs} {...shell}>
      <Page
        width="wide"
        header={<PageHeader breadcrumbs={null} title={name} description={description} status={status} meta={meta} actions={actions} tabs={null} />}
      >
        <Tabs
          value={tab}
          onValueChange={(v) => {
            const next = TABS.find((t) => t.value === v)?.value ?? 'overview';
            setTab(next);
            onTabChange?.(next);
          }}
        >
          <TabsList aria-label="Resource sections">
            {TABS.map((t) => (
              <TabsTab key={t.value} value={t.value}>
                {t.label}
              </TabsTab>
            ))}
          </TabsList>

          <TabsPanel value="overview">
            <VisuallyHidden render={<h2 />}>Overview</VisuallyHidden>
            <Grid cols={{ base: 1, lg: 5 }} gap={6} align="start">
              <DescriptionListCard className="lg:col-span-3" items={details} onEdit={onEditDetails} />
              <Section variant="card" padding="md" title="Status history" className="lg:col-span-2" headingLevel="h3">
                <StatusTimeline events={events} maxVisible={4} />
              </Section>
            </Grid>
          </TabsPanel>

          <TabsPanel value="activity">
            <Section variant="card" padding="md" title="Activity" description="Changes made to this resource by people and automations.">
              <ActivityFeed items={activity} label="Activity, newest first" />
            </Section>
          </TabsPanel>

          <TabsPanel value="settings">
            <Stack gap={8}>
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  setSaved(settings);
                  onSaveSettings?.(settings);
                }}
              >
                <FormSection
                  title="General"
                  description="Name and description shown across the console."
                  actions={
                    <>
                      <Button variant="ghost" disabled={!dirty} onClick={() => setSettings(saved)}>
                        Discard
                      </Button>
                      <Button type="submit" disabled={!dirty}>
                        Save changes
                      </Button>
                    </>
                  }
                >
                  <Stack gap={4}>
                    <Field>
                      <FieldLabel required>Name</FieldLabel>
                      <Input required value={settings.name} onValueChange={(v) => setSettings((s) => ({ ...s, name: v }))} />
                      <FieldDescription>Lowercase letters, numbers and dashes.</FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel>Description</FieldLabel>
                      <Textarea rows={3} value={settings.description} onValueChange={(v) => setSettings((s) => ({ ...s, description: v }))} />
                    </Field>
                  </Stack>
                </FormSection>
              </form>
              <DangerZone description="These actions affect everyone who uses this resource." actions={dangerActions} onConfirm={onDangerAction} />
            </Stack>
          </TabsPanel>
        </Tabs>
      </Page>
    </ConsoleShell>
  );
}
