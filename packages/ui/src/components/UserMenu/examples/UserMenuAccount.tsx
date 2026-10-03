import { CreditCard, Settings, User } from 'lucide-react';
import { useState } from 'react';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { UserMenu } from '../UserMenu';

export default function UserMenuAccount() {
  const [last, setLast] = useState('');
  return (
    // Apps mount ThemeProvider once at the root; it is local here so the example stands alone.
    <ThemeProvider storageKey={null}>
      <div className="flex flex-col items-center gap-3">
        <UserMenu
          user={{ name: 'Dana Whitfield', email: 'dana@example.com' }}
          items={[
            { label: 'Profile', icon: User, onSelect: () => setLast('Profile') },
            { label: 'Settings', icon: Settings, shortcut: '⌘,', onSelect: () => setLast('Settings') },
            { label: 'Billing', icon: CreditCard, href: '#billing' },
          ]}
          onSignOut={() => setLast('Signed out')}
        />
        <p aria-live="polite" className="h-4 font-mono text-[11px] text-muted-foreground">
          {last}
        </p>
      </div>
    </ThemeProvider>
  );
}
