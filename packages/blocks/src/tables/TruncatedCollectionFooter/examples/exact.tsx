import { TruncatedCollectionFooter } from '../TruncatedCollectionFooter';

/** Count-only recipe: retain the visible count without introducing truncation messaging. */
export default function ExactExample() {
  return <TruncatedCollectionFooter visibleCount={37} hasMore={false} noun="records" />;
}
