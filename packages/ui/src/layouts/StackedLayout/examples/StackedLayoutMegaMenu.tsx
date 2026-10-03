import { useState } from 'react';
import { MegaMenu, megaMenuNavItems, type MegaMenuItem } from '../../../components/MegaMenu';
import { Logo } from '../../../theme/Logo';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { ThemeCycleButton } from '../../../components/ThemeSwitcher';
import { StackedLayout } from '../StackedLayout';

const items: MegaMenuItem[] = [
  { label: 'Overview', href: '#overview' },
  {
    label: 'Workspace',
    sections: [
      {
        title: 'Build',
        links: [
          { label: 'Projects', href: '#projects', description: 'Every project, its environments and owners.' },
          { label: 'Deployments', href: '#deployments', description: 'Releases, rollbacks and deploy gates.' },
        ],
      },
    ],
  },
  { label: 'Docs', href: '#docs' },
];

export default function StackedLayoutMegaMenu() {
  const [href, setHref] = useState('#projects');
  return (
    <ThemeProvider storageKey={null}>
      <div className="h-[420px] overflow-hidden rounded-lg border border-border">
        <StackedLayout
          mainId="stacked-mega-main"
          brand={<Logo size={24} wordmark />}
          nav={<MegaMenu items={items} currentHref={href} onNavigate={(link) => link.href && setHref(link.href)} />}
          links={megaMenuNavItems(items)}
          currentHref={href}
          onNavigate={(item) => item.href && setHref(item.href)}
          actions={<ThemeCycleButton />}
        >
          <h1 className="text-xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            The `nav` slot puts a MegaMenu in the top bar on large screens; the same items feed the drawer on small ones.
          </p>
        </StackedLayout>
      </div>
    </ThemeProvider>
  );
}
