import { getApiBaseUrl } from '../config/api';

export async function acceptCallViaApi(channelId: string): Promise<any> {
    const url = `${getApiBaseUrl()}/calling/api/call/accept-call`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ channelId, isLivekit: 'true' })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `API error: ${response.status}`);
    }
    return response.json();
}

export async function rejectCallViaApi(channelId: string): Promise<any> {
    const url = `${getApiBaseUrl()}/calling/api/call/end`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ channelId, reason: 'DECLINED' })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `API error: ${response.status}`);
    }
    return response.json();
}
