import type { Metadata } from 'next';
import { SignInView } from './view';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInRoute() {
  return <SignInView />;
}
