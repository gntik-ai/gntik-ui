import { cn } from '@gntik-ai/ui';
import { useState, type ReactNode } from 'react';

export interface AuthHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  headingLevel?: 'h1' | 'h2' | 'h3';
  className?: string;
}

/** Eyebrow + title + supporting line used at the top of every auth form. */
export function AuthHeader({ eyebrow, title, description, headingLevel: Heading = 'h1', className }: AuthHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {eyebrow != null && <p className="mb-2.5 font-mono text-[11px] tracking-[0.2em] text-primary-text uppercase">{eyebrow}</p>}
      <Heading className="text-[24px] font-semibold tracking-tight text-balance text-foreground sm:text-[27px]">{title}</Heading>
      {description != null && <p className="mt-2 text-[14px] leading-relaxed text-pretty text-muted-foreground">{description}</p>}
    </div>
  );
}

/** Horizontal rule with a centred caption ("Or continue with"). */
export function AuthDivider({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-3" role="presentation">
      <span className="h-px flex-1 bg-border" />
      <span className="font-mono text-[10.5px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">{children}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export const authFormClass = 'w-full max-w-[392px]';

/** Loading + error state around an async submit handler. A rejection's message becomes the error. */
export function useAsyncSubmit(fallbackError = 'Something went wrong. Try again.') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (fn: () => void | Promise<void>) => {
    setError(null);
    setLoading(true);
    try {
      await fn();
      setLoading(false);
      return true;
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : fallbackError);
      return false;
    }
  };
  return { loading, error, setError, run };
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
