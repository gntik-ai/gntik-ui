import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { LiveAnnouncer, useAnnounce } from './LiveAnnouncer';
import LiveAnnouncerSave from './examples/LiveAnnouncerSave';

describe('LiveAnnouncer', () => {
  it('renders a polite status region and an assertive region', () => {
    render(<LiveAnnouncer />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(document.querySelector('[aria-live="assertive"]')).toBeInTheDocument();
  });

  it('Enter / Space on a control that announces writes the message, and repeats re-announce', async () => {
    const user = userEvent.setup();
    render(<LiveAnnouncerSave />);
    const button = screen.getByRole('button', { name: 'Save draft' });
    button.focus();
    await user.keyboard('{Enter}');
    const status = screen.getByRole('status');
    expect(status.textContent).toBe('Draft saved.');
    await user.keyboard(' ');
    expect(status.textContent).toBe('Draft saved.\u00A0');
  });

  it('routes assertive messages to the assertive region', async () => {
    function Alerting() {
      const announce = useAnnounce();
      return (
        <button type="button" onClick={() => announce('Connection lost', 'assertive')}>
          Fail
        </button>
      );
    }
    const user = userEvent.setup();
    render(
      <LiveAnnouncer>
        <Alerting />
      </LiveAnnouncer>,
    );
    await user.click(screen.getByRole('button', { name: 'Fail' }));
    expect(document.querySelector('[aria-live="assertive"]')).toHaveTextContent('Connection lost');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('useAnnounce is a no-op outside a LiveAnnouncer', () => {
    const { result } = renderHook(() => useAnnounce());
    expect(() => result.current('Nothing to hear')).not.toThrow();
  });

  it('example has no axe violations', async () => {
    render(<LiveAnnouncerSave />);
    await expectNoAxeViolations();
  });
});
