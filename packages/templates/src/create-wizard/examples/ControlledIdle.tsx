import FlowExample from './FlowExample';

/** A snapshot of caller-owned submit state. See template.meta.ts for the abort-aware handler. */
export default function ControlledIdle() {
  return <FlowExample submitState={{ status: 'idle' }} />;
}
