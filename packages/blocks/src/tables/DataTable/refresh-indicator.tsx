import { Progress } from '@gntik-ai/ui';

/**
 * Indeterminate bar on the top edge of the body. The row has no height and the bar is positioned
 * absolutely, so the table keeps its size; rows underneath keep full opacity.
 */
export function RefreshIndicator({ label, span }: { label: string; span: number }) {
  return (
    <tbody data-refresh-indicator="">
      <tr role="presentation" className="h-0">
        <td role="presentation" colSpan={span} className="relative h-0 border-0 p-0">
          <Progress aria-label={label} size="sm" value={null} className="absolute inset-x-0 top-0 z-raised" />
        </td>
      </tr>
    </tbody>
  );
}
