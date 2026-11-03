import { useMemo, useState, type ComponentPropsWithRef } from 'react';
import { Breadcrumbs } from '../../components/Breadcrumbs';
import { Button } from '../../components/Button';
import { LinkProvider } from '../../components/Link';
import { NavList } from '../../components/NavList';
import { useI18n } from '../../i18n/I18nProvider';
import { NavigationProvider, useNavigation } from '../NavigationProvider';
import type { NavRoute } from '../route-tree';

/** Preview-only router: links update state instead of reloading the catalog. */
function previewLink(navigate: (href: string) => void) {
  return function PreviewLink({ href = '', onClick, ...props }: ComponentPropsWithRef<'a'>) {
    return (
      <a
        href={href}
        {...props}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          navigate(href);
        }}
      />
    );
  };
}

function Shell({ navigate }: { navigate: (href: string) => void }) {
  const { t } = useI18n();
  const navigation = useNavigation();
  const page = navigation?.activePage ?? null;
  const detail = page?.route.path === '/functions/:id';
  return (
    <div className="grid w-full max-w-sm gap-4 text-sm text-foreground">
      <NavList
        groups={navigation?.groups ?? []}
        currentHref={page?.menuHref ?? navigation?.pathname}
        label={t('navigation.example.sections')}
      />
      <Breadcrumbs items={page?.breadcrumbs ?? []} aria-label={t('navigation.example.trail')} />
      <div className="grid gap-1" role="status">
        <p>
          {t('navigation.example.documentTitle', {
            value: page ? `${page.title} · ${t('navigation.example.appTitle')}` : t('navigation.example.appTitle'),
          })}
        </p>
        <p>
          {t('navigation.example.params', {
            value:
              page && Object.keys(page.params).length > 0
                ? JSON.stringify(page.params)
                : t('navigation.example.noParams'),
          })}
        </p>
        <p>{t('navigation.example.menuItem', { value: page?.menuHref ?? '—' })}</p>
      </div>
      <Button variant="secondary" onClick={() => navigate(detail ? '/functions' : '/functions/fn-42?tab=logs')}>
        {t(detail ? 'navigation.example.openList' : 'navigation.example.openDetail')}
      </Button>
    </div>
  );
}

/**
 * One route tree drives the sidebar, the highlighted item, the breadcrumbs and the title. The
 * preview sets documentTitle={false}: the catalog keeps its own tab title.
 */
export default function NavigationProviderRouteTree() {
  const { t } = useI18n();
  const [pathname, setPathname] = useState('/functions/fn-42?tab=logs');
  const routes = useMemo<NavRoute[]>(
    () => [
      {
        path: '/functions',
        title: t('navigation.example.functions'),
        group: t('navigation.example.build'),
        hideChildrenInMenu: true,
        children: [{ path: '/functions/:id', title: (params) => params.id ?? '' }],
      },
      { path: '/workflows', title: t('navigation.example.workflows'), group: t('navigation.example.build') },
      { path: '/logs', title: t('navigation.example.logs'), group: t('navigation.example.operate') },
    ],
    [t],
  );
  const Link = useMemo(() => previewLink(setPathname), []);
  return (
    <LinkProvider component={Link}>
      <NavigationProvider
        routes={routes}
        pathname={pathname}
        appTitle={t('navigation.example.appTitle')}
        documentTitle={false}
        home={{ label: t('navigation.example.home'), href: '/functions' }}
      >
        <Shell navigate={setPathname} />
      </NavigationProvider>
    </LinkProvider>
  );
}
