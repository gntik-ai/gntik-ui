import userEvent from '@testing-library/user-event';
import { act, fireEvent, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { PortalContainerContext } from '../../utils/portal';
import { useFileDialog } from './useFileDialog';

const picker = () => document.querySelector<HTMLInputElement>('input[type=file]')!;

describe('useFileDialog', () => {
  it('attaches one hidden picker, preserves cancelled selections, resets and cleans up', async () => {
    const onChange = vi.fn();
    const { result, rerender, unmount } = renderHook(() => useFileDialog({ onChange }));
    expect(picker()).toHaveAttribute('hidden');
    expect(picker()).toHaveAttribute('tabindex', '-1');
    const file = new File(['key'], 'key.json');
    await userEvent.upload(picker(), file);
    expect(picker().value).not.toBe('');
    expect(result.current.files).toEqual([file]);
    expect(onChange).toHaveBeenCalledExactlyOnceWith([file]);
    const click = vi.spyOn(picker(), 'click');
    act(() => result.current.open());
    expect(click).toHaveBeenCalledOnce();
    expect(picker().value).toBe('');
    fireEvent(picker(), new Event('cancel'));
    fireEvent.change(picker(), { target: { files: [] } });
    expect(result.current.files).toEqual([file]);
    expect(onChange).toHaveBeenCalledOnce();
    rerender();
    expect(document.querySelectorAll('input[type=file]')).toHaveLength(1);
    act(() => result.current.reset());
    expect(result.current.files).toEqual([]);
    expect(onChange).toHaveBeenCalledOnce();
    unmount();
    expect(picker()).toBeNull();
  });

  it('uses the portal container and updates attributes and callbacks without replacing the picker', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const onChange = vi.fn();
    const latest = vi.fn();
    const { rerender, result, unmount } = renderHook(
      ({ disabled, onChange }) =>
        useFileDialog({ accept: '.yaml', multiple: true, directory: true, capture: 'environment', disabled, onChange }),
      {
        initialProps: { disabled: false, onChange },
        wrapper: ({ children }) => (
          <PortalContainerContext.Provider value={container}>{children}</PortalContainerContext.Provider>
        ),
      },
    );
    const input = picker();
    expect(input.parentElement).toBe(container);
    expect(input).toHaveAttribute('accept', '.yaml');
    expect(input.multiple).toBe(true);
    expect(input).toHaveAttribute('webkitdirectory');
    expect(input).toHaveAttribute('capture', 'environment');
    rerender({ disabled: true, onChange: latest });
    const click = vi.spyOn(input, 'click');
    act(() => result.current.open());
    fireEvent.change(input, { target: { files: [new File(['x'], 'x.yaml')] } });
    expect(click).not.toHaveBeenCalled();
    expect(latest).not.toHaveBeenCalled();
    rerender({ disabled: false, onChange: latest });
    fireEvent.change(input, { target: { files: [new File(['x'], 'x.yaml')] } });
    expect(latest).toHaveBeenCalledOnce();
    expect(input).toBe(picker());
    unmount();
    container.remove();
  });

  it('renders no markup and never creates an input during server rendering', () => {
    function Example() {
      useFileDialog();
      return null;
    }
    const create = vi.spyOn(document, 'createElement');
    expect(renderToString(<Example />)).toBe('');
    expect(create).not.toHaveBeenCalled();
    create.mockRestore();
  });
});
