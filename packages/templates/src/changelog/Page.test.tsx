import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ChangelogPage from './Page';
import { changelogEntries } from './data';

describe('ChangelogPage', () => {
  it('renders every release with its badges', { timeout: 15000 }, async () => {
    render(<ChangelogPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Changelog' })).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Releases' });
    expect(within(list).getAllByRole('article')).toHaveLength(changelogEntries.length);
    expect(within(list).getAllByText('New')).toHaveLength(changelogEntries.filter((e) => e.isNew).length);
    await expectNoAxeViolations();
  });

  it('filters by tag and resets', { timeout: 15000 }, async () => {
    const onTagsChange = vi.fn();
    render(<ChangelogPage onTagsChange={onTagsChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Security' }));
    expect(onTagsChange).toHaveBeenLastCalledWith(['security']);
    const list = screen.getByRole('list', { name: 'Releases' });
    expect(within(list).getAllByRole('article')).toHaveLength(changelogEntries.filter((e) => e.tags.includes('security')).length);
    expect(screen.getByText('2 releases')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Show all' }));
    expect(screen.getByText(`${changelogEntries.length} releases`)).toBeInTheDocument();
  });
});
