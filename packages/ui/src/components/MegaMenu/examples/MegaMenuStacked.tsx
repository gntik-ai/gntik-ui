import { Sparkles } from 'lucide-react';
import { StackedLayout } from '../../../layouts/StackedLayout';
import { Logo } from '../../../theme/Logo';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { MegaMenu, type MegaMenuItem } from '../MegaMenu';
import { megaMenuItems } from './items';

const items: MegaMenuItem[] = megaMenuItems.map((it) =>
  it.label === 'Workspace'
    ? {
        ...it,
        featured: (
          <div className="flex h-full flex-col gap-2 rounded-lg border border-border bg-card p-3.5">
            <Sparkles size={16} aria-hidden className="text-primary-text" />
            <p className="text-[13px] font-semibold text-foreground">Deploy gates</p>
            <p className="text-[12px] leading-5 text-muted-foreground">Block releases automatically while an incident is open.</p>
            <a href="#changelog" className="mt-auto text-[12px] font-medium text-primary-text underline underline-offset-2">
              Read the changelog
            </a>
          </div>
        ),
      }
    : it,
);

export default function MegaMenuStacked() {
  return (
    <ThemeProvider storageKey={null}>
      <div className="h-[420px] overflow-hidden rounded-lg border border-border">
        <StackedLayout mainId="mega-main" brand={<Logo size={24} wordmark />} subnav={<MegaMenu items={items} currentHref="#projects" />}>
          <h1 className="text-xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">Hover or focus a section in the navigation to open its panel.</p>
        </StackedLayout>
      </div>
    </ThemeProvider>
  );
}
