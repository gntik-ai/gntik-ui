import { Bold, Code, Italic, Pin } from 'lucide-react';
import { Toggle, ToggleGroup } from '../ToggleGroup';

export default function ToggleMultiple() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <ToggleGroup aria-label="Text formatting" variant="joined" multiple defaultValue={['bold']}>
        <Toggle value="bold" iconOnly aria-label="Bold">
          <Bold size={16} aria-hidden />
        </Toggle>
        <Toggle value="italic" iconOnly aria-label="Italic">
          <Italic size={16} aria-hidden />
        </Toggle>
        <Toggle value="code" iconOnly aria-label="Inline code">
          <Code size={16} aria-hidden />
        </Toggle>
      </ToggleGroup>
      <Toggle defaultPressed>
        <Pin size={15} aria-hidden />
        Pin project
      </Toggle>
    </div>
  );
}
