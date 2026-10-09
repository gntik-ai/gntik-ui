import type { TemplateMeta } from '../meta';

export const meta = {
  name: 'Public hub',
  family: 'Auth',
  priority: 'P1',
  status: 'stable',
  description: `Unauthenticated entry hub on AuthLayout full-bleed with PageHeader, explanatory cards and navigation actions. Use public-hub instead of landing for an account entry point without a marketing hero or screenshot; use sign-in-card for a single sign-in form. Recommend 2 to 4 cards; any number is supported. Cards use the kit sm breakpoint: one column below sm, two from sm. ARIA: a section labelled by the text span inside the single PageHeader h1, h2 card headings and a ul/li card list. The title span owns the aria-labelledby target id in server HTML and after hydration; PageHeader has no heading-id prop. Loading replaces content with decorative kit Skeletons in an aria-busy section named by loadingLabel. Keyboard: Tab and Shift+Tab move through the primary, secondary and tertiary links in visual order; Enter follows href and invokes onClick, with visible focus and no trap. AuthLayout retains its skip link, named "Skip to main content", before the content in both states. The PageHeader title inherits truncation for long titles.

## Props

| Prop | Type | Default / behaviour |
| --- | --- | --- |
| eyebrow | string | Omitted; optional Badge before PageHeader |
| title | string | Welcome; PageHeader h1 |
| description | string | Omitted; PageHeader description |
| cards | { title: string; body: string }[] | Omitted; explanatory list with h2 headings |
| primaryAction | { label: string; href: string; onClick?: MouseEventHandler<HTMLAnchorElement> } | Sign in, #sign-in; Button rendered as an anchor |
| secondaryAction | Same action shape | Omitted; secondary Button rendered as an anchor |
| tertiaryLink | Same action shape | Omitted; one kit Link |
| footer | string | Omitted; Separator then supporting Text |
| loading | boolean | false; replaces header, cards and actions; hides eyebrow/footer copy |
| logo | ReactNode | Active preset logo from AuthLayout |
| loadingLabel | string | Loading; accessible name of the busy section |

Optional content has no default fixtures and creates no empty wrappers; an empty cards array also renders no list. Without footer there is no separator. Preview fixtures: public-hub--full, public-hub--minimal, public-hub--loading and public-hub--minimal-loading.

## Theme examples

Import ThemeProvider from @gntik-ai/ui and PublicHubPage from @gntik-ai/templates. Pass account routes and copy as props. Each theme supports the same full, minimal and loading composition.

\`\`\`tsx
<ThemeProvider defaultMode="dark" storageKey={null}>
  <PublicHubPage title="Welcome" primaryAction={{ label: 'Sign in', href: '/sign-in' }} />
</ThemeProvider>
\`\`\`

\`\`\`tsx
<ThemeProvider defaultMode="light" storageKey={null}>
  <PublicHubPage title="Welcome" primaryAction={{ label: 'Sign in', href: '/sign-in' }} />
</ThemeProvider>
\`\`\`

\`\`\`tsx
<ThemeProvider defaultMode="high_contrast" storageKey={null}>
  <PublicHubPage title="Welcome" primaryAction={{ label: 'Sign in', href: '/sign-in' }} />
</ThemeProvider>
\`\`\``,
  layout: 'AuthLayout',
  blocks: ['page-header'],
  pattern:
    'Named section (aria-labelledby points to the title span inside the PageHeader h1, including in server HTML); h2 card headings in a ul/li list. Loading: aria-busy=true and aria-label=loadingLabel, with decorative Skeletons and no content links or headings.',
  keyboard: [
    [
      'Tab / Shift+Tab',
      'Move through primary, secondary and tertiary navigation links in reading order, after the AuthLayout skip link named "Skip to main content"; focus is visible and can leave the page.',
    ],
    ['Enter', 'Follow the focused anchor href and invoke its optional onClick handler.'],
  ],
} satisfies TemplateMeta & { pattern: string; keyboard: [string, string][] };
