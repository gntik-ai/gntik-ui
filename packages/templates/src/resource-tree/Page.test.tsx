import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ResourceTreePage from './Page';
import { groupRows, treeResources } from './data';

describe('ResourceTreePage', () => {
  it('renders the tree and one table per group', { timeout: 15000 }, async () => {
    render(<ResourceTreePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Resources' })).toBeInTheDocument();
    expect(screen.getByRole('tree', { name: 'Teams and projects' })).toBeInTheDocument();
    const groups = groupRows(treeResources, 'kind');
    for (const g of groups) expect(screen.getByRole('table', { name: `${g.label} resources` })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /\+2 more/ }).length).toBeGreaterThan(0);
    await expectNoAxeViolations();
  });

  it('filters by a tree node and regroups', { timeout: 15000 }, async () => {
    render(<ResourceTreePage />);
    await userEvent.click(within(screen.getByRole('tree')).getByText('compliance'));
    expect(screen.getByText('compliance · 2 resources')).toBeInTheDocument();
    expect(screen.queryByRole('table', { name: 'Services resources' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox', { name: 'Group by' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Region' }));
    const table = screen.getByRole('table', { name: 'ap-south-1 resources' });
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    await userEvent.click(screen.getByRole('button', { name: 'All resources' }));
    expect(screen.getByText(`All resources · ${treeResources.length} resources`)).toBeInTheDocument();
  });
});
