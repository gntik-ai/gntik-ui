import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'useOs',
  status: 'stable',
  description:
    'Reports the client operating system: macos, ios, windows, android, linux, chromeos or undetermined. Import useOs and getOs from @gntik-ai/ui/hooks. getOs() reads client hints, navigator.platform and the user agent once and is safe without navigator. useOs uses undetermined for server rendering and the initial hydration render, then the detected value, so markup never mismatches. Use it to pick platform labels such as the command key; prefer feature detection for behaviour.',
  signature: 'useOs(): Os',
  server:
    'Returns `undetermined` on the server and in the first hydration render; getOs() also returns undetermined without navigator.',
  also: ['getOs'],
};
