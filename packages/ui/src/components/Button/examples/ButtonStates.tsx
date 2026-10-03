import { MoreHorizontal } from 'lucide-react';
import { Button, IconButton } from '../Button';

export default function ButtonStates() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button loading>Saving</Button>
      <Button disabled>Disabled</Button>
      <IconButton icon={MoreHorizontal} label="More actions" />
    </div>
  );
}
