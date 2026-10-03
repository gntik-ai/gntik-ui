import type { PricingTier } from '@gntik-ai/blocks';
import { Check, Minus } from '@gntik-ai/icons';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@gntik-ai/ui';
import { Fragment } from 'react';
import type { ComparisonSection, ComparisonValue } from './data';

function Value({ value }: { value: ComparisonValue | undefined }) {
  if (value === true)
    return (
      <>
        <Check size={16} aria-hidden className="inline text-primary-text" />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === false || value === undefined)
    return (
      <>
        <Minus size={16} aria-hidden className="inline text-muted-foreground" />
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className="text-foreground">{value}</span>;
}

/** Plan comparison: one column per tier, rows grouped by section (column-group headers). */
export function ComparisonTable({ tiers, sections, caption }: { tiers: readonly PricingTier[]; sections: readonly ComparisonSection[]; caption: string }) {
  return (
    <Table containerLabel={caption}>
      <TableCaption srOnly>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="w-[34%]">
            Feature
          </TableHead>
          {tiers.map((t) => (
            <TableHead key={t.id} scope="col" align="center">
              {t.name}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sections.map((s) => (
          <Fragment key={s.title}>
            <TableRow>
              <TableHead scope="colgroup" colSpan={tiers.length + 1} className="bg-secondary/40 text-foreground">
                {s.title}
              </TableHead>
            </TableRow>
            {s.rows.map((r) => (
              <TableRow key={r.feature}>
                <TableHead scope="row" className="font-normal text-foreground">
                  {r.feature}
                </TableHead>
                {tiers.map((t) => (
                  <TableCell key={t.id} align="center">
                    <Value value={r.values[t.id]} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
