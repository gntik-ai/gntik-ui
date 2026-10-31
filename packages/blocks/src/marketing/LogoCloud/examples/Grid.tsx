import { LogoCloud } from '../LogoCloud';
import { sampleLogos } from '../fixtures';

/** Six, three and four columns from md; every grid uses two columns on phones. */
export default function Grid() {
  return (
    <div className="space-y-8">
      <LogoCloud logos={sampleLogos} layout="grid" columns={6} />
      <LogoCloud logos={sampleLogos} layout="grid" columns={3} />
      <LogoCloud logos={sampleLogos} layout="grid" columns={4} />
    </div>
  );
}
