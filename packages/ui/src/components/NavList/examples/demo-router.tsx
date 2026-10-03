import { createContext, useContext, type ComponentPropsWithRef } from 'react';

/** Example-only stand-in for a client router: links update state instead of reloading. */
export const NavigateContext = createContext<(href: string) => void>(() => {});

export function DemoRouterLink({ href = '', onClick, ...props }: ComponentPropsWithRef<'a'>) {
  const navigate = useContext(NavigateContext);
  return (
    <a
      href={href}
      data-router-link=""
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}
