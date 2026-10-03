import { useState } from 'react';
import { CodePanel } from '../CodePanel';

/** The page owns the open file (e.g. to sync it with the URL) and places the panel under an h2. */
export default function ControlledCodePanel() {
  const [file, setFile] = useState('deploy.yaml');
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[12.5px] text-muted-foreground">
        Open file: <span className="font-mono text-foreground">{file}</span>
      </p>
      <CodePanel activeFile={file} onActiveFileChange={setFile} headingLevel={4} />
    </div>
  );
}
