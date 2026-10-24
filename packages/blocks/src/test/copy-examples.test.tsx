import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DescriptionListSpanish from '../data-display/DescriptionListCard/examples/Spanish';
import LogViewerSpanish from '../builders/LogViewer/examples/Spanish';
import { expectNoAxeViolations } from './a11y';

afterEach(() => vi.restoreAllMocks());

describe.each(['dark', 'light', 'high_contrast'])('%s copy examples', (theme) => {
  it.each([
    ['DescriptionListCard', DescriptionListSpanish, 'Copiar Deployment ID', 'Copy field Deployment ID'],
    ['LogViewer', LogViewerSpanish, 'Copiar línea 12:00:00.000', 'Copy 12:00:00.000'],
  ] as const)(
    '%s shows catalog and overridden failure names without axe violations',
    async (_name, Example, copyName, overrideName) => {
      document.documentElement.className = theme;
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
      const { container } = render(<Example />);
      await user.click(screen.getAllByRole('button', { name: copyName })[0]!);
      await user.click(screen.getByRole('button', { name: overrideName }));
      expect(screen.getByRole('button', { name: 'No se pudo copiar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Copy failed' })).toBeInTheDocument();
      expect(container.querySelector('.lucide-check')).toBeNull();
      await expectNoAxeViolations(container);
    },
  );
});
