import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from './Accordion';
import AccordionSingle from './examples/AccordionSingle';
import AccordionMultiple from './examples/AccordionMultiple';

function Basic({ multiple = false }: { multiple?: boolean }) {
  return (
    <Accordion multiple={multiple}>
      <AccordionItem value="a">
        <AccordionTrigger>Alpha</AccordionTrigger>
        <AccordionPanel>Alpha body <button type="button">Inner</button></AccordionPanel>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Beta</AccordionTrigger>
        <AccordionPanel>Beta body</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Gamma</AccordionTrigger>
        <AccordionPanel>Gamma body</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

const trigger = (name: string) => screen.getByRole('button', { name });

describe('Accordion', () => {
  it('wraps triggers in headings and links them to their region', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    expect(screen.getByRole('heading', { level: 3, name: 'Alpha' })).toBeInTheDocument();
    expect(trigger('Alpha')).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger('Alpha'));
    const region = screen.getByRole('region', { name: 'Alpha' });
    expect(trigger('Alpha')).toHaveAttribute('aria-controls', region.id);
  });

  it('Enter / Space toggle the focused section; single mode closes the others', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.tab();
    expect(trigger('Alpha')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(trigger('Alpha')).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(trigger('Alpha')).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{Enter}');
    await user.click(trigger('Beta'));
    expect(trigger('Beta')).toHaveAttribute('aria-expanded', 'true');
    expect(trigger('Alpha')).toHaveAttribute('aria-expanded', 'false');
  });

  it('multiple mode keeps several sections open', async () => {
    const user = userEvent.setup();
    render(<Basic multiple />);
    await user.click(trigger('Alpha'));
    await user.click(trigger('Gamma'));
    expect(trigger('Alpha')).toHaveAttribute('aria-expanded', 'true');
    expect(trigger('Gamma')).toHaveAttribute('aria-expanded', 'true');
  });

  it('ArrowDown / ArrowUp move focus between triggers and wrap', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(trigger('Beta')).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(trigger('Gamma')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(trigger('Alpha')).toHaveFocus();
  });

  it('Home / End move focus to the first / last trigger', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.tab();
    await user.keyboard('{End}');
    expect(trigger('Gamma')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(trigger('Alpha')).toHaveFocus();
  });

  it('Tab moves through triggers and into open panel content', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.click(trigger('Alpha'));
    await user.tab();
    expect(screen.getByRole('button', { name: 'Inner' })).toHaveFocus();
    await user.tab();
    expect(trigger('Beta')).toHaveFocus();
  });

  it('skips disabled items when moving with arrows', async () => {
    const user = userEvent.setup();
    render(<AccordionMultiple />);
    const general = trigger('General');
    general.focus();
    await user.keyboard('{ArrowUp}');
    expect(trigger('Notifications')).toHaveFocus();
    await user.click(trigger('Danger zone (owners only)'));
    expect(trigger('Danger zone (owners only)')).toHaveAttribute('aria-expanded', 'false');
  });

  it('examples have no axe violations (with panels open)', async () => {
    const user = userEvent.setup();
    render(<><AccordionSingle /><AccordionMultiple /></>);
    await user.click(trigger('Notifications'));
    await waitFor(() => expect(screen.getAllByRole('region').length).toBeGreaterThanOrEqual(3));
    await expectNoAxeViolations();
  });
});
