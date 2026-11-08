import { SearchField } from '../SearchField';

export default function SearchFieldShortcut() {
  return (
    <div className="grid max-w-sm gap-4">
      <SearchField aria-label="Search shortcuts" placeholder="Press / to search" shortcut="/" />
    </div>
  );
}
