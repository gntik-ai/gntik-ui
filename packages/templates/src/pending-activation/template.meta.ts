import type { TemplateMeta } from "../meta";

export const meta: TemplateMeta = {
  name: "Pending activation",
  family: "Auth",
  priority: "P2",
  status: "beta",
  description:
    "Centred card for registered accounts awaiting approval or activation: polite status, optional request reference, allowed actions and recovery links. Use instead of verify-email when activation requires approval rather than an email verification link.",
  layout: "AuthLayout",
  blocks: ["inline-callout", "error-panel"],
};
