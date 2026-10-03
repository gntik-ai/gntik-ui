import { ListInput } from '../ListInput';

export default function ListInputHeaders() {
  return (
    <div className="flex max-w-xl flex-col gap-2">
      <h3 className="text-[13px] font-semibold text-foreground">Webhook headers</h3>
      <ListInput
        label="Webhook headers"
        separator=":"
        reorderable={false}
        maxRows={5}
        keyPlaceholder="Header"
        valuePlaceholder="Value"
        labels={{ key: 'Header', add: 'Add header', pasteHint: 'Paste "Name: value" lines to add several headers.' }}
        defaultValue={[{ key: 'X-Request-Source', value: 'billing' }]}
      />
    </div>
  );
}
