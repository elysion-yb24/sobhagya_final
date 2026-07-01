"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../utils/auth-utils";

/**
 * Client-side auth guard for feature pages that must not be used by guests.
 *
 * On mount it checks `isAuthenticated()`. If the user is signed in it returns
 * `true` (the page can render); otherwise it redirects to
 * `/login?next=<path>` and returns `false`, so the page can render a
 * lightweight placeholder while the redirect happens. The login page honors
 * the same-origin `?next=` hint and returns the user here after sign-in.
 *
 * This mirrors the existing pattern in app/chat-app/page.tsx and is backed by
 * the cookie-based edge gate in middleware.ts.
 */
export function useRequireAuth(next: string): boolean {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setReady(true);
    } else {
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [router, next]);

  return ready;
}
