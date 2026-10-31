import { LogoCloud } from '../LogoCloud';

/** Empty input produces no caption, list or dangling ARIA reference. */
export default function Empty() {
  return <LogoCloud logos={[]} />;
}
