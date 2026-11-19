---
'@gntik-ai/blocks': minor
'@gntik-ai/ui': minor
---

BREAKING: DataTable now renders the identifying column's body cells as row headers (`th scope="row"`, role `rowheader`) instead of `td` (role `cell`) by default, so consumer tests that query `cell` for that column must query `rowheader`; set `rowHeader: false` on the first column to keep `td`, or `rowHeader: true` on another column to pick it. The default row label now follows the row-header column. `TableCell` gains a `rowHeader` prop.
