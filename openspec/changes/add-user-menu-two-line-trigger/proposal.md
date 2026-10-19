# Add a two-line UserMenu trigger

## Why

Sidebar footers need to identify the signed-in account without opening the menu.

## What changes

Add the optional showEmail prop to UserMenu. It implies showName and renders a full-width avatar, a truncated name/email column and a decorative ChevronsUpDown icon. Without showEmail, the existing trigger DOM and classes stay unchanged. Keep the existing menu positioning and collision flipping.

Document a sidebar-footer example that disables showEmail in a collapsed rail. Release as a minor of @gntik-ai/ui. No changes to SidebarLayout, Menu, Avatar or baseline OpenSpec specs.
