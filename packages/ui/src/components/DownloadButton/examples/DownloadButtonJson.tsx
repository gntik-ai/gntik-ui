import { useState } from 'react';
import { DownloadButton } from '../index';

/** A Blob supplies its own MIME type. This one-time action disables after saving. */
export default function DownloadButtonJson() {
  const [saved, setSaved] = useState(false);
  return (
    <DownloadButton
      data={() => new Blob([JSON.stringify({ count: 42 }, null, 2)], { type: 'application/json' })}
      fileName="report.json"
      variant="soft"
      disabled={saved}
      onDownloaded={() => setSaved(true)}
    />
  );
}
