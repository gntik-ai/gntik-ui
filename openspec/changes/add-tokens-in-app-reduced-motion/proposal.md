# In-app reduced motion

## Why

Managed and shared devices may prevent users from changing the OS motion setting. The kit needs an additive app preference that always preserves OS reduced motion.

## What changes

- Add duration overrides and zero-specificity motion variants for data-motion="reduce".
- Expose SSR-safe tokens runtime helpers and one UI hook under useReducedMotion and usePrefersReducedMotion.
- Add optional ThemeProvider motion state, persistence and pre-hydration script restoration.
- Connect Carousel, Tour, Outline, chat scrolling and live charts to this preference.
- Add a localized appearance settings switch, live docs preview and regression coverage.

## Impact

Risk R2. Existing token values, theme behavior and OS preferences remain unchanged. No third-party animation changes. Minor releases for tokens, UI and templates; patch releases for chat and charts. No deployment or publishing.
