import { toolCallCardStyles } from '../ToolCallCard/toolCallCard.variants';

export const reasoningBlockStyles = {
  root: toolCallCardStyles.root,
  trigger: toolCallCardStyles.trigger,
  running: 'animate-pulse motion-reduce:animate-none',
  markdown: 'text-[13px] text-muted-foreground',
  body: 'border-s border-border ps-3 text-[13px] text-muted-foreground',
} as const;
