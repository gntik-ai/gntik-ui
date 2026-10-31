import { Text } from '@gntik-ai/ui';
import ShellSidebarPage from '../Page';

export default function Brand() {
  return (
    <ShellSidebarPage
      shell={{
        brand: (
          <Text variant="label" className="truncate">
            Console identity
          </Text>
        ),
      }}
    />
  );
}
