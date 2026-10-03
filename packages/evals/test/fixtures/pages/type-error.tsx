import { NotARealExport } from '@gntik-ai/ui';
import { SettingsMembersPage } from '@gntik-ai/templates';

export default function Members() {
  const count: number = 'three';
  return (
    <>
      <NotARealExport />
      <SettingsMembersPage notAProp={count} />
    </>
  );
}
