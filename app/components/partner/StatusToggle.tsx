'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getApiBaseUrl, API_CONFIG } from '../../config/api';
import { getAuthToken, authenticatedFetch } from '../../utils/auth-utils';
import { useLiveSocket } from '../../hooks/useLiveSocket';
import { Signal, Video, Phone, Power, Radio as RadioIcon, Loader2, ShieldCheck, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  _id: string;
  status?: 'online' | 'offline' | 'busy';
  isVideoCallAllowed?: boolean;
  isVideoCallAllowedAdmin?: boolean;
  name?: string;
  avatar?: string;
  [key: string]: any;
}

interface StatusToggleProps {
  user: User | null;
  onUpdate: () => void;
}

export default function StatusToggle({ user, onUpdate }: StatusToggleProps) {
  const router = useRouter();
  const { startSession } = useLiveSocket();
  const [loading, setLoading] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  
  const currentStatus = user?.status || 'offline';
  const videoEnabled = user?.isVideoCallAllowed ?? false;
  const adminBlocked = user?.isVideoCallAllowedAdmin === false;

  const performRequest = async (endpoint: string, body: any) => {
    const res = await authenticatedFetch(`${getApiBaseUrl()}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${res.status}`);
    }

    return await res.json();
  };

  const handleStatusChange = async (newStatus: 'online' | 'offline') => {
    if (currentStatus === newStatus) return;

    setLoading(true);
    try {
      const response = await performRequest(API_CONFIG.ENDPOINTS.USER.CHANGE_STATUS as string, { status: newStatus });
      
      if (response.success) {
        if (newStatus === 'offline') {
          if (videoEnabled && !adminBlocked) {
            try {
              await performRequest(API_CONFIG.ENDPOINTS.USER.CHANGE_VIDEO_STATUS as string, { status: false });
              toast.success('You are now Offline. Settings disabled.', { icon: '🌑' });
            } catch (error) {
              toast.success('You are now Offline.');
            }
          } else {
            toast.success('Status changed to offline.');
          }
        } else {
          toast.success(`You are now Online!`, { icon: '🟢' });
        }
        onUpdate();
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleGoLive = async () => {
    setLiveLoading(true);
    try {
      // 1. Ensure user is online
      if (currentStatus !== 'online') {
        const statusResponse = await performRequest(API_CONFIG.ENDPOINTS.USER.CHANGE_STATUS as string, { status: 'online' });
        if (!statusResponse.success) throw new Error("Failed to set online status");
      }

      // 2. Ensure video is enabled
      if (!videoEnabled && !adminBlocked) {
        await performRequest(API_CONFIG.ENDPOINTS.USER.CHANGE_VIDEO_STATUS as string, { status: true });
      }

      // 3. Initiate Live Session via Socket
      const sessionId = `live_${user?._id}_${Date.now()}`;
      const broadcasterId = user?._id || '';
      const broadcasterName = user?.name || 'Partner';
      const broadcasterAvatar = user?.avatar || '';

      const resp = await startSession(sessionId, broadcasterId, broadcasterName, broadcasterAvatar);
      
      if (!resp.error) {
        toast.success('Live Session Started!', { icon: '🎥' });
        onUpdate();
        // 4. Redirect to Live Session Room
        router.push(`/live-sessions/${sessionId}`);
      } else {
        toast.error(resp.message || 'Failed to start live session');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to go live');
    } finally {
      setLiveLoading(false);
    }
  };

  const handleVideoToggle = async (enabled: boolean) => {
    if (adminBlocked) {
      toast.error('Video calls restricted by admin.');
      return;
    }

    if (currentStatus === 'offline') {
      toast.error('Please go online first.');
      return;
    }

    setLoading(true);
    try {
      const response = await performRequest(API_CONFIG.ENDPOINTS.USER.CHANGE_VIDEO_STATUS as string, { status: enabled });
      if (response.success) {
        toast.success(`Video calls ${enabled ? 'enabled' : 'disabled'}`);
        onUpdate();
      } else {
        toast.error(response.message || 'Failed to update settings');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const isOnline = currentStatus === 'online';
  const handleToggle = () => {
    if (loading) return;
    handleStatusChange(isOnline ? 'offline' : 'online');
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border p-8 transition-all duration-500
        ${isOnline
          ? 'bg-gradient-to-br from-emerald-50/90 via-white to-white border-emerald-100/60 shadow-[0_16px_40px_-12px_rgba(16,185,129,0.25)]'
          : 'bg-white/80 border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]'
        }`}
    >
      {/* Ambient gradient orbs */}
      <motion.div
        aria-hidden
        className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          isOnline ? 'bg-emerald-200/50' : 'bg-orange-100/30'
        }`}
        animate={{ scale: isOnline ? [1, 1.15, 1] : 1, opacity: isOnline ? [0.6, 0.9, 0.6] : 0.4 }}
        transition={{ duration: 4, repeat: isOnline ? Infinity : 0, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className={`absolute -bottom-20 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
          isOnline ? 'bg-teal-100/50' : 'bg-gray-100/30'
        }`}
        animate={{ scale: isOnline ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 5, repeat: isOnline ? Infinity : 0, ease: 'easeInOut', delay: 1 }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <motion.span
                animate={isOnline ? { rotate: [0, 8, -8, 0] } : { rotate: 0 }}
                transition={{ duration: 2, repeat: isOnline ? Infinity : 0, ease: 'easeInOut' }}
              >
                <Signal className={`w-5 h-5 ${isOnline ? 'text-emerald-500' : 'text-gray-400'}`} />
              </motion.span>
              Partner Status
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time availability</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStatus}
              initial={{ opacity: 0, y: -4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-2 ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-50'
                  : 'bg-gray-50 text-gray-400 border-gray-100'
              }`}
            >
              <span className="relative flex items-center justify-center w-2 h-2">
                {isOnline && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <span className={`relative w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              </span>
              {currentStatus}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Toggle Switch for Status */}
        <div className="mb-8">
          <button
            type="button"
            role="switch"
            aria-checked={isOnline}
            aria-label="Toggle online availability"
            onClick={handleToggle}
            disabled={loading}
            className={`group relative w-full overflow-hidden rounded-2xl border p-1.5 transition-all duration-500 ${
              isOnline
                ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 shadow-inner'
                : 'border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50 shadow-inner'
            } ${loading ? 'cursor-wait opacity-80' : 'cursor-pointer hover:shadow-md'}`}
          >
            {/* Shine sweep on hover */}
            <span
              aria-hidden
              className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] translate-x-0 group-hover:translate-x-[250%] transition-transform duration-1000 pointer-events-none"
            />

            <div className="relative grid grid-cols-2 items-stretch">
              {/* Sliding highlight */}
              <motion.span
                aria-hidden
                layout
                className={`absolute top-0 bottom-0 w-1/2 rounded-xl shadow-md ${
                  isOnline
                    ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-200'
                    : 'bg-gradient-to-br from-gray-700 to-gray-900 shadow-gray-200'
                }`}
                initial={false}
                animate={{ left: isOnline ? '0%' : '50%' }}
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />

              {/* Online label */}
              <span
                className={`relative z-10 flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-wide transition-colors duration-300 ${
                  isOnline ? 'text-white' : 'text-gray-400'
                }`}
              >
                <span className="relative flex items-center justify-center w-2.5 h-2.5">
                  {isOnline && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-white/60"
                      animate={{ scale: [1, 2, 1], opacity: [0.9, 0, 0.9] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                  <span className={`relative w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-white' : 'bg-gray-300'}`} />
                </span>
                Online
              </span>

              {/* Offline label */}
              <span
                className={`relative z-10 flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-wide transition-colors duration-300 ${
                  !isOnline ? 'text-white' : 'text-gray-400'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                Offline
              </span>
            </div>

            {/* Loading shimmer bar */}
            {loading && (
              <motion.span
                aria-hidden
                className="absolute left-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
                initial={{ width: '20%', x: '-20%' }}
                animate={{ x: '500%' }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </button>
          <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
            Tap the toggle to {isOnline ? 'go offline' : 'go online'}
          </p>
        </div>

        {/* Go Live CTA */}
        <div className="mb-8 relative">
          {/* Pulsing halo rings (only when ready to go live) */}
          {!adminBlocked && !liveLoading && (
            <>
              <motion.div
                aria-hidden
                className="absolute inset-0 rounded-2xl border-2 border-orange-400/40 pointer-events-none"
                animate={{ scale: [1, 1.04, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                aria-hidden
                className="absolute inset-0 rounded-2xl border-2 border-red-400/30 pointer-events-none"
                animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
              />
            </>
          )}

          <motion.button
            onClick={handleGoLive}
            disabled={liveLoading || adminBlocked}
            whileHover={!adminBlocked && !liveLoading ? { scale: 1.02 } : undefined}
            whileTap={!adminBlocked && !liveLoading ? { scale: 0.98 } : undefined}
            className={`w-full group relative overflow-hidden py-5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-shadow duration-500 ${
              adminBlocked
                ? 'bg-gray-100 cursor-not-allowed opacity-50'
                : liveLoading
                ? 'bg-gradient-to-br from-orange-400 to-red-500 cursor-wait shadow-2xl shadow-orange-200'
                : 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 shadow-2xl shadow-orange-200 hover:shadow-orange-300'
            }`}
          >
            {/* Animated shine sweep */}
            {!adminBlocked && !liveLoading && (
              <span
                aria-hidden
                className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:translate-x-[450%] transition-transform duration-[1400ms] ease-out pointer-events-none"
              />
            )}

            {/* Floating sparkles when idle */}
            {!adminBlocked && !liveLoading && (
              <>
                <motion.span
                  aria-hidden
                  className="absolute top-3 right-5 text-white/70"
                  animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4], rotate: [0, 12, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </motion.span>
                <motion.span
                  aria-hidden
                  className="absolute bottom-3 left-6 text-white/60"
                  animate={{ y: [0, -4, 0], opacity: [0.3, 0.9, 0.3], rotate: [0, -10, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                >
                  <Sparkles className="w-3 h-3" />
                </motion.span>
              </>
            )}

            <div className="relative z-10 flex items-center gap-3 text-white">
              {liveLoading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-white/20 blur-md"
                  />
                  <RadioIcon className="relative w-7 h-7" />
                </motion.span>
              )}
              <span className="text-xl font-black uppercase tracking-tighter drop-shadow-sm">
                {liveLoading ? 'Going Live…' : 'Go Live Now'}
              </span>
            </div>
            <p className="relative z-10 text-white/70 text-[10px] font-bold uppercase tracking-wider">
              {liveLoading ? 'Connecting to your studio' : 'Start streaming to your followers'}
            </p>

            {/* Loading progress stripe */}
            {liveLoading && (
              <motion.span
                aria-hidden
                className="absolute left-0 bottom-0 h-1 bg-white/70"
                initial={{ width: '15%', x: '-15%' }}
                animate={{ x: '700%' }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </motion.button>
        </div>

        {/* Call Settings Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={currentStatus === 'online' ? { y: -2 } : undefined}
            className={`group relative overflow-hidden p-5 rounded-3xl border transition-all duration-300 ${
              currentStatus === 'offline'
                ? 'bg-gray-50/50 border-gray-100 opacity-60'
                : videoEnabled && !adminBlocked
                ? 'bg-white border-blue-100 shadow-md ring-1 ring-blue-50'
                : 'bg-white border-blue-50 shadow-sm hover:shadow-md'
            }`}
          >
            {videoEnabled && !adminBlocked && currentStatus === 'online' && (
              <motion.div
                aria-hidden
                className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-blue-100/60 blur-2xl pointer-events-none"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <div className="relative flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl transition-colors ${
                videoEnabled && !adminBlocked && currentStatus === 'online'
                  ? 'bg-blue-50 text-blue-600'
                  : currentStatus === 'online'
                  ? 'bg-blue-50 text-blue-400'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <Video className="w-4 h-4" />
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={videoEnabled && !adminBlocked}
                  onChange={(e) => handleVideoToggle(e.target.checked)}
                  disabled={loading || adminBlocked || currentStatus === 'offline'}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:shadow after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
            <p className="relative font-black text-gray-900 text-xs mb-0.5">Video Call</p>
            <p className="relative text-[10px] font-bold uppercase tracking-wide">
              <span className={
                adminBlocked ? 'text-red-400'
                  : videoEnabled && currentStatus === 'online' ? 'text-blue-500'
                  : 'text-gray-400'
              }>
                {adminBlocked ? 'Restricted' : videoEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </p>
          </motion.div>

          <motion.div
            whileHover={currentStatus === 'online' ? { y: -2 } : undefined}
            className={`relative overflow-hidden p-5 rounded-3xl border transition-all duration-300 ${
              currentStatus === 'offline' ? 'bg-gray-50/50 border-gray-100 opacity-60' : 'bg-white border-emerald-100 shadow-sm'
            }`}
          >
            {currentStatus === 'online' && (
              <motion.div
                aria-hidden
                className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-emerald-100/60 blur-2xl pointer-events-none"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              />
            )}
            <div className="relative flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl transition-colors ${currentStatus === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                <Phone className="w-4 h-4" />
              </div>
              <span className="relative flex items-center justify-center w-3 h-3">
                {currentStatus === 'online' && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 2, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                )}
                <span className={`relative w-3 h-3 rounded-full ${currentStatus === 'online' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              </span>
            </div>
            <p className="relative font-black text-gray-900 text-xs mb-0.5">Audio Call</p>
            <p className="relative text-[10px] font-bold uppercase tracking-wide">
              <span className={currentStatus === 'online' ? 'text-emerald-500' : 'text-gray-400'}>
                {currentStatus === 'online' ? 'Active' : 'Offline'}
              </span>
            </p>
          </motion.div>
        </div>

        {/* Footer info/warning */}
        {adminBlocked && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100">
             <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
             <p className="text-[11px] font-bold text-red-600 leading-normal">
               Professional streaming and video call services are restricted by administrator. Contact support for activation.
             </p>
          </div>
        )}
        
        {!adminBlocked && currentStatus === 'offline' && (
           <div className="mt-6 flex items-center gap-3 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
             <Info className="w-4 h-4 text-orange-400 flex-shrink-0" />
             <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-tight">
               Switch to online to enable consultations
             </p>
           </div>
        )}
      </div>
    </div>
  );
}
