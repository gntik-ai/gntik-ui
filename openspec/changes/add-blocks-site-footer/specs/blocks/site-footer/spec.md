## Purpose

Public site footer with brand content, titled link columns, legal and social links, copyright, and optional theme controls and newsletter content.

## ADDED Requirements

### Requirement: Titled columns and separate legal navigation

SiteFooter SHALL default to the columns layout, render populated columns as h2 headings followed by link lists inside one navigation named by footer.label, and render legal links in a separate navigation named by footer.legal. headingLevel and navLabel SHALL override their defaults.

#### Scenario: Sample columns

- **WHEN** the Product, Company and Resources fixtures and legal links render
- **THEN** Footer contains three h2 headings followed by lists and Legal contains the legal links
- **AND** headingLevel h3 changes the column titles to h3

### Requirement: Opt-in footer landmark

SiteFooter SHALL render a div by default and a footer when landmark is true.

#### Scenario: Composed footer

- **WHEN** SiteFooter renders in StackedLayout's footer slot
- **THEN** there is one contentinfo landmark and no nested footer
- **AND** a standalone SiteFooter with landmark exposes contentinfo

### Requirement: Named social anchors and keyboard order

Social links SHALL use IconButton anchors with nativeButton false, required labels naming the network, and hidden icons. Their list SHALL be named by footer.social. Tab order SHALL follow column links, legal links and social links.

#### Scenario: RSS feed

- **WHEN** the RSS fixture renders
- **THEN** the link named RSS feed points to /feed.xml and its svg is aria-hidden
- **AND** it follows the column and legal links in keyboard order

### Requirement: Responsive simple and centered layouts

Simple layout SHALL preserve the existing public footer flex and gap classes and inherited typography, stacking below sm and using logical alignment. Centered layout SHALL center the brand, wrapping links, social links and copyright without overflow at 320px.

#### Scenario: Simple RTL

- **WHEN** simple layout renders under dir rtl above sm
- **THEN** copyright is at the start right edge and links at the end

#### Scenario: Narrow centered footer

- **WHEN** centered layout renders at 320px
- **THEN** link and social lists wrap and no horizontal scrolling is needed

### Requirement: Optional theme and newsletter content

With themeSwitcher, SiteFooter SHALL render ThemeSwitcher size sm with four icon-only options at every width. Without the flag it SHALL render no theme control. The newsletter slot SHALL accept consumer content under the brand blurb.

#### Scenario: Phone theme control

- **WHEN** themeSwitcher is true at 375px
- **THEN** the Theme group exposes Light, Dark, High contrast and System options without hiding classes

### Requirement: Empty groups remain absent

Empty or omitted link groups SHALL render no navigation, list or heading. The copyright SHALL default to the fixed text © Example, Inc., without a current year. The brand SHALL default to Logo size 24 with wordmark.

#### Scenario: Copyright only

- **WHEN** all groups are empty or omitted
- **THEN** no nav, ul or heading renders and the copyright remains

### Requirement: Localized kit links and labels

SiteFooter SHALL read catalog strings with useI18n and preserve explicit overrides. English and Spanish SHALL provide footer.label, footer.legal and footer.social. Links SHALL use kit Link with muted tone and hover underline; external links SHALL include the new-tab icon and localized link.external text.

#### Scenario: Spanish navigation

- **WHEN** the Spanish locale is active
- **THEN** navigation names are Pie de página and Legal, and the social list is named Redes sociales
- **AND** an explicit navLabel takes precedence

### Requirement: Public template integration and documentation

Landing, pricing and contact SHALL use SiteFooter simple, keep footerLinks and copyright props, expose exactly one contentinfo containing Footer with Status, Privacy and Terms, and retain no literal Footer navigation markup. SiteFooter SHALL appear in the Blocks gallery with live examples, token styles, keyboard and axe coverage in all three themes.

#### Scenario: Public page footer

- **WHEN** any of the three public pages renders
- **THEN** one contentinfo contains Footer navigation and no nested footer
- **AND** callers can still override footerLinks and copyright
