import { PowerSearch } from '../PowerSearch';
import { deploymentFields } from './fields';

export default function PowerSearchEmpty() {
  return (
    <form className="max-w-xl" onSubmit={(e) => e.preventDefault()}>
      <PowerSearch
        aria-label="Search deployments"
        name="q"
        fields={deploymentFields}
        placeholder="Try status=failed or duration>60"
        labels={{ freeText: (t) => `Search all fields for “${t}”` }}
      />
    </form>
  );
}
