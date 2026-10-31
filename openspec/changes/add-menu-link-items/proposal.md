# Add menu link items

## Why

Row actions used for navigation need real destinations so users can copy links or open them in another tab. Menu currently exports only action items, while UserMenu keeps a private link implementation.

## What changes

Add router-aware MenuLinkItem and MenuLinkItemProps on Base UI Menu.LinkItem, with the existing menu icon, label, shortcut and destructive slots. Support caller render overrides, closeOnClick (true by default) and external links with the existing localized new-tab hint. Leave browser modifier and middle clicks unprevented.

Add optional href and external to MoreMenuAction. Disabled link actions remain disabled non-anchor items. DataTable inherits these types without block implementation changes. Reuse MenuLinkItem in UserMenu, preserving its DOM and existing enabled behavior for href plus disabled.

Document the navigation-only guidance and router adapter forwarding contract, add live examples and keyboard, DOM, event and accessibility tests. Release a minor of @gntik-ai/ui and regenerate the registry and language-model documentation.

## Scope and risk

R1, additive API. No row activation, shared menu handles, CommandPalette or MegaMenu links, prefetching or active-route styling. Roll back by reverting or pinning the previous UI minor. No deployment step.
