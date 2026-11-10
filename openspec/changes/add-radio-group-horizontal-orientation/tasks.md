# Tasks

## 1. Implementation

- [x] 1.1 Add the `orientation` variant and its compound classes per variant to radio-group.variants.ts, and the prop with `data-orientation` to RadioGroup.tsx.
- [x] 1.2 Add examples/RadioGroupInline.tsx with en and es catalog entries, and document `orientation`, including the list exception, in RadioGroup.doc.ts.

## 2. Tests

- [x] 2.1 Extend RadioGroup.test.tsx: keyboard contract on a horizontal group, `data-orientation`, the list fallback and the unchanged default DOM.
- [x] 2.2 Add a browser layout test: row placement at 600px, wrapping at 240px, equal card columns at 720px and RTL order.

## 3. Docs and release

- [x] 3.1 Add a changeset: minor for `@gntik-ai/ui`.
- [x] 3.2 Run `pnpm registry` and commit the generated files.
- [x] 3.3 Run `openspec validate add-radio-group-horizontal-orientation --strict`.
