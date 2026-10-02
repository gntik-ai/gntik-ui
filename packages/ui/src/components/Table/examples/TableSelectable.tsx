import { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { DEPLOYMENTS, count } from './data';

const checkboxClass =
  'size-4 cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

export default function TableSelectable() {
  const [selected, setSelected] = useState<Set<number>>(new Set([2]));
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table density="compact" stickyHeader containerClassName="max-h-64" containerLabel="Deployments">
        <TableCaption srOnly>Deployments, compact view with selection</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"><span className="sr-only">Select</span></TableHead>
            <TableHead>Deployment</TableHead>
            <TableHead>Region</TableHead>
            <TableHead align="right">Requests</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEPLOYMENTS.map((d) => (
            <TableRow key={d.id} selected={selected.has(d.id)}>
              <TableCell>
                <input
                  type="checkbox"
                  aria-label={`Select ${d.name}`}
                  checked={selected.has(d.id)}
                  onChange={() => toggle(d.id)}
                  className={checkboxClass}
                />
              </TableCell>
              <TableCell className="font-semibold">{d.name}</TableCell>
              <TableCell className="font-mono text-[12px] text-muted-foreground">{d.region}</TableCell>
              <TableCell align="right" className="font-mono text-[12.5px]">{count(d.requests)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
