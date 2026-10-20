# Fix platform-aware shortcut hints

## Why

The default CommandPaletteTrigger and kit shortcut data show the Mac command glyph on Windows, Linux and ChromeOS even though Ctrl opens the palette there.

## What changes

Export Os, getOs and the SSR-safe useOs hook from @gntik-ai/ui. Resolve the opt-in mod key in Kbd to Command on macOS/iOS and Control elsewhere, and use it in the default trigger, GlobalSearch fixtures and keyboard-shortcuts template. Preserve explicit keys, label overrides, existing filterShortcuts callers and key bindings. Document the hook and modifier in the live Kbd example.

## Impact

Release patches for @gntik-ai/ui, @gntik-ai/blocks and @gntik-ai/templates. Server-rendered hints show Ctrl until hydration detects the client OS. Spoofed platform data can affect the hint but never the binding. Reverting the change or pinning the previous kit releases rolls it back. No deployment or visual baseline updates are included.
