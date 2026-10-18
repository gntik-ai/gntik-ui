import { formatMonth } from './calendar-utils';
import { MonthGrid, type PeriodGridProps } from './period-grids';

export function CalendarMonthView(props: PeriodGridProps) {
  return <MonthGrid {...props} accessibleLabel={(date) => formatMonth(date, props.locale)} />;
}
