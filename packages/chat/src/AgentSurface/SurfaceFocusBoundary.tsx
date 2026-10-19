import { Component, createRef, type ReactNode } from 'react';

const focusable = 'button, a[href], input, select, textarea, [tabindex], [contenteditable="true"]';
function candidates(element: Element): HTMLElement[] {
  return [element, ...element.querySelectorAll(focusable)].filter(
    (item): item is HTMLElement =>
      item instanceof HTMLElement &&
      item.matches(focusable) &&
      item.tabIndex >= 0 &&
      !item.matches(':disabled, [aria-disabled="true"], input[type="hidden"]') &&
      !item.closest('[hidden], [inert], [aria-hidden="true"]') &&
      getComputedStyle(item).display !== 'none' &&
      getComputedStyle(item).visibility !== 'hidden',
  );
}
interface Props {
  surfaceIds: ReadonlySet<string>;
  visible: boolean;
  label: string;
  children: ReactNode;
}
interface FocusSnapshot {
  siblings: Element[];
}

/** Capture focus before React removes DOM; restore after all deleted surfaces are gone. */
export class SurfaceFocusBoundary extends Component<Props> {
  private host = createRef<HTMLDivElement>();

  getSnapshotBeforeUpdate(): FocusSnapshot | null {
    const host = this.host.current;
    const active = document.activeElement;
    if (!host || !(active instanceof HTMLElement)) return null;
    let frame = host.contains(active) ? active.closest<HTMLElement>('[data-agent-surface]') : null;
    // Base UI Select options live in a portal. aria-controls identifies their owning trigger.
    if (!frame) {
      for (const trigger of host.querySelectorAll('[aria-controls]')) {
        const ownsFocus = (trigger.getAttribute('aria-controls') ?? '')
          .split(/\s+/)
          .some((id) => document.getElementById(id)?.contains(active));
        if (ownsFocus) {
          frame = trigger.closest<HTMLElement>('[data-agent-surface]');
          break;
        }
      }
    }
    if (!frame || this.props.surfaceIds.has(frame.dataset.agentSurface ?? '')) return null;
    const next: Element[] = [];
    // The next surface's controls, then the consumer's next focusable sibling.
    for (const start of [frame, host]) {
      let sibling = start.nextElementSibling;
      while (sibling) {
        next.push(sibling);
        sibling = sibling.nextElementSibling;
      }
    }
    return { siblings: next };
  }

  componentDidUpdate(_previous: Props, _state: unknown, snapshot: FocusSnapshot | null) {
    if (!snapshot) return;
    const restore = () => {
      // Resolve focusability after popup teardown has removed inert/aria-hidden markers.
      const next = snapshot.siblings.filter((element) => element.isConnected).flatMap(candidates);
      const composers = [...document.querySelectorAll('textarea')].flatMap(candidates);
      for (const target of [...next, ...composers, this.host.current]) {
        if (!target) continue;
        target.focus();
        if (document.activeElement === target) return;
      }
    };
    restore();
    queueMicrotask(() => {
      if (document.activeElement === document.body || document.activeElement === this.host.current) restore();
    });
  }

  render() {
    if (!this.props.visible) return null;
    return (
      <div
        ref={this.host}
        tabIndex={-1}
        role="group"
        aria-label={this.props.label}
        className="space-y-3 outline-focus-ring"
      >
        {this.props.children}
      </div>
    );
  }
}
