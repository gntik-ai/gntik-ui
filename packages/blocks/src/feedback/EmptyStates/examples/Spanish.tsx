import { I18nProvider, Stack } from '@gntik-ai/ui';
import { FirstRunEmpty, NoResultsEmpty, NoAccessEmpty } from '../EmptyStates';
export default function Spanish() {
  return (
    <I18nProvider locale="es">
      <Stack gap={6}>
        <FirstRunEmpty />
        <FirstRunEmpty
          labels={{
            title: 'Start a project',
            description: 'Connect your repository.',
            action: 'Create project',
            guide: 'Open guide',
          }}
        />
        <NoResultsEmpty filterCount={1} />
        <NoResultsEmpty filterCount={2} />
        <NoResultsEmpty
          labels={{
            queryTitle: (entity, query) => `No ${entity} for ${query}`,
            title: (entity) => `No ${entity} yet`,
            description: (count) => `Try removing ${count} filters.`,
            clearFilters: 'Reset filters',
            clearSearch: 'Reset search',
          }}
        />
        <NoResultsEmpty query="" labels={{ title: (entity) => `No ${entity} yet` }} />
        <NoAccessEmpty />
        <NoAccessEmpty
          labels={{
            title: (resource) => `Access needed: ${resource}`,
            description: (resource, owner) => `Contact ${owner} about ${resource}.`,
            request: 'Ask for access',
            requested: 'Request pending',
            sent: 'Your request was sent',
          }}
        />
        <NoAccessEmpty resource="Restricted settings" showRequestAccess={false} />
        <NoAccessEmpty
          resource="Restricted resource"
          showRequestAccess={false}
          action={{ label: 'Back to overview', href: '#overview' }}
        />
        <NoAccessEmpty resource="Shared resource" action={{ label: 'Back to overview', href: '#overview' }} />
      </Stack>
    </I18nProvider>
  );
}
