# Named typography roles

## Why

Text and Heading encode their type scale as literal utilities, so design-tool exports cannot share it and consumers repeat the values.

## What changes

Add eleven roles in typography.css, alias them as text-<role> utilities, export DTCG composites, scoped Figma variables and TypeScript typeScale, and adopt the roles in Text and Heading. Teach the shared class merger to treat roles as font sizes. Document the scale and inherited/overridden properties in catalog previews.

## Scope and risk

Risk R2: typography affects compositions throughout the kit. Sizes, leading, tracking and weight preserve f31e4d9; brand.css, scope.css and frozen-values.json remain byte-identical. Body, supporting and caption omit weight and tracking; label and heading-2xs omit tracking. No dependency changes, literal-size migration, new dense roles, font-family changes or colour changes. Rollback is a revert or pinning the previous tokens and UI packages. Release both packages as minor versions.

Capabilities: tokens/type-scale and ui/text. All deltas are ADDED; no dependencies.
