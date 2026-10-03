import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, renderHook, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Badge } from '../components/Badge/Badge';
import { badgeVariants } from '../components/Badge/badge.variants';
import { Button, IconButton } from '../components/Button/Button';
import { buttonVariants } from '../components/Button/button.variants';
import { datePickerVariants } from '../components/DatePicker/date-picker.variants';
import { Input } from '../components/Input/Input';
import { inputVariants } from '../components/Input/input.variants';
import { numberInputVariants } from '../components/NumberInput/number-input.variants';
import { paginationVariants } from '../components/Pagination/pagination.variants';
import { selectVariants } from '../components/Select/select.variants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table/Table';
import { toggleVariants } from '../components/ToggleGroup/toggle-group.variants';
import { tokenVariants } from '../components/Token/token.variants';
import { cn } from '../utils/cn';
import { DensityProvider, useDensity } from './index';

/** Density utility → [its variable, the original class it replaces in comfortable]. */
const EQUIVALENT: Record<string, [string, string]> = {
  'h-control-sm': ['--control-h-sm', 'h-8'],
  'h-control': ['--control-h-md', 'h-9'],
  'w-control': ['--control-h-md', 'w-9'],
  'size-control-sm': ['--control-h-sm', 'size-8'],
  'size-control': ['--control-h-md', 'size-9'],
  'px-control-sm': ['--control-px-sm', 'px-3'],
  'px-control': ['--control-px-md', 'px-3.5'],
  'px-field': ['--field-px', 'px-3'],
  'ps-field': ['--field-px', 'ps-3'],
  'gap-tight': ['--gap-tight', 'gap-2.5'],
  'h-item': ['--item-h', 'h-[34px]'],
  'h-tab': ['--tab-h', 'h-10'],
  'h-chip': ['--chip-h', 'h-[22px]'],
  'h-token': ['--token-h', 'h-7'],
  'py-bar': ['--bar-py', 'py-2.5'],
};

const densityCss = readFileSync(resolve(import.meta.dirname, '../../../tokens/src/density.css'), 'utf8');
const comfortableBlock = /:root,\s*\[data-density="comfortable"\]\s*\{([^}]*)\}/.exec(densityCss)?.[1] ?? '';
const comfortable = Object.fromEntries([...comfortableBlock.matchAll(/(--[\w-]+)\s*:\s*([\d.]+)rem/g)].map(([, k, v]) => [k, Number(v)]));

/** rem value of a Tailwind sizing class: `h-9` → 2.25 (0.25rem steps), `h-[34px]` → 2.125. */
function remOf(cls: string): number {
  const px = /\[(\d+)px\]$/.exec(cls);
  if (px) return Number(px[1]) / 16;
  return Number(cls.slice(cls.lastIndexOf('-') + 1)) * 0.25;
}

/** A default (density-driven) class string as it reads in comfortable: each utility swapped for its original. */
const asComfortable = (classes: string | undefined) => (classes ?? '').split(' ').map((c) => EQUIVALENT[c]?.[1] ?? c).join(' ');

describe('density tokens ↔ classes', () => {
  it('each density utility equals its original class in comfortable', () => {
    for (const [cls, [variable, original]] of Object.entries(EQUIVALENT)) {
      expect(comfortable[variable], cls).toBe(remOf(original));
    }
  });

  it('default (auto) sizes read exactly as md in comfortable', () => {
    expect(asComfortable(buttonVariants())).toBe(buttonVariants({ size: 'md' }));
    expect(asComfortable(buttonVariants({ iconOnly: true, variant: 'ghost' }))).toBe(buttonVariants({ size: 'md', iconOnly: true, variant: 'ghost' }));
    for (const fn of [inputVariants, selectVariants, numberInputVariants, datePickerVariants, paginationVariants, badgeVariants, tokenVariants] as const) {
      const auto = fn() as unknown as Record<string, () => string>;
      const md = fn({ size: 'md' }) as unknown as Record<string, () => string>;
      for (const slot of Object.keys(auto)) expect(asComfortable(auto[slot]!()), slot).toBe(md[slot]!() ?? '');
    }
    for (const variant of ['standalone', 'segmented', 'joined'] as const) {
      for (const iconOnly of [false, true]) {
        expect(asComfortable(toggleVariants({ variant, iconOnly }))).toBe(toggleVariants({ variant, iconOnly, size: 'md' }));
      }
    }
  });
});

describe('comfortable class output is unchanged', () => {
  it('Button with an explicit size keeps its exact classes', () => {
    render(<Button size="md">Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' }).className).toBe(
      'inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring data-[disabled]:pointer-events-none data-[disabled]:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 gap-1.5 px-3.5 text-[13px] rounded-lg',
    );
  });

  it('Input with an explicit size keeps its exact classes', () => {
    render(<Input size="md" aria-label="Name" />);
    const root = screen.getByRole('textbox', { name: 'Name' }).parentElement!;
    expect(root.className).toBe(
      'flex w-full min-w-0 items-center rounded-md border border-border bg-background text-foreground shadow-sm transition-colors motion-reduce:transition-none has-[input:focus-visible]:border-primary/60 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus-ring data-invalid:border-destructive/70 has-[input[data-invalid]]:border-destructive/70 has-[input[aria-invalid=true]]:border-destructive/70 has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-secondary/50 has-[input:disabled]:text-muted-foreground has-[input:read-only]:bg-secondary/40 h-9 gap-2.5 px-3 text-[13px]',
    );
  });
});

describe('DensityProvider', () => {
  it('sets data-density on its wrapper (display: contents)', () => {
    render(
      <DensityProvider density="compact">
        <Button>Run</Button>
      </DensityProvider>,
    );
    const wrapper = screen.getByRole('button', { name: 'Run' }).parentElement!;
    expect(wrapper).toHaveAttribute('data-density', 'compact');
    expect(wrapper).toHaveClass('contents');
  });

  it('sets data-density on <html> with applyTo="document" and restores it on unmount', () => {
    document.documentElement.setAttribute('data-density', 'comfortable');
    const { unmount, rerender } = render(<DensityProvider density="compact" applyTo="document">x</DensityProvider>);
    expect(document.documentElement).toHaveAttribute('data-density', 'compact');
    rerender(<DensityProvider density="comfortable" applyTo="document">x</DensityProvider>);
    expect(document.documentElement).toHaveAttribute('data-density', 'comfortable');
    unmount();
    expect(document.documentElement).toHaveAttribute('data-density', 'comfortable');
    document.documentElement.removeAttribute('data-density');
    render(<DensityProvider density="compact" applyTo="document">y</DensityProvider>).unmount();
    expect(document.documentElement).not.toHaveAttribute('data-density');
  });

  it('useDensity reads the nearest provider, comfortable outside one', () => {
    expect(renderHook(() => useDensity()).result.current).toBe('comfortable');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DensityProvider density="comfortable">
        <DensityProvider density="compact">{children}</DensityProvider>
      </DensityProvider>
    );
    expect(renderHook(() => useDensity(), { wrapper }).result.current).toBe('compact');
  });
});

describe('components follow the density', () => {
  it('controls without a size use the density utilities; explicit sizes stay fixed', () => {
    render(
      <DensityProvider density="compact">
        <Button>Auto</Button>
        <Button size="lg">Large</Button>
        <IconButton icon={() => null} label="More" />
        <Input aria-label="Search" />
        <Badge>Beta</Badge>
      </DensityProvider>,
    );
    expect(screen.getByRole('button', { name: 'Auto' })).toHaveClass('h-control', 'px-control');
    expect(screen.getByRole('button', { name: 'Large' })).toHaveClass('h-11', 'px-5');
    expect(screen.getByRole('button', { name: 'Large' })).not.toHaveClass('h-control');
    expect(screen.getByRole('button', { name: 'More' })).toHaveClass('size-control', 'px-0');
    expect(screen.getByRole('textbox', { name: 'Search' }).parentElement).toHaveClass('h-control', 'px-field', 'gap-tight');
    expect(screen.getByText('Beta').closest('span')?.className).toMatch(/\bh-chip\b/);
  });

  it('className overrides merge with density utilities', () => {
    expect(cn(buttonVariants(), 'h-10 px-6').split(' ')).not.toContain('h-control');
    expect(cn(buttonVariants(), 'h-10 px-6').split(' ')).not.toContain('px-control');
    expect(buttonVariants({ iconOnly: true }).split(' ')).not.toContain('px-control');
  });

  function DataTable({ density }: { density?: 'compact' | 'comfortable' }) {
    return (
      <Table density={density}>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>api-gateway</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  it('Table defaults to the context density and an explicit prop wins', () => {
    const { unmount } = render(<DataTable />);
    expect(screen.getByRole('table')).toHaveAttribute('data-density', 'comfortable');
    expect(screen.getByRole('cell')).toHaveClass('py-3');
    unmount();
    const { unmount: unmount2 } = render(
      <DensityProvider density="compact">
        <DataTable />
      </DensityProvider>,
    );
    expect(screen.getByRole('table')).toHaveAttribute('data-density', 'compact');
    expect(screen.getByRole('columnheader')).toHaveClass('h-9');
    expect(screen.getByRole('cell')).toHaveClass('py-2');
    unmount2();
    render(
      <DensityProvider density="compact">
        <DataTable density="comfortable" />
      </DensityProvider>,
    );
    expect(screen.getByRole('cell')).toHaveClass('py-3');
  });
});
