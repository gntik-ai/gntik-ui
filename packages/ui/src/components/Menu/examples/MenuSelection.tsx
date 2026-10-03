import { ChevronDown, Columns3, Globe } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../Button';
import { Menu, MenuCheckboxItem, MenuContent, MenuGroup, MenuGroupLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '../Menu';

const REGIONS = ['eu-west-1', 'us-east-1', 'ap-south-1', 'eu-central-1'];
const COLUMNS = ['Status', 'Deployments', 'Cost', 'Uptime', 'Last run'];

export default function MenuSelection() {
  const [region, setRegion] = useState('eu-west-1');
  const [visible, setVisible] = useState<Record<string, boolean>>({ Status: true, Deployments: true, Cost: true, Uptime: false, 'Last run': true });
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Menu>
        <MenuTrigger render={<Button variant="secondary" icon={Globe} trailingIcon={ChevronDown} />}>
          <span className="font-mono text-[12.5px]">{region}</span>
        </MenuTrigger>
        <MenuContent className="min-w-[200px]">
          <MenuRadioGroup value={region} onValueChange={(v: string) => setRegion(v)}>
            <MenuGroupLabel>Region</MenuGroupLabel>
            {REGIONS.map((r) => (
              <MenuRadioItem key={r} value={r} className="font-mono text-[12.5px]">
                {r}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger render={<Button variant="secondary" icon={Columns3} trailingIcon={ChevronDown} />}>Columns</MenuTrigger>
        <MenuContent className="min-w-[210px]">
          <MenuGroup>
            <MenuGroupLabel>Visible columns</MenuGroupLabel>
            {COLUMNS.map((c) => (
              <MenuCheckboxItem key={c} checked={visible[c] ?? false} onCheckedChange={(on) => setVisible((prev) => ({ ...prev, [c]: on }))}>
                {c}
              </MenuCheckboxItem>
            ))}
          </MenuGroup>
        </MenuContent>
      </Menu>
    </div>
  );
}
