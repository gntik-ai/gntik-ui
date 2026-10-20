import { SidebarLayout } from '../../../layouts/SidebarLayout';
import { UserMenu } from '../UserMenu';

export default function UserMenuSidebarFooter() {
  return (
    <div className="h-64 min-w-0 overflow-hidden rounded-lg border border-border">
      <SidebarLayout
        mainId="user-menu-sidebar-main"
        sidebar={null}
        sidebarFooter={({ collapsed }) => (
          <UserMenu
            showEmail={!collapsed}
            user={{
              name: 'Ana López',
              email: 'ana.lopez.with.a.very.long.account.address.for.sidebar.truncation@example.test',
            }}
          />
        )}
      />
    </div>
  );
}
