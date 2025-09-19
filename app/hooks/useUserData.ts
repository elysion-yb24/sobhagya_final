import { useState, useEffect, useCallback } from 'react';
import { userService, UserData } from '../utils/userService';

interface UseUserDataReturn {
  getUserData: (userId: string) => UserData | null;
  getUserName: (userId: string) => string;
  getUserAvatar: (userId: string) => string;
  getUserInitial: (userId: string) => string;
  isLoading: (userId: string) => boolean;
  refreshUser: (userId: string) => Promise<void>;
  ensureUserData: (userId: string) => void;
}

export function useUserData(): UseUserDataReturn {
  const [userDataMap, setUserDataMap] = useState<Map<string, UserData>>(new Map());
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());

  const fetchUserData = useCallback(async (userId: string) => {
    if (userDataMap.has(userId) || loadingUsers.has(userId)) {
      return;
    }

    setLoadingUsers(prev => new Set(prev).add(userId));
    
    try {
      const userData = await userService.getUserById(userId);
      if (userData) {
        setUserDataMap(prev => new Map(prev).set(userId, userData));
      }
    } catch (error) {
      console.error(`Error fetching user data for ${userId}:`, error);
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  }, [userDataMap]);

  const getUserData = useCallback((userId: string): UserData | null => {
    return userDataMap.get(userId) || null;
  }, [userDataMap]);

  const getUserName = useCallback((userId: string): string => {
    const userData = userDataMap.get(userId);
    if (userData) {
      return userData.name;
    }
    return `User ${userId.slice(0, 8)}…`;
  }, [userDataMap]);

  const getUserAvatar = useCallback((userId: string): string => {
    const userData = userDataMap.get(userId);
    if (userData?.profileImage) {
      return userData.profileImage;
    }
    return '';
  }, [userDataMap]);

  const getUserInitial = useCallback((userId: string): string => {
    const userData = userDataMap.get(userId);
    if (userData?.name) {
      return userData.name.charAt(0).toUpperCase();
    }
    return userId.charAt(0).toUpperCase();
  }, [userDataMap]);

  const isLoading = useCallback((userId: string): boolean => {
    return loadingUsers.has(userId);
  }, [loadingUsers]);

  const refreshUser = useCallback(async (userId: string): Promise<void> => {
    userService.clearUserCache(userId);
    await fetchUserData(userId);
  }, [fetchUserData]);

  // Auto-fetch user data when userId is provided
  const ensureUserData = useCallback((userId: string) => {
    if (!userDataMap.has(userId) && !loadingUsers.has(userId)) {
      fetchUserData(userId);
    }
  }, [userDataMap, loadingUsers, fetchUserData]);

  return {
    getUserData,
    getUserName,
    getUserAvatar,
    getUserInitial,
    isLoading,
    refreshUser,
    ensureUserData
  };
}
