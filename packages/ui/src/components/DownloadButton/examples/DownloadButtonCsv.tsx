import { DownloadButton, toCsv } from '../index';

/** A static CSV with safe defaults: header, CRLF and formula escaping. */
export default function DownloadButtonCsv() {
  const data = toCsv(
    [{ name: 'Ana López', note: '=SUM(A1)' }],
    [
      { header: 'Name', value: 'name' },
      { header: 'Note', value: 'note' },
    ],
  );
  return <DownloadButton data={data} fileName="report.csv" mimeType="text/csv" />;
}
