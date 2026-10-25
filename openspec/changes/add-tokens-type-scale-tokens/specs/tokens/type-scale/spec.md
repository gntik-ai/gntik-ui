## Purpose

Named type roles of @gntik-ai/tokens exposed as CSS variables, Tailwind utilities and design-tool exports.

## ADDED Requirements

### Requirement: Type roles mirror the current Text and Heading values

Typography SHALL define display, heading-xl, heading-lg, heading-md, heading-sm, heading-xs, heading-2xs, body, label, supporting and caption with the sizes, unitless leadings, tracking and weights of f31e4d9 in their original CSS units. Values SHALL live only in typography.css.

#### Scenario: Label role

- **WHEN** typography.css is parsed
- **THEN** label size is 13px, leading is 1.25 and weight is 500
- **AND** label tracking is omitted

#### Scenario: Heading md role

- **WHEN** typography.css is parsed
- **THEN** heading-md size is 1.25rem, leading is 1.375, tracking is -0.025em and weight is 600

### Requirement: Role utilities support explicit overrides and inheritance

Tailwind SHALL alias every declared role property. Explicit leading, tracking and weight utilities MUST override the role. Body, supporting and caption SHALL omit weight and tracking; heading-2xs SHALL omit tracking.

#### Scenario: Small heading and weight override

- **WHEN** text-heading-sm is applied
- **THEN** it computes 17px, leading 1.375, tracking -0.025em and weight 600
- **AND** adding font-bold changes weight to 700

#### Scenario: Caption inside bold text

- **GIVEN** a strong parent
- **WHEN** it contains a caption Text
- **THEN** the caption inherits bold weight

### Requirement: Roles are exported to DTCG, Figma and TypeScript

The export SHALL include eleven DTCG typography composites with fontFamily referencing {font.sans}, px dimensions at a 16px root and numeric unitless leading. Figma SHALL include font-size and line-height in px and declared font-weight variables with matching text scopes and values in all three modes. TypeScript and declarations SHALL export typeScale with px dimensions, numeric unitless leading and omitted inherited properties.

#### Scenario: Label exports

- **WHEN** the export runs
- **THEN** typography.label is a DTCG typography token with fontSize value 13 and unit px
- **AND** type/label/font-size is 13 in dark, light and high_contrast
- **AND** typeScale includes the label role
