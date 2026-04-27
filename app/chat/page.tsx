'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthToken, getRefreshToken, getUserDetails } from '../utils/auth-utils';
import { getChatBackendUrl } from '../config/api';

// Mirrors the Flutter `_onTapHandler` cookie-seeding flow:
//   1. Try chat-service /api/chat/web-handoff directly. That response comes
//      from a *.sobhagya.in host (e.g. micro.sobhagya.in), so it can legally
//      set cookies with `Domain=.sobhagya.in` — the browser stores them and
//      delivers them to chat.sobhagya.in on the next request.
//   2. If the handoff endpoint is unavailable (e.g. backend not yet deployed),
//      fall back to URL-param navigation. Chatterbox without proper cookies
//      will degrade to its unauth state, but at least the page renders an
//      iframe instead of a hard "Failed to fetch" error.
//   3. Render an iframe pointing at the resolved chatUrl.
type Status = 'checking' | 'ready' | 'unauthorized' | 'error';

const CHAT_THREAD_URL = 'https://chat.sobhagya.in/chat/';
const CHAT_THREADS_URL = 'https://chat.sobhagya.in/threads';

function buildLegacyChatUrl(args: {
  threadId: string | null;
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  role: string;
}): string {
  const base = args.threadId
    ? `${CHAT_THREAD_URL}${encodeURIComponent(args.threadId)}`
    : CHAT_THREADS_URL;
  const qs = new URLSearchParams();
  qs.set('userId', args.userId);
  qs.set('access_token', args.accessToken);
  qs.set('role', args.role);
  if (args.refreshToken) qs.set('token', args.refreshToken);
  return `${base}?${qs.toString()}`;
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('checking');
  const [chatUrl, setChatUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [usedFallback, setUsedFallback] = useState<boolean>(false);

  const threadId =
    searchParams?.get('threadId') || searchParams?.get('sessionId') || null;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const accessToken = getAuthToken();
    const refresh = getRefreshToken();
    const user = getUserDetails();
    const userId = user?.id || user?._id;
    const role = user?.role || 'user';

    if (!accessToken || !userId) {
      setStatus('unauthorized');
      return;
    }

    const legacyUrl = buildLegacyChatUrl({
      threadId,
      userId: String(userId),
      accessToken,
      refreshToken: refresh,
      role,
    });

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };
    if (refresh && refresh !== accessToken) headers['cookies'] = refresh;

    const qs = new URLSearchParams();
    if (threadId) qs.set('threadId', threadId);
    qs.set('role', role);
    const handoffUrl = `${getChatBackendUrl()}/chat/web-handoff?${qs.toString()}`;

    fetch(handoffUrl, { method: 'GET', headers, credentials: 'include' })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        const url = json?.data?.chatUrl;
        if (!res.ok || !json?.success || !url) {
          throw new Error(json?.message || `HTTP ${res.status}`);
        }
        setChatUrl(url as string);
        setStatus('ready');
      })
      .catch((err) => {
        // Backend handoff unavailable (CORS / 404 / network). Use the
        // URL-param URL so the iframe still mounts. Chatterbox will likely
        // be unauth without cookies, but this is no worse than today's
        // pre-deploy behaviour.
        console.warn('[chat] handoff unavailable, falling back to URL params:', err);
        setChatUrl(legacyUrl);
        setUsedFallback(true);
        setStatus('ready');
      });
  }, [threadId]);

  if (status === 'unauthorized') {
    return (
      <div
        className="fixed inset-0 bg-white z-40 flex items-center justify-center p-6"
        style={{ top: '64px' }}
      >
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Please sign in to chat
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your conversations.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className="fixed inset-0 bg-white z-40 flex items-center justify-center p-6"
        style={{ top: '64px' }}
      >
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Couldn&apos;t open chat
          </h2>
          <p className="text-gray-600 mb-6">{errorMsg}</p>
          <button
            onClick={() => router.refresh()}
            className="px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (status === 'checking' || !chatUrl) {
    return (
      <div
        className="fixed inset-0 bg-white z-40 flex items-center justify-center"
        style={{ top: '64px' }}
      >
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-700 font-medium">Opening chat…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-white z-40 flex flex-col"
      style={{ top: '64px' }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 text-sm">
        <span className="text-gray-700 font-medium">
          Chat
          {usedFallback && (
            <span className="ml-2 text-amber-600 text-xs">
              (handoff unavailable — sign-in may not persist)
            </span>
          )}
        </span>
        <a
          href={chatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-600 underline font-medium"
        >
          Open in new tab ↗
        </a>
      </div>
      <iframe
        src={chatUrl}
        title="Chat"
        className="flex-1 w-full border-0"
        allow="microphone; clipboard-write"
      />
    </div>
  );
}
