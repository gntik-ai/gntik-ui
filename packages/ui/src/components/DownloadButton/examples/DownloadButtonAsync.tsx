import { useState } from 'react';
import { DownloadButton, toCsv } from '../index';

/** The secondary button fails once; activating it again retries successfully. */
export default function DownloadButtonAsync() {
  const [failed, setFailed] = useState(false);
  const getCsv = () =>
    new Promise<string>((resolve) => {
      setTimeout(() => resolve(toCsv([{ count: 42 }], [{ header: 'Count', value: 'count' }])), 500);
    });
  return (
    <div className="flex flex-wrap gap-3">
      <DownloadButton data={getCsv} fileName="report.csv" mimeType="text/csv" />
      <DownloadButton
        variant="secondary"
        data={async () => {
          if (!failed) throw new Error('Example export unavailable');
          return getCsv();
        }}
        fileName="retry.csv"
        mimeType="text/csv"
        onDownloadError={() => setFailed(true)}
      />
    </div>
  );
}
