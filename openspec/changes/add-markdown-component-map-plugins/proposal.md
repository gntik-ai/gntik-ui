# Extend Markdown safely

## Why

Consumers need to render rich model replies through kit components without losing the safe Markdown defaults or prose around unknown HTML.

## What changes

Add optional element overrides, case-insensitive code-language renderers, allowlisted standalone custom block tags, user remark/rehype plugins, a streaming context hook and opt-in lazily loaded sanitised HTML. Keep HTML skipping and the final URL policy mandatory. Pre-scan custom blocks in linear time, skipping fences and consuming only registered paired blocks or streaming partial blocks.

Document stable maps/plugins and the untrusted content boundary with a bilingual MarkdownCustom live preview. Add public-component regression, parse-count and axe tests, regenerate the registry, and record a chat minor and ui translation patch in one changeset.

## Scope and risk

- Change id: add-markdown-component-map-plugins; capability: chat/markdown. All requirements are ADDED because no baseline exists.
- R2: extension code is trusted host code; unsafe overrides can reintroduce injection. The fixed HTML schema is private and cannot be supplied by consumers.
- Attributes on custom tags are strings minus on* and style. Only standalone block tags are supported.
- No math, Mermaid, ordinary syntax highlighting, extra streaming repairs, inline custom tags, new reasoning/citation components or assistant-chat template changes.
- Rollback by reverting this additive library change or pinning the previous chat release. No deployment or publication.
