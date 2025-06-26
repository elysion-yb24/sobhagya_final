import { getApiBaseUrl } from '../config/api';
import { getAuthToken } from './auth-utils';

interface NotificationPayload {
  receiverId: string;
  senderId: string;
  senderName: string;
  channelId: string;
  callType: 'video' | 'audio';
  senderAvatar?: string;
  receiverAvatar?: string;
}

class NotificationService {
  /**
   * Send a call notification to the receiver (astrologer)
   */
  async sendCallNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token available for sending notification');
        return false;
      }

      console.log('Sending call notification:', payload);

      // Try to send notification through multiple channels
      const notificationPromises = [];

      // 1. Try the notification service endpoint
      notificationPromises.push(
        fetch(`${getApiBaseUrl()}/notification-service/api/events/send-call-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...payload,
            timestamp: new Date().toISOString(),
            notificationType: 'video_call_request',
          }),
          credentials: 'include',
        }).catch(err => {
          console.warn('Notification service failed:', err);
          return null;
        })
      );

      // 2. Try the direct user notification endpoint
      notificationPromises.push(
        fetch(`${getApiBaseUrl()}/api/notifications/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: payload.receiverId,
            title: `Incoming ${payload.callType} call`,
            body: `${payload.senderName} is calling you`,
            data: {
              channelId: payload.channelId,
              callType: payload.callType,
              senderId: payload.senderId,
              senderName: payload.senderName,
              action: 'video_call_request',
            },
          }),
          credentials: 'include',
        }).catch(err => {
          console.warn('Direct notification failed:', err);
          return null;
        })
      );

      // Wait for at least one notification to succeed
      const results = await Promise.allSettled(notificationPromises);
      const successfulNotification = results.find(
        result => result.status === 'fulfilled' && result.value && result.value.ok
      );

      if (successfulNotification) {
        console.log('✅ Call notification sent successfully');
        return true;
      } else {
        console.warn('⚠️ All notification attempts failed');
        return false;
      }

    } catch (error) {
      console.error('Error sending call notification:', error);
      return false;
    }
  }

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(token: string, platform: 'web' | 'ios' | 'android' = 'web'): Promise<boolean> {
    try {
      const authToken = getAuthToken();
      if (!authToken) {
        console.error('No auth token available');
        return false;
      }

      const response = await fetch(`${getApiBaseUrl()}/api/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          deviceToken: token,
          platform,
        }),
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Error registering device token:', error);
      return false;
    }
  }

  /**
   * Request notification permission from the browser
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Show a browser notification
   */
  showBrowserNotification(title: string, options?: NotificationOptions): void {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } else {
      console.warn('Notification permission not granted');
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService(); 