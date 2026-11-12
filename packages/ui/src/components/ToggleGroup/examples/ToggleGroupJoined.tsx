import { LayoutGrid, List, SquareKanban } from 'lucide-react';
import { useState } from 'react';
import { Toggle, ToggleGroup } from '../ToggleGroup';

export default function ToggleGroupJoined() {
  const [view, setView] = useState(['week']);
  return (
    <div className="flex flex-col items-start gap-5">
      <ToggleGroup
        aria-label="Calendar view"
        variant="joined"
        disallowEmptySelection
        value={view}
        onValueChange={setView}
      >
        <Toggle value="day">Day</Toggle>
        <Toggle value="week">Week</Toggle>
        <Toggle value="month">Month</Toggle>
      </ToggleGroup>
      <ToggleGroup aria-label="Project layout" variant="joined" disallowEmptySelection defaultValue={['list']}>
        <Toggle value="list" iconOnly aria-label="List">
          <List size={16} aria-hidden />
        </Toggle>
        <Toggle value="grid" iconOnly aria-label="Grid">
          <LayoutGrid size={16} aria-hidden />
        </Toggle>
        <Toggle value="board" iconOnly aria-label="Board">
          <SquareKanban size={16} aria-hidden />
        </Toggle>
      </ToggleGroup>
    </div>
  );
}
