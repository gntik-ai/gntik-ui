import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'OtpInput',
  group: 'Forms',
  status: 'beta',
  description:
    'One-time / verification code input: 4–8 character boxes, numeric or alphanumeric, optional group separator. Typing auto-advances, paste fills every slot, onComplete fires when full; invalid and disabled states; works inside Field.',
  primitive: '@base-ui/react/otp-field',
  pattern: 'group of single-character textboxes',
  keyboard: [
    ['Type a character', 'Fills the slot and moves to the next one'],
    ['Backspace', 'Clears the slot, or the previous one when empty, and moves back'],
    ['ArrowLeft / ArrowRight', 'Moves between slots'],
    ['Paste (⌘V / Ctrl+V)', 'Fills the slots from the clipboard, dropping invalid characters'],
  ],
  tokens: ['background', 'border', 'foreground', 'muted-foreground', 'primary', 'destructive', 'secondary', 'focus-ring'],
};
