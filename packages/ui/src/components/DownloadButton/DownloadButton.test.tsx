import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import DownloadButtonCsv from './examples/DownloadButtonCsv';
import DownloadButtonAsync from './examples/DownloadButtonAsync';
import DownloadButtonJson from './examples/DownloadButtonJson';
import { I18nProvider } from '../../i18n';
import { LiveAnnouncer } from '../LiveAnnouncer';
import { DownloadButton } from './DownloadButton';
import { downloadFile } from './download';

let clickedAnchors: HTMLAnchorElement[];
const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:download-test');
const revokeObjectURL = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  clickedAnchors = [];
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = revokeObjectURL;
    },
  );
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    expect(revokeObjectURL).not.toHaveBeenCalled();
    expect(this.isConnected).toBe(true);
    clickedAnchors.push(this);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('DownloadButton', () => {
  it('saves one typed Blob with the requested name, then releases its URL on the next task', async () => {
    const onDownloaded = vi.fn();
    const BlobConstructor = vi.spyOn(globalThis, 'Blob');
    render(
      <DownloadButton data="a,b" fileName="report.csv" mimeType="text/csv" onDownloaded={onDownloaded}>
        Export
      </DownloadButton>,
    );
    await act(async () => screen.getByRole('button', { name: 'Export' }).click());
    expect(BlobConstructor).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(createObjectURL.mock.calls[0]?.[0]).toBeInstanceOf(Blob);
    expect((createObjectURL.mock.calls[0]?.[0] as Blob).type).toBe('text/csv');
    expect(clickedAnchors).toHaveLength(1);
    expect(clickedAnchors[0]).toHaveAttribute('download', 'report.csv');
    expect(clickedAnchors[0]).toHaveAttribute('href', 'blob:download-test');
    expect(document.querySelector('a[download]')).toBeNull();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    expect(onDownloaded).toHaveBeenCalledTimes(1);
    act(() => vi.runOnlyPendingTimers());
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:download-test');
  });

  it('uses the existing Blob type or the plain-text default, and permits an explicit override', () => {
    const data = new Blob(['{}'], { type: 'application/json' });
    downloadFile(data, 'data.json');
    expect(createObjectURL).toHaveBeenLastCalledWith(data);
    downloadFile('text', 'data.txt');
    expect((createObjectURL.mock.calls[1]?.[0] as Blob).type).toBe('text/plain;charset=utf-8');
    downloadFile(new Blob(['text']), 'data.txt');
    expect((createObjectURL.mock.calls[2]?.[0] as Blob).type).toBe('text/plain;charset=utf-8');
    downloadFile(data, 'data.txt', 'text/plain');
    expect((createObjectURL.mock.calls[3]?.[0] as Blob).type).toBe('text/plain');
  });

  it('does nothing when object URLs are unavailable', () => {
    Object.defineProperty(URL, 'createObjectURL', { value: undefined, configurable: true });
    expect(() => downloadFile('text', 'data.txt')).not.toThrow();
    expect(clickedAnchors).toHaveLength(0);
    expect(revokeObjectURL).not.toHaveBeenCalled();
  });
});

it('stays focusable while pending and ignores repeats even before React renders', async () => {
  vi.useRealTimers();
  let resolve!: (value: string) => void;
  const pending = new Promise<string>((done) => {
    resolve = done;
  });
  const getter = vi.fn(() => pending);
  render(<DownloadButton data={getter} fileName="report.csv" />);
  const button = screen.getByRole('button', { name: 'Download' });
  button.focus();
  act(() => {
    button.click();
    button.click();
    button.click();
    button.click();
  });
  expect(getter).toHaveBeenCalledTimes(1);
  expect(button).toHaveAttribute('aria-busy', 'true');
  expect(button).not.toBeDisabled();
  expect(button).toHaveFocus();
  expect(clickedAnchors).toHaveLength(0);
  const user = userEvent.setup();
  await user.tab();
  await user.tab();
  expect(button).toHaveFocus();
  await act(async () => resolve('a,b'));
  expect(clickedAnchors).toHaveLength(1);
  expect(button).not.toHaveAttribute('aria-busy');
  expect(button).toHaveFocus();
});

it.each([
  ['en', false, 'Download', 'Download failed'],
  ['en', true, 'Download', 'Download failed'],
  ['es', false, 'Descargar', 'No se pudo descargar'],
  ['es', true, 'Descargar', 'No se pudo descargar'],
] as const)('announces failures politely in %s (LiveAnnouncer: %s)', async (locale, hasAnnouncer, label, message) => {
  const error = new Error('Export unavailable');
  const onDownloadError = vi.fn();
  const onDownloaded = vi.fn();
  const content = (
    <DownloadButton
      data={() => Promise.reject(error)}
      fileName="report.csv"
      onDownloadError={onDownloadError}
      onDownloaded={onDownloaded}
    />
  );
  render(
    <I18nProvider locale={locale}>{hasAnnouncer ? <LiveAnnouncer>{content}</LiveAnnouncer> : content}</I18nProvider>,
  );
  const button = screen.getByRole('button', { name: label });
  button.focus();
  await act(async () => button.click());
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status')).toHaveTextContent(message);
  expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  expect(onDownloadError).toHaveBeenCalledExactlyOnceWith(error);
  expect(onDownloaded).not.toHaveBeenCalled();
  expect(clickedAnchors).toHaveLength(0);
  expect(button).not.toHaveAttribute('aria-busy');
  expect(button).toHaveFocus();
});

it.each(['{Enter}', ' '])('downloads with keyboard activation %j', async (key) => {
  vi.useRealTimers();
  const user = userEvent.setup();
  render(<DownloadButton data="text" fileName="report.txt" />);
  await user.tab();
  expect(screen.getByRole('button')).toHaveFocus();
  await user.keyboard(key);
  expect(clickedAnchors).toHaveLength(1);
});

it('Tab moves focus to and from the button', async () => {
  vi.useRealTimers();
  const user = userEvent.setup();
  render(
    <>
      <DownloadButton data="text" fileName="report.txt" />
      <button>After</button>
    </>,
  );
  await user.tab();
  expect(screen.getByRole('button', { name: 'Download' })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
});

it.each(['dark', 'light', 'high_contrast'])('examples are axe clean in %s', async (theme) => {
  vi.useRealTimers();
  const { container } = render(
    <div data-theme={theme}>
      <DownloadButtonCsv />
      <DownloadButtonAsync />
      <DownloadButtonJson />
    </div>,
  );
  await expectNoAxeViolations(container);
});

it('does not report a completed download when object URLs are unsupported', async () => {
  Object.defineProperty(URL, 'createObjectURL', { value: undefined, configurable: true });
  const onDownloaded = vi.fn();
  render(<DownloadButton data="text" fileName="report.txt" onDownloaded={onDownloaded} />);
  await act(async () => screen.getByRole('button').click());
  expect(clickedAnchors).toHaveLength(0);
  expect(onDownloaded).not.toHaveBeenCalled();
});
