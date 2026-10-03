import { useState } from 'react';
import { Slider } from '../Slider';

export default function SliderSingle() {
  const [replicas, setReplicas] = useState(3);
  return (
    <div className="grid w-full max-w-sm gap-7">
      <Slider
        label="Replicas"
        showValue
        min={1}
        max={10}
        value={replicas}
        onValueChange={(v) => setReplicas(Array.isArray(v) ? (v[0] ?? 1) : v)}
      />
      <Slider label="Traffic to canary" showValue defaultValue={20} step={5} largeStep={25} formatValue={(f) => `${f[0] ?? ''}%`} />
      <Slider aria-label="Log retention (days)" size="sm" defaultValue={30} max={90} />
      <Slider label="Storage limit (locked)" showValue defaultValue={50} disabled />
    </div>
  );
}
