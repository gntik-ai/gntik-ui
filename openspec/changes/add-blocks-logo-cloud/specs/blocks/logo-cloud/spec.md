## Purpose

Logo cloud block for public pages: a caption over a static row or grid of customer logos painted in one token colour, as social proof.

## ADDED Requirements

### Requirement: Logos are named images in a labelled list

LogoCloud SHALL render one semantic list labelled through aria-labelledby by its caption. Each list item SHALL contain an image named exactly by its name, with a decorative aria-hidden mark. Preserving the listitem role around the image MUST retain valid list semantics. An empty logos array SHALL render nothing.

#### Scenario: Six customer marks

- **GIVEN** six logos whose SVG marks use fill="currentColor"
- **WHEN** LogoCloud renders with a custom caption
- **THEN** one list has six listitems, each containing an image named exactly by its name
- **AND** the list is named by the custom caption

#### Scenario: Empty logos

- **WHEN** logos is an empty array
- **THEN** no block, caption, list or dangling ARIA reference renders

### Requirement: Captions use the English and Spanish catalog

LogoCloud SHALL use useI18n for its default caption and SHALL accept a ReactNode override. No default English copy SHALL be hard-coded in LogoCloud.tsx.

#### Scenario: Default captions

- **WHEN** caption is omitted
- **THEN** the English list name is Trusted by teams at companies of every size
- **AND** the Spanish list name is Equipos de empresas de todos los tamaños confían en nosotros under the es locale

### Requirement: Marks inherit token colours and a configurable height

Apps MUST supply single-colour currentColor SVG marks. LogoCloud SHALL default to text-muted-foreground in dark, light and high_contrast themes. A root or item className SHALL allow text-foreground overrides. logoHeight SHALL default to 28 pixels, with automatic width constrained to the available space and no inline colour styles.

#### Scenario: Token colour and height

- **WHEN** a fixture mark renders in any supported theme
- **THEN** its computed fill equals the muted foreground token colour and its height is 28 pixels
- **AND** logoHeight 40 changes every mark height to 40 pixels
- **AND** a text-foreground root or item override takes precedence

### Requirement: Logo cloud never animates or blurs

LogoCloud MUST NOT animate, scroll automatically, transition transforms, blur, filter or mask its logos with either motion preference. The block source MUST contain no fixed colour literals, palette colours, dark variants, gradients, glow or shadow effects.

#### Scenario: Either motion preference

- **GIVEN** prefers-reduced-motion is no-preference or reduce
- **WHEN** LogoCloud renders
- **THEN** no element has an animation, transform transition, filter or mask

### Requirement: Grid layout sets columns from the md breakpoint

LogoCloud SHALL default to a centred wrapping row without horizontal page scroll at 320px or 375px. Grid layout SHALL show two columns below md and columns columns from md, with static class mappings for 3, 4 and 6 and a default of 4.

#### Scenario: Six-column grid on a phone and desktop

- **WHEN** layout is grid, columns is 6 and the viewport is 375px wide
- **THEN** logos are laid out in two columns without horizontal page scroll
- **AND** at 1024px the grid has six columns

### Requirement: Caption placement is responsive

captionPlacement above SHALL always put the caption above the list. captionPlacement start SHALL put it above below md and beside the logos from md.

#### Scenario: Caption at start

- **WHEN** captionPlacement is start
- **THEN** the caption is above the list at 375px and beside it at 1024px

### Requirement: Documentation and accessibility ship with the block

LogoCloud SHALL have metadata, a doc file and live Blocks gallery examples for row, grid, start caption and composition below Hero. Examples SHALL demonstrate height, caption and colour overrides and empty input. Documentation MUST explain currentColor SVG preparation and high_contrast or text-foreground for thin marks. Every example SHALL pass axe in dark, light and high_contrast. Registry output and a minor blocks/ui changeset SHALL accompany the block.

#### Scenario: Gallery coverage

- **WHEN** the Blocks gallery loads LogoCloud
- **THEN** every documented example loads and all public props are documented
- **AND** generated registries include the block
