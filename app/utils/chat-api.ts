// Client-side helpers for the chat REST API (proxied through Next.js /api/chat/*).
// These talk to the backend `chat-service` at https://micro.sobhagya.in/chat/api.

import { getAuthToken, getRefreshToken } from './auth-utils';

// -------------------- Types --------------------

export interface PopulatedUser {
  _id: string;
  name: string;
  avatar?: string;
}

/** A normalized chat thread for the UI. `sessionId` is historically the field
 *  the UI uses as the conversation's primary key; we populate it with the
 *  backend's threadId so existing code keeps working. `lastSessionId` holds
 *  the actual current session document id (needed for send_message, end_session). */
export interface ChatThreadView {
  sessionId: string;          // backend threadId (thread._id)
  threadId: string;           // alias (same value)
  lastSessionId: string | null; // current session document id
  providerId: PopulatedUser;
  userId: PopulatedUser;
  lastMessage: string;
  createdAt: string;
  status: 'active' | 'ended' | 'pending';
  userUnreadCount: number;
  providerUnreadCount: number;
}

export interface BackendThread {
  _id: string;
  providerId: string;
  userId: string;
  userName?: string;
  providerName?: string;
  providerUnreadCount?: number;
  userUnreadCount?: number;
  lastMessage?: string;
  lastMessageType?: string;
  lastSessionId?: string | null;
  totalSessions?: number;
  isActiveSession?: boolean;
  providerProfileImage?: string | null;
  userProfileImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendMessage {
  _id?: string;
  chatId: string;
  sentBy: string;
  receivedBy: string;
  message: string;
  voiceMessageDuration?: number;
  sessionId: string;
  threadId: string;
  messageType: 'voice' | 'image' | 'info' | 'text' | 'options' | 'file' | 'video' | 'informative' | 'call' | '';
  fileLink?: string;
  replyMessage?: any;
  isAutomated?: boolean;
  createdAt: string;
}

// -------------------- Headers --------------------

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const refresh = getRefreshToken();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  // Backend middleware reads the refresh token from the `cookies` header.
  if (refresh && refresh !== token) h['cookies'] = refresh;
  return h;
}

function authHeadersMultipart(): Record<string, string> {
  const token = getAuthToken();
  const refresh = getRefreshToken();
  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (refresh && refresh !== token) h['cookies'] = refresh;
  return h;
}

async function parseJson(res: Response): Promise<any> {
  return res.json().catch(() => ({}));
}

// -------------------- Adapters --------------------

export function adaptThread(t: BackendThread, currentUserId?: string | null): ChatThreadView {
  const providerName = t.providerName || 'Astrologer';
  const userName = t.userName || 'User';

  // Distinguish pending/active/ended using lastSessionId + isActiveSession + totalSessions.
  // - isActiveSession true  → 'active'
  // - has lastSessionId but not active → 'ended'
  // - no sessions ever → 'pending' (newly created thread awaiting acceptance)
  let status: 'active' | 'ended' | 'pending';
  if (t.isActiveSession) {
    status = 'active';
  } else if (t.lastSessionId || (t.totalSessions && t.totalSessions > 0)) {
    status = 'ended';
  } else {
    status = 'pending';
  }

  return {
    sessionId: String(t._id),
    threadId: String(t._id),
    lastSessionId: t.lastSessionId ? String(t.lastSessionId) : null,
    providerId: {
      _id: String(t.providerId),
      name: providerName,
      avatar: t.providerProfileImage || undefined,
    },
    userId: {
      _id: String(t.userId),
      name: userName,
      avatar: t.userProfileImage || undefined,
    },
    lastMessage: t.lastMessage || '',
    createdAt: t.updatedAt || t.createdAt || new Date().toISOString(),
    status,
    userUnreadCount: t.userUnreadCount || 0,
    providerUnreadCount: t.providerUnreadCount || 0,
  };
}

// -------------------- REST functions --------------------

export async function fetchThreads(params: { lastTimeStamp?: string; limit?: number } = {}): Promise<{
  threads: BackendThread[];
  hasMore: boolean;
}> {
  const qs = new URLSearchParams();
  if (params.lastTimeStamp) qs.set('lastTimeStamp', params.lastTimeStamp);
  const limit = params.limit || 20;
  qs.set('limit', String(limit));

  const url = `/api/chat/threads?${qs.toString()}`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders(), credentials: 'include' });
  if (!res.ok) {
    console.error('[chat-api] fetchThreads failed', res.status);
    return { threads: [], hasMore: false };
  }
  const json = await parseJson(res);
  const data = Array.isArray(json?.data) ? json.data : [];
  return {
    threads: data as BackendThread[],
    hasMore: data.length >= limit,
  };
}

export async function fetchMessages(
  threadId: string,
  params: { lastTimeStamp?: string; limit?: number } = {}
): Promise<BackendMessage[]> {
  if (!threadId) return [];
  const qs = new URLSearchParams();
  if (params.lastTimeStamp) qs.set('lastTimeStamp', params.lastTimeStamp);
  if (params.limit) qs.set('limit', String(params.limit));
  const url = `/api/chat/messages/${encodeURIComponent(threadId)}${qs.toString() ? `?${qs}` : ''}`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders(), credentials: 'include' });
  if (!res.ok) {
    console.error('[chat-api] fetchMessages failed', res.status);
    return [];
  }
  const json = await parseJson(res);
  const data = Array.isArray(json?.data) ? json.data : [];
  return data as BackendMessage[];
}

export interface CreateSessionResult {
  threadId: string;
  sessionId: string;
  thread: BackendThread;
  session: any;
}

export async function createChatSession(userId: string, providerId: string): Promise<CreateSessionResult | null> {
  if (!userId || !providerId) return null;
  const res = await fetch('/api/chat/create-session', {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ userId, providerId }),
  });
  const json = await parseJson(res);
  if (!res.ok || !json?.success || !json?.data?.thread || !json?.data?.session) {
    const message = json?.message || `HTTP ${res.status}`;
    console.error('[chat-api] createChatSession failed:', message);
    return null;
  }
  const thread = json.data.thread as BackendThread;
  const session = json.data.session;
  return {
    threadId: String(thread._id),
    sessionId: String(session._id),
    thread,
    session,
  };
}

export async function fetchThreadById(threadId: string): Promise<BackendThread | null> {
  if (!threadId) return null;
  const res = await fetch(`/api/chat/thread/${encodeURIComponent(threadId)}`, {
    method: 'GET', headers: authHeaders(), credentials: 'include',
  });
  if (!res.ok) return null;
  const json = await parseJson(res);
  return (json?.data as BackendThread) || null;
}

export async function declineSession(threadId: string, sessionId: string): Promise<boolean> {
  if (!threadId || !sessionId) return false;
  const res = await fetch('/api/chat/session/decline', {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ threadId, sessionId }),
  });
  const json = await parseJson(res);
  return Boolean(res.ok && json?.success);
}

export async function fetchChatServiceStatus(): Promise<{ ok: boolean; data: any }> {
  try {
    const res = await fetch('/api/chat/chat-service-status', {
      method: 'GET', headers: authHeaders(), credentials: 'include',
    });
    const json = await parseJson(res);
    return { ok: Boolean(res.ok && json?.success !== false), data: json?.data ?? null };
  } catch (err) {
    console.error('[chat-api] fetchChatServiceStatus failed:', err);
    return { ok: false, data: null };
  }
}

export async function fetchUserDetails(userIds: string[]): Promise<PopulatedUser[]> {
  if (!userIds?.length) return [];
  const res = await fetch('/api/chat/user-details', {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ userIds }),
  });
  if (!res.ok) return [];
  const json = await parseJson(res);
  const users = json?.data?.users;
  return Array.isArray(users) ? (users as PopulatedUser[]) : [];
}

export async function fetchPartnerDetails(partnerIds: string[]): Promise<PopulatedUser[]> {
  if (!partnerIds?.length) return [];
  const res = await fetch('/api/chat/partner-details', {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify({ partnerIds }),
  });
  if (!res.ok) return [];
  const json = await parseJson(res);
  const users = json?.data?.users;
  return Array.isArray(users) ? (users as PopulatedUser[]) : [];
}

export interface UploadFileResult {
  fileLink: string;
  [k: string]: any;
}

export async function uploadChatFile(file: File): Promise<UploadFileResult | null> {
  if (!file) return null;
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/chat/upload-file', {
    method: 'POST',
    headers: authHeadersMultipart(),
    credentials: 'include',
    body: fd,
  });
  const json = await parseJson(res);
  if (!res.ok || !json?.success) {
    console.error('[chat-api] uploadChatFile failed:', json?.message || res.status);
    return null;
  }
  const data = json?.data || {};
  const fileLink = data.fileLink || data.url || data.location || data.file || '';
  if (!fileLink) {
    console.warn('[chat-api] uploadChatFile: no fileLink in response', data);
    return null;
  }
  return { ...data, fileLink };
}

export async function fetchPlans(): Promise<any[]> {
  const res = await fetch('/api/chat/get-plans', {
    method: 'GET', headers: authHeaders(), credentials: 'include',
  });
  if (!res.ok) return [];
  const json = await parseJson(res);
  return Array.isArray(json?.data?.plans) ? json.data.plans : [];
}

export interface CurrentPlanInfo {
  chatCredits: any;
  plans: any[];
}

export async function fetchCurrentPlan(): Promise<CurrentPlanInfo | null> {
  const res = await fetch('/api/chat/get-current-plan', {
    method: 'GET', headers: authHeaders(), credentials: 'include',
  });
  if (!res.ok) return null;
  const json = await parseJson(res);
  return (json?.data as CurrentPlanInfo) || null;
}

export async function checkCredits(): Promise<any | null> {
  const res = await fetch('/api/chat/check-credits', {
    method: 'GET', headers: authHeaders(), credentials: 'include',
  });
  if (!res.ok) return null;
  const json = await parseJson(res);
  return json?.data ?? null;
}

export async function redeemCredits(): Promise<any | null> {
  const res = await fetch('/api/chat/redeem-credits', {
    method: 'GET', headers: authHeaders(), credentials: 'include',
  });
  if (!res.ok) return null;
  const json = await parseJson(res);
  return json?.data ?? null;
}
