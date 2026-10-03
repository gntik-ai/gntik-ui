import { Settings, User } from 'lucide-react';
import { UserMenu } from '../UserMenu';

export default function UserMenuWithName() {
  return (
    <UserMenu
      showName
      showTheme={false}
      user={{ name: 'Sam Patel', email: 'sam@example.com' }}
      items={[
        { label: 'Profile', icon: User },
        { label: 'Settings', icon: Settings },
      ]}
      onSignOut={() => {}}
    />
  );
}
