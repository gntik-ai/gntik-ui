// Share links: the source travels in the URL hash, never to a server.
//   #z=<base64url(deflate-raw(utf8))>   compressed (CompressionStream)
//   #c=<base64url(utf8)>                fallback where CompressionStream is missing
// Theme and brand ride along as `t` and `b`.
import type { ResolvedTheme } from '@gntik-ai/ui';
import type { BrandId } from './protocol';

export interface SharedState {
  code: string;
  theme?: ResolvedTheme;
  brand?: BrandId;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes: Uint8Array<ArrayBuffer>, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const piped = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(piped).arrayBuffer());
}

const canCompress = () => typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';

/** Builds the hash (without `#`) for a state. */
export async function encodeShare({ code, theme, brand }: SharedState): Promise<string> {
  const params = new URLSearchParams();
  const raw = new TextEncoder().encode(code);
  if (canCompress()) {
    try {
      params.set('z', toBase64Url(await pipe(raw, new CompressionStream('deflate-raw'))));
    } catch {
      params.set('c', toBase64Url(raw));
    }
  } else {
    params.set('c', toBase64Url(raw));
  }
  if (theme) params.set('t', theme);
  if (brand) params.set('b', brand);
  return params.toString();
}

const THEME_IDS: readonly string[] = ['dark', 'light', 'high_contrast'];
const BRAND_IDS: readonly string[] = ['gntik', 'musematic', 'falcone'];

/** Reads a hash (with or without `#`). Returns null when it holds no code or cannot be decoded. */
export async function decodeShare(hash: string): Promise<SharedState | null> {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const z = params.get('z');
  const c = params.get('c');
  try {
    let code: string;
    if (z) {
      if (!canCompress()) return null;
      code = new TextDecoder().decode(await pipe(fromBase64Url(z), new DecompressionStream('deflate-raw')));
    } else if (c) {
      code = new TextDecoder().decode(fromBase64Url(c));
    } else {
      return null;
    }
    const t = params.get('t');
    const b = params.get('b');
    return {
      code,
      theme: t && THEME_IDS.includes(t) ? (t as ResolvedTheme) : undefined,
      brand: b && BRAND_IDS.includes(b) ? (b as BrandId) : undefined,
    };
  } catch {
    return null;
  }
}
