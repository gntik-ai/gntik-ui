import { Hero } from '../../Hero/Hero';
import { LogoCloud } from '../LogoCloud';
import { sampleLogos } from '../fixtures';

/** A separate section after Hero; the Hero API and landing template stay unchanged. */
export default function UnderHero() {
  return (
    <div>
      <Hero media={null} />
      <LogoCloud logos={sampleLogos} />
    </div>
  );
}
