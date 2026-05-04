// Shared in-memory cache of astrologers loaded across pages.
//
// As the call-with-astrologer list paginates, each batch is appended here. The
// profile page reads from this cache first; if the requested astrologer isn't
// present, it continues paginating from where the cache left off and appends
// new pages to the same cache. This keeps a single growing source of truth
// instead of each page re-fetching from scratch.

import { getApiBaseUrl } from "../config/api";
import { getAuthToken } from "./auth-utils";

export interface CachedAstrologer {
  _id: string;
  name: string;
  [key: string]: unknown;
}

const PAGE_SIZE = 200;
const MAX_PAGES = 25; // 5,000 row ceiling

const astrologerById = new Map<string, CachedAstrologer>();
let nextSkip = 0;
let exhausted = false;
let inflight: Promise<void> | null = null;

function extractList(payload: unknown): CachedAstrologer[] {
  const p = payload as Record<string, unknown> | null | undefined;
  if (!p) return [];
  const data = p.data as Record<string, unknown> | unknown[] | undefined;
  if (Array.isArray((data as Record<string, unknown>)?.list)) {
    return ((data as Record<string, unknown>).list as CachedAstrologer[]) || [];
  }
  if (Array.isArray(data)) return data as CachedAstrologer[];
  if (Array.isArray(p.users)) return p.users as CachedAstrologer[];
  return [];
}

/** Append a batch of astrologers loaded externally (e.g. from the list page). */
export function appendAstrologers(batch: CachedAstrologer[]): void {
  for (const a of batch) {
    if (a && a._id) astrologerById.set(String(a._id), a);
  }
}

/** Read a single astrologer from cache without triggering a fetch. */
export function getCachedAstrologer(id: string): CachedAstrologer | undefined {
  return astrologerById.get(String(id));
}

/** Read every astrologer currently in the cache, in insertion order. */
export function getAllCachedAstrologers(): CachedAstrologer[] {
  return Array.from(astrologerById.values());
}

/**
 * Fetch the next page of users-list and append it to the shared cache.
 * Returns the batch that was just loaded, or null if the list is exhausted.
 * Concurrent calls share the same in-flight request.
 */
async function fetchNextPage(): Promise<CachedAstrologer[] | null> {
  if (exhausted) return null;
  if (inflight) {
    await inflight;
    return [];
  }

  const skip = nextSkip;
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  inflight = (async () => {
    try {
      const res = await fetch(
        `${baseUrl}/user/api/users-list?skip=${skip}&limit=${PAGE_SIZE}&asc=-1`,
        {
          method: "GET",
          headers,
          credentials: "include",
          cache: "no-store",
        }
      );
      if (!res.ok) {
        exhausted = true;
        return;
      }
      const json = await res.json().catch(() => null);
      const list = extractList(json);
      if (list.length === 0) {
        exhausted = true;
        return;
      }
      appendAstrologers(list);
      nextSkip = skip + list.length;
      if (list.length < PAGE_SIZE) exhausted = true;
    } finally {
      inflight = null;
    }
  })();

  await inflight;
  return getAllCachedAstrologers();
}

/**
 * Find an astrologer by ID, paginating users-list and appending to the shared
 * cache until found or the list is exhausted. The same cache is reused across
 * the list page, profile page, and similar-astrologers section.
 */
export async function findOrFetchAstrologer(
  id: string
): Promise<CachedAstrologer | null> {
  if (!id) return null;
  const cached = astrologerById.get(String(id));
  if (cached) return cached;

  // Try the by-id endpoint first; if it works, populate the cache.
  try {
    const baseUrl = getApiBaseUrl();
    const token = getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${baseUrl}/user/api/users/${id}`, {
      method: "GET",
      headers,
      credentials: "include",
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json().catch(() => null);
      const user =
        (json?.data?.user as CachedAstrologer | undefined) ||
        (json?.data as CachedAstrologer | undefined);
      if (json?.success && user && user._id) {
        astrologerById.set(String(user._id), user);
        return user;
      }
    }
  } catch {
    // ignore — fall through to paginated lookup
  }

  // Paginated walk. Each page is appended to the shared cache, so subsequent
  // lookups (or the list page rendering) see the accumulated data.
  for (let i = 0; i < MAX_PAGES; i++) {
    const batch = await fetchNextPage();
    if (batch === null) break; // exhausted
    const hit = astrologerById.get(String(id));
    if (hit) return hit;
    if (exhausted) break;
  }

  return astrologerById.get(String(id)) || null;
}

/** Reset the cache — call after explicit refresh actions if needed. */
export function resetAstrologerCache(): void {
  astrologerById.clear();
  nextSkip = 0;
  exhausted = false;
  inflight = null;
}
