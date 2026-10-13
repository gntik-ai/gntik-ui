import { SignUpForm } from '../SignUpForm';

/** Explicit opt-out; omitting terms continues to require consent. */
export default function NoTerms() {
  return <SignUpForm terms={false} sso={null} passwordHelp={(minimum) => `Use at least ${minimum} characters.`} />;
}
