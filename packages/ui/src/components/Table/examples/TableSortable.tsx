import { useState } from 'react';
import { StatusTag } from '../../StatusTag';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../Table';
import type { SortDirection } from '../table.variants';
import { DEPLOYMENTS, count, money, type Deployment } from './data';

type Key = 'name' | 'region' | 'requests' | 'cost';

export default function TableSortable() {
  const [sort, setSort] = useState<{ key: Key; dir: Exclude<SortDirection, 'none'> }>({ key: 'cost', dir: 'descending' });
  const rows = [...DEPLOYMENTS].sort((a: Deployment, b: Deployment) => {
    const va = a[sort.key];
    const vb = b[sort.key];
    const diff = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
    return sort.dir === 'ascending' ? diff : -diff;
  });
  const head = (key: Key, label: string, align: 'left' | 'right' = 'left') => (
    <TableHead
      align={align}
      sortable
      sortDirection={sort.key === key ? sort.dir : 'none'}
      onSortChange={(dir) => setSort({ key, dir: sort.key === key ? dir : 'ascending' })}
    >
      {label}
    </TableHead>
  );
  const total = DEPLOYMENTS.reduce((sum, d) => sum + d.cost, 0);
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableCaption>Deployments in this project, last 30 days.</TableCaption>
        <TableHeader>
          <TableRow>
            {head('name', 'Deployment')}
            {head('region', 'Region')}
            <TableHead>Status</TableHead>
            {head('requests', 'Requests', 'right')}
            {head('cost', 'Cost', 'right')}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="font-semibold">{d.name}</TableCell>
              <TableCell className="font-mono text-[12px] text-muted-foreground">{d.region}</TableCell>
              <TableCell><StatusTag status={d.status} /></TableCell>
              <TableCell align="right" className="font-mono text-[12.5px]">{count(d.requests)}</TableCell>
              <TableCell align="right" className="font-mono text-[12.5px]">{money(d.cost)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell align="right" className="font-mono text-[12.5px]">{money(total)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
