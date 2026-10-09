/** Product-agnostic preview copy for an account awaiting activation. */
export const pendingActivationSample = {
  title: "Your account is awaiting activation",
  intro:
    "Your registration is complete. You can sign in once your account has been approved.",
  statusTitle: "Approval pending",
  statusMessage:
    "Your account is waiting for review. No further action is needed right now.",
  recovery: {
    "no-access": {
      title: "Account access is restricted",
      message:
        "This account is not available to you yet. Return to sign in or review your registration.",
    },
    "not-found": {
      title: "Account not found",
      message:
        "We could not find this registration. Return to sign in or review your sign-up.",
    },
    error: {
      title: "Account status unavailable",
      message: "We could not load your account status. Try again in a moment.",
    },
  },
  recoveryLinks: [
    { label: "Sign in", href: "/sign-in" },
    { label: "Review sign-up", href: "/sign-up" },
  ],
};
