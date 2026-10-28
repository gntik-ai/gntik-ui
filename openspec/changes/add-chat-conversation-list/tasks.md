# Tasks

## 1. Implementation

- [x] 1.1 Add ConversationList, row/group/keyboard/windowing modules and public types/exports.
- [x] 1.2 Add controlled and uncontrolled selection/disclosures, row menus and rename.
- [x] 1.3 Add localized counts, New chat, Load more and measured windowing.
- [x] 1.4 Add ChatLayout sidebar and migrate the messaging template.

## 2. Tests and docs

- [x] 2.1 Observe failing public-DOM tests before each implementation slice.
- [x] 2.2 Cover grouping, disclosures, keyboard, links, menus, rename, unread/loading and 1,000-row windowing.
- [x] 2.3 Capture the original ChatLayout DOM snapshot before adding sidebar; cover LTR/RTL and existing panel behavior.
- [x] 2.4 Document the keyboard contract and add interactive grouped, link/custom-group, windowed and responsive Drawer examples.
- [x] 2.5 Run example/template axe checks in all themes (jsdom locally, browser contrast in PR CI).

## 3. Release evidence

- [x] 3.1 Add one changeset: chat minor, ui/templates patch.
- [x] 3.2 Regenerate kit registry and documentation artifacts.
- [x] 3.3 Run bounded toolchain checks, docs coverage and strict OpenSpec validation; record environment limits.
- [x] 3.4 Create one local commit; never push, merge, publish or deploy.

## Test seams and red-to-green evidence

The acceptance criteria select the public rendered nav, row/link controls, heading disclosures, menu and rename controls, callback results, I18nProvider, scroll/resize boundary and ChatLayout DOM as the seams. Tests do not mock kit components or internal collaborators; window geometry and ResizeObserver are browser boundaries.

`pnpm --filter @gntik-ai/chat exec vitest run src/ConversationList/ConversationList.test.tsx` first failed for the missing component, then for visible collapsed rows, seven Tab stops instead of one, absent selection reporting and missing links before their respective implementations. The actions suite failed for missing menu triggers and rename inputs; the controls suite failed for absent unread badges and New chat/Load more; the window suite failed with 1,000 mounted rows against the fewer-than-60 requirement. Each slice passed after implementation.

`pnpm --filter @gntik-ai/chat exec vitest run src/ChatLayout/ChatLayout.test.tsx -u` captured the original thread-only DOM before sidebar source changes and failed for missing LTR/RTL sidebars. The snapshot passes unchanged after adding the slot. The messaging suite failed for the missing nav before swapping the template onto ConversationList, then passed with unread reset and sending intact.

## Validation boundaries

Library builds, lint, monorepo typecheck, generated registry freshness, both consumer kit-only checks, docs coverage, changed-file Prettier checks and strict OpenSpec validation pass. Scoped chat/layout tests and the messaging template pass, including example/template axe checks in dark, light and high_contrast, open menus, inline rename and the mobile Drawer. Window tests cover the retained tab stop, mounted count, measured height updates and observer cleanup. Catalog fallback behavior is tested through I18nProvider.

The required aggregate library test command cannot complete in this offline environment: the unchanged token mirror-install test cannot fetch the published 0.2.1 artifact, packs local 0.3.0 instead and raises ENOENT opening gntik-ai-tokens-0.2.1.tgz before install assertions. Direct execution confirmed the cause; all other twelve token test files pass. All ten remaining library packages pass when run separately without that package, including the full UI, chat, blocks and templates suites.

Browser a11y/visual suites (including rendered contrast), Next.js app builds, MCP CLI tests and evals are deferred to PR CI under worker policy. No browser suites, deployment, publication, push or merge were performed.
