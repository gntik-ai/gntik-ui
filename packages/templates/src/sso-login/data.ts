/** Sample copy for the single sign-on lookup. */
export const ssoLoginSample = {
  defaultEmail: '',
  signInHref: '#sign-in',
  /** Identity provider shown while redirecting (resolved from the email domain in a real product). */
  providerName: 'your identity provider',
};

/** Simple shape check before asking the server for the domain's identity provider. */
export const ssoEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
