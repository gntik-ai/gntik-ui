import { DataTable } from '../DataTable';
import { generateDeployments } from '../fixtures';

const rows = generateDeployments(95);

/** Drag the parent taller to fit more whole rows; the density toggle recomputes the size too. */
export default function AutoPageSize() {
  return (
    <div className="h-[480px] min-h-64 resize-y overflow-auto">
      <DataTable rows={rows} autoPageSize defaultPage={2} />
    </div>
  );
}
