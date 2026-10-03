'use client';
import { SignInPage } from '@gntik-ai/templates';
import { useRouter } from 'next/navigation';

export function SignInView() {
  const router = useRouter();
  return <SignInPage onSubmit={() => router.push('/dashboard')} onSso={() => router.push('/dashboard')} />;
}
