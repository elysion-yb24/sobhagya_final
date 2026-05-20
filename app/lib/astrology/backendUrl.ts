/**
 * Base URL for the astrology API endpoints.
 *
 * Always returns a same-origin path that hits the Next.js proxy at
 * `app/api/astrology/[...path]`. The proxy uses `apiFetch` server-side, which
 * reads the HttpOnly auth cookies from the request and forwards them to
 * user-service with both the Authorization header AND the refresh cookie
 * that the backend's authMiddleware expects.
 *
 * We deliberately don't expose `NEXT_PUBLIC_BACKEND_URL` here anymore — calling
 * micro.sobhagya.in directly from the browser breaks because:
 *   - the backend CORS config doesn't whitelist the `cookies` request header,
 *     so preflight blocks the request;
 *   - even if it did, localhost cookies aren't sent cross-origin so the
 *     refresh-token check fails.
 */
export function backendUrl(): string {
  return "/api/astrology";
}
