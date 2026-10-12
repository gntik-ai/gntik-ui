import { TruncatedCollectionFooter } from '../TruncatedCollectionFooter';

/**
 * First-page recipe: place below DataTable with paginated={false}.
 * A consumer table can reference this note with aria-describedby="records-truncation-note".
 * DataTable does not forward aria-describedby; a named containing region can reference it instead.
 */
export default function HasMoreExample() {
  return (
    <TruncatedCollectionFooter visibleCount={100} hasMore={true} noun="records" noteId="records-truncation-note" />
  );
}
