import { io, Socket } from 'socket.io-client';
import { getCallSocketUrl } from '../lib/socketUrl';
import { getUserDetails } from './auth-utils';

// Chat-socket singleton for the pooja workflow (scheduling, negotiation, the 5-min
// clarify chat). The call socket targets /call-socket; the pooja chat/schedule
// lives on /chat-socket/socket.io — the same socket the chat web app uses. The
// gateway routes both paths, so in production we reuse the same base host.
//
// Both the base URL and the path are env-overridable so LOCAL dev (no gateway) can
// dial chat-service directly WITHOUT disturbing the call socket (which shares
// getCallSocketUrl()). In production leave these unset:
//   • base → getCallSocketUrl() (the gateway host)
//   • path → /chat-socket/socket.io (gateway strips /chat-socket → chat-service /socket.io)
// For local dev set:
//   NEXT_PUBLIC_CHAT_SOCKET_URL=http://localhost:7001
//   NEXT_PUBLIC_CHAT_SOCKET_PATH=/socket.io
const SOCKET_PATH = process.env.NEXT_PUBLIC_CHAT_SOCKET_PATH || '/chat-socket/socket.io';
const getChatSocketBase = () => process.env.NEXT_PUBLIC_CHAT_SOCKET_URL || getCallSocketUrl();

let socket: Socket | null = null;

export function getPoojaChatSocket(): Socket {
  const u = getUserDetails();
  const userId = String(u?.id || u?._id || '');

  if (!socket) {
    socket = io(getChatSocketBase(), {
      path: SOCKET_PATH,
      query: { userId, role: 'user' },
      transports: ['websocket'],
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 60000,
    });
  } else if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectPoojaChatSocket(): void {
  if (socket) {
    try {
      socket.removeAllListeners();
      socket.disconnect();
    } catch { /* noop */ }
    socket = null;
  }
}
