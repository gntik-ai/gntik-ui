import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { ExternalLink } from 'lucide-react';
import { createContext, createElement, useContext, type ComponentType, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { linkVariants, type LinkVariantProps } from './link.variants';

/** A router link component that accepts anchor props (at least `href`), e.g. an adapter around a router's Link. */
export type LinkComponent = ComponentType<ComponentPropsWithRef<'a'>>;

const LinkContext = createContext<LinkComponent | null>(null);

export interface LinkProviderProps {
  /** The app's router link. Internal `Link`s (and kit parts built on it) render through it. */
  component: LinkComponent;
  children?: ReactNode;
}

/**
 * Supplies the app's router link to every kit `Link`, so internal navigation stays client-side.
 *
 * ```tsx
 * const RouterLink = ({ href = '', ...props }) => <NextLink href={href} {...props} />;
 * <LinkProvider component={RouterLink}>…</LinkProvider>
 * ```
 */
export function LinkProvider({ component, children }: LinkProviderProps) {
  return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>;
}

/** The router link supplied by the nearest LinkProvider, or null. */
export function useLinkComponent() {
  return useContext(LinkContext);
}

export interface LinkProps extends Omit<useRender.ComponentProps<'a'>, 'className'>, LinkVariantProps {
  className?: string;
  /**
   * Opens in a new tab (`target="_blank"`, `rel="noopener noreferrer"`), adds the external icon and a
   * visually hidden hint, and bypasses the router link.
   */
  external?: boolean;
  /** Visually hidden text appended to external links. */
  externalLabel?: string;
}

/**
 * Styled anchor. Renders the LinkProvider's router link when one is set (unless `external`),
 * or any element passed through `render`.
 */
export function Link({
  tone,
  underline,
  external = false,
  externalLabel = '(opens in a new tab)',
  className,
  render,
  ref,
  children,
  ...props
}: LinkProps) {
  const RouterLink = useContext(LinkContext);
  const s = linkVariants({ tone, underline });
  const resolvedRender = render ?? (RouterLink && !external ? createElement(RouterLink) : undefined);
  const ownProps: useRender.ElementProps<'a'> = {
    className: cn(s.root(), className),
    ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    children: (
      <>
        {children}
        {external && (
          <>
            <ExternalLink size={12} className={s.externalIcon()} aria-hidden />
            <span className="sr-only"> {externalLabel}</span>
          </>
        )}
      </>
    ),
  };
  return useRender({
    defaultTagName: 'a',
    render: resolvedRender,
    ref,
    props: mergeProps<'a'>(props, ownProps),
  });
}
