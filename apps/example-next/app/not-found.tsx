import { Status404Page } from '@gntik-ai/templates';

export default function NotFound() {
  return <Status404Page homeHref="/dashboard" homeLabel="Go to dashboard" supportHref="/sign-in" supportLabel="Sign in" />;
}
