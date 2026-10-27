import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

const initial = { scale: 1, x: 0, y: 0 };
export function useDiagramViewport() {
  const [position, setPosition] = useState(initial);
  const drag = useRef<{ id: number; x: number; y: number; panX: number; panY: number } | null>(null);
  const zoom = (delta: number) =>
    setPosition((p) => ({ ...p, scale: Math.max(0.2, Math.min(4, Math.round((p.scale + delta) * 10) / 10)) }));
  const reset = () => setPosition(initial);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
    switch (event.key) {
      case '+':
      case '=':
        zoom(0.2);
        break;
      case '-':
        zoom(-0.2);
        break;
      case '0':
        reset();
        break;
      case 'ArrowLeft':
        setPosition((p) => ({ ...p, x: p.x - 24 }));
        break;
      case 'ArrowRight':
        setPosition((p) => ({ ...p, x: p.x + 24 }));
        break;
      case 'ArrowUp':
        setPosition((p) => ({ ...p, y: p.y - 24 }));
        break;
      case 'ArrowDown':
        setPosition((p) => ({ ...p, y: p.y + 24 }));
        break;
      default:
        return;
    }
    event.preventDefault();
  };
  const stop = () => {
    drag.current = null;
  };
  return {
    zoom,
    reset,
    transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
    handlers: {
      onKeyDown,
      onPointerDown(event: PointerEvent<HTMLDivElement>) {
        if (event.button !== 0) return;
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: position.x, panY: position.y };
        event.preventDefault();
      },
      onPointerMove(event: PointerEvent<HTMLDivElement>) {
        const start = drag.current;
        if (!start || start.id !== event.pointerId) return;
        setPosition((p) => ({
          ...p,
          x: start.panX + event.clientX - start.x,
          y: start.panY + event.clientY - start.y,
        }));
      },
      onPointerUp: stop,
      onPointerCancel: stop,
      onLostPointerCapture: stop,
    },
  };
}
