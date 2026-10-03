import { Logo } from '../../../theme/Logo';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { ThemeCycleButton } from '../../../components/ThemeSwitcher';
import { StackedLayout } from '../StackedLayout';

export default function StackedLayoutNarrow() {
  return (
    <ThemeProvider storageKey={null}>
      <div className="h-[420px] overflow-hidden rounded-lg border border-border">
        <StackedLayout
          mainId="stacked-narrow-main"
          width="narrow"
          brand={<Logo size={24} wordmark />}
          actions={<ThemeCycleButton />}
          pageHeader={
            <>
              <h1 className="text-xl font-bold tracking-tight">Edit project</h1>
              <p className="mt-1 text-[13px] text-muted-foreground">A narrow, centered column for forms and reading.</p>
            </>
          }
        >
          <div className="space-y-3">
            {['Name', 'Region', 'Default branch'].map((label) => (
              <div key={label} className="rounded-[10px] border border-border bg-card px-4 py-3 text-[13px]">
                {label}
              </div>
            ))}
          </div>
        </StackedLayout>
      </div>
    </ThemeProvider>
  );
}
