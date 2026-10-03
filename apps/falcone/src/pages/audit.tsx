import { AuditLogPage } from '@gntik-ai/templates';
import { auditEvents, auditFilterFields } from '../data/audit';
import { shellFor } from '../shell';

export function Audit() {
  return (
    <AuditLogPage
      events={auditEvents}
      filterFields={auditFilterFields}
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Audit log' }]}
      currentHref="/audit"
      shell={shellFor('/audit')}
    />
  );
}
