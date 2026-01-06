import { getAuthToken, getUserDetails } from "./auth-utils";
import { getApiBaseUrl } from "../config/api";
import { toast } from "react-hot-toast";

export interface InitiateCallParams {
    astrologerId: string;
    callType: 'audio' | 'video';
    router: any;
    setLoading?: (loading: boolean) => void;
    onStatusOffline?: () => void;
}

/**
 * Fetches the astrologer's name from the API.
 */
async function fetchAstrologerName(astrologerId: string, token: string): Promise<string> {
    try {
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/user/api/users/${astrologerId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if (!response.ok) return 'Astrologer';
        const data = await response.json();
        return data?.data?.name || data?.name || 'Astrologer';
    } catch (err) {
        console.error("Error fetching astrologer name:", err);
        return 'Astrologer';
    }
}

/**
 * Refreshes individual astrologer profile to get the latest status.
 */
async function refreshAstrologerStatus(astrologerId: string, token: string | null): Promise<string> {
    try {
        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/user/api/profile/${astrologerId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...(token && { "Authorization": `Bearer ${token}` }),
            },
            credentials: "include",
        });

        if (response.ok) {
            const result = await response.json();
            if (result?.data) {
                const updated = result.data;
                if (updated.isOnline !== undefined && !updated.status) {
                    return updated.isOnline ? "online" : "offline";
                }
                return updated.status || "offline";
            }
        }
        return "offline";
    } catch (err) {
        console.error("Error refreshing status:", err);
        return "offline";
    }
}

/**
 * Centralized function to initiate a call (audio or video).
 */
export async function initiateCall({
    astrologerId,
    callType,
    router,
    setLoading,
    onStatusOffline,
}: InitiateCallParams) {
    try {
        if (setLoading) setLoading(true);

        const token = getAuthToken();
        const user = getUserDetails();

        if (!token || !user?.id) {
            // Not authenticated - store intent and redirect to login
            localStorage.setItem("selectedAstrologerId", astrologerId);
            localStorage.setItem("callIntent", callType);
            localStorage.setItem("callSource", "directCall");
            router.push("/login");
            return;
        }

        // Check user role
        if (user.role === 'friend') {
            toast.error("Partners cannot initiate calls.");
            if (setLoading) setLoading(false);
            return;
        }

        // 1. Refresh status
        const latestStatus = await refreshAstrologerStatus(astrologerId, token);
        if (latestStatus !== 'online') {
            if (latestStatus === 'busy') {
                toast.error("Astrologer is currently busy on another call.");
            } else {
                toast.error("Astrologer is currently offline.");
            }
            if (onStatusOffline) onStatusOffline();
            if (setLoading) setLoading(false);
            return;
        }

        // 2. Initiate Call via LiveKit API
        const channelId = Date.now().toString();
        const baseUrl = getApiBaseUrl();
        const livekitUrl = `${baseUrl}/calling/api/call/call-token-livekit?channel=${encodeURIComponent(channelId)}`;
        const body = {
            receiverUserId: astrologerId,
            type: callType === 'audio' ? 'call' : 'video',
            appVersion: '1.0.0'
        };

        const response = await fetch(livekitUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
            credentials: 'include',
        });

        const data = await response.json();
        if (!response.ok || !data?.data?.token || !data?.data?.channel) {
            const errorMessage = data?.message || 'Failed to initiate call';

            if (errorMessage === 'User not online' || errorMessage.includes('not online')) {
                toast.error('Astrologer is currently offline.');
                if (onStatusOffline) onStatusOffline();
            } else if (errorMessage === 'Call already in progress' || errorMessage.includes('already in progress')) {
                toast.error('A call is already in progress.');
            } else if (errorMessage === 'DONT_HAVE_ENOUGH_BALANCE' || errorMessage.includes('balance')) {
                toast.error('Insufficient wallet balance. Please recharge.');
            } else if (errorMessage === 'User already on another call') {
                toast.error('Astrologer is currently busy on another call.');
            } else {
                toast.error(errorMessage);
            }

            if (setLoading) setLoading(false);
            return;
        }

        // 3. Get name for display
        const astrologerName = await fetchAstrologerName(astrologerId, token);

        // 4. Navigate to call page
        const dest = callType === 'audio'
            ? `/audio-call?token=${encodeURIComponent(data.data.token)}&room=${encodeURIComponent(data.data.channel)}&astrologer=${encodeURIComponent(astrologerName)}&astrologerId=${encodeURIComponent(astrologerId)}&wsURL=${encodeURIComponent(data.data.livekitSocketURL || '')}`
            : `/video-call?token=${encodeURIComponent(data.data.token)}&room=${encodeURIComponent(data.data.channel)}&astrologer=${encodeURIComponent(astrologerName)}&astrologerId=${encodeURIComponent(astrologerId)}&wsURL=${encodeURIComponent(data.data.livekitSocketURL || '')}`;

        // Clean up intent storage if any
        localStorage.removeItem('selectedAstrologerId');
        localStorage.removeItem('callIntent');
        localStorage.removeItem('callSource');
        localStorage.setItem('lastAstrologerId', astrologerId);

        router.replace(dest);
    } catch (err: any) {
        console.error('❌ Call initiation failed:', err);
        toast.error('Failed to initiate call. Please try again.');
    } finally {
        if (setLoading) setLoading(false);
    }
}
