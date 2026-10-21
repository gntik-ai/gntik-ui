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
  useI18n,
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

export interface ResourceDetailLabels {
  overview: string;
  activity: string;
  settings: string;
  sections: string;
}

export interface ResourceDetailProps {
  /** Per-key copy overrides; explicit props take precedence, then labels, then the active catalog. */
  labels?: Partial<ResourceDetailLabels>;
  /**
   * Optional boolean, default false. Shows only the keyboard-accessible Overview tab in
   * the "Resource sections" tablist, using explicit resource props without sample defaults.
   * Ignores activity, events, dangerActions, defaultTab, onSaveSettings and onDangerAction.
   * Explicit actions and onEditDetails are still honored. ConsoleShell defaults are unchanged.
   */
  readOnly?: boolean;
  /**
   * Optional readonly StatusEvent[], default undefined; used only when readOnly is true.
   * Omitted: no history card. Empty: named StatusTimeline empty state. Populated: exactly
   * the supplied events, without fabricated actors. Editable mode continues to use events.
   */
  history?: readonly StatusEvent[];
  name: string;
  description: string;
  /** StatusTag key next to the title. */
  status: string;
  breadcrumbs: BreadcrumbItem[];
  meta: PageHeaderMetaItem[];
  actions: PageChromeAction[];
  details: readonly DescriptionItem[];
  /** Title of the Overview details card (default "Configuration"). */
  overviewTitle: string;
  /** Description of the Overview details card. */
  overviewDescription: string;
  /** Title of the Overview status-history card (default "Status history"). */
  historyTitle: string;
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

const TABS: ResourceDetailTab[] = ['overview', 'activity', 'settings'];

/** Resource detail: editable tabs by default, or explicit-only Overview when readOnly is true. */
export default function ResourceDetailPage(props: Partial<ResourceDetailProps>) {
  const { t } = useI18n();
  const readOnly = props.readOnly ?? false;
  const {
    name = readOnly ? '' : detailResource.name,
    description = readOnly ? '' : detailResource.description,
    status = readOnly ? '' : detailResource.status,
    breadcrumbs = readOnly ? [] : detailBreadcrumbs,
    meta: metaProp,
    actions: actionsProp,
    details: detailsProp,
    overviewTitle = 'Configuration',
    overviewDescription = readOnly ? '' : 'Settings of this resource.',
    historyTitle = 'Status history',
    events = readOnly ? [] : detailEvents,
    activity = readOnly ? [] : detailActivity,
    dangerActions = readOnly ? [] : detailDangerActions,
    defaultTab = 'overview',
    onTabChange,
    onEditDetails,
    onSaveSettings,
    onDangerAction,
    shell,
    labels,
  } = props;
  const meta = metaProp ?? (readOnly ? [] : detailMeta);
  const actions: PageChromeAction[] =
    actionsProp ??
    (readOnly
      ? []
      : [
          { label: 'View logs', icon: FileText, variant: 'secondary' },
          { label: 'Redeploy', icon: RotateCw, variant: 'primary' },
        ]);
  const details = detailsProp ?? (readOnly ? [] : detailItems);
  const historyEvents = readOnly ? props.history : events;
  const [tab, setTab] = useState<ResourceDetailTab>(defaultTab);
  const [settings, setSettings] = useState<ResourceSettings>({ name, description });
  const [saved, setSaved] = useState<ResourceSettings>({ name, description });
  const dirty = settings.name !== saved.name || settings.description !== saved.description;
  const tabs = (readOnly ? TABS.filter((value) => value === 'overview') : TABS).map((value) => ({
    value,
    label: labels?.[value] ?? t(`resourceDetail.${value}`),
  }));

  return (
    <ConsoleShell currentHref="/deployments" breadcrumbs={breadcrumbs} {...shell}>
      <Page
        width="wide"
        header={
          <PageHeader
            breadcrumbs={null}
            title={name}
            description={description}
            status={status}
            meta={meta}
            actions={actions}
            tabs={null}
          />
        }
      >
        <Tabs
          value={readOnly ? 'overview' : tab}
          onValueChange={(v) => {
            const next = tabs.find((t) => t.value === v)?.value ?? 'overview';
            setTab(next);
            onTabChange?.(next);
          }}
        >
          <TabsList aria-label={labels?.sections ?? t('resourceDetail.sections')}>
            {tabs.map((t) => (
              <TabsTab key={t.value} value={t.value}>
                {t.label}
              </TabsTab>
            ))}
          </TabsList>

          <TabsPanel value="overview">
            <Grid cols={historyEvents === undefined ? 1 : { base: 1, lg: 5 }} gap={6} align="start">
              <DescriptionListCard
                className={historyEvents === undefined ? undefined : 'lg:col-span-3'}
                titleAs="h2"
                title={overviewTitle}
                description={overviewDescription}
                items={details}
                onEdit={onEditDetails}
              />
              {historyEvents !== undefined && (
                <Section
                  role={readOnly ? 'group' : undefined}
                  variant="card"
                  padding="md"
                  title={historyTitle}
                  className="lg:col-span-2"
                >
                  <StatusTimeline events={historyEvents} maxVisible={readOnly ? undefined : 4} />
                </Section>
              )}
            </Grid>
          </TabsPanel>

          {!readOnly && (
            <TabsPanel value="activity">
              <Section
                variant="card"
                padding="md"
                title="Activity"
                description="Changes made to this resource by people and automations."
              >
                <ActivityFeed items={activity} label="Activity, newest first" />
              </Section>
            </TabsPanel>
          )}

          {!readOnly && (
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
                        <Input
                          required
                          value={settings.name}
                          onValueChange={(v) => setSettings((s) => ({ ...s, name: v }))}
                        />
                        <FieldDescription>Lowercase letters, numbers and dashes.</FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel>Description</FieldLabel>
                        <Textarea
                          rows={3}
                          value={settings.description}
                          onValueChange={(v) => setSettings((s) => ({ ...s, description: v }))}
                        />
                      </Field>
                    </Stack>
                  </FormSection>
                </form>
                <DangerZone
                  description="These actions affect everyone who uses this resource."
                  actions={dangerActions}
                  onConfirm={onDangerAction}
                />
              </Stack>
            </TabsPanel>
          )}
        </Tabs>
      </Page>
    </ConsoleShell>
  );
}
