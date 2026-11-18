import { useState } from 'react';
import { Text } from '@gntik-ai/ui';
import ShellSidebarPage from '../Page';
import { shellSidebarCopy } from '../data';

export default function Navigation() {
  const [currentHref, setCurrentHref] = useState(shellSidebarCopy.currentHref);
  const [message, setMessage] = useState('');
  return (
    <ShellSidebarPage
      currentHref={currentHref}
      shell={{
        // On small screens the drawer closes first, then the consumer hears about the click.
        onNavigate: (item) => {
          setCurrentHref(item.href ?? currentHref);
          setMessage(`Opened ${item.label}`);
        },
      }}
    >
      <Text role="status">{message}</Text>
    </ShellSidebarPage>
  );
}
