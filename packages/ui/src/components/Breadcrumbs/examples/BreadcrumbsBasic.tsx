import { Home } from 'lucide-react';
import { Breadcrumbs } from '../Breadcrumbs';

export default function BreadcrumbsBasic() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '/', icon: Home, hideLabel: true },
        { label: 'Projects', href: '/projects' },
        { label: 'Deployments', href: '/projects/acme/deployments' },
        { label: 'web-frontend', mono: true },
      ]}
    />
  );
}
