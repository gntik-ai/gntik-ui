# Fix shared text matching

## Why

Typing an unaccented name currently hides accented results in kit filters. Lowercase-only highlight offsets also mark the wrong substring when case conversion changes the string length.

## What changes

Add dependency-free foldText, matchText and matchRanges utilities to @gntik-ai/ui. Adopt them in the approved UI filters, LogViewer and eight template helpers, with provider locales in components and optional locales in pure helpers. Memoise folded JSON search nodes and log lines. Preserve equality, ordering, set membership and facet comparisons, Base UI Combobox filtering, and all other non-scope search paths.

Document a live utility example, add regressions at rendered component and public helper seams, and release patches for UI, blocks and templates. No data or deployment changes.

## Impact

Search returns more results for common Latin accents. The fold table does not transliterate non-Latin scripts. Reverting this change or pinning the previous kit packages restores prior behavior.
