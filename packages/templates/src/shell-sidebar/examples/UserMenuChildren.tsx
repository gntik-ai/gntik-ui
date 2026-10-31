import { MenuGroupLabel, MenuRadioGroup, MenuRadioItem } from '@gntik-ai/ui';
import { useState } from 'react';
import ShellSidebarPage from '../Page';

export default function UserMenuChildren() {
  const [language, setLanguage] = useState('en');
  return (
    <ShellSidebarPage
      shell={{
        usage: null,
        helpHref: '',
        userMenuItems: [{ label: 'Account settings', href: '#account' }],
        userMenuChildren: (
          <MenuRadioGroup value={language} onValueChange={setLanguage}>
            <MenuGroupLabel>Language</MenuGroupLabel>
            <MenuRadioItem value="en">English</MenuRadioItem>
            <MenuRadioItem value="fr">French</MenuRadioItem>
          </MenuRadioGroup>
        ),
      }}
    />
  );
}
