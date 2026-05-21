/**
 * Returns the base URL used by Socket.IO clients to reach the call-socket and
 * other realtime endpoints. Socket.IO websockets aren't subject to the same
 * CORS preflight as REST (no custom `cookies` header), so we can dial the
 * backend directly — but we still want env-configurability for staging/dev.
 *
 * Precedence: NEXT_PUBLIC_SOCKET_URL > NEXT_PUBLIC_API_BASE_URL > production literal.
 */
export function getCallSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  return 'https://micro.sobhagya.in';
}
