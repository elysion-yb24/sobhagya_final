import { getApiBaseUrl } from '../config/api';

export const initiateCall = async (receiverUserId: string, isVideo: boolean = false, existingChannelId?: string): Promise<{ token: string; serverUrl: string; channelId: string }> => {
    try {
        const channelId = existingChannelId ?? Date.now().toString();
        const url = `${getApiBaseUrl()}/calling/api/call/call-token-livekit?channel=${channelId}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                receiverUserId,
                type: isVideo ? 'video' : 'call',
                appVersion: '1.0.0',
                isScreenShareCall: false
            })
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            throw new Error(errText || `HTTP ${response.status}`);
        }

        const json = await response.json();
        if (!json.success) throw new Error(json.message || 'Call initiation failed');

        if (json.data?.token && (json.data?.livekitSocketURL || json.data?.serverUrl)) {
            return {
                token: json.data.token,
                serverUrl: json.data.livekitSocketURL || json.data.serverUrl || '',
                channelId: channelId || ''
            };
        }

        throw new Error('Invalid call initiation response');
    } catch (err) {
        console.log('Error initiating call:', err);
        throw err;
    }
};

export const getUserImages = async (userId: string): Promise<string[]> => {
    try {
        const url = `${getApiBaseUrl()}/user/api/user/get-images/${userId}`;
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) return [];
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) return json.data.map((img: any) => img.url);
        return [];
    } catch (err) {
        console.log(`Error fetching images for user ${userId}:`, err);
        return [];
    }
};

export const getCallLog = async (
    role: string,
    skip: number = 0,
    limit: number = 10
) => {
    try {
        if (!role) {
            console.log('getCallLog: No role provided');
            return null;
        }

        const url = `${getApiBaseUrl()}/calling/api/call/call-log?skip=${skip}&limit=${limit}&role=${role}`;
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch call logs');
        const json = await res.json();
        return json;
    } catch (err) {
        console.log('Error in getCallLog:', err);
        return null;
    }
};
