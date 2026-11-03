import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'useDocumentTitle',
  status: 'stable',
  description:
    "useDocumentTitle(title) overrides document.title while the calling component is mounted. Inside a NavigationProvider the text gets the provider's separator and appTitle (Edit fn-42 · Console) and the route title returns on unmount; nested calls resolve to the innermost mounted one, in any unmount order, and undefined leaves the title alone. With documentTitle={false} on the provider nothing is written, which is the setting for Next.js apps whose metadata sets titles. Outside a provider the text is written as is and the previous title is restored on unmount. Import from @gntik-ai/ui or @gntik-ai/ui/hooks.",
  signature: 'useDocumentTitle(title: string | undefined): void',
  server: 'Does nothing and never reads `document.title`; the title is only written in an effect after mount.',
};
