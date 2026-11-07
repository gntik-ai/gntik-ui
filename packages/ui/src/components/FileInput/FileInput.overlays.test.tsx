import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../Dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { FileInput } from './FileInput';
import { FileTrigger } from './FileTrigger';
import { useFileDialog } from './useFileDialog';
import { PortalContainerContext } from '../../utils/portal';

function HookTrigger({ onSelect }: { onSelect: (files: File[]) => void }) {
  const { open } = useFileDialog({ onChange: onSelect });
  return (
    <button type="button" onClick={() => open()}>
      Import files
    </button>
  );
}

it.each(['body', 'portal container'])(
  'keeps a page-owned hook picker attached to %s after its activating Popover closes',
  async (host) => {
    const onSelect = vi.fn();
    const container = host === 'portal container' ? document.createElement('div') : undefined;
    if (container) document.body.append(container);
    function Page() {
      const { open, files } = useFileDialog({ onChange: onSelect });
      return (
        <>
          <output aria-label="Selected file">{files[0]?.name}</output>
          <Popover>
            <PopoverTrigger>Open files</PopoverTrigger>
            <PopoverContent aria-label="Files">
              <button type="button" onClick={open}>
                Import files
              </button>
            </PopoverContent>
          </Popover>
        </>
      );
    }
    const view = render(
      <PortalContainerContext.Provider value={container}>
        <Page />
      </PortalContainerContext.Provider>,
    );
    const picker = document.querySelector<HTMLInputElement>('input[type=file]')!;
    expect(picker.parentElement).toBe(container ?? document.body);
    await userEvent.click(screen.getByRole('button', { name: 'Open files' }));
    await userEvent.click(screen.getByRole('button', { name: 'Import files' }));
    expect(screen.getByRole('dialog', { name: 'Files' })).toContainElement(picker);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Files' })).not.toBeInTheDocument());
    await waitFor(() => expect(picker).toBeInTheDocument());
    expect(picker.parentElement).toBe(container ?? document.body);
    expect(document.querySelectorAll('input[type=file]')).toHaveLength(1);
    // A chooser can finish after the overlay closes while the hook remains mounted.
    const first = new File(['first'], 'first.json');
    fireEvent.change(picker, { target: { files: [first] } });
    expect(screen.getByRole('status', { name: 'Selected file' })).toHaveTextContent('first.json');
    expect(onSelect).toHaveBeenCalledExactlyOnceWith([first]);
    await userEvent.click(screen.getByRole('button', { name: 'Open files' }));
    await userEvent.click(screen.getByRole('button', { name: 'Import files' }));
    const second = new File(['second'], 'second.json');
    fireEvent.change(picker, { target: { files: [second] } });
    expect(screen.getByRole('status', { name: 'Selected file' })).toHaveTextContent('second.json');
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenLastCalledWith([second]);
    expect(document.querySelector('input[type=file]')).toBe(picker);
    view.unmount();
    // Let queued mutation callbacks run: cleanup must not resurrect the picker.
    await Promise.resolve();
    expect(picker).not.toBeInTheDocument();
    container?.remove();
  },
);

describe.each(['Popover', 'non-modal Dialog', 'modal Dialog'])('%s', (overlay) => {
  it.each(['FileInput', 'FileTrigger', 'useFileDialog'])(
    'keeps %s mounted through selection and cancellation',
    async (kind) => {
      const onSelect = vi.fn();
      const content = (
        <section aria-label="File action">
          {kind === 'FileInput' ? (
            <FileInput onValueChange={onSelect} />
          ) : kind === 'FileTrigger' ? (
            <FileTrigger onSelect={onSelect}>Import files</FileTrigger>
          ) : (
            <HookTrigger onSelect={onSelect} />
          )}
        </section>
      );
      const view = render(
        overlay === 'Popover' ? (
          <Popover defaultOpen>
            <PopoverTrigger>Open files</PopoverTrigger>
            <PopoverContent aria-label="Files">{content}</PopoverContent>
          </Popover>
        ) : (
          <Dialog defaultOpen modal={overlay === 'modal Dialog'}>
            <DialogTrigger>Open files</DialogTrigger>
            <DialogContent>
              <DialogTitle>Files</DialogTitle>
              {content}
            </DialogContent>
          </Dialog>
        ),
      );
      const panel = screen.getByRole('dialog', { name: 'Files' });
      await waitFor(() => expect(panel).toBeVisible());
      const trigger = screen.getByRole('button', { name: /Choose file|Import files/ });
      const picker = document.querySelector<HTMLInputElement>('input[type=file]')!;
      const file = new File(['credentials'], 'key.json');
      trigger.focus();
      // No click spy: the native picker click must reach the overlay's event handlers.
      fireEvent.click(trigger);
      await waitFor(() => expect(panel).toBeVisible());
      expect(picker).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'File action' }).querySelector('input[type=file]')).toBeNull();
      fireEvent.change(picker, { target: { files: [file] } });
      expect(onSelect).toHaveBeenCalledExactlyOnceWith(kind === 'FileInput' ? file : [file]);
      fireEvent.click(trigger);
      fireEvent(picker, new Event('cancel'));
      fireEvent.change(picker, { target: { files: [] } });
      expect(onSelect).toHaveBeenCalledOnce();
      expect(panel).toBeVisible();
      if (kind === 'FileInput') expect(trigger).toHaveTextContent('key.json');
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Files' })).not.toBeInTheDocument());
      expect(picker).not.toBeInTheDocument();
      view.unmount();
    },
  );
});
