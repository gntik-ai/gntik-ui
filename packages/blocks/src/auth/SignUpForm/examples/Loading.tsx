import { SignUpForm } from '../SignUpForm';

/** Policy loading is separate from loading, which represents submitting an account. */
export default function Loading() {
  return <SignUpForm policyLoading />;
}
