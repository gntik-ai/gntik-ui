import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { SkipLink } from '../../components/VisuallyHidden';
import { Logo } from '../../theme/Logo';
import { useTheme } from '../../theme/ThemeProvider';
import { authLayoutVariants, type AuthLayoutVariantProps } from './auth-layout.variants';

export interface AuthLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** `split` (brand panel + form), `card` (centred card) or `full-bleed` (form on the chrome surface). */
  variant?: AuthLayoutVariantProps['variant'];
  /** The form: heading, fields, submit, alternative sign-in methods. */
  children?: ReactNode;
  /** Brand mark above the form (and in the split brand panel). Defaults to the active preset's Logo with wordmark. */
  logo?: ReactNode;
  /** Split variant: brand panel body (eyebrow, headline, feature list). */
  brand?: ReactNode;
  /** Split variant: line at the bottom of the brand panel (security note, status). */
  brandFooter?: ReactNode;
  /** Accessible name of the brand panel. Defaults to the brand preset's name. */
  brandLabel?: string;
  /** Below the form (switch to sign-up, terms, help). */
  footer?: ReactNode;
  mainId?: string;
  skipLinkLabel?: string;
  fullScreen?: boolean;
}

/**
 * Sign-in / sign-up shell. `split` pairs a brand panel (chrome surface, Logo from the theme's
 * brand preset) with the form and hides the panel below `lg`; `card` centres the form in a card;
 * `full-bleed` puts it straight on the chrome surface. The form comes first in the DOM, so it is
 * first in tab order (after the skip link) on every screen size.
 */
export function AuthLayout({
  variant = 'split',
  children,
  logo,
  brand,
  brandFooter,
  brandLabel,
  footer,
  mainId = 'main',
  skipLinkLabel = 'Skip to sign-in form',
  fullScreen = false,
  className,
  ...props
}: AuthLayoutProps) {
  const theme = useTheme();
  const s = authLayoutVariants({ variant, fullScreen });
  const mark = logo ?? <Logo size={28} wordmark />;
  return (
    <div className={cn(s.root(), className)} {...props}>
      <SkipLink targetId={mainId} className={s.skipLink()}>
        {skipLinkLabel}
      </SkipLink>
      <main id={mainId} tabIndex={-1} className={s.main()}>
        <div className={s.column()}>
          <div className={s.logo()}>{mark}</div>
          <div className={s.surface()}>{children}</div>
          {footer != null && <div className={s.footer()}>{footer}</div>}
        </div>
      </main>
      {variant === 'split' && (
        <aside aria-label={brandLabel ?? theme.brand.name} className={s.brand()}>
          {/* The small-screen logo already names the brand; this one is decorative. */}
          <div aria-hidden>{mark}</div>
          <div className={s.brandBody()}>{brand}</div>
          {brandFooter != null ? <div className={s.brandFooter()}>{brandFooter}</div> : <div />}
        </aside>
      )}
    </div>
  );
}
