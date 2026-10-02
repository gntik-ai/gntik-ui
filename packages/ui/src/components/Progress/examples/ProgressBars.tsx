import { useState } from 'react';
import { Button } from '../../Button';
import { Progress } from '../Progress';

export default function ProgressBars() {
  const [value, setValue] = useState(34);
  return (
    <div className="grid max-w-md gap-5">
      <Progress label="Indexing documents" value={72} showValue />
      <Progress label="Database migration" value={100} showValue tone="success" />
      <Progress label="Rebuilding cache" value={value} showValue size="lg" />
      <Progress label="Waiting for a runner" value={null} size="sm" />
      <Progress aria-label="Upload" value={58} tone="warning" />
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setValue((v) => Math.max(0, v - 10))}>Back</Button>
        <Button size="sm" onClick={() => setValue((v) => Math.min(100, v + 10))}>Advance</Button>
      </div>
    </div>
  );
}
