import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Tour } from './Tour';
import TourOnboarding from './examples/TourOnboarding';

async function start() {
  const user = userEvent.setup();
  render(<TourOnboarding />);
  const trigger = screen.getByRole('button', { name: 'Start tour' });
  trigger.focus();
  await user.keyboard('{Enter}');
  const dialog = await screen.findByRole('dialog', { name: 'Find anything' });
  return { user, trigger, dialog };
}

describe('Tour', () => {
  it('opens on the first step with a counter, and focuses Next', async () => {
    const { dialog } = await start();
    expect(dialog).toHaveTextContent('Step 1 of 3');
    expect(dialog).toHaveAccessibleDescription(/Search projects/);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus());
    expect(document.querySelector('[data-tour-highlight]')).toBeInTheDocument();
  });

  it('Enter on Next / Back walks the steps; Finish completes', async () => {
    const { user } = await start();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('dialog', { name: 'Create a project' })).toHaveTextContent('Step 2 of 3');
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByRole('dialog', { name: 'Find anything' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'Finish' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Tour completed.')).toBeInTheDocument();
  });

  it('ArrowRight / ArrowLeft move between steps', async () => {
    const { user } = await start();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus());
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByRole('dialog', { name: 'Create a project' })).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(await screen.findByRole('dialog', { name: 'Find anything' })).toBeInTheDocument();
  });

  it('Tab / Shift+Tab move between the step controls', async () => {
    const { user } = await start();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus());
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Skip tour' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'End tour' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Skip tour' })).toHaveFocus();
  });

  it('Escape ends the tour (skipped) and returns focus to where it was', async () => {
    const { user, trigger } = await start();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Tour skipped.')).toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('Skip ends the tour', async () => {
    const onFinish = vi.fn();
    const user = userEvent.setup();
    render(<Tour defaultOpen steps={[{ target: '#nowhere', title: 'Centred' }, { target: '#nowhere', title: 'Two' }]} onFinish={onFinish} />);
    await user.click(await screen.findByRole('button', { name: 'Skip tour' }));
    expect(onFinish).toHaveBeenCalledWith(false);
  });

  it('examples have no axe violations (open)', async () => {
    await start();
    await expectNoAxeViolations();
  });
});
