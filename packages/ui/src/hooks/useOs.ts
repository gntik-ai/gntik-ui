import { useSyncExternalStore } from 'react';

/** Operating systems detected by {@link getOs}; undetermined is also the server snapshot. */
export type Os = 'undetermined' | 'macos' | 'ios' | 'windows' | 'android' | 'linux' | 'chromeos';

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: { platform?: string };
}

function detect(platform: string, maxTouchPoints: number): Os {
  if (/iphone|ipad|ipod|ios/i.test(platform) || (/MacIntel/i.test(platform) && maxTouchPoints > 1)) return 'ios';
  if (/mac/i.test(platform)) return 'macos';
  if (/win/i.test(platform)) return 'windows';
  if (/android/i.test(platform)) return 'android';
  if (/cros|chrome\s?os/i.test(platform)) return 'chromeos';
  if (/linux/i.test(platform)) return 'linux';
  return 'undetermined';
}

/** Detect the OS from client hints, platform and user agent; safe without navigator. */
export function getOs(): Os {
  if (typeof navigator === 'undefined') return 'undetermined';
  const nav: NavigatorWithUserAgentData = navigator;
  const touchPoints = nav.maxTouchPoints ?? 0;
  const hinted = detect(nav.userAgentData?.platform ?? '', touchPoints);
  if (hinted !== 'undetermined') return hinted;
  const platform = detect(nav.platform ?? '', touchPoints);
  // Android and ChromeOS commonly identify their navigator.platform as Linux.
  if (platform !== 'undetermined' && platform !== 'linux') return platform;
  const agent = detect(nav.userAgent ?? '', touchPoints);
  if (platform === 'linux' && agent !== 'android' && agent !== 'chromeos') return platform;
  return agent;
}

const subscribe = () => () => {};
const getServerSnapshot = (): Os => 'undetermined';

/** Report the client OS, using undetermined for SSR and the initial hydration render. */
export function useOs(): Os {
  return useSyncExternalStore(subscribe, getOs, getServerSnapshot);
}
