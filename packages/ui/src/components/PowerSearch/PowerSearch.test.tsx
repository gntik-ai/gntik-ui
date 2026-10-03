import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { PowerSearch } from './PowerSearch';
import { formatPowerSearch, matchPowerSearch, parsePowerSearch, type PowerSearchQuery } from './power-search-query';
import PowerSearchDeployments from './examples/PowerSearchDeployments';
import PowerSearchEmpty from './examples/PowerSearchEmpty';
import { deploymentFields, type DeploymentField } from './examples/fields';

type Q = PowerSearchQuery<DeploymentField>;

function setup(defaultValue?: Q) {
  const user = userEvent.setup();
  const onValueChange = vi.fn<(q: Q) => void>();
  const onSubmit = vi.fn<(q: Q) => void>();
  render(<PowerSearch aria-label="Filter" fields={deploymentFields} defaultValue={defaultValue} onValueChange={onValueChange} onSubmit={onSubmit} />);
  const input = screen.getByRole('combobox', { name: 'Filter' });
  const last = () => onValueChange.mock.lastCall?.[0];
  const text = () => (last() ? formatPowerSearch(last() as Q) : '');
  return { user, input, onValueChange, onSubmit, last, text };
}

const announcer = () => document.querySelector('[data-announcer]');
const highlighted = () => document.querySelector('[role="option"][data-highlighted]');

describe('PowerSearch query helpers', () => {
  it('parses filters (inline and spaced), coerces types and keeps text', () => {
    const q = parsePowerSearch('status=failed duration > 60 region:"eu-west" hello "two words" nope=1', deploymentFields);
    expect(q.terms).toEqual([
      { type: 'filter', field: 'status', operator: '=', value: 'failed' },
      { type: 'filter', field: 'duration', operator: '>', value: 60 },
      { type: 'filter', field: 'region', operator: '=', value: 'eu-west' },
      { type: 'text', value: 'hello' },
      { type: 'text', value: 'two words' },
      { type: 'text', value: 'nope=1' },
    ]);
    expect(formatPowerSearch(q)).toBe('status = failed duration > 60 region = eu-west hello "two words" nope=1');
    expect(parsePowerSearch('status=unknown', deploymentFields).terms[0]?.type).toBe('text');
  });

  it('matches records', () => {
    const q = parsePowerSearch('status=failed duration>=200 sync', deploymentFields);
    expect(matchPowerSearch(q, { status: 'failed', duration: 312, project: 'invoice-sync' })).toBe(true);
    expect(matchPowerSearch(q, { status: 'failed', duration: 145, project: 'invoice-sync' })).toBe(false);
  });
});

describe('PowerSearch', () => {
  it('ArrowDown + Enter walk field → operator → value and emit the AST', async () => {
    const { user, input, last } = setup();
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('status'));
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('option', { name: /is not/ })).toBeInTheDocument();
    // A new step keeps the first suggestion highlighted, so Enter alone would pick "is".
    await waitFor(() => expect(highlighted()).toHaveTextContent('is'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('is not'));
    await user.keyboard('{Enter}');
    await user.keyboard('fai');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(highlighted()).toHaveTextContent('failed'));
    await user.keyboard('{Enter}');
    expect(last()).toEqual({ type: 'and', terms: [{ type: 'filter', field: 'status', operator: '!=', value: 'failed' }] });
    expect(announcer()).toHaveTextContent('Added status is not failed.');
    expect(input).toHaveValue('');
  });

  it('typed shortcuts: field=value, number operators, Enter commits', async () => {
    const { user, input, text } = setup();
    await user.click(input);
    await user.keyboard('project=billing-api{Enter}');
    expect(text()).toBe('project = billing-api');
    await user.keyboard('duration>=90{Enter}');
    expect(text()).toBe('project = billing-api duration >= 90');
    await user.keyboard('duration:abc{Enter}');
    expect(announcer()).toHaveTextContent('Not a valid duration value.');
  });

  it('Enter on loose text adds a free-text term; Enter on empty submits', async () => {
    const { user, input, text, onSubmit } = setup();
    await user.click(input);
    await user.keyboard('timeout{Enter}');
    expect(text()).toBe('timeout');
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith({ type: 'and', terms: [{ type: 'text', value: 'timeout' }] });
  });

  it('Backspace on empty input steps back, then edits the last term', async () => {
    const { user, input, last } = setup(parsePowerSearch('status=failed', deploymentFields));
    await user.click(input);
    await user.keyboard('region=');
    expect(input).toHaveAccessibleDescription('region is');
    await user.keyboard('{Backspace}');
    expect(input).toHaveAccessibleDescription('region');
    await user.keyboard('{Backspace}');
    expect(input).not.toHaveAccessibleDescription();
    await user.keyboard('{Backspace}');
    expect(last()?.terms).toEqual([]);
    expect(input).toHaveValue('failed');
    expect(input).toHaveAccessibleDescription('status is');
    await user.keyboard('{Control>}a{/Control}succeeded{Enter}');
    expect(last()?.terms).toEqual([{ type: 'filter', field: 'status', operator: '=', value: 'succeeded' }]);
  });

  it('ArrowLeft reaches the terms; arrows move; Delete removes; ArrowRight returns', async () => {
    const { user, input, text } = setup(parsePowerSearch('status=failed region=eu-west', deploymentFields));
    const terms = screen.getByRole('list', { name: 'Active filters' });
    await user.click(input);
    await user.keyboard('{ArrowLeft}');
    const chipRegion = within(terms).getByRole('button', { name: /^region is EU West/ });
    expect(chipRegion).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(within(terms).getByRole('button', { name: /^status is failed/ })).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(input).toHaveFocus();
    await user.keyboard('{ArrowLeft}{Delete}');
    expect(text()).toBe('status = failed');
    expect(input).toHaveFocus();
    expect(announcer()).toHaveTextContent('Removed region is EU West.');
  });

  it('Enter on a term pulls it back for editing', async () => {
    const { user, input } = setup(parsePowerSearch('duration>60', deploymentFields));
    await user.click(input);
    await user.keyboard('{ArrowLeft}{Enter}');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('60');
    expect(input).toHaveAccessibleDescription('duration greater than');
  });

  it('Escape closes suggestions, then clears the draft', async () => {
    const { user, input } = setup();
    await user.click(input);
    await user.keyboard('status=');
    await screen.findByRole('listbox');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(input).toHaveAccessibleDescription('status is');
    await user.keyboard('{Escape}');
    expect(input).not.toHaveAccessibleDescription();
  });

  it('clear button removes everything', async () => {
    const { user, last } = setup(parsePowerSearch('status=failed hello', deploymentFields));
    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(last()?.terms).toEqual([]);
  });

  it('examples have no axe violations (closed and open)', async () => {
    const user = userEvent.setup();
    render(
      <>
        <PowerSearchDeployments />
        <PowerSearchEmpty />
      </>,
    );
    expect(within(screen.getByRole('list', { name: 'Matching deployments' })).getAllByRole('listitem')).toHaveLength(2);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('combobox', { name: 'Search deployments' }));
    await screen.findByRole('listbox');
    await expectNoAxeViolations();
  });
});
