import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '../../i18n';
import DropzoneDefault from './examples/DropzoneDefault';
import DropzoneTriggerExample from './examples/DropzoneTrigger';
import DropzoneHeadlessCard from './examples/DropzoneHeadlessCard';
import DropzoneFullScreen from './examples/DropzoneFullScreen';
import { useDropzone } from './useDropzone';
import userEvent from '@testing-library/user-event';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { Dropzone, DropzoneAccept, DropzoneReject, DropzoneIdle, DropzoneTrigger, DropzoneCaption } from './Dropzone';

const transfer = (types: string[], mimeTypes: string[]) => ({
  dataTransfer: { types, items: mimeTypes.map((type) => ({ kind: 'file', type })), files: [] },
});
const csvDrag = () => transfer(['Files'], ['text/csv']);

describe('Dropzone', () => {
  it('cancels disabled file drags and drops without accepting files or changing state', () => {
    const onDrop = vi.fn();
    const onReject = vi.fn();
    render(<Dropzone disabled onDrop={onDrop} onReject={onReject} />);
    const zone = screen.getByRole('button');
    const dragOver = createEvent.dragOver(zone, csvDrag()) as DragEvent;
    fireEvent(zone, dragOver);
    expect(dragOver.defaultPrevented).toBe(true);
    expect(dragOver.dataTransfer?.dropEffect).toBe('none');
    const drop = createEvent.drop(zone, {
      dataTransfer: { types: ['Files'], files: [new File(['csv'], 'report.csv', { type: 'text/csv' })] },
    });
    fireEvent(zone, drop);
    expect(drop.defaultPrevented).toBe(true);
    expect(zone).toHaveAttribute('data-drag-state', 'idle');
    expect(zone).toHaveAttribute('aria-disabled', 'true');
    expect(onDrop).not.toHaveBeenCalled();
    expect(onReject).not.toHaveBeenCalled();
  });

  it('shows matching MIME states, keeps state across children, and ignores text drags', () => {
    render(
      <Dropzone accept=".csv,text/csv" maxFiles={1}>
        <DropzoneIdle>Idle</DropzoneIdle>
        <DropzoneAccept>
          <span>Accepted</span>
        </DropzoneAccept>
        <DropzoneReject>Rejected</DropzoneReject>
      </Dropzone>,
    );
    const zone = screen.getByRole('button');
    expect(zone).toHaveAttribute('data-drag-state', 'idle');
    fireEvent.dragEnter(zone, csvDrag());
    expect(zone).toHaveAttribute('data-drag-state', 'accept');
    expect(screen.queryByText('Idle')).not.toBeInTheDocument();
    const child = screen.getByText('Accepted');
    fireEvent.dragEnter(child, csvDrag());
    fireEvent.dragLeave(child, csvDrag());
    expect(zone).toHaveAttribute('data-drag-state', 'accept');
    fireEvent.dragLeave(zone, csvDrag());
    expect(zone).toHaveAttribute('data-drag-state', 'idle');
    fireEvent.dragEnter(zone, transfer(['Files'], ['image/png']));
    expect(zone).toHaveAttribute('data-drag-state', 'reject');
    expect(screen.queryByText('Accepted')).not.toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    fireEvent.dragLeave(zone, csvDrag());
    fireEvent.dragEnter(zone, transfer(['Files'], ['text/csv', 'text/csv']));
    expect(zone).toHaveAttribute('data-drag-state', 'reject');
    fireEvent.dragLeave(zone, csvDrag());
    fireEvent.dragEnter(zone, transfer(['text/uri-list'], []));
    expect(zone).toHaveAttribute('data-drag-state', 'idle');
    fireEvent.dragEnter(zone, transfer(['Files'], ['']));
    expect(zone).toHaveAttribute('data-drag-state', 'accept');
    fireEvent.dragOver(zone, transfer(['Files'], ['image/png']));
    expect(zone).toHaveAttribute('data-drag-state', 'reject');
  });
  it('validates a mixed drop and politely announces accepted and rejected counts', () => {
    const onDrop = vi.fn();
    const onReject = vi.fn();
    render(<Dropzone accept=".csv" maxSize={25_000_000} onDrop={onDrop} onReject={onReject} />);
    const a = new File([new Uint8Array(2_000_000)], 'a.csv');
    const b = new File(['png'], 'b.png', { type: 'image/png' });
    const c = new File([new Uint8Array(30_000_000)], 'c.csv');
    fireEvent.drop(screen.getByRole('button'), { dataTransfer: { types: ['Files'], files: [a, b, c] } });
    const rejected = [
      { file: b, reasons: ['type'] },
      { file: c, reasons: ['size'] },
    ];
    expect(onDrop).toHaveBeenCalledWith([a], rejected);
    expect(onReject).toHaveBeenCalledWith(rejected);
    expect(screen.getByRole('status')).toHaveTextContent('1 file added. 2 rejected.');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByRole('button')).toHaveAttribute('data-drag-state', 'idle');
  });

  it('is one named tab stop, opens on click, Enter and Space, and resets repeated picks', async () => {
    const onDrop = vi.fn();
    const { container } = render(<Dropzone onDrop={onDrop} />);
    const zone = screen.getByRole('button', { name: 'Drop files here' });
    const input = container.querySelector('input')!;
    const click = vi.spyOn(input, 'click').mockImplementation(() => {});
    await userEvent.tab();
    expect(zone).toHaveFocus();
    await userEvent.keyboard('{Enter} ');
    await userEvent.click(zone);
    expect(click).toHaveBeenCalledTimes(3);
    const file = new File(['csv'], 'a.csv');
    // A nonempty fake path verifies reset, not merely repeated synthetic change events.
    let value = 'C:/fakepath/a.csv';
    Object.defineProperty(input, 'value', {
      configurable: true,
      get: () => value,
      set: (v: string) => {
        value = v;
      },
    });
    fireEvent.change(input, { target: { files: [file] } });
    expect(input.value).toBe('');
    const firstAnnouncement = screen.getByRole('status').textContent;
    value = 'C:/fakepath/a.csv';
    fireEvent.change(input, { target: { files: [file] } });
    expect(input.value).toBe('');
    expect(onDrop).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('status').textContent).not.toBe(firstAnnouncement);
    expect(screen.getByRole('status')).toHaveTextContent('1 file added.');
    await userEvent.tab();
    expect(zone).not.toHaveFocus();
  });

  it('uses only the trigger as a tab stop in trigger mode and ignores disabled interaction', async () => {
    const onDrop = vi.fn();
    const { container, rerender } = render(
      <Dropzone activateOnClick={false} data-testid="zone" onDrop={onDrop}>
        <DropzoneTrigger />
      </Dropzone>,
    );
    const zone = screen.getByTestId('zone');
    expect(zone).not.toHaveAttribute('role');
    expect(zone).not.toHaveAttribute('tabindex');
    const input = container.querySelector('input')!;
    const click = vi.spyOn(input, 'click').mockImplementation(() => {});
    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();
    await userEvent.click(screen.getByRole('button'));
    expect(click).toHaveBeenCalledOnce();
    rerender(
      <Dropzone disabled onDrop={onDrop} data-testid="zone">
        <DropzoneTrigger />
      </Dropzone>,
    );
    expect(zone).toHaveAttribute('aria-disabled', 'true');
    fireEvent.dragEnter(zone, csvDrag());
    fireEvent.dragOver(zone, csvDrag());
    fireEvent.drop(zone, { dataTransfer: { types: ['Files'], files: [new File(['x'], 'x.csv')] } });
    fireEvent.click(zone);
    fireEvent.keyDown(zone, { key: 'Enter' });
    fireEvent.keyDown(zone, { key: ' ' });
    expect(onDrop).not.toHaveBeenCalled();
    expect(click).toHaveBeenCalledOnce();
    expect(zone).toHaveAttribute('data-drag-state', 'idle');
  });

  it('portals a full-screen file target, drops anywhere, closes on leave or Escape and removes listeners', () => {
    const onDrop = vi.fn();
    const { container, unmount } = render(<Dropzone fullScreen onDrop={onDrop} data-testid="overlay" />);
    expect(screen.queryByTestId('overlay')).not.toBeInTheDocument();
    fireEvent.dragEnter(window, transfer(['text/plain'], []));
    expect(screen.queryByTestId('overlay')).not.toBeInTheDocument();
    fireEvent.dragEnter(window, csvDrag());
    const overlay = screen.getByTestId('overlay');
    expect(container).not.toContainElement(overlay);
    expect(overlay).toHaveClass('fixed', 'inset-0');
    // Nested page/overlay events must not hide it.
    fireEvent.dragEnter(overlay, csvDrag());
    fireEvent.dragLeave(overlay, csvDrag());
    expect(overlay).toBeInTheDocument();
    const file = new File(['csv'], 'a.csv');
    fireEvent.drop(document.body, { dataTransfer: { types: ['Files'], files: [file] } });
    expect(onDrop).toHaveBeenCalledExactlyOnceWith([file], []);
    expect(screen.queryByTestId('overlay')).not.toBeInTheDocument();
    fireEvent.dragEnter(window, csvDrag());
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('overlay')).not.toBeInTheDocument();
    fireEvent.dragEnter(window, csvDrag());
    fireEvent.dragLeave(window, csvDrag());
    expect(screen.queryByTestId('overlay')).not.toBeInTheDocument();
    unmount();
    fireEvent.dragEnter(window, csvDrag());
    fireEvent.drop(document.body, { dataTransfer: { types: ['Files'], files: [file] } });
    expect(onDrop).toHaveBeenCalledOnce();
  });

  it('supports a headless div with validation and open()', () => {
    const onDrop = vi.fn();
    function Headless() {
      const zone = useDropzone({ accept: 'image/*', activateOnClick: false, onDrop });
      return (
        <>
          <div {...zone.rootProps} data-testid="headless">
            <button onClick={zone.open}>Open</button>
          </div>
          <input {...zone.inputProps} />
        </>
      );
    }
    const { container } = render(<Headless />);
    const root = screen.getByTestId('headless');
    expect(root).not.toHaveAttribute('role');
    fireEvent.dragEnter(root, transfer(['Files'], ['text/csv']));
    expect(root).toHaveAttribute('data-drag-state', 'reject');
    fireEvent.dragOver(root, transfer(['Files'], ['image/png']));
    expect(root).toHaveAttribute('data-drag-state', 'accept');
    const png = new File(['png'], 'a.png', { type: 'image/png' });
    fireEvent.drop(root, { dataTransfer: { types: ['Files'], files: [png] } });
    expect(onDrop).toHaveBeenCalledWith([png], []);
    const click = vi.spyOn(container.querySelector('input')!, 'click').mockImplementation(() => {});
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(click).toHaveBeenCalledOnce();
  });

  it.each(['dark', 'light', 'high_contrast'])('examples and active states are axe clean in %s', async (theme) => {
    document.documentElement.classList.add(theme);
    try {
      for (const Example of [DropzoneDefault, DropzoneTriggerExample, DropzoneHeadlessCard, DropzoneFullScreen]) {
        const view = render(<Example />);
        await expectNoAxeViolations();
        fireEvent.dragEnter(window, csvDrag());
        const target = document.querySelector('[data-drag-state]');
        if (target) {
          fireEvent.dragEnter(target, csvDrag());
          await expectNoAxeViolations();
          fireEvent.dragOver(target, transfer(['Files'], ['image/png']));
          await expectNoAxeViolations();
        }
        view.unmount();
      }
    } finally {
      document.documentElement.classList.remove(theme);
    }
  });

  it('localizes the default copy and caption, supports render and limits multiple=false', () => {
    const onDrop = vi.fn();
    render(
      <I18nProvider locale="es">
        <Dropzone accept=".csv" maxSize={25_000_000} multiple={false} onDrop={onDrop} render={<span />}>
          <DropzoneIdle>CSV</DropzoneIdle>
          <DropzoneCaption />
        </Dropzone>
      </I18nProvider>,
    );
    const zone = screen.getByRole('button', { name: 'Suelta archivos aquí' });
    expect(zone.tagName).toBe('SPAN');
    expect(screen.getByText('CSV · máx. 25 MB por archivo')).toBeInTheDocument();
    const a = new File(['a'], 'a.csv');
    const b = new File(['b'], 'b.csv');
    fireEvent.dragEnter(zone, transfer(['Files'], ['text/csv', 'text/csv']));
    expect(zone).toHaveAttribute('data-drag-state', 'reject');
    fireEvent.drop(zone, { dataTransfer: { types: ['Files'], files: [a, b] } });
    expect(onDrop).toHaveBeenCalledWith([a], [{ file: b, reasons: ['count'] }]);
    expect(screen.getByRole('status')).toHaveTextContent('1 archivo añadido. 1 rechazado.');
  });
  it('resets an active drag when disabled and ignores non-file leave events', () => {
    const { rerender } = render(<Dropzone data-testid="zone" />);
    const zone = screen.getByTestId('zone');
    fireEvent.dragEnter(zone, csvDrag());
    fireEvent.dragLeave(zone, transfer(['text/plain'], []));
    expect(zone).toHaveAttribute('data-drag-state', 'accept');
    rerender(<Dropzone disabled data-testid="zone" />);
    expect(zone).toHaveAttribute('data-drag-state', 'idle');
    rerender(<Dropzone data-testid="zone" />);
    expect(zone).toHaveAttribute('data-drag-state', 'idle');
    fireEvent.dragEnter(zone, csvDrag());
    fireEvent.dragLeave(zone, csvDrag());
    expect(zone).toHaveAttribute('data-drag-state', 'idle');
  });

  it('keeps the full-screen overlay when entering it from the page body', () => {
    render(<Dropzone fullScreen data-testid="overlay" />);
    fireEvent.dragEnter(document.body, csvDrag());
    fireEvent.dragEnter(screen.getByTestId('overlay'), csvDrag());
    fireEvent.dragLeave(document.body, csvDrag());
    expect(screen.getByTestId('overlay')).toBeInTheDocument();
  });
});
