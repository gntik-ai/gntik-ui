import { LoadMoreFooter } from '../LoadMoreFooter';

/** Exhausted lists have no controls, including when a settled error remains visible. */
export default function ExhaustedExample() {
  return <LoadMoreFooter nextCursor={null} loadedCount={40} error="Request failed" />;
}
