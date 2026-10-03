import { FlowBuilder as Builder } from '../components/blocks/builders/FlowBuilder';
import { FlowBuilder } from 'some-other-lib';

export const A = () => <Builder defaultConsoleEntries={[]} />;
export const B = () => <FlowBuilder consoleEntries={[]} />;
