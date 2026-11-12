import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '../../i18n/I18nProvider';
import { QrCode } from './QrCode';
import { qrCodeSvg } from './qr-svg';
import { doc } from './QrCode.doc';
import QrCodeExpired from './examples/QrCodeExpired';
import QrCodeOtpauth from './examples/QrCodeOtpauth';
import QrCodeTooLong from './examples/QrCodeTooLong';
import QrCodePairingLink from './examples/QrCodePairingLink';

const OTPAUTH = 'otpauth://totp/Example:ana@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example';

describe('QrCode', () => {
  describe('image', () => {
    it('renders one svg image named "QR code"', () => {
      const { container } = render(<QrCode value={OTPAUTH} />);
      expect(container.querySelectorAll('svg')).toHaveLength(1);
      expect(screen.getAllByRole('img')).toHaveLength(1);
      expect(screen.getByRole('img', { name: 'QR code' })).toBeInTheDocument();
    });

    it('uses label as the accessible name', () => {
      render(<QrCode value={OTPAUTH} label="Authenticator setup code" />);
      expect(screen.getByRole('img', { name: 'Authenticator setup code' })).toBeInTheDocument();
    });

    it('names the image in Spanish under an es I18nProvider', () => {
      render(
        <I18nProvider locale="es">
          <QrCode value={OTPAUTH} />
        </I18nProvider>,
      );
      expect(screen.getByRole('img', { name: 'Código QR' })).toBeInTheDocument();
    });
  });

  describe('geometry', () => {
    const sideOf = (viewBox: string | null) => Number(viewBox!.split(' ')[2]);

    it('is 160 px with a viewBox of the module count plus an 8-module quiet zone by default', () => {
      render(<QrCode value="HELLO" errorLevel="L" />);
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('width', '160');
      expect(svg).toHaveAttribute('height', '160');
      // HELLO fits version 1 (21 modules).
      expect(svg).toHaveAttribute('viewBox', '0 0 29 29');
      expect(svg).toHaveAttribute('shape-rendering', 'crispEdges');
    });

    it('takes size and margin: 240 px and the module count plus 4', () => {
      render(<QrCode value="HELLO" errorLevel="L" size={240} margin={2} />);
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('width', '240');
      expect(svg).toHaveAttribute('height', '240');
      expect(sideOf(svg.getAttribute('viewBox'))).toBe(25);
    });

    it('grows the code with the error level', () => {
      const side = (errorLevel: 'L' | 'H') => {
        const { unmount } = render(<QrCode value={OTPAUTH} errorLevel={errorLevel} />);
        const result = sideOf(screen.getByRole('img').getAttribute('viewBox'));
        unmount();
        return result;
      };
      expect(side('H')).toBeGreaterThanOrEqual(side('L'));
    });

    it('draws every dark module of a 120-character value at level H as one path', () => {
      const { container } = render(<QrCode value={'x'.repeat(120)} errorLevel="H" />);
      expect(container.querySelectorAll('svg path')).toHaveLength(1);
      expect(container.querySelectorAll('svg rect')).toHaveLength(0);
    });
  });

  describe('loading', () => {
    it('is busy and shows the kit spinner instead of the code', () => {
      const { container } = render(<QrCode value={OTPAUTH} status="loading" />);
      expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('status', { name: 'Generating QR code…' })).toBeInTheDocument();
      expect(container.querySelector('path[d^="M"][d*="h"]')).toBeNull();
    });

    it('is not busy when active', () => {
      const { container } = render(<QrCode value={OTPAUTH} />);
      expect(container.firstElementChild).not.toHaveAttribute('aria-busy');
    });
  });

  describe('expired', () => {
    it('shows the message and removes every module and the image', () => {
      const { container } = render(<QrCode value={OTPAUTH} status="expired" />);
      expect(screen.getByText('QR code expired')).toBeInTheDocument();
      expect(container.querySelector('path')).toBeNull();
      expect(screen.queryByRole('img')).toBeNull();
    });

    it('has no Refresh button without onRefresh', () => {
      render(<QrCode value={OTPAUTH} status="expired" />);
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('calls onRefresh once per click', async () => {
      const onRefresh = vi.fn();
      render(<QrCode value={OTPAUTH} status="expired" onRefresh={onRefresh} />);
      await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['Enter', '{Enter}'],
      ['Space', ' '],
    ])('calls onRefresh once on %s', async (_name, key) => {
      const user = userEvent.setup();
      const onRefresh = vi.fn();
      render(<QrCode value={OTPAUTH} status="expired" onRefresh={onRefresh} />);
      await user.tab();
      expect(screen.getByRole('button', { name: 'Refresh' })).toHaveFocus();
      await user.keyboard(key);
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it('documents a keyboard row for Enter and Space', () => {
      expect(doc.keyboard?.map(([key]) => key)).toEqual(expect.arrayContaining(['Enter', 'Space']));
    });

    it('translates the message and button in Spanish', () => {
      render(
        <I18nProvider locale="es">
          <QrCode value={OTPAUTH} status="expired" onRefresh={() => undefined} />
        </I18nProvider>,
      );
      expect(screen.getByText('Código QR caducado')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
    });
  });

  describe('too much content', () => {
    it('renders a placeholder, no svg, no throw and no console error', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      try {
        const { container } = render(<QrCode value={'x'.repeat(3000)} errorLevel="H" />);
        expect(screen.getByText('Too much content for a QR code')).toBeInTheDocument();
        expect(container.querySelector('svg')).toBeNull();
        expect(error).not.toHaveBeenCalled();
      } finally {
        error.mockRestore();
      }
    });

    it('keeps the placeholder in the requested box', () => {
      render(<QrCode value={'x'.repeat(3000)} errorLevel="H" size={200} />);
      expect(screen.getByText('Too much content for a QR code')).toHaveStyle({ width: '200px', height: '200px' });
    });
  });

  describe('qrCodeSvg', () => {
    it('returns a standalone svg string with namespace, size and viewBox and no class names', () => {
      const svg = qrCodeSvg(OTPAUTH);
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toMatch(/\swidth="160"/);
      expect(svg).toMatch(/\sheight="160"/);
      expect(svg).toMatch(/\sviewBox="0 0 \d+ \d+"/);
      expect(svg).not.toContain('class');
    });

    it('uses the colours it is given', () => {
      const svg = qrCodeSvg('HELLO', { moduleColor: 'rebeccapurple', surfaceColor: 'white', size: 100 });
      expect(svg).toContain('fill="rebeccapurple"');
      expect(svg).toContain('fill="white"');
      expect(svg).toMatch(/\swidth="100"/);
    });

    it('resolves colours from the qr tokens with tokenColor', () => {
      document.documentElement.style.setProperty('--qr-module', '0 0% 4%');
      document.documentElement.style.setProperty('--qr-surface', '0 0% 98%');
      try {
        const svg = qrCodeSvg('HELLO');
        expect(svg).toContain('fill="hsl(0 0% 4%)"');
        expect(svg).toContain('fill="hsl(0 0% 98%)"');
      } finally {
        document.documentElement.style.removeProperty('--qr-module');
        document.documentElement.style.removeProperty('--qr-surface');
      }
    });

    it('escapes the label and names the image only when asked', () => {
      expect(qrCodeSvg('HELLO')).not.toContain('role=');
      expect(qrCodeSvg('HELLO', { label: 'A "b" <c>' })).toContain('aria-label="A &quot;b&quot; &lt;c&gt;"');
    });

    it('throws a RangeError for a value beyond version 40', () => {
      expect(() => qrCodeSvg('x'.repeat(3000), { errorLevel: 'H' })).toThrow(RangeError);
    });
  });

  describe('examples', () => {
    it.each([
      ['QrCodeOtpauth', QrCodeOtpauth],
      ['QrCodePairingLink', QrCodePairingLink],
      ['QrCodeExpired', QrCodeExpired],
      ['QrCodeTooLong', QrCodeTooLong],
    ])('%s has no axe violations in dark, light and high_contrast', async (_name, Example) => {
      for (const theme of ['dark', 'light', 'high_contrast']) {
        document.documentElement.className = theme;
        const { unmount } = render(<Example />);
        await expectNoAxeViolations();
        unmount();
      }
      document.documentElement.className = '';
    });

    it('too-long example shows the placeholder and no image', () => {
      const { container } = render(<QrCodeTooLong />);
      expect(screen.getByText('Too much content for a QR code')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeNull();
    });

    it('expired example refreshes into a new code', async () => {
      const user = userEvent.setup();
      const { container } = render(<QrCodeExpired />);
      expect(container.querySelector('svg path')).toBeNull();
      await user.click(screen.getByRole('button', { name: 'Refresh' }));
      expect(await screen.findByRole('img', { name: 'QR code' })).toBeInTheDocument();
      expect(within(container).getByText('New code issued')).toBeInTheDocument();
    });
  });
});
