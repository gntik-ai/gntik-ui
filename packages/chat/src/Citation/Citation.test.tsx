import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import { Citation, CitationList, sourceHost } from './Citation';
import CitationAnswer from './examples/CitationAnswer';

const SOURCE = { title: 'Deployment limits', url: 'https://docs.example.com/limits', snippet: 'Up to 20 deployments a day.' };

describe('Citation', () => {
  it('Enter opens the preview; Escape closes it and returns focus', async () => {
    const user = userEvent.setup();
    render(<Citation index={1} source={SOURCE} />);
    const marker = screen.getByRole('button', { name: 'Source 1: Deployment limits' });
    expect(marker).toHaveTextContent('1');
    marker.focus();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Deployment limits');
    expect(dialog).toHaveTextContent('docs.example.com');
    expect(dialog).toHaveTextContent('Up to 20 deployments a day.');
    expect(screen.getByRole('link', { name: /Open source/ })).toHaveAttribute('href', SOURCE.url);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(marker).toHaveFocus();
  });

  it('does not link unsafe source URLs', async () => {
    const user = userEvent.setup();
    render(<Citation index={2} source={{ title: 'Bad', url: 'javascript:alert(1)' }} />);
    await user.click(screen.getByRole('button', { name: 'Source 2: Bad' }));
    await screen.findByRole('dialog');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('sourceHost strips www and survives bad URLs', () => {
    expect(sourceHost('https://www.example.com/a')).toBe('example.com');
    expect(sourceHost('not a url')).toBeUndefined();
  });
});

describe('CitationList', () => {
  it('renders a numbered, labelled list of sources', () => {
    render(<CitationList sources={[SOURCE, { title: 'Offline note' }]} />);
    const list = screen.getByRole('region', { name: 'Sources' });
    expect(list.querySelectorAll('li')).toHaveLength(2);
    expect(screen.getByRole('link', { name: /Deployment limits/ })).toHaveAttribute('target', '_blank');
    expect(screen.getByText('Offline note').tagName).toBe('SPAN');
  });

  it('renders nothing without sources', () => {
    const { container } = render(<CitationList sources={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('example has no axe violations', async () => {
    const { container } = render(<CitationAnswer />);
    await expectNoAxeViolations(container);
  });
});
