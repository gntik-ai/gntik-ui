import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'ToolCallCard',
  group: 'Display',
  status: 'beta',
  description:
    'A tool invocation in an assistant turn: name, status (awaiting-approval, running, succeeded, failed, denied), duration and collapsible arguments, result or error. Failed and denied calls open by default. Entering awaiting-approval opens arguments unless open is controlled, announces the request politely once per entry and keeps focus where it was. The approval group remains visible even when collapsed. onApprove() and onDeny(reason?) report a decision; the caller must update status and decision (ToolCallDecision: outcome approved or denied, optional reason). Promise callbacks show loading and keep the disabled actions focusable until settled; rejection enables retry and the caller reports errors. askDenyReason defaults to true: Deny asks for a trimmed optional reason (empty becomes undefined); false denies immediately. destructive uses Run {name}, destructive tone and a reversibility hint. approveLabel and denyLabel override text; approvalPrompt accepts a ReactNode naming the group. The live example includes normal, destructive and controlled-closed approval, custom labels and prompt, immediate denial and recorded decisions. Approval must be enforced server-side: the backend must refuse unapproved calls; this card is not a security boundary.',
  primitive: '@base-ui/react/collapsible',
  pattern: 'disclosure',
  keyboard: [
    ['Enter', 'Expands or collapses the card (or a JSON section)'],
    ['Space', 'Expands or collapses the card (or a JSON section)'],
    ['Tab', 'Moves to JSON sections, scrollable code and approval controls; busy actions remain focusable'],
    ['Enter / Space on Approve', 'Calls onApprove once; pending callbacks disable further decisions'],
    ['Enter / Space on Deny', 'Focuses Reason (optional), or calls onDeny immediately with askDenyReason=false'],
    ['Enter in Reason (optional)', 'Calls onDeny once with the trimmed reason or undefined; ignores IME composition'],
    ['Escape in the reason step / Cancel', 'Cancels locally and focuses Deny without reporting a decision'],
  ],
  tokens: [
    'card',
    'border',
    'secondary',
    'muted-foreground',
    'success-text',
    'destructive',
    'destructive-text',
    'focus-ring',
    'warning',
    'warning-chip-text',
  ],
};
