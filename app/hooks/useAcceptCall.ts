import { acceptCallViaApi, rejectCallViaApi } from '../utils/acceptCallService';
import { io } from 'socket.io-client';
import { getApiBaseUrl } from '../config/api';

const TAG = '[useAcceptCall]';
const SOCKET_TIMEOUT_MS = 10_000;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || getApiBaseUrl() || 'https://micro.sobhagya.in';

/** Accept via a one-shot socket emit with ack. */
const acceptViaSocket = (channelId: string, userId: string, role: string): Promise<any> =>
    new Promise((resolve, reject) => {
        const socket = io(SOCKET_URL, {
            secure: true,
            path: '/call-socket/socket.io',
            transports: ['websocket'],
            reconnection: false,
            query: { userId, role },
        });

        const timer = setTimeout(() => {
            socket.disconnect();
            reject(new Error('Socket timed out'));
        }, SOCKET_TIMEOUT_MS);

        const cleanup = (err?: Error, data?: any) => {
            clearTimeout(timer);
            socket.disconnect();
            err ? reject(err) : resolve(data);
        };

        socket.on('connect', () => {
            console.log(`${TAG} ✅ Socket connected:`, socket.id);
            socket.emit('accept_call', { channelId, isLivekit: 'true' }, (res: any) => {
                res?.error
                    ? cleanup(new Error(res.message || 'accept_call rejected'))
                    : cleanup(undefined, res);
            });
        });

        socket.on('connect_error', (e) => cleanup(new Error(e.message)));
    });

/** Reject via a one-shot socket emit with ack (using end_call event). */
const rejectViaSocket = (channelId: string, userId: string, role: string): Promise<any> =>
    new Promise((resolve, reject) => {
        const socket = io(SOCKET_URL, {
            secure: true,
            path: '/call-socket/socket.io',
            transports: ['websocket'],
            reconnection: false,
            query: { userId, role },
        });

        const timer = setTimeout(() => {
            socket.disconnect();
            reject(new Error('Socket timed out'));
        }, SOCKET_TIMEOUT_MS);

        const cleanup = (err?: Error, data?: any) => {
            clearTimeout(timer);
            socket.disconnect();
            err ? reject(err) : resolve(data);
        };

        socket.on('connect', () => {
            console.log(`${TAG} ✅ Socket connected for reject:`, socket.id);
            const payload = {
                channelId,
                userId,
                reason: 'DECLINED',
                isFromNotification: false,
            };

            socket.emit('end_call', payload, (res: any) => {
                res?.error
                    ? cleanup(new Error(res.message || 'end_call rejected'))
                    : cleanup(undefined, res);
            });
        });

        socket.on('connect_error', (e) => cleanup(new Error(e.message)));
    });

/** Orchestrator: try socket → fall back to API. */
export async function acceptCall(channelId: string, userId: string, role: string): Promise<any> {
    console.log(`${TAG} Accepting call for channel:`, channelId);

    try {
        return await acceptViaSocket(channelId, userId, role);
    } catch (socketErr: any) {
        console.log(`${TAG} ⚠️ Socket failed (${socketErr.message}), trying API...`);
    }

    try {
        return await acceptCallViaApi(channelId);
    } catch (apiErr: any) {
        console.log(`${TAG} ❌ API fallback also failed:`, apiErr.message);
        throw new Error(`Accept call failed — both socket & API errored`);
    }
}

/** Reject orchestrator: try socket end_call → fall back to API endCall. */
export async function rejectCall(channelId: string, userId: string, role: string): Promise<any> {
    console.log(`${TAG} Rejecting call for channel:`, channelId);

    try {
        return await rejectViaSocket(channelId, userId, role);
    } catch (socketErr: any) {
        console.log(`${TAG} ⚠️ Socket reject failed (${socketErr.message}), trying API...`);
    }

    try {
        return await rejectCallViaApi(channelId);
    } catch (apiErr: any) {
        console.log(`${TAG} ❌ API reject fallback also failed:`, apiErr.message);
        throw new Error(`Reject call failed — both socket & API errored`);
    }
}
