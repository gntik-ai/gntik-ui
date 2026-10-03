import { PageHeader } from '@gntik-ai/blocks';
import { ConsoleShell } from '@gntik-ai/templates';
import { Card, CardBody, CardHeader, CardTitle, Grid, Page, Stack, StatusTag, type StatusDefinition } from '@gntik-ai/ui';

interface Incident {
  id: string;
  title: string;
  severity: 'sev1' | 'sev2' | 'sev3';
  status: 'open' | 'investigating' | 'resolved';
}

const SEVERITIES: Record<string, StatusDefinition> = {
  sev1: { label: 'SEV 1', tone: 'destructive' },
  sev2: { label: 'SEV 2', tone: 'warning' },
  sev3: { label: 'SEV 3', tone: 'info' },
};

const COLUMNS: Array<{ id: Incident['status']; label: string }> = [
  { id: 'open', label: 'Open' },
  { id: 'investigating', label: 'Investigating' },
  { id: 'resolved', label: 'Resolved' },
];

const INCIDENTS: Incident[] = [
  { id: 'INC-101', title: 'Elevated error rate on the API gateway', severity: 'sev1', status: 'open' },
  { id: 'INC-102', title: 'Slow dashboard queries', severity: 'sev3', status: 'investigating' },
  { id: 'INC-103', title: 'Webhook deliveries delayed', severity: 'sev2', status: 'resolved' },
];

export default function IncidentBoard() {
  return (
    <ConsoleShell currentHref="/incidents">
      <Page width="wide" header={<PageHeader title="Incidents" description="Every open incident, by status." />}>
        <Grid cols={{ base: 1, md: 3 }} gap={4}>
          {COLUMNS.map((column) => (
            <Stack key={column.id} gap={3}>
              <h2 className="text-sm font-semibold text-foreground">{column.label}</h2>
              {INCIDENTS.filter((i) => i.status === column.id).map((incident) => (
                <Card key={incident.id}>
                  <CardHeader>
                    <CardTitle>{incident.title}</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <StatusTag status={incident.severity} statuses={SEVERITIES} size="sm" />
                  </CardBody>
                </Card>
              ))}
            </Stack>
          ))}
        </Grid>
      </Page>
    </ConsoleShell>
  );
}
