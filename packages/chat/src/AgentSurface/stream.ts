import { setPointer } from './pointer';
import { parseMessage, validGraph, type A2uiMessage, type AgentComponent, type AgentSurfaceError } from './protocol';

export interface SurfaceState {
  nodes: Map<string, AgentComponent>;
  model: unknown;
  invalid?: boolean;
}
export interface StreamState {
  messages: A2uiMessage[];
  surfaces: Map<string, SurfaceState>;
  deleted: boolean;
  blocked: Set<string>;
  errors: AgentSurfaceError[];
}
export const emptyStream = (): StreamState => ({
  messages: [],
  deleted: false,
  surfaces: new Map(),
  blocked: new Set(),
  errors: [],
});

export function consume(previous: StreamState, messages: A2uiMessage[]): StreamState {
  const append = previous.messages.every((message, index) => messages[index] === message);
  const base = append ? previous : emptyStream();
  const state = {
    messages,
    deleted: base.deleted,
    surfaces: new Map(base.surfaces),
    blocked: new Set(base.blocked),
    errors: [...base.errors],
  };
  for (const input of messages.slice(base.messages.length)) {
    const parsed = parseMessage(input);
    if ('error' in parsed) {
      if (parsed.error.code === 'version') {
        state.blocked.add(parsed.error.surfaceId);
        state.surfaces.delete(parsed.error.surfaceId);
      }
      state.errors.push(parsed.error);
      continue;
    }
    const message = parsed.message;
    const payload =
      'createSurface' in message
        ? message.createSurface
        : 'updateComponents' in message
          ? message.updateComponents
          : 'updateDataModel' in message
            ? message.updateDataModel
            : message.deleteSurface;
    const { surfaceId } = payload;
    if (state.blocked.has(surfaceId)) continue;
    if ('createSurface' in message) {
      if (!state.surfaces.has(surfaceId)) {
        if (state.surfaces.size >= 32) state.errors.push({ code: 'message', surfaceId });
        else state.surfaces.set(surfaceId, { nodes: new Map(), model: {} });
      }
      continue;
    }
    const surface = state.surfaces.get(surfaceId);
    if (!surface) {
      state.errors.push({ code: 'message', surfaceId });
      continue;
    }
    if ('updateComponents' in message) {
      const nodes = new Map(surface.nodes);
      for (const node of message.updateComponents.components) {
        const old = nodes.get(node.id);
        nodes.set(node.id, { ...(old?.component === node.component ? old : {}), ...node });
      }
      const invalid = !validGraph(nodes);
      if (invalid) state.errors.push({ code: 'graph', surfaceId });
      state.surfaces.set(surfaceId, { ...surface, nodes: invalid ? surface.nodes : nodes, invalid });
    }
    if ('updateDataModel' in message) {
      try {
        const { path = '', value } = message.updateDataModel;
        state.surfaces.set(surfaceId, { ...surface, model: setPointer(surface.model, path, value) });
      } catch {
        state.errors.push({ code: 'binding', surfaceId });
      }
    }
    if ('deleteSurface' in message) {
      state.surfaces.delete(surfaceId);
      state.deleted = true;
    }
  }
  // An unsupported version suppresses all rendering and other diagnostics for that surface.
  state.errors = state.errors.filter((error) => !state.blocked.has(error.surfaceId) || error.code === 'version');
  return state;
}
