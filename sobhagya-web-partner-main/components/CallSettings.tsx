'use client';

import { useState } from 'react';
import { userAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  status?: 'online' | 'offline' | 'busy';
  isVideoCallAllowed?: boolean;
  isVideoCallAllowedAdmin?: boolean;
  [key: string]: any;
}

interface CallSettingsProps {
  user: User | null;
  onUpdate: () => void;
}

export default function CallSettings({ user, onUpdate }: CallSettingsProps) {
  const [loading, setLoading] = useState(false);
  const currentStatus = user?.status || 'offline';
  const videoEnabled = user?.isVideoCallAllowed ?? false;
  const adminBlocked = user?.isVideoCallAllowedAdmin === false;
  const isOffline = currentStatus === 'offline';

  const handleVideoToggle = async (enabled: boolean) => {
    if (adminBlocked) {
      toast.error('Video calls are blocked by admin. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.changeVideoStatus(enabled);
      if (response.success) {
        toast.success(`Video calls ${enabled ? 'enabled' : 'disabled'}`);
        onUpdate();
      } else {
        toast.error(response.message || 'Failed to update video call settings');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Call Settings
          </h3>
          <p className="text-xs text-gray-500 mt-1">Configure your call preferences</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Video Call Toggle */}
        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
          <div className="flex-1">
            <p className="font-bold text-gray-800 mb-1">Video Calls</p>
            <p className="text-xs text-gray-500">
              {adminBlocked 
                ? 'Blocked by admin' 
                : videoEnabled 
                ? 'Currently enabled' 
                : 'Currently disabled'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={videoEnabled && !adminBlocked}
              onChange={(e) => handleVideoToggle(e.target.checked)}
              disabled={loading || adminBlocked}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"></div>
          </label>
        </div>

        {/* Audio Call Info */}
        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
          <div className="flex-1">
            <p className="font-bold text-gray-800 mb-1">Audio Calls</p>
            <p className="text-xs text-gray-500">
              {isOffline 
                ? 'Disabled (offline)' 
                : 'Available when online'}
            </p>
          </div>
          <div className={`w-12 h-6 rounded-full flex items-center justify-end pr-1 shadow-inner transition-all ${
            isOffline 
              ? 'bg-gray-300' 
              : 'bg-gradient-to-r from-green-500 to-emerald-500'
          }`}>
            <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>

      {adminBlocked && (
        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-yellow-800 font-medium">
              Video calls are currently blocked. Please contact support to enable them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

