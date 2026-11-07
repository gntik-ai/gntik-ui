import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { useForm } from 'react-hook-form';
import { Form, FormField } from '../../forms/FormField';
import { I18nProvider } from '../../i18n';
import { expectNoAxeViolations } from '../../test/a11y';
import { Dialog, DialogContent, DialogTitle } from '../Dialog';
import { Field, FieldLabel } from '../Field';
import { SearchField } from './SearchField';
import { searchFieldDoc } from './index';
import SearchFieldBasic from './examples/SearchFieldBasic';
import SearchFieldPending from './examples/SearchFieldPending';
import SearchFieldShortcut from './examples/SearchFieldShortcut';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SearchField naming', () => {
  const container = document.createElement('div');
  beforeEach(() => {
    document.body.append(container);
  });
  afterEach(() => {
    container.remove();
    container.innerHTML = '';
  });

  it('renders one searchbox with the given name and a decorative icon', () => {
    const { container } = render(<SearchField aria-label="Search logs" />);
    expect(screen.getAllByRole('searchbox')).toHaveLength(1);
    expect(screen.getByRole('searchbox', { name: 'Search logs' })).toBeInTheDocument();
    const icon = container.querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('is named Search, with the catalog placeholder, when nothing names it', () => {
    render(<SearchField />);
    const input = screen.getByRole('searchbox', { name: 'Search' });
    expect(input).toHaveAttribute('placeholder', 'Search…');
  });

  it('localizes the default name and placeholder', () => {
    render(
      <I18nProvider locale="es">
        <SearchField />
      </I18nProvider>,
    );
    expect(screen.getByRole('searchbox', { name: 'Buscar' })).toHaveAttribute('placeholder', 'Buscar…');
  });

  it('keeps an explicit placeholder', () => {
    render(<SearchField placeholder="Find a log" />);
    expect(screen.getByRole('searchbox')).toHaveAttribute('placeholder', 'Find a log');
  });

  it('lets a Field label win over the default name', () => {
    render(
      <Field>
        <FieldLabel>Search deployments</FieldLabel>
        <SearchField defaultValue="api" />
      </Field>,
    );
    expect(screen.getByRole('searchbox', { name: 'Search deployments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear Search deployments' })).toBeInTheDocument();
  });

  it('lets a FormField label win over the default name', () => {
    function Example() {
      const form = useForm({ defaultValues: { q: '' } });
      return (
        <Form form={form} onSubmit={() => {}}>
          <FormField name="q" label="Find members">
            {(props) => <SearchField {...props} value={undefined} />}
          </FormField>
        </Form>
      );
    }
    render(<Example />);
    expect(screen.getByRole('searchbox', { name: 'Find members' })).toBeInTheDocument();
  });

  it('lets aria-labelledby win over the default name', () => {
    render(
      <>
        <span id="heading">Audit events</span>
        <SearchField aria-labelledby="heading" />
      </>,
    );
    expect(screen.getByRole('searchbox', { name: 'Audit events' })).toBeInTheDocument();
  });

  it('server-renders a Field label as the name, not the default aria-label', () => {
    const html = renderToString(
      <Field>
        <FieldLabel>Search deployments</FieldLabel>
        <SearchField />
      </Field>,
    );
    expect(html).not.toContain('aria-label=');
    container.innerHTML = html;
    expect(screen.getByRole('searchbox', { name: 'Search deployments' })).toBeInTheDocument();
  });

  it('server-renders a FormField label as the name, not the default aria-label', () => {
    function Example() {
      const form = useForm({ defaultValues: { q: '' } });
      return (
        <Form form={form} onSubmit={() => {}}>
          <FormField name="q" label="Find members">
            {(props) => <SearchField {...props} value={undefined} />}
          </FormField>
        </Form>
      );
    }
    const html = renderToString(<Example />);
    expect(html).not.toContain('aria-label=');
    container.innerHTML = html;
    expect(screen.getByRole('searchbox', { name: 'Find members' })).toBeInTheDocument();
  });

  it('keeps the default name inside a Field that has no label', () => {
    render(
      <Field>
        <SearchField />
      </Field>,
    );
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('server-renders the default name inside a Field that has no label', () => {
    const html = renderToString(
      <Field>
        <SearchField />
      </Field>,
    );
    expect(html).toContain('aria-label="Search"');
    container.innerHTML = html;
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('server-renders the default name', () => {
    const html = renderToString(<SearchField />);
    expect(html).toContain('aria-label="Search"');
    expect(html).toContain('type="search"');
  });
});

describe('SearchField clear', () => {
  it('reports each keystroke, then clears with one set of callbacks and keeps focus', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    const onSearch = vi.fn();
    render(
      <SearchField aria-label="Search logs" onValueChange={onValueChange} onClear={onClear} onSearch={onSearch} />,
    );
    const input = screen.getByRole('searchbox');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    await user.type(input, 'api');
    expect(onValueChange.mock.calls.map(([v]) => v)).toEqual(['a', 'ap', 'api']);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Clear Search logs' }));
    expect(input).toHaveValue('');
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('', 'clear');
    expect(input).toHaveFocus();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each([{ disabled: true }, { readOnly: true }])('has no clear button when %o', (props) => {
    render(<SearchField aria-label="Search" defaultValue="api" {...props} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('has no clear button while the value is empty', () => {
    render(<SearchField aria-label="Search" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('clears a controlled field through the parent', async () => {
    function Example() {
      const [value, setValue] = useState('api');
      return <SearchField aria-label="Search" value={value} onValueChange={setValue} />;
    }
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear Search' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('hides the native cancel button so only one clear control shows', () => {
    render(<SearchField aria-label="Search" defaultValue="api" inputClassName="custom-input" />);
    const input = screen.getByRole('searchbox');
    expect(input).toHaveClass('[&::-webkit-search-cancel-button]:hidden', 'custom-input');
  });
});

describe('SearchField Enter', () => {
  it('reports onSearch once and lets the enclosing form submit', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SearchField aria-label="Search" defaultValue="billing" onSearch={onSearch} />
      </form>,
    );
    screen.getByRole('searchbox').focus();
    await user.keyboard('{Enter}');
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('billing', 'enter');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not report during IME composition', () => {
    const onSearch = vi.fn();
    render(<SearchField aria-label="Search" defaultValue="あ" onSearch={onSearch} />);
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter', isComposing: true });
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter', keyCode: 229 });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('does not report when a consumer onKeyDown prevented the event', async () => {
    const onSearch = vi.fn();
    render(
      <SearchField
        aria-label="Search"
        defaultValue="api"
        onSearch={onSearch}
        onKeyDown={(event) => event.preventDefault()}
      />,
    );
    screen.getByRole('searchbox').focus();
    await userEvent.keyboard('{Enter}');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('passes other keys to a consumer onKeyDown', async () => {
    const onKeyDown = vi.fn();
    render(<SearchField aria-label="Search" onKeyDown={onKeyDown} />);
    screen.getByRole('searchbox').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});

describe('SearchField Escape', () => {
  it('clears inside a Dialog without closing it; a second Escape closes it', async () => {
    const onClear = vi.fn();
    const onSearch = vi.fn();
    const onValueChange = vi.fn();
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Find</DialogTitle>
          <SearchField
            aria-label="Projects"
            defaultValue="api"
            onClear={onClear}
            onSearch={onSearch}
            onValueChange={onValueChange}
          />
        </DialogContent>
      </Dialog>,
    );
    const input = await screen.findByRole('searchbox');
    input.focus();
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveValue('');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('', 'clear');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('propagates Escape and keeps the value on a read-only field', () => {
    const onEscape = vi.fn();
    render(
      <div onKeyDown={onEscape}>
        <SearchField aria-label="Search" defaultValue="api" readOnly />
      </div>,
    );
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('searchbox')).toHaveValue('api');
  });

  it('propagates Escape and keeps the value on a disabled field', () => {
    const onEscape = vi.fn();
    render(
      <div onKeyDown={onEscape}>
        <SearchField aria-label="Search" defaultValue="api" disabled />
      </div>,
    );
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('searchbox')).toHaveValue('api');
  });
});

describe('SearchField debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const type = (value: string) => fireEvent.change(screen.getByRole('searchbox'), { target: { value } });
  const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));

  it('commits one type search 300 ms after the last key, never for intermediate values', () => {
    const onSearch = vi.fn();
    render(<SearchField aria-label="Search" debounceMs={300} onSearch={onSearch} />);
    type('a');
    wait(100);
    type('ap');
    wait(100);
    type('api');
    wait(299);
    expect(onSearch).not.toHaveBeenCalled();
    wait(2);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('api', 'type');
  });

  it('does not report a typed search when there is no debounceMs', () => {
    const onSearch = vi.fn();
    render(<SearchField aria-label="Search" onSearch={onSearch} />);
    type('api');
    wait(5000);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('cancels a pending debounce on Enter', () => {
    const onSearch = vi.fn();
    render(<SearchField aria-label="Search" debounceMs={300} onSearch={onSearch} />);
    type('api');
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' });
    wait(1000);
    expect(onSearch.mock.calls).toEqual([['api', 'enter']]);
  });

  it('cancels a pending debounce on the clear button', () => {
    const onSearch = vi.fn();
    render(<SearchField aria-label="Search" debounceMs={300} onSearch={onSearch} />);
    type('api');
    fireEvent.click(screen.getByRole('button', { name: 'Clear Search' }));
    wait(1000);
    expect(onSearch.mock.calls).toEqual([['', 'clear']]);
  });

  it('cancels a pending debounce on Escape', () => {
    const onSearch = vi.fn();
    render(<SearchField aria-label="Search" debounceMs={300} onSearch={onSearch} />);
    type('api');
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Escape' });
    wait(1000);
    expect(onSearch.mock.calls).toEqual([['', 'clear']]);
  });

  it('cancels a pending debounce on unmount', () => {
    const onSearch = vi.fn();
    const { unmount } = render(<SearchField aria-label="Search" debounceMs={300} onSearch={onSearch} />);
    type('api');
    unmount();
    wait(1000);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('never reports controlled value changes from the parent', () => {
    const onSearch = vi.fn();
    const { rerender } = render(<SearchField aria-label="Search" debounceMs={300} value="a" onSearch={onSearch} />);
    rerender(<SearchField aria-label="Search" debounceMs={300} value="api" onSearch={onSearch} />);
    rerender(<SearchField aria-label="Search" debounceMs={300} value="" onSearch={onSearch} />);
    wait(1000);
    expect(onSearch).not.toHaveBeenCalled();
  });
});

describe('SearchField pending', () => {
  it('marks the input busy, swaps the icon for a decorative spinner and stays editable', async () => {
    const { container, rerender } = render(<SearchField aria-label="Search" pending />);
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-busy', 'true');
    const spinner = container.querySelector('svg.animate-spin');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.type(input, 'api');
    expect(input).toHaveValue('api');
    rerender(<SearchField aria-label="Search" />);
    expect(screen.getByRole('searchbox')).not.toHaveAttribute('aria-busy');
    expect(container.querySelector('svg.animate-spin')).toBeNull();
  });
});

describe('SearchField shortcut', () => {
  it('focuses the field from the body, selects its text and types no slash', async () => {
    render(<SearchField aria-label="Search" defaultValue="api" shortcut="/" />);
    const input = screen.getByRole<HTMLInputElement>('searchbox');
    expect(input).toHaveAttribute('aria-keyshortcuts', '/');
    expect(input).not.toHaveFocus();
    await userEvent.keyboard('/');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('api');
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 3]);
  });

  it('types the slash in another input and keeps focus there', async () => {
    render(
      <>
        <input aria-label="Other" />
        <SearchField aria-label="Search" shortcut="/" />
      </>,
    );
    const other = screen.getByLabelText('Other');
    other.focus();
    await userEvent.keyboard('/');
    expect(other).toHaveValue('/');
    expect(other).toHaveFocus();
  });

  it('shows an aria-hidden hint only while the field is empty and unfocused', async () => {
    const { container } = render(<SearchField aria-label="Search" shortcut="/" />);
    const hint = () => container.querySelector('kbd');
    expect(hint()).toHaveTextContent('/');
    expect(hint()?.closest('[aria-hidden="true"]')).not.toBeNull();
    const input = screen.getByRole('searchbox');
    act(() => input.focus());
    expect(hint()).toBeNull();
    await userEvent.type(input, 'api');
    act(() => input.blur());
    expect(hint()).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Clear Search' }));
    act(() => input.blur());
    expect(hint()).toHaveTextContent('/');
  });

  it('shows the platform key for mod+k, never the literal mod', () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel' });
    const mac = render(<SearchField aria-label="Search" shortcut="mod+k" />);
    expect(mac.container.querySelector('kbd')).toHaveTextContent('⌘K');
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-keyshortcuts', 'Meta+K');
    mac.unmount();
    vi.stubGlobal('navigator', { platform: 'Win32' });
    const win = render(<SearchField aria-label="Search" shortcut="mod+k" />);
    expect(win.container.querySelector('kbd')?.textContent).toBe('Ctrl+K');
    expect(win.container.textContent).not.toContain('mod');
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-keyshortcuts', 'Control+K');
  });

  it('focuses on mod+k even while typing elsewhere', async () => {
    vi.stubGlobal('navigator', { platform: 'Win32' });
    render(
      <>
        <input aria-label="Other" />
        <SearchField aria-label="Search" shortcut="mod+k" />
      </>,
    );
    screen.getByLabelText('Other').focus();
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('searchbox')).toHaveFocus();
  });

  it('does not respond, show a hint or announce a shortcut when disabled', async () => {
    const { container } = render(<SearchField aria-label="Search" shortcut="/" disabled />);
    await userEvent.keyboard('/');
    expect(screen.getByRole('searchbox')).not.toHaveFocus();
    expect(container.querySelector('kbd')).toBeNull();
    expect(screen.getByRole('searchbox')).not.toHaveAttribute('aria-keyshortcuts');
  });

  it('does not respond, show a hint or announce a shortcut inside a disabled Field', async () => {
    const { container } = render(
      <Field disabled>
        <FieldLabel>Search deployments</FieldLabel>
        <SearchField shortcut="/" />
      </Field>,
    );
    await userEvent.keyboard('/');
    expect(screen.getByRole('searchbox')).not.toHaveFocus();
    expect(container.querySelector('kbd')).toBeNull();
    expect(screen.getByRole('searchbox')).not.toHaveAttribute('aria-keyshortcuts');
  });

  it('removes its binding on unmount', async () => {
    const { unmount } = render(<SearchField aria-label="Search" shortcut="/" />);
    unmount();
    const other = document.createElement('button');
    document.body.append(other);
    other.focus();
    await userEvent.keyboard('/');
    expect(other).toHaveFocus();
    other.remove();
  });

  it('forwards a consumer ref', () => {
    let node: HTMLInputElement | null = null;
    render(
      <SearchField
        aria-label="Search"
        ref={(element) => {
          node = element;
        }}
      />,
    );
    expect(node).toBe(screen.getByRole('searchbox'));
  });
});

describe('SearchField keyboard contract', () => {
  it('documents every keyboard row', () => {
    expect(searchFieldDoc.keyboard?.map(([key]) => key)).toEqual(['Enter', 'Escape', '/ (shortcut)', 'Tab']);
  });

  it('Tab moves from the input to the clear button', async () => {
    const user = userEvent.setup();
    render(<SearchField aria-label="Search" defaultValue="api" />);
    screen.getByRole('searchbox').focus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Clear Search' })).toHaveFocus();
  });
});

describe('SearchField examples', () => {
  it.each(['dark', 'light', 'high_contrast'])('have no axe violations in %s', async (theme) => {
    document.documentElement.className = theme === 'light' ? '' : theme;
    render(
      <>
        <SearchFieldBasic />
        <SearchFieldPending />
        <SearchFieldShortcut />
      </>,
    );
    await expectNoAxeViolations();
  });
});
