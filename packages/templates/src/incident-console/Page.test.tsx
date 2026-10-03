import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import IncidentConsolePage from './Page';
import { incidents } from './data';

describe('IncidentConsolePage', () => {
  it('renders the alert rail filtered to open incidents', { timeout: 15000 }, async () => {
    render(<IncidentConsolePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Incidents' })).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Incidents' });
    const open = incidents.filter((i) => i.status !== 'resolved');
    expect(within(list).getAllByRole('button')).toHaveLength(open.length);
    expect(within(list).getAllByRole('button')[0]).toHaveTextContent('SEV1');
    expect(screen.getByRole('heading', { name: 'Select an incident' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('acknowledges then resolves an incident', { timeout: 15000 }, async () => {
    const onAcknowledge = vi.fn();
    const onResolve = vi.fn();
    render(<IncidentConsolePage onAcknowledge={onAcknowledge} onResolve={onResolve} />);
    await userEvent.click(within(screen.getByRole('list', { name: 'Incidents' })).getByRole('button', { name: /api-gateway/ }));
    expect(screen.getByRole('heading', { level: 2, name: 'Elevated 5xx on api-gateway' })).toBeInTheDocument();
    expect(screen.getByRole('timer', { name: 'INC-2041 elapsed time' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Acknowledge' }));
    expect(onAcknowledge).toHaveBeenCalledWith('INC-2041');
    expect(screen.getByRole('button', { name: 'Acknowledge' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Resolve' }));
    expect(onResolve).toHaveBeenCalledWith('INC-2041');
    const timeline = screen.getByRole('region', { name: 'Timeline' });
    expect(within(timeline).getByText('Resolved')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Incidents' })).queryByRole('button', { name: /api-gateway/ })).not.toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('filters by severity with PowerSearch', { timeout: 15000 }, async () => {
    render(<IncidentConsolePage defaultQuery="" />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Filter incidents' }));
    await userEvent.keyboard('severity=sev2{Enter}');
    const list = screen.getByRole('list', { name: 'Incidents' });
    expect(within(list).getAllByRole('button')).toHaveLength(incidents.filter((i) => i.severity === 'sev2').length);
  });
});
