import { Braces, FileText, Folder, Home, PanelLeft, PanelsTopLeft } from 'lucide-react';
import { useState, type ComponentPropsWithRef } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Button } from '../../Button';
import { LinkProvider } from '../../Link';
import { SimpleSelect } from '../../Select';
import { TooltipProvider } from '../../Tooltip';
import { NavList, type NavGroup } from '../NavList';
// Keep preview navigation local, without requiring a router or reloading the catalog.
function PreviewLink({ onClick, ...props }: ComponentPropsWithRef<'a'>) {
  return (
    <a
      {...props}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    />
  );
}

const locations = [
  '/',
  '/?tab=a',
  '/functions/fn-42',
  '/functions-v2',
  '/functions/templates/7',
  '/projects/42',
  '/projects/42/runs/7',
  '/audit',
  '/audit?page=2',
];

/** Opt-in matching against a real detail location, independent of any router. */
export default function NavListRouteMatching() {
  const { t } = useI18n();
  const [currentHref, setCurrentHref] = useState('/functions/fn-42');
  const [collapsed, setCollapsed] = useState(false);
  const groups: NavGroup[] = [
    {
      items: [
        { label: t('navRoute.home'), href: '/', icon: Home },
        { label: t('navRoute.functions'), href: '/functions', match: 'prefix', icon: Braces },
        { label: t('navRoute.templates'), href: '/functions/templates', icon: PanelsTopLeft },
        { label: t('navRoute.audit'), href: '/audit', match: 'exact', icon: FileText },
        {
          label: t('navRoute.projects'),
          icon: Folder,
          items: [
            {
              label: t('navRoute.project'),
              href: '/projects',
              match: 'exact',
              pattern: ['/projects/:id', '/projects/:id/*'],
            },
          ],
        },
      ],
    },
  ];
  return (
    <LinkProvider component={PreviewLink}>
      <TooltipProvider>
        <div data-example="nav-list-route-matching" className="grid w-full max-w-sm gap-4">
          <SimpleSelect
            label={t('navRoute.location')}
            items={locations.map((value) => ({ value, label: value }))}
            value={currentHref}
            onValueChange={(value) => {
              if (value) setCurrentHref(value);
            }}
          />
          <Button
            variant="secondary"
            icon={PanelLeft}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}
          >
            {t(collapsed ? 'nav.expandSidebar' : 'nav.collapseSidebar')}
          </Button>
          <NavList
            key={currentHref}
            groups={groups}
            onNavigate={(item) => {
              if (item.href) setCurrentHref(item.href);
            }}
            currentHref={currentHref}
            match="prefix"
            collapsed={collapsed}
            label={t('navRoute.navigation')}
          />
        </div>
      </TooltipProvider>
    </LinkProvider>
  );
}
