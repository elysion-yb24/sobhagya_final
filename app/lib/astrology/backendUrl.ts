/**
 * Resolves the base URL for the astrology backend.
 * Set NEXT_PUBLIC_BACKEND_URL to point at the Express service
 * (locally http://localhost:5000, on Render the public URL).
 */
export function backendUrl(): string {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url || url.trim() === "") {
    return "http://localhost:4001";
  }
  return url.replace(/\/+$/, "");
}
