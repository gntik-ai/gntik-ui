import type { HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { codeVariants } from './code-block.variants';

export interface CodeProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  className?: string;
  ref?: Ref<HTMLElement>;
}

/** Inline code inside running text: `<Code>pnpm add @gntik-ai/ui</Code>`. */
export function Code({ className, ...props }: CodeProps) {
  return <code className={cn(codeVariants(), className)} {...props} />;
}
