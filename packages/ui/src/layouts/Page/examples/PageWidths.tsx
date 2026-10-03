import { useState } from 'react';
import { Toggle, ToggleGroup } from '../../../components/ToggleGroup';
import { Page, type PageProps } from '../Page';

type Width = NonNullable<PageProps['width']>;
const WIDTHS: Width[] = ['narrow', 'default', 'wide', 'full'];

export default function PageWidths() {
  const [width, setWidth] = useState<Width>('default');
  return (
    <div className="grid gap-3">
      <ToggleGroup aria-label="Page width" value={[width]} onValueChange={(v) => {
          const next = WIDTHS.find((w) => w === v[0]);
          if (next) setWidth(next);
        }}>
        {WIDTHS.map((w) => (
          <Toggle key={w} value={w}>
            {w}
          </Toggle>
        ))}
      </ToggleGroup>
      <div className="h-[260px] overflow-auto rounded-lg border border-border bg-background">
        <div className="w-[1500px]">
          <Page width={width} title="Deployments" description={`width="${width}"`}>
            <div className="h-24 rounded-[10px] border border-dashed border-border bg-card" />
          </Page>
        </div>
      </div>
    </div>
  );
}
