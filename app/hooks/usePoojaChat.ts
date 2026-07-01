'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { getPoojaChatSocket } from '../utils/poojaChatSocket';
import { getUserDetails } from '../utils/auth-utils';

export type PoojaChatEvent =
  | 'receive_message'
  | 'pooja_live_scheduled'
  | 'pooja_schedule_change_requested'
  | 'pooja_live_reminder'
  | 'pooja_live_start'
  | 'pooja_feedback_request'
  | 'pooja_live_joined'
  | 'clarify_window'
  | 'clarify_window_ended'
  | 'session_ended'
  | 'astrologer_joined';

type Handlers = Partial<Record<PoojaChatEvent, (payload: any) => void>>;

// Max time to wait for a socket-ack before failing the action (so a dead/slow
// socket shows an error instead of an infinite spinner).
const ACK_TIMEOUT_MS = 12000;

const EVENT_NAMES: PoojaChatEvent[] = [
  'receive_message',
  'pooja_live_scheduled',
  'pooja_schedule_change_requested',
  'pooja_live_reminder',
  'pooja_live_start',
  'pooja_feedback_request',
  'pooja_live_joined',
  'clarify_window',
  'clarify_window_ended',
  'session_ended',
  'astrologer_joined',
];

/**
 * Devotee-side chat-socket hook for the pooja workflow. Joins the session, binds
 * the pooja socket events, and exposes typed emitters (mirrors the chat web app's
 * useChatSocket, but for role 'user' inside this frontend). Realtime updates for
 * scheduling, negotiation and the 5-min clarify chat flow through here.
 */
export function usePoojaChat({
  threadId,
  sessionId,
  orderId,
  handlers,
  autoJoin = true,
  onJoined,
}: {
  threadId?: string | null;
  sessionId?: string | null;
  orderId?: string | null;
  handlers?: Handlers;
  autoJoin?: boolean;
  onJoined?: (session: any) => void;
}) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<Handlers | undefined>(handlers);
  handlersRef.current = handlers;
  const onJoinedRef = useRef(onJoined);
  onJoinedRef.current = onJoined;
  const [connected, setConnected] = useState(false);

  const userId = String(getUserDetails()?.id || getUserDetails()?._id || '');

  useEffect(() => {
    if (!threadId || !sessionId) return;
    const socket = getPoojaChatSocket();
    socketRef.current = socket;

    const join = () => {
      setConnected(true);
      if (autoJoin) socket.emit('join_session', { threadId, sessionId, isAstrologer: false }, (resp: any) => onJoinedRef.current?.(resp?.data));
    };
    if (socket.connected) join();
    socket.on('connect', join);
    const onDisconnect = () => setConnected(false);
    socket.on('disconnect', onDisconnect);

    const bound: Record<string, (p: any) => void> = {};
    EVENT_NAMES.forEach((name) => {
      const fn = (p: any) => handlersRef.current?.[name]?.(p);
      bound[name] = fn;
      socket.on(name, fn);
    });

    return () => {
      socket.off('connect', join);
      socket.off('disconnect', onDisconnect);
      EVENT_NAMES.forEach((name) => socket.off(name, bound[name]));
    };
  }, [threadId, sessionId, autoJoin]);

  // Emit an event that expects a server ack, but NEVER hang the UI: if the socket
  // is disconnected (or the gateway/chat-service is briefly unreachable on deploy)
  // the ack may never arrive, which previously left action buttons spinning
  // forever. We race the ack against a timeout and always resolve a result.
  const emitWithAck = useCallback(
    (event: string, payload: any, ready: boolean): Promise<any> =>
      new Promise((resolve) => {
        const s = socketRef.current;
        if (!s || !ready) return resolve({ success: false, message: 'Not connected. Please refresh and try again.' });
        let done = false;
        let timer: ReturnType<typeof setTimeout>;
        const finish = (r: any) => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve(r);
        };
        timer = setTimeout(
          () => finish({ success: false, message: 'Request timed out — please check your connection and try again.' }),
          ACK_TIMEOUT_MS,
        );
        try {
          s.emit(event, payload, (resp: any) => finish(resp ?? { success: false }));
        } catch {
          finish({ success: false, message: 'Could not send request.' });
        }
      }),
    []
  );

  const sendMessage = useCallback(
    (message: string): Promise<any> =>
      emitWithAck('send_message', { sessionId, threadId, sentBy: userId, message, messageType: 'text' }, !!(sessionId && threadId)),
    [emitWithAck, sessionId, threadId, userId]
  );

  const scheduleLive = useCallback(
    (scheduledAtISO: string): Promise<any> =>
      emitWithAck('schedule_pooja_live', { threadId, sessionId, orderId, scheduledAt: scheduledAtISO }, !!(sessionId && threadId)),
    [emitWithAck, sessionId, threadId, orderId]
  );

  const respondScheduleChange = useCallback(
    (accept: boolean): Promise<any> =>
      emitWithAck('pooja_schedule_change_respond', { threadId, sessionId, orderId, accept }, !!(sessionId && threadId)),
    [emitWithAck, sessionId, threadId, orderId]
  );

  const markJoin = useCallback(
    (): Promise<any> => emitWithAck('pooja_live_join', { sessionId, role: 'user' }, !!sessionId),
    [emitWithAck, sessionId]
  );

  return { connected, sendMessage, scheduleLive, respondScheduleChange, markJoin };
}
