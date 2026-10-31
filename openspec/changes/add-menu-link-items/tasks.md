# Tasks

## 1. Implementation

- [x] 1.1 Add and export MenuLinkItem and MenuLinkItemProps on Base UI Menu.LinkItem.
- [x] 1.2 Add href and external to MoreMenuAction and reuse MenuLinkItem in UserMenu without changing existing DOM or disabled-link behavior.
- [x] 1.3 Document link items, Enter activation and router adapter forwarding; add MenuLinks and update navigation examples.

## 2. Tests

- [x] 2.1 Test anchors, layout, router/render resolution, Enter, modifier/middle clicks, external attributes, localization and ContextMenu.
- [x] 2.2 Test MoreMenu mixed/disabled actions, DataTable link actions and baseline UserMenu/MoreMenu DOM.
- [x] 2.3 Add axe checks for MenuLinks, MenuRowActions and MenuAccount across all three themes (browser execution in PR CI).

## 3. Docs and release

- [x] 3.1 Add a minor changeset for @gntik-ai/ui.
- [x] 3.2 Regenerate the registry and llms output.
- [x] 3.3 Run scoped tests, repository gates and strict OpenSpec validation.

## Validation limits

Browser axe suites run in PR CI. Local jsdom axe checks cover all three menu examples in dark, light and high_contrast. The token mirror-install suite cannot finish without the unavailable registry tarball: its offline fallback expects gntik-ai-tokens-0.2.1.tgz, which is absent. The remaining library suites run separately.
