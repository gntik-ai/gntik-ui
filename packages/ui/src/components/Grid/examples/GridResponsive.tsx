import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '../../Card';
import { Grid, GridItem } from '../Grid';

const STATS = [
  ['Active projects', '24'],
  ['Members', '138'],
  ['Deployments today', '57'],
  ['Open invoices', '3'],
] as const;

export default function GridResponsive() {
  return (
    <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={4}>
      {STATS.map(([label, value]) => (
        <Card key={label}>
          <CardBody>
            <p className="text-[13px] text-muted-foreground">{label}</p>
            <p className="mt-1 text-[1.5rem] font-bold tracking-tight text-foreground">{value}</p>
          </CardBody>
        </Card>
      ))}
      <GridItem span={{ base: 1, sm: 2, lg: 3 }}>
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>Spans three of four columns on wide screens.</CardDescription>
          </CardHeader>
        </Card>
      </GridItem>
      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>Team · 12 of 20 seats</CardDescription>
        </CardHeader>
      </Card>
    </Grid>
  );
}
