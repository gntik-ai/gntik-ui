import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import WizardLayoutNewProject from './examples/WizardLayoutNewProject';
import { WizardLayout, type WizardLayoutProps } from './WizardLayout';

const STEPS = [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }];

function Harness({ current: initial = 0, ...props }: Partial<WizardLayoutProps>) {
  const [current, setCurrent] = useState(initial);
  return (
    <WizardLayout steps={STEPS} onStepChange={setCurrent} {...props} current={current}>
      <input aria-label="Field" />
    </WizardLayout>
  );
}

const currentStep = () => screen.getByRole('navigation', { name: 'Progress' }).querySelector('[aria-current="step"]');

describe('WizardLayout', () => {
  it('renders header, full and compact steppers, main and footer', () => {
    const { container } = render(<Harness current={1} />);
    expect(container.firstElementChild).toHaveClass('h-full');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(currentStep()).toHaveTextContent('Two');
    expect(screen.getByRole('navigation', { name: 'Progress summary' })).toHaveTextContent('Step 2 of 3');
  });

  it('Back and Next move between steps; Finish on the last one', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Harness onFinish={onFinish} />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    screen.getByRole('button', { name: 'Next' }).focus();
    await user.keyboard('{Enter}');
    expect(currentStep()).toHaveTextContent('Two');
    await user.keyboard(' ');
    expect(currentStep()).toHaveTextContent('Three');
    await user.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onFinish).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(currentStep()).toHaveTextContent('Two');
  });

  it('Tab / Enter on a completed step goes back to it', async () => {
    const user = userEvent.setup();
    render(<Harness current={2} />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Exit' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: /^One/ })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(currentStep()).toHaveTextContent('One');
  });

  it('Escape opens the exit confirmation; Escape in the dialog closes it without reopening', async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<Harness onExit={onExit} />);
    screen.getByRole('textbox', { name: 'Field' }).focus();
    await user.keyboard('{Escape}');
    const dialog = await screen.findByRole('alertdialog', { name: 'Leave this setup?' });
    expect(dialog).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onExit).not.toHaveBeenCalled();
  });

  it('Exit opens the confirmation; Leave calls onExit, Stay does not', async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<Harness onExit={onExit} />);
    await user.click(screen.getByRole('button', { name: 'Exit' }));
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Stay' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onExit).not.toHaveBeenCalled();
    screen.getByRole('button', { name: 'Exit' }).focus();
    await user.keyboard('{Enter}');
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Leave' }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('confirmExit={false} exits directly', async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    render(<Harness onExit={onExit} confirmExit={false} />);
    await user.click(screen.getByRole('button', { name: 'Exit' }));
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('the example disables Next without a name and finishes', async () => {
    const user = userEvent.setup();
    render(<WizardLayoutNewProject />);
    const name = screen.getByRole('textbox', { name: /Project name/ });
    await user.clear(name);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    await user.type(name, 'api');
    for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Finish' }));
    expect(screen.getByText('Project “api” created')).toBeInTheDocument();
  });

  it('the example and its exit dialog have no axe violations', async () => {
    const user = userEvent.setup();
    render(<WizardLayoutNewProject />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: 'Exit' }));
    await screen.findByRole('alertdialog');
    await expectNoAxeViolations();
  });
});
