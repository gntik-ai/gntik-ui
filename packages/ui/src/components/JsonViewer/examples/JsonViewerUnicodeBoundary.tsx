import { JsonViewer } from '../JsonViewer';

export default function JsonViewerUnicodeBoundary() {
  return (
    <div className="grid w-full max-w-lg gap-3">
      <p className="text-sm text-muted-foreground">
        A complete supplementary character at 4096 units stays in the tree.
      </p>
      <JsonViewer label="Exact Unicode boundary" data={'a'.repeat(4094) + '😀'} maxDisplayChars={4096} />
      <p className="text-sm text-muted-foreground">A character split by the cap is dropped before the ellipsis.</p>
      <JsonViewer
        label="Split Unicode boundary"
        data={'a'.repeat(4095) + '😀'}
        maxDisplayChars={4096}
        maxHeight={160}
      />
    </div>
  );
}
