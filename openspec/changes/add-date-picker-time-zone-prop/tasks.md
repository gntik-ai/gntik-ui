# Tasks

## 1. Implementation

- [x] 1.1 Reuse shared time-zone helpers; validate effective explicit/provider/system zones.
- [x] 1.2 DatePicker zoned calendar proxies, time segments, compatible edits, formatting, today and offset form values.
- [x] 1.3 DateTimeRangePicker zoned absolute drafts and formatting; preserve relative instants and ISO form values.
- [x] 1.4 Add translated zone labels, documented props and live UTC examples including hideTimeZone.

## 2. Tests

- [x] 2.1 Test UTC display and editing before implementation, then zoned date-only selection and calendar bounds.
- [x] 2.2 Cover Madrid DST gaps/overlaps, Tokyo today, offsets/seconds, provider inheritance, invalid zones and custom formatting.
- [x] 2.3 Test absolute range UTC round trips before implementation; cover relative presets, provider zones and calendar boundaries.
- [x] 2.4 Add axe checks for new examples closed and open in all themes and browser coverage for PR CI.

## 3. Docs and release

- [x] 3.1 Add one minor changeset for @gntik-ai/ui, including the provider behavior change.
- [x] 3.2 Regenerate registry and llms outputs.
- [x] 3.3 Run strict OpenSpec validation and bounded repository checks; browser suites run in PR CI.

Worker limit: the token mirror-install test cannot obtain the public tarball without network access, and its local fallback cannot find gntik-ai-tokens-0.2.1.tgz (ENOENT). The remaining token checks run separately. Browser accessibility/visual suites and the excluded MCP/evals suites remain for PR CI.
