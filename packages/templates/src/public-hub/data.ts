/** Product-agnostic English copy; optional content is supplied explicitly. */
export const publicHubCopy = {
  title: 'Welcome',
  primaryAction: { label: 'Sign in', href: '#sign-in' },
};

export const publicHubFixture = {
  ...publicHubCopy,
  eyebrow: 'Start here',
  description: 'Choose how to continue to your workspace.',
  cards: [
    {
      title: 'Your workspace',
      body: 'Keep your projects and resources together.',
    },
    {
      title: 'Your team',
      body: 'Share your work and collaborate with others.',
    },
  ],
  secondaryAction: { label: 'Create an account', href: '#sign-up' },
  tertiaryLink: { label: 'Recover access', href: '#recovery' },
  footer: 'Need help? Contact your account administrator.',
};
