import { SettingsRow } from '@gntik-ai/blocks';
import { Plus } from '@gntik-ai/icons';
import { Badge, Card, Grid, Section, SimpleSelect, StatusTag, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, Timestamp, type StatusDefinition } from '@gntik-ai/ui';
import { useState } from 'react';
import { SettingsFrame, type SettingsFrameOptions } from '../settings-profile/SettingsFrame';
import { connectors as defaultConnectors, webhookDeliveries, webhookEndpoints, type Connector, type WebhookDelivery, type WebhookEndpoint } from './data';

export interface SettingsIntegrationsProps extends SettingsFrameOptions {
  connectors: Connector[];
  endpoints: WebhookEndpoint[];
  deliveries: WebhookDelivery[];
  onConnectorChange: (connectorId: string, enabled: boolean) => void;
  onAddEndpoint: () => void;
}

const ENDPOINT_STATUSES: Record<string, StatusDefinition> = {
  active: { label: 'Active', tone: 'success' },
  paused: { label: 'Paused', tone: 'neutral' },
  failing: { label: 'Failing', tone: 'destructive' },
};

const deliveryTone = (code: number | null) => (code == null || code >= 500 ? 'destructive' : code >= 400 ? 'warning' : 'success');

/** Integrations settings: connector cards (SettingsRow switches), webhook endpoints Table, delivery log Table. */
export default function SettingsIntegrationsPage({
  connectors = defaultConnectors,
  endpoints = webhookEndpoints,
  deliveries = webhookDeliveries,
  onConnectorChange,
  onAddEndpoint,
  ...frame
}: Partial<SettingsIntegrationsProps>) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => Object.fromEntries(connectors.map((c) => [c.id, c.enabled])));
  const [endpointFilter, setEndpointFilter] = useState('all');
  const shown = endpointFilter === 'all' ? deliveries : deliveries.filter((d) => d.endpointId === endpointFilter);
  const urlOf = (id: string) => endpoints.find((e) => e.id === id)?.url ?? id;
  const connectedCount = Object.values(enabled).filter(Boolean).length;

  const toggle = (id: string, on: boolean) => {
    setEnabled((s) => ({ ...s, [id]: on }));
    onConnectorChange?.(id, on);
  };

  return (
    <SettingsFrame
      page="integrations"
      width="wide"
      description="Connect the workspace to other tools and send events to your own endpoints."
      actions={[{ label: 'Add endpoint', icon: Plus, variant: 'primary', onClick: onAddEndpoint }]}
      {...frame}
    >
      <Section title="Connectors" description={`${connectedCount} of ${connectors.length} connected.`}>
        <Grid cols={{ base: 1, md: 2 }} gap={4}>
          {connectors.map(({ id, name, description, icon: ConnectorIcon }) => (
            <Card key={id} className="px-5">
              <SettingsRow
                label={
                  <span className="flex items-center gap-2.5">
                    <ConnectorIcon size={16} aria-hidden className="text-muted-foreground" />
                    {name}
                  </span>
                }
                description={description}
                checked={enabled[id] ?? false}
                onCheckedChange={(on) => toggle(id, on)}
              >
                <Badge size="sm" tone={enabled[id] ? 'success' : 'neutral'} dot className="mt-2">
                  {enabled[id] ? 'Connected' : 'Off'}
                </Badge>
              </SettingsRow>
            </Card>
          ))}
        </Grid>
      </Section>
      <Section title="Webhook endpoints" description="We sign every request; retries back off for up to 24 hours.">
        <Table className="min-w-[620px]">
          <TableCaption srOnly>Webhook endpoints</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Endpoint</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead align="right">Last delivery</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-[12px] text-foreground">{e.url}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {e.events.map((ev) => (
                      <Badge key={ev} size="sm" className="font-mono">
                        {ev}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusTag status={e.status} statuses={ENDPOINT_STATUSES} />
                </TableCell>
                <TableCell align="right" className="text-muted-foreground">
                  {e.lastDeliveryAt ? <Timestamp value={e.lastDeliveryAt} tooltip={false} /> : 'Never'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
      <Section
        title="Recent deliveries"
        actions={
          <SimpleSelect
            aria-label="Filter deliveries by endpoint"
            size="sm"
            items={[{ value: 'all', label: 'All endpoints' }, ...endpoints.map((e) => ({ value: e.id, label: e.url.replace('https://', '') }))]}
            value={endpointFilter}
            onValueChange={(v) => setEndpointFilter(v ?? 'all')}
          />
        }
      >
        <Table density="compact" className="min-w-[620px]">
          <TableCaption srOnly>Webhook deliveries</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Response</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead align="right">Duration</TableHead>
              <TableHead align="right">Sent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shown.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <Badge size="sm" tone={deliveryTone(d.statusCode)} dot className="font-mono">
                    {d.statusCode ?? 'Timeout'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-[12px]">{d.event}</TableCell>
                <TableCell className="font-mono text-[12px] text-muted-foreground">{urlOf(d.endpointId)}</TableCell>
                <TableCell align="right" className="tabular-nums">
                  {d.durationMs} ms
                </TableCell>
                <TableCell align="right" className="text-muted-foreground">
                  <Timestamp value={d.at} tooltip={false} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </SettingsFrame>
  );
}
