import { Text } from '@gntik-ai/ui';
import ShellSidebarPage from '../Page';

export default function PlatformWide() {
  return (
    <ShellSidebarPage
      title="Platform overview"
      shell={{ hideWorkspaceContext: true, brand: <Text variant="label">Platform console</Text> }}
    />
  );
}
