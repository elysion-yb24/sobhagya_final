"use client";

import { useCallback, useRef, useState } from "react";

interface Options<TIn> {
  /** Builds a deterministic key from the input. Defaults to JSON.stringify(input). */
  keyFor?: (input: TIn) => string;
  /**
   * Window during which an identical payload reuses the in-flight promise
   * instead of firing again. Defaults to 1500ms.
   */
  windowMs?: number;
}

interface DedupedState<TOut> {
  loading: boolean;
  data: TOut | null;
  error: string | null;
}

/**
 * Client-side deduplication for expensive action submits.
 *
 * Why: a double-tap on "Generate Kundli" today fires two identical POSTs to
 * the backend. The backend will resolve both to the same cache row, but the
 * second request still costs a TLS handshake and a Mongo lookup. This hook
 * collapses repeats of the same payload into a single promise.
 */
export function useDedupedAction<TIn, TOut>(
  fn: (input: TIn) => Promise<TOut>,
  opts: Options<TIn> = {},
) {
  const { keyFor = (i: TIn) => JSON.stringify(i), windowMs = 1500 } = opts;
  const [state, setState] = useState<DedupedState<TOut>>({ loading: false, data: null, error: null });
  const inflight = useRef<{ key: string; at: number; promise: Promise<TOut> } | null>(null);

  const run = useCallback(async (input: TIn): Promise<TOut> => {
    const key = keyFor(input);
    const now = Date.now();
    const existing = inflight.current;
    if (existing && existing.key === key && now - existing.at < windowMs) {
      return existing.promise;
    }
    const promise = (async () => {
      setState({ loading: true, data: null, error: null });
      try {
        const result = await fn(input);
        setState({ loading: false, data: result, error: null });
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Request failed.";
        setState({ loading: false, data: null, error: msg });
        throw err;
      } finally {
        if (inflight.current && inflight.current.key === key) inflight.current = null;
      }
    })();
    inflight.current = { key, at: now, promise };
    return promise;
  }, [fn, keyFor, windowMs]);

  const reset = useCallback(() => {
    inflight.current = null;
    setState({ loading: false, data: null, error: null });
  }, []);

  return { run, reset, ...state };
}
