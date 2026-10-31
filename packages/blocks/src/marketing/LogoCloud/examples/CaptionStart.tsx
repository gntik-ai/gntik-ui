import { LogoCloud } from '../LogoCloud';
import { sampleLogos } from '../fixtures';

export default function CaptionStart() {
  return <LogoCloud logos={sampleLogos} captionPlacement="start" />;
}
