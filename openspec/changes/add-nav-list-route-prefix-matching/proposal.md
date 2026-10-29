# Change: Add opt-in NavList prefix and pattern matching

## Why

Strict href equality leaves sections unmarked on nested detail routes. Consumers need router-agnostic matching without changing existing exact-match navigation.

## What changes

- Add optional item and list-wide exact/prefix matching, plus item patterns with named segments and a trailing wildcard.
- Export pure path, pattern and winner-resolution helpers; retain the existing isNavItemCurrent call signature.
- Resolve one computed winner across all groups and descendants: exact href first, then the longest matching href or pattern by segment count, then document order. Explicit current flags override computation.
- Use the resolved winner for NavList indicators, section expansion, rail flyouts and StackedLayout top links, memoized by navigation inputs.
- Add a localized live example, public-seam tests, a minor UI changeset and regenerated registries and LLM documentation.

## Scope and risk

Issue #140; risk R1. Matching stays exact unless opted in. Prefix and pattern comparisons ignore query strings, hashes and a trailing slash; root prefix matches only root. Patterns never compile user input into regular expressions. This change does not read router location or alter MegaMenu, breadcrumbs, titles or template location workarounds. No dependencies, deployment or publication. Rollback is a revert or a previous UI version pin.
