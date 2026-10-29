import { useState } from 'react';
import { Button } from '../../components/Button';
import { readLocalStorageValue, useLocalStorage, useSessionStorage } from '../useLocalStorage';

type Density = 'comfortable' | 'compact';
const densityKey = 'catalog:settings:density';
const isDensity = (value: unknown): value is Density => value === 'comfortable' || value === 'compact';

function SharedDensity() {
  const [density] = useLocalStorage<Density>(densityKey, 'comfortable', { validate: isDensity });
  return <output aria-label="Shared density">Another component: {density}</output>;
}

export default function StorageExample() {
  const [density, setDensity, removeDensity] = useLocalStorage<Density>(densityKey, 'comfortable', {
    validate: isDensity,
  });
  const [visits, setVisits, removeVisits] = useSessionStorage('catalog:settings:visits', 0);
  const [saved, setSaved] = useState<Density>('comfortable');
  return (
    <div className="flex flex-col gap-4 text-sm text-foreground">
      <output aria-label="Density">Density: {density}</output>
      <SharedDensity />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setDensity('compact')}>Use compact density</Button>
        <Button variant="secondary" onClick={removeDensity}>
          Reset density
        </Button>
        <Button
          variant="secondary"
          onClick={() => setSaved(readLocalStorageValue<Density>(densityKey, 'comfortable', { validate: isDensity }))}
        >
          Read saved density
        </Button>
      </div>
      <output aria-label="Saved density">Last explicit read: {saved}</output>
      <p className="text-muted-foreground">Open this example in another tab to see density changes sync.</p>
      <output aria-label="Session visits">Visits in this tab: {visits}</output>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setVisits((count) => count + 1)}>
          Add session visit
        </Button>
        <Button variant="secondary" onClick={removeVisits}>
          Reset session visits
        </Button>
      </div>
    </div>
  );
}
