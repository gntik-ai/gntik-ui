import { Breadcrumbs } from '../Breadcrumbs';

export default function BreadcrumbsCollapsed() {
  return (
    <Breadcrumbs
      aria-label="Breadcrumb (collapsed)"
      separator="slash"
      maxItems={3}
      items={[
        { label: 'Workspace', href: '/' },
        { label: 'Projects', href: '/projects' },
        { label: 'eu-west-1', href: '/projects/eu-west-1' },
        { label: 'Members', href: '/projects/eu-west-1/members' },
        { label: 'Invitations' },
      ]}
    />
  );
}
