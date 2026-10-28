# Tasks

## 1. Implementation

- [x] 1.1 Add SiteFooter, types, metadata, fixtures and exports.
- [x] 1.2 Add English and Spanish footer strings, including the fixed default copyright.
- [x] 1.3 Replace all three public template footers and update template block dependencies.

## 2. Tests

- [x] 2.1 Test column headings, localized navigation, social anchors and tab order, landmarks, all layouts, theme controls, empty groups, external links and newsletter composition.
- [x] 2.2 Test all three public pages through their existing props and footer landmarks; retain existing Page assertions unchanged.
- [x] 2.3 Run jsdom axe checks on footer examples and public pages in all themes. Add browser geometry and contrast checks for PR CI.

## 3. Docs and release

- [x] 3.1 Add live Blocks gallery previews for columns, centered, simple RTL, custom Spanish and empty states.
- [x] 3.2 Record minor blocks/ui and patch templates changes in one changeset.
- [x] 3.3 Regenerate registry output and run bounded repository checks and strict OpenSpec validation. Browser suites run in PR CI; the offline tokens mirror test cannot obtain its pinned tarball here.
