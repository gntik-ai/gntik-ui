# Flag inverted QueryBuilder between ranges

## Why

A filled but inverted numeric or date range currently counts as complete and silently filters out every record. The pair editor provides no feedback.

## What changes

Add and export `isConditionValid(condition)`, preserving `isConditionComplete`. Compare complete numeric pairs by value and date strings by day through the existing comparison helpers. Leave other values valid. Skip inverted conditions in evaluation, including nested AND/OR groups, while preserving queryToString output.

Mark both range inputs invalid and link them to a stable inline error from the en/es catalogs. Preserve entered values, document backend validation, and demonstrate both errors in a live example.

## Impact

Patch @gntik-ai/ui. Inverted ranges now leave more records visible because evaluation ignores them; apps should check completeness and validity before sending conditions to a backend. There are no data or deployment migrations. Revert the commit or pin the previous package patch to roll back. Automatic swapping and NumberRangeInput are out of scope.
