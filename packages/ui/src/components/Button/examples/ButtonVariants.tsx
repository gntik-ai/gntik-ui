import { Plus, RefreshCw, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Button } from '../Button';

export default function ButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button icon={Plus}>Create</Button>
      <Button variant="secondary" icon={SlidersHorizontal}>Filters</Button>
      <Button variant="soft" icon={RefreshCw}>Retry</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive" icon={Trash2}>Delete</Button>
    </div>
  );
}
