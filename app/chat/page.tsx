'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthToken, getRefreshToken, getUserDetails } from '../utils/auth-utils';

// Mirrors the Flutter reference:
//   static String chatURL        = "https://chat.sobhagya.in/chat/";
//   static const String previousChatURl = "https://chat.sobhagya.in/threads";
// The Flutter app loads those URLs inside an in-app WebView and seeds auth
// cookies. In the browser, framing is blocked by X-Frame-Options on
// chat.sobhagya.in, so we do a top-level navigation instead — same
// destination, same auth params, just taking the whole tab.
const CHAT_THREAD_URL = 'https://chat.sobhagya.in/chat/';
const CHAT_THREADS_URL = 'https://chat.sobhagya.in/threads';

function buildChatUrl(params: {
  threadId?: string | null;
  userId: string;
  accessToken: string;
  refreshToken?: string | null;
  role?: string | null;
}): string {
  const base = params.threadId
    ? `${CHAT_THREAD_URL}${encodeURIComponent(params.threadId)}`
    : CHAT_THREADS_URL;

  const qs = new URLSearchParams();
  qs.set('userId', params.userId);
  qs.set('access_token', params.accessToken);
  if (params.refreshToken) qs.set('token', params.refreshToken);
  qs.set('role', params.role || 'user');

  return `${base}?${qs.toString()}`;
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'unauthorized'>(
    'checking'
  );
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  const threadId =
    searchParams?.get('threadId') || searchParams?.get('sessionId') || null;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = getAuthToken();
    const refresh = getRefreshToken();
    const user = getUserDetails();

    if (!token || !user?.id) {
      setStatus('unauthorized');
      return;
    }

    const url = buildChatUrl({
      threadId,
      userId: user.id,
      accessToken: token,
      refreshToken: refresh,
      role: user.role || 'user',
    });

    setTargetUrl(url);
    setStatus('redirecting');

    // Top-level navigation — matches the Flutter WebView behavior (user lands
    // on chat.sobhagya.in with auth in the URL). Browser back returns here.
    window.location.href = url;
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

  return (
    <div
      className="fixed inset-0 bg-white z-40 flex items-center justify-center"
      style={{ top: '64px' }}
    >
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-700 font-medium">Opening chat…</p>
        {targetUrl && (
          <p className="text-gray-500 text-sm max-w-md">
            If this page doesn&apos;t open automatically,{' '}
            <a
              href={targetUrl}
              className="text-orange-600 underline font-medium"
            >
              click here to continue
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
