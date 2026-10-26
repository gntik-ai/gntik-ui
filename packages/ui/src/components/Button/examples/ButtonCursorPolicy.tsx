import type { CSSProperties } from 'react';
import { Button } from '../Button';
import { Checkbox } from '../../Checkbox/Checkbox';

/** Use the arrow for enabled controls; disabled and loading controls retain their cursor. */
export default function ButtonCursorPolicy() {
  return (
    <div
      data-cursor-policy="arrow"
      style={{ '--cursor-interactive': 'default' } as CSSProperties}
      className="flex flex-wrap items-center gap-3"
    >
      <Button>Small</Button>
      <Button disabled>Disabled</Button>
      <Button loading>Saving</Button>
      <Checkbox label="Archived projects (locked)" disabled />
    </div>
  );
}
