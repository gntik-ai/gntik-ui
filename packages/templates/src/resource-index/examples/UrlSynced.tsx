import ResourceIndexPage from '../Page';

/**
 * Search and sorting replace history; filters push. Try Back after changing filters.
 * A shared link can include ?q=api&f=status:failed&sort=name:desc.
 * With a router, wrap the page in UrlStateProvider using the hook's adapter recipe.
 */
export default function UrlSynced() {
  return <ResourceIndexPage syncUrl />;
}
