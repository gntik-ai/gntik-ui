import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useChatI18n } from '../utils/i18n';
import { SurfaceFocusBoundary } from './SurfaceFocusBoundary';
import { consume, emptyStream } from './stream';
import { bindingPath, isRecord, resolveValue, safeProperties, validAction } from './model';
import { setPointer } from './pointer';
import type { AgentCatalog } from './catalog';
import type { A2uiMessage, AgentComponent, AgentAction, AgentSurfaceError } from './protocol';

export interface AgentSurfaceProps {
  /** Immutable command log: append messages to update the rendered surfaces. */
  messages: A2uiMessage[];
  /** Trusted allow-list, created by the host rather than the agent. */
  catalog: AgentCatalog;
  onAction?: (action: AgentAction) => void;
  onError?: (error: AgentSurfaceError) => void;
}
export function AgentSurface({ messages, catalog, onError, onAction }: AgentSurfaceProps) {
  const { tc } = useChatI18n();
  const reported = useRef(new Set<string>());
  const errors: AgentSurfaceError[] = [];
  const [state, setState] = useState(emptyStream);
  if (state.messages !== messages) setState(consume(state, messages));
  errors.push(...state.errors);
  function renderNode(surfaceId: string, nodes: Map<string, AgentComponent>, id: string): ReactNode {
    const node = nodes.get(id);
    if (!node) return null;
    const entry = Object.hasOwn(catalog, node.component) ? catalog[node.component] : undefined;
    const surface = state.surfaces.get(surfaceId)!;
    let props: Record<string, unknown> | null = null;
    try {
      const input = safeProperties(node, surface.model);
      if (validAction(input.action)) props = entry?.validate(input) ?? null;
    } catch {
      /* Invalid paths and validators produce the same neutral placeholder. */
    }
    if (!entry || !props) {
      errors.push({ code: entry ? 'props' : 'component', surfaceId, componentId: id, type: node.component });
      return (
        <p key={id} className="text-muted-foreground">
          {tc('chat.surfaceUnsupported')}
        </p>
      );
    }
    const Component = entry.component;
    return (
      <Component
        key={id}
        props={props}
        onValueChange={(value) => {
          const path = bindingPath(node.value ?? node.checked);
          if (path === undefined) return;
          setState((current) => {
            const surface = current.surfaces.get(surfaceId);
            if (!surface) return current;
            const surfaces = new Map(current.surfaces);
            surfaces.set(surfaceId, { ...surface, model: setPointer(surface.model, path, value) });
            return { ...current, surfaces };
          });
        }}
        onAction={() => {
          if (!isRecord(node.action) || typeof node.action.name !== 'string') return;
          const context = resolveValue(node.action.context ?? {}, surface.model);
          if (isRecord(context)) onAction?.({ name: node.action.name, surfaceId, context });
        }}
      >
        {node.children?.map((child) => renderNode(surfaceId, nodes, child))}
      </Component>
    );
  }
  const content = [...state.surfaces].map(([id, surface]) => (
    <section
      key={id}
      data-agent-surface={id}
      aria-label={tc('chat.surfaceAgentContent')}
      className="rounded-lg border border-border bg-background p-3"
    >
      <p className="mb-3 text-xs font-semibold text-muted-foreground">{tc('chat.surfaceAgentContent')}</p>
      <form onSubmit={(event) => event.preventDefault()}>
        {surface.invalid ? (
          <p className="text-muted-foreground">{tc('chat.surfaceUnsupported')}</p>
        ) : (
          renderNode(id, surface.nodes, 'root')
        )}
      </form>
    </section>
  ));
  useEffect(() => {
    for (const error of errors) {
      const key = JSON.stringify(error);
      if (!reported.current.has(key)) {
        reported.current.add(key);
        onError?.(error);
      }
    }
  });
  return (
    <SurfaceFocusBoundary
      surfaceIds={new Set(state.surfaces.keys())}
      visible={state.surfaces.size > 0 || state.deleted}
      label={tc('chat.surfaceAgentContent')}
    >
      {content}
    </SurfaceFocusBoundary>
  );
}
