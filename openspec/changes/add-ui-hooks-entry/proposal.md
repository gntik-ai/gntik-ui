# Change: Add the @gntik-ai/ui/hooks entry

## Why

Generic hooks hide in component folders, and kit-only apps may import only react, react-dom and `@gntik-ai/*`. Product teams need one documented, tree-shakable place to find the kit's behaviour hooks.

## What Changes

- Publish `@gntik-ai/ui/hooks` (types and an ESM build with the `'use client'` banner) and re-export every hook from the package root.
- Re-export the generic hooks already public: useAnnounce, useToast, useAsyncOptions, useFitCount and useVirtualWindow, imported from their source files so a bundle of one hook pulls no other component code.
- Add `HookDoc`, a `.doc.ts` and a live example per hook, the Library > Hooks docs page and the "Adding a hook" contract in CONTRIBUTING.md.
- Add the `ui-hooks` registry item (kind `component`, group `Hooks`), with no new registry kind.
- Prove the subpath in apps/example-vite and apps/example-next by importing the five generic hooks from it.

## Impact

- Capability: ui/package-exports (added).
- Packages: @gntik-ai/ui (minor).
- Provider hooks, component-bound hooks, a standalone hooks package and moving or removing any root export are outside scope.
