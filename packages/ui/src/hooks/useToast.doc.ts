import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'useToast',
  status: 'stable',
  description:
    'Queues toasts from any component under a ToastProvider. Import useToast from @gntik-ai/ui/hooks and ToastProvider and Toaster from @gntik-ai/ui; the hook shares the provider\'s context whichever entry it comes from. add(options) returns the toast id; promise(task, { loading, success, error }) follows one toast through a pending task; close(id) and update(id, options) change a toast; toasts lists those on screen. Errors use priority "high" so they are announced assertively.',
  signature: 'useToast(): { add, promise, close, update, toasts }',
  server:
    'Requires a ToastProvider above it and returns a manager with no toasts (`Toasts on screen: 0` in the example); render does not queue anything.',
};
