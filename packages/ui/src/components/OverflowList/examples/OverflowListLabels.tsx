import { Badge } from '../../Badge';
import { OverflowList } from '../OverflowList';

const LABELS = ['backend', 'billing', 'eu-west-1', 'production', 'pci', 'on-call', 'v2-migration'];

export default function OverflowListLabels() {
  return (
    <div className="grid w-full max-w-md gap-6">
      <OverflowList label="Project labels" items={LABELS} max={3} renderItem={(l) => <Badge variant="outline">{l}</Badge>} renderOverflowItem={(l) => l} />
      <div className="w-full resize-x overflow-hidden rounded-lg border border-dashed border-border p-3">
        <OverflowList
          label="Responsive labels"
          responsive
          items={LABELS}
          renderItem={(l) => <Badge variant="soft">{l}</Badge>}
          renderOverflowItem={(l) => l}
        />
      </div>
    </div>
  );
}
