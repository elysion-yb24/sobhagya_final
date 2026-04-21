import { getAuthToken, getUserDetails } from './auth-utils';

export interface CallInitiationParams {
    astrologerId: string;
    astrologerName: string;
    callType: 'audio' | 'video';
    avatarUrl?: string;
    rpm?: string | number;
}

/**
 * Centrally manages call initiation, token generation via local proxy, 
 * and redirection to the appropriate call page.
 */
export async function initiateCall({
    astrologerId,
    astrologerName,
    callType,
    avatarUrl = '',
    rpm = '15'
}: CallInitiationParams): Promise<void> {
    try {
        const token = getAuthToken();
        const user = getUserDetails();

        if (!token || !user?.id) {
            // Store intent for after login
            if (typeof window !== 'undefined') {
                localStorage.setItem("selectedAstrologerId", astrologerId);
                localStorage.setItem("callIntent", callType);
                localStorage.setItem("callSource", "initiateCall");
                window.location.href = "/login";
            }
            return;
        }

        if (user.role === 'friend') {
            alert('Partners cannot initiate calls. Use a user account.');
            return;
        }

        // Generate a random channel ID if not provided - backend usually handles this too
        const channelId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        // Call our local API proxy
        const livekitUrl = `/api/calling/call-token-livekit?channel=${encodeURIComponent(channelId)}`;
        
        const response = await fetch(livekitUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                receiverUserId: astrologerId,
                type: callType === 'audio' ? 'call' : 'video',
                appVersion: '1.0.0'
            }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data?.data?.token || !data?.data?.channel) {
            const errorMsg = data?.message || 'Failed to initiate call';
            throw new Error(errorMsg);
        }

        // Persistence for reconnection / history
        if (typeof window !== 'undefined') {
            localStorage.setItem('lastAstrologerId', astrologerId);
            localStorage.setItem('callSource', 'initiateCall');
        }

        const backendData = data.data;
        const livekitToken = backendData.token;
        const roomName = backendData.channel;
        const wsURL = backendData.livekitSocketURL || '';
        const currentRpm = backendData.rpm || rpm;
        const currentBalance = backendData.balance || '0';

        // Prepare query parameters
        const params = new URLSearchParams({
            token: livekitToken,
            room: roomName,
            astrologer: astrologerName,
            astrologerId: astrologerId,
            wsURL: wsURL,
            avatar: avatarUrl,
            rpm: String(currentRpm),
            balance: String(currentBalance)
        });

        const dest = callType === 'audio' ? `/audio-call?${params.toString()}` : `/video-call?${params.toString()}`;

        // Redirect to the call page
        if (typeof window !== 'undefined') {
            window.location.href = dest;
        }
    } catch (err) {
        console.error('❌ Call initiation failed:', err);
        const msg = err instanceof Error ? err.message : 'Call failed to start';
        
        if (msg === 'DONT_HAVE_ENOUGH_BALANCE') {
            // You might want to handle this specifically via an event or callback
            // For now, re-throw so the caller can show its specific modal
            throw err;
        }
        
        alert(msg);
        throw err;
    }
}
