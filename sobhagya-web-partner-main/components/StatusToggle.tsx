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

interface StatusToggleProps {
  user: User | null;
  onUpdate: () => void;
}

export default function StatusToggle({ user, onUpdate }: StatusToggleProps) {
  const [loading, setLoading] = useState(false);
  const currentStatus = user?.status || 'offline';
  const videoEnabled = user?.isVideoCallAllowed ?? false;
  const adminBlocked = user?.isVideoCallAllowedAdmin === false;

  const handleStatusChange = async (newStatus: 'online' | 'offline') => {
    if (currentStatus === newStatus) return;

    setLoading(true);
    try {
      // Change status
      const statusResponse = await userAPI.changeStatus(newStatus);
      if (!statusResponse.success) {
        toast.error(statusResponse.message || 'Failed to change status');
        setLoading(false);
        return;
      }

      // If going offline, automatically disable video calls (audio calls are controlled by status)
      if (newStatus === 'offline') {
        if (videoEnabled && !adminBlocked) {
          try {
            await userAPI.changeVideoStatus(false);
            toast.success('Status changed to offline. All call settings disabled automatically.');
          } catch (error: any) {
            // Even if video toggle fails, status was changed (audio calls already disabled by offline status)
            toast.success('Status changed to offline. All calls disabled.');
            console.error('Failed to disable video calls:', error);
          }
        } else {
          toast.success('Status changed to offline. All calls disabled.');
        }
      } else {
        toast.success(`Status changed to ${newStatus}`);
      }

      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change status');
    } finally {
      setLoading(false);
    }
  };

  const handleGoLive = async () => {
    // Note: "Live" (like Instagram Live) is a separate feature that will be added later
    // For now, this sets status to online and enables video calls
    // Backend live feature will be implemented separately
    
    if (currentStatus === 'online' && videoEnabled && !adminBlocked) {
      toast('You are already online with video calls enabled!', { icon: 'ℹ️' });
      return;
    }

    setLoading(true);
    try {
      // Set status to online
      const statusResponse = await userAPI.changeStatus('online');
      if (!statusResponse.success) {
        toast.error(statusResponse.message || 'Failed to go online');
        setLoading(false);
        return;
      }

      // Enable video calls if not blocked by admin
      if (!videoEnabled && !adminBlocked) {
        try {
          await userAPI.changeVideoStatus(true);
          toast.success('✅ You are now online. Video calls enabled.');
        } catch (error: any) {
          // Status was changed to online even if video toggle fails
          toast.success('You are now online');
          console.error('Failed to enable video calls:', error);
        }
      } else if (adminBlocked) {
        toast.success('You are now online (Video calls blocked by admin)');
      } else {
        toast.success('✅ You are now online');
      }

      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to go online');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoToggle = async (enabled: boolean) => {
    if (adminBlocked) {
      toast.error('Video calls are blocked by admin. Please contact support.');
      return;
    }

    if (currentStatus === 'offline') {
      toast.error('Cannot change video settings while offline. Please go online first.');
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
            Status Control
          </h3>
          <p className="text-xs text-gray-500 mt-1">Manage your availability</p>
        </div>
        <div className="flex items-center gap-3">
          {currentStatus === 'online' ? (
            <button
              onClick={() => handleStatusChange('offline')}
              disabled={loading}
              className={`py-2 px-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg whitespace-nowrap ${
                'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-xl'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {loading ? 'Going Offline...' : '✓ Go Offline'}
            </button>
          ) : (
            <button
              onClick={handleGoLive}
              disabled={loading}
              className={`py-2 px-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg whitespace-nowrap ${
                'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-[1.02] active:scale-[0.98]'}`}
              title="Go online and enable video calls. Live streaming feature coming soon."
            >
              {loading ? 'Going Online...' : '✓ Go Online'}
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Status:</span>
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
              currentStatus === 'online' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}>
              {currentStatus.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Call Settings */}
      <div>
          <h4 className="text-sm font-bold text-gray-800 mb-3">Call Settings</h4>
          <div className="space-y-3">
            {/* Video Call Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
              <div className="flex-1">
                <p className="font-bold text-gray-800 mb-1 text-sm">Video Calls</p>
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
                  disabled={loading || adminBlocked || currentStatus === 'offline'}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"></div>
              </label>
            </div>

            {/* Audio Call Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
              <div className="flex-1">
                <p className="font-bold text-gray-800 mb-1 text-sm">Audio Calls</p>
                <p className="text-xs text-gray-500">
                  {currentStatus === 'offline' 
                    ? 'Disabled (offline)' 
                    : 'Available when online'}
                </p>
              </div>
              <div className={`w-12 h-6 rounded-full flex items-center justify-end pr-1 shadow-inner transition-all ${
                currentStatus === 'offline' 
                  ? 'bg-gray-300' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
              }`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
      </div>

      {adminBlocked && (
        <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-yellow-800 font-medium">
              Video calls are currently blocked. Please contact support to enable them.
            </p>
          </div>
        </div>
      )}

      {currentStatus === 'offline' && (
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-3">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          All call settings are disabled when offline
        </p>
      )}
    </div>
  );
}

