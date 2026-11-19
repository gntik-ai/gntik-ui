import { useI18n } from '../../../i18n/I18nProvider';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { DEPLOYMENTS, count } from './data';

/** `TableCell rowHeader` renders `th scope="row"` with the cell styling, so each value is announced with its row. */
export default function TableRowHeader() {
  const { t } = useI18n();
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableCaption srOnly>{t('table.example.quickFilter.caption')}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.example.quickFilter.name')}</TableHead>
            <TableHead>{t('table.example.quickFilter.region')}</TableHead>
            <TableHead align="right">{t('table.example.quickFilter.requests')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEPLOYMENTS.map((d) => (
            <TableRow key={d.id}>
              <TableCell rowHeader className="font-semibold">
                {d.name}
              </TableCell>
              <TableCell className="font-mono text-[12px] text-muted-foreground">{d.region}</TableCell>
              <TableCell align="right" className="font-mono text-[12.5px]">
                {count(d.requests)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
