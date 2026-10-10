import type { BlockMeta } from "../../meta";

/** Catalogue contract read by get_block and llms-full.txt. */
export const documentation = {
  pattern:
    "Heading (titleAs h2/h3/h4), text-labelled Badge, optional features list and native consumer actions. Summary omits absent regions; no heading plus a development warning when name and emptyLabel are absent. ToggleGroup has an accessible Billing cycle label and aria-pressed buttons, rendered only with both prices. Axe coverage in dark, light and high_contrast.",
  keyboard: [
    [
      "Tab / Shift+Tab",
      "Move through the cycle toggle (only with both prices) and supplied buttons or links.",
    ],
    [
      "Arrow keys / Home / End",
      "Move focus within the monthly/annual toggle group.",
    ],
    [
      "Enter / Space",
      "Activate focused buttons and toggles; Enter activates links.",
    ],
  ],
  tokens: ["card", "foreground", "muted-foreground", "border", "focus-ring"],
  props: [
    ["variant", "billing (default) | summary"],
    [
      "billing plan",
      "BillingPlan: name, priceMonthly and renewsOn required; status, priceAnnual, currency, summary and features optional. Omitted plan uses samplePlan.",
    ],
    [
      "summary plan",
      "SummaryPlan: all optional: name, statusLabel, statusTone, priceMonthly, priceAnnual, currency, cycle, renewsOn, features. Prices are supplied cycle totals, never multiplied or discounted.",
    ],
    [
      "emptyLabel",
      "Summary only: consumer label used when the name is absent.",
    ],
    [
      "actions",
      "Summary only: ReactNode slot of kit Buttons or native links, absent by default.",
    ],
    [
      "defaultCycle / onCycleChange",
      "Initial monthly (default) or annual selection and cycle callback.",
    ],
    [
      "titleAs / className",
      "h2 | h3 (default) | h4; additional token-backed classes.",
    ],
    [
      "onUpgrade / onManage / upgradeLabel / manageLabel",
      "Billing only: existing action handlers and labels; both buttons always render.",
    ],
  ],
  examples: [
    "summary-full",
    "summary-minimal",
    "summary-unassigned",
    "summary-unassigned-no-label",
    "summary-price-only",
    "summary-zero-price",
    "summary-renewal-only",
    "summary-features-only",
    "summary-actions-only",
  ],
};

export const meta: BlockMeta = {
  name: "Plan card",
  family: "billing",
  status: "beta",
  description: [
    'Default billing header retains sample plan, Active status fallback, required monthly price and renewal, monthly/annual per-month pricing and built-in Manage/Upgrade actions. Opt-in variant="summary" uses only consumer data: optional name or emptyLabel, statusLabel, price totals (including zero), cycle, renewal, features and action slots; no sample fallback. See README.md for props, ARIA, keyboard and examples.',
    '',
    '| Prop | Contract |',
    '| --- | --- |',
    ...documentation.props.map(([prop, contract]) => `| ${prop} | ${contract?.replaceAll('|', '\\|')} |`),
    '',
    'Examples:',
    ...documentation.examples.map((example) => `- [${example}](/preview.html?kind=block&id=plan-card--${example})`),
  ].join('\n'),
  uses: ["Card", "Badge", "Button", "ToggleGroup", "Toggle"],
};
