import type { SearchResultsPage } from '@gntik-ai/templates';
import { projects } from './projects';
import type { ItemOf } from './types';

type SearchHit = ItemOf<typeof SearchResultsPage, 'hits'>;
type SearchFacet = ItemOf<typeof SearchResultsPage, 'facets'>;

/** The search index: projects plus a few members and documents. */
export const searchHits: SearchHit[] = [
  ...projects.map((p, i): SearchHit => ({ id: `p${i}`, type: 'project', title: p.name, snippet: p.description, href: `/projects/${p.id}`, owner: p.owner, meta: p.region })),
  { id: 'm1', type: 'member', title: 'Jamie Chen', snippet: 'Admin · owns the API projects.', href: '/settings/members', owner: 'Alex Rivera', meta: 'jamie@acme.example' },
  { id: 'm2', type: 'member', title: 'Priya Shah', snippet: 'Member · auth and media.', href: '/settings/members', owner: 'Alex Rivera', meta: 'priya@acme.example' },
  { id: 'd1', type: 'document', title: 'Launch plan', snippet: 'Rollout steps, owners and the rollback plan for web-app.', href: '/projects/web-app', owner: 'Jamie Chen', meta: 'Updated 2 days ago' },
];

const owners = [...new Set(searchHits.map((h) => h.owner))];

export const searchFacets: SearchFacet[] = [
  {
    id: 'type',
    label: 'Type',
    options: [
      { value: 'project', label: 'Projects' },
      { value: 'member', label: 'Members' },
      { value: 'document', label: 'Documents' },
    ],
  },
  { id: 'owner', label: 'Owner', options: owners.map((o) => ({ value: o, label: o })) },
];
