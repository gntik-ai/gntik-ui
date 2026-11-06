import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../Dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import { FileInput } from './FileInput';
import { FileTrigger } from './FileTrigger';
import { useFileDialog } from './useFileDialog';

function HookTrigger({ onSelect }: { onSelect: (files: File[]) => void }) {
  const { open } = useFileDialog({ onChange: onSelect });
  return (
    <button type="button" onClick={() => open()}>
      Import files
    </button>
  );
}

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
