// Native-app bridge for the Pooja WebView. The pooja frontend runs inside the
// iOS/Android native shell; these helpers signal the wrapper to take over (start
// the live-puja video, open wallet top-up). Per spec: window.parent.postMessage,
// with the flutter_inappwebview bridge + ReactNativeWebView as fallbacks so it
// works across WebView styles. No-ops gracefully in a plain browser.

type NativePayload = Record<string, unknown>;

/** Is a native wrapper present (any bridge)? Used to decide UX fallbacks. */
export function hasNativeBridge(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(w.flutter_inappwebview?.callHandler || w.ReactNativeWebView?.postMessage || window.parent !== window);
}

/** Emit an event to the native wrapper across all supported bridges. */
export function emitNative(type: string, payload: NativePayload = {}): void {
  if (typeof window === 'undefined') return;
  const msg = { type, ...payload };
  const w = window as any;
  // 1) Spec contract: post to the parent (native WebView host).
  try { window.parent?.postMessage(msg, '*'); } catch { /* noop */ }
  // 2) Flutter InAppWebView bridge (the existing "Call with Astrologer" channel).
  try {
    const handler = type === 'start_call' ? 'startCall' : type;
    w.flutter_inappwebview?.callHandler?.(handler, msg);
  } catch { /* noop */ }
  // 3) React Native WebView bridge.
  try { w.ReactNativeWebView?.postMessage?.(JSON.stringify(msg)); } catch { /* noop */ }
}

/** Signal the native app to start the live-puja video (it owns the call). */
export function startCallNative(payload: { poojaId?: string; orderId?: string; sessionId?: string; threadId?: string }): void {
  emitNative('start_call', { ...payload, callType: 'video', source: 'pooja' });
}

/** Signal the native app to open wallet top-up/recharge. */
export function topUpWalletNative(amountNeeded: number): void {
  emitNative('top_up_wallet', { amountNeeded });
}
