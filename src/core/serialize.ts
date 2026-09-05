import type { RenderParams } from './types';

export interface ShareState {
  params: RenderParams;
  targetId: string;
  axes: { decoId: string; themeId: string; effectId: string };
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodeState(state: ShareState): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(state)));
}

export function decodeState(hash: string): ShareState | null {
  const s = hash.replace(/^#/, '');
  if (!s) return null;
  try {
    const obj = JSON.parse(new TextDecoder().decode(fromBase64Url(s)));
    if (!obj?.params || obj.params.version !== 1) return null;
    return obj as ShareState;
  } catch {
    return null;
  }
}
