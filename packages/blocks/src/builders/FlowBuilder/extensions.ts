import type { FlowNodeRenderer, FlowTone } from '@gntik-ai/flow';
import type { FlowEdge } from './fixtures';

/** Connection plus node type identifiers, for consumer edge mapping and validation. */
export interface FlowConnection {
  source: string;
  target: string;
  sourceHandle: string | null;
  targetHandle: string | null;
  sourceType: string;
  targetType: string;
}

export interface FlowValidationIssue {
  code: string;
  nodeId?: string;
  message: string;
}

export interface FlowConnectionRejection extends FlowValidationIssue {
  nodeId: string;
}

export interface FlowBuilderExtensions {
  mode?: 'edit' | 'run';
  nodeStatus?: Readonly<Record<string, FlowTone | undefined>>;
  onNodeSelect?: (id: string) => void;
  validationIssues?: readonly FlowValidationIssue[];
  nodeTypes?: readonly FlowNodeRenderer[];
  /** Return edge kind and payload; endpoints always come from the connection. */
  onConnectEdge?: (connection: FlowConnection) => Pick<FlowEdge, 'type' | 'data'>;
  /** Return true to accept, false for a generic rejection, or an issue for a specific reason. Pure: called during dragging. */
  isValidConnection?: (connection: FlowConnection) => boolean | FlowValidationIssue;
  onConnectionRejected?: (issue: FlowConnectionRejection) => void;
  /** Called only after an accepted connection has been added. */
  onConnect?: (connection: FlowConnection) => void;
}
