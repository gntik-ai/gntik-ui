import { ThemeProvider, useTheme } from '../../../theme/ThemeProvider';
import { ThemeCycleButton } from '../ThemeSwitcher';

function CurrentMode() {
  const { mode, resolved } = useTheme();
  return (
    <span className="font-mono text-[11px] text-muted-foreground">
      mode: {mode} · resolved: {resolved}
    </span>
  );
}

export default function ThemeSwitcherCycle() {
  return (
    <ThemeProvider storageKey={null}>
      <div className="flex items-center gap-3">
        <ThemeCycleButton />
        <CurrentMode />
      </div>
    </ThemeProvider>
  );
}
