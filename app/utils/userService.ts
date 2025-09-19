// User data service for fetching and caching user information
interface UserData {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
  phone?: string;
  role?: string;
}

class UserService {
  private userCache = new Map<string, UserData>();
  private pendingRequests = new Map<string, Promise<UserData | null>>();

  async getUserById(userId: string): Promise<UserData | null> {
    // Return cached data if available
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)!;
    }

    // Return pending request if already in progress
    if (this.pendingRequests.has(userId)) {
      return this.pendingRequests.get(userId)!;
    }

    // Create new request
    const request = this.fetchUserFromAPI(userId);
    this.pendingRequests.set(userId, request);

    try {
      const userData = await request;
      if (userData) {
        this.userCache.set(userId, userData);
      }
      return userData;
    } finally {
      this.pendingRequests.delete(userId);
    }
  }

  private async fetchUserFromAPI(userId: string): Promise<UserData | null> {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (!token) {
        console.warn('No auth token available for user fetch');
        return null;
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error(`Failed to fetch user ${userId}:`, response.status);
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return {
          id: data.data._id || data.data.id,
          name: data.data.name || data.data.fullName || `User ${userId.slice(0, 8)}`,
          email: data.data.email,
          profileImage: data.data.profileImage || data.data.avatar,
          phone: data.data.phone,
          role: data.data.role
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }

  // Get multiple users at once
  async getUsersByIds(userIds: string[]): Promise<Map<string, UserData>> {
    const results = new Map<string, UserData>();
    const promises = userIds.map(async (userId) => {
      const userData = await this.getUserById(userId);
      if (userData) {
        results.set(userId, userData);
      }
    });

    await Promise.all(promises);
    return results;
  }

  // Clear cache for a specific user
  clearUserCache(userId: string): void {
    this.userCache.delete(userId);
  }

  // Clear all cache
  clearAllCache(): void {
    this.userCache.clear();
    this.pendingRequests.clear();
  }

  // Get cached user data without API call
  getCachedUser(userId: string): UserData | null {
    return this.userCache.get(userId) || null;
  }
}

// Export singleton instance
export const userService = new UserService();
export type { UserData };
