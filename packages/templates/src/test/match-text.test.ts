import { matchesTriage, triageColumns } from '../incident-board/data';
import { filterUsage, usageRows } from '../usage-analytics/data';
import { filterShortcuts } from '../keyboard-shortcuts/data';
import { filterAuditEvents } from '../audit-log/Page';
import { auditEvents } from '../audit-log/data';
import { filterResources } from '../resource-index/data';
import { searchResources, galleryItems } from '../resource-gallery/data';
import { searchArticles, helpArticles } from '../help-home/data';
import { matchQuery } from '../search-results/Page';
import { searchHits } from '../search-results/data';

it('search-results finds an accented title', () => {
  const row = { ...searchHits[0]!, title: 'Función' };
  expect(matchQuery([row], 'funcion')).toEqual([row]);
});

it('help-home finds an accented title', () => {
  const row = { ...helpArticles[0]!, title: 'Función' };
  expect(searchArticles([row], 'funcion')).toEqual([row]);
});

it('resource-gallery finds an accented name', () => {
  const row = { ...galleryItems[0]!, name: 'Función' };
  expect(searchResources([row], 'funcion')).toEqual([row]);
});

it('resource-index folds free text and keeps facets accent-sensitive', () => {
  const row = { id: 'function', name: 'Función', status: 'Función' };
  expect(filterResources([row], 'funcion', [])).toEqual([row]);
  expect(filterResources([row], '', [{ field: 'status', value: 'funcion' }])).toEqual([]);
});

it('audit-log finds an accented target', () => {
  const row = { ...auditEvents[0]!, target: 'Función' };
  expect(filterAuditEvents([row], 'funcion', [], { start: null, end: null })).toEqual([row]);
});

it('keyboard-shortcuts finds an accented description', () => {
  const row = { id: 'actions', title: 'Actions', shortcuts: [{ id: 'function', description: 'Función', keys: ['F'] }] };
  expect(filterShortcuts([row], 'funcion')).toEqual([row]);
});

it('usage-analytics finds an accented project', () => {
  const row = { ...usageRows[0]!, project: 'Función' };
  expect(filterUsage([row], 'funcion', [])).toEqual([row]);
});

it('incident-board finds an accented title', () => {
  const row = { ...triageColumns[0]!.cards[0]!, title: 'Función' };
  expect(matchesTriage(row, 'funcion', [])).toBe(true);
});
