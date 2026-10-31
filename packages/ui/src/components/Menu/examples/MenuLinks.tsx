import { Eye, FileText } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';
import { Button } from '../../Button';
import { LinkProvider } from '../../Link';
import { Menu, MenuContent, MenuItem, MenuLinkItem, MenuTrigger } from '../Menu';

// Adapt a router's Link here. Forward ref, role and every event handler to its anchor.
function RouterLink(props: ComponentPropsWithRef<'a'>) {
  return <a data-router-link="" {...props} />;
}

export default function MenuLinks() {
  return (
    <LinkProvider component={RouterLink}>
      <Menu>
        <MenuTrigger render={<Button variant="secondary" />}>Run navigation</MenuTrigger>
        <MenuContent>
          <MenuLinkItem href="/runs/42" icon={Eye} shortcut="⌘O">
            Open run
          </MenuLinkItem>
          <MenuLinkItem href="/runs/42#details" closeOnClick={false}>
            Run details (keep menu open)
          </MenuLinkItem>
          <MenuLinkItem href="https://docs.example.test" icon={FileText} external>
            Documentation
          </MenuLinkItem>
          <MenuItem>Restart</MenuItem>
        </MenuContent>
      </Menu>
    </LinkProvider>
  );
}
