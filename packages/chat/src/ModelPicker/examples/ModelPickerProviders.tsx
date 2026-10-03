import { useState } from 'react';
import { ModelPicker } from '../ModelPicker';
import { DEMO_MODELS } from '../fixtures';

export default function ModelPickerProviders() {
  const [model, setModel] = useState<string | null>('balanced');
  const [compactModel, setCompactModel] = useState<string | null>('swift');
  return (
    <div className="flex flex-col items-start gap-4">
      <ModelPicker models={DEMO_MODELS} value={model} onValueChange={setModel} />
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1.5">
        <span className="ps-1.5 text-[12px] text-muted-foreground">Composer toolbar</span>
        <ModelPicker compact models={DEMO_MODELS} value={compactModel} onValueChange={setCompactModel} />
      </div>
    </div>
  );
}
