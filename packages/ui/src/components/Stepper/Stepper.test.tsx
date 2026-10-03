import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import StepperCompact from './examples/StepperCompact';
import StepperVertical from './examples/StepperVertical';
import StepperWizard from './examples/StepperWizard';
import { Stepper } from './Stepper';

const STEPS = [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }, { label: 'Four' }];

describe('Stepper', () => {
  it('renders an ordered list with aria-current="step" on the current step', () => {
    render(<Stepper label="Setup" steps={STEPS} current={2} />);
    const nav = screen.getByRole('navigation', { name: 'Setup' });
    const items = within(nav).getAllByRole('listitem');
    expect(items).toHaveLength(4);
    const current = nav.querySelector('[aria-current="step"]');
    expect(current).toHaveTextContent('Three');
    expect(items[0]).toHaveTextContent('One, completed');
    expect(items[3]).toHaveTextContent('Four, not started');
  });

  it('without onStepClick no step is focusable', () => {
    render(<Stepper steps={STEPS} current={2} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('Tab moves between clickable completed steps and Enter activates one', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();
    render(<Stepper steps={STEPS} current={2} onStepClick={onStepClick} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    await user.tab();
    expect(buttons[0]).toHaveFocus();
    await user.tab();
    expect(buttons[1]).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onStepClick).toHaveBeenCalledWith(1);
    await user.keyboard(' ');
    expect(onStepClick).toHaveBeenCalledTimes(2);
  });

  it('the wizard example moves back when a completed step is activated', async () => {
    const user = userEvent.setup();
    render(<StepperWizard />);
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('navigation').querySelector('[aria-current="step"]')).toHaveTextContent('Policies');
    (document.activeElement as HTMLElement | null)?.blur();
    await user.tab();
    expect(screen.getByRole('button', { name: /Connect/ })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('navigation').querySelector('[aria-current="step"]')).toHaveTextContent('Connect');
  });

  it('explicit error status is announced', () => {
    render(<StepperVertical />);
    expect(screen.getByText('Database migration').closest('li')).toHaveTextContent('Database migration, error');
  });

  it('compact mode shows "Step N of M"', () => {
    render(<StepperCompact />);
    expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Onboarding' }).querySelector('[aria-current="step"]')).toHaveTextContent('Workspace');
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <StepperWizard />
        <StepperVertical />
        <StepperCompact />
      </>,
    );
    await expectNoAxeViolations();
  });
});
