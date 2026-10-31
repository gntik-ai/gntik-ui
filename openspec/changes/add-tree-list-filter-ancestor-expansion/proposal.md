# TreeList filtering, navigation links and animated groups

## Why

Loaded file and navigation trees need text filtering, highlighted matches and ancestor reveal without losing selection or the user's previous expansion. Link nodes and motion-aware groups complete the navigation example.

## What Changes

- Add optional filter, filterNode and currentHref props and TreeNode.href.
- Search loaded nodes only, retaining matching branches' whole subtrees and the caller's node identity. Keep filtering expansion separate from onExpandedChange.
- Share JsonViewer's existing highlight helper without changing its search behavior or resting DOM. Preserve the unfiltered flatten memo and avoid an unconditional full-tree walk.
- Add localized match counts, empty results, LinkProvider treeitems and Base UI Collapsible height transitions using motion tokens.
- Add live filtering and navigation examples, regression tests, registry output and a minor ui changeset.

## Impact

- Capability: ui/tree-list (ADDED; no baseline spec). Risk R1, opt-in additive API.
- Depends on fix-ui-match-text, already present in this snapshot.
- Unloaded branches, server search, fuzzy matching, range selection and checkbox cascade stay out of scope.
- NVDA and VoiceOver checks are operator release checks. Browser axe checks run in PR CI.
- Roll back by reverting this ChangeSet or pinning the previous package release. No deployment or publishing.
