import { ThemeProvider } from '../../../theme/ThemeProvider';
import { ThemeSwitcher } from '../ThemeSwitcher';

export default function ThemeSwitcherSegmented() {
  return (
    // Apps mount ThemeProvider once at the root; it is local here so the example stands alone.
    <ThemeProvider storageKey={null}>
      <div className="flex flex-col items-start gap-4">
        <ThemeSwitcher />
        <ThemeSwitcher showLabels={false} label="Theme (compact)" />
      </div>
    </ThemeProvider>
  );
}
