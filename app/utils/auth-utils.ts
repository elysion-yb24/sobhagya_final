// auth-utils.ts
import Cookies from "universal-cookie";

// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7002";

/**
 * Returns true if a string looks like a raw phone number (7+ consecutive digits).
 */
export function looksLikePhone(value: string | undefined | null): boolean {
  if (!value) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Masks a phone number for safe display. Shows only last 2 digits.
 * e.g. "9876543210" => "+91 ••••••••10"
 */
export function maskPhone(phone: string | number | undefined | null): string {
  if (!phone) return '';
  const str = phone.toString().replace(/\D/g, '');
  if (str.length < 4) return '••••';
  return `+91 ••••••••${str.slice(-2)}`;
}

/**
 * Gets the authentication token from xxlocalStorage and cookies
 */
export function getAuthToken(): string | null {
  try {
    // Only use localStorage
    const authTokenLS = localStorage.getItem('authToken');
    if (authTokenLS) return authTokenLS;
    const tokenLS = localStorage.getItem('token');
    if (tokenLS) return tokenLS;
    return null;
  } catch (e) {
    console.error("Error in getAuthToken:", e);
    return null;
  }
}

/**
 * Returns the refresh token (distinct from the access token returned by
 * getAuthToken). Backend chat middleware reads it from the `cookies` header
 * OR the standard `Cookie: token=...` header.
 *
 * This app's login flow stores the JWT under several names; we look in
 * priority order so the chat-service auth check never fails for lack of
 * a refresh-token-shaped value.
 */
export function getRefreshToken(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    // Explicit refresh-token locations (future-proof for when the backend
    // starts issuing distinct refresh tokens)
    const lsRefresh = localStorage.getItem('refresh_token');
    if (lsRefresh) return lsRefresh;
    const refreshCookieMatch = document.cookie.match(/(?:^|;\s*)refresh_token=([^;]+)/);
    if (refreshCookieMatch) return decodeURIComponent(refreshCookieMatch[1]);
    // Fallbacks: the JWT itself doubles as the refresh token in this app.
    const lsToken = localStorage.getItem('token');
    if (lsToken) return lsToken;
    const tokenCookieMatch = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (tokenCookieMatch) return decodeURIComponent(tokenCookieMatch[1]);
    const lsAuth = localStorage.getItem('authToken');
    if (lsAuth) return lsAuth;
    return null;
  } catch (e) {
    console.error('Error in getRefreshToken:', e);
    return null;
  }
}

/**
 * Stores the authentication token in localStorage.
 *
 * Authoritative auth state lives in HttpOnly cookies set by /api/auth/verify-otp
 * (see app/lib/server-auth.ts). localStorage is kept as a backward-compat mirror
 * so legacy components reading getAuthToken() keep working. We deliberately do
 * NOT mirror the access token to a JS-readable `token` cookie — that name is
 * reserved for the HttpOnly refresh cookie and collisions break the proxy auth.
 */
export function storeAuthToken(token: string): boolean {
  try {
    localStorage.setItem('authToken', token);
    localStorage.setItem('tokenTimestamp', Date.now().toString());
    return true;
  } catch (e) {
    console.error("Error storing token:", e);
    return false;
  }
}

/**
 * Stores user details in localStorage
 */
export function storeUserDetails(userDetails: any): boolean {
  try {
    localStorage.setItem('userDetails', JSON.stringify(userDetails));
    return true;
  } catch (e) {
    console.error("Error storing user details:", e);
    return false;
  }
}

/**
 * Gets user details from localStorage
 */
export function getUserDetails(): any {
  try {
    const userDetailsString = localStorage.getItem('userDetails');
    return userDetailsString ? JSON.parse(userDetailsString) : null;
  } catch (e) {
    console.error("Error getting user details:", e);
    return null;
  }
}
export const getAuthenticatedUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user"); // or decode from JWT
  return user ? JSON.parse(user) : null;
};

/**
 * Checks if user has made calls before (not first-time user)
 */
export function hasUserCalledBefore(): boolean {
  try {
    if (typeof window === "undefined") return false;
    
    // Check if user has call history
    const callHistory = localStorage.getItem('callHistory');
    if (callHistory) {
      const history = JSON.parse(callHistory);
      return Array.isArray(history) && history.length > 0;
    }
    
    // Check if user has transaction history
    const transactionHistory = localStorage.getItem('transactionHistory');
    if (transactionHistory) {
      const history = JSON.parse(transactionHistory);
      return Array.isArray(history) && history.length > 0;
    }
    
    // Check if user has made any calls (stored in user details)
    const userDetails = getUserDetails();
    if (userDetails && userDetails.hasCalledBefore) {
      return true;
    }
    
    // Check if user has been authenticated for more than 1 day (likely not first time)
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    if (tokenTimestamp) {
      const tokenTime = parseInt(tokenTimestamp);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      return (now - tokenTime) > oneDay;
    }
    
    return false;
  } catch (e) {
    console.error("Error checking call history:", e);
    return false;
  }
}

/**
 * Marks user as having made a call
 */
export function markUserAsCalled(): void {
  try {
    if (typeof window === "undefined") return;
    
    const userDetails = getUserDetails();
    if (userDetails) {
      const updatedUserDetails = {
        ...userDetails,
        hasCalledBefore: true,
        lastCallTime: Date.now()
      };
      storeUserDetails(updatedUserDetails);
    }
    
    // Dispatch event to update UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('user-call-status-changed'));
    }
  } catch (e) {
    console.error("Error marking user as called:", e);
  }
}

/**
 * Captures user name from various sources and integrates with auth system
 */
export function captureUserName(name: string): boolean {
  try {
    const currentUserDetails = getUserDetails();
    if (!currentUserDetails) {
      // Store in session storage for later use during authentication
      sessionStorage.setItem('capturedUserName', name.trim());
      return true;
    }

    // User is authenticated, update their details
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    const updatedUserDetails = {
      ...currentUserDetails,
      name: name.trim(),
      firstName: firstName,
      lastName: lastName,
      displayName: name.trim(),
      profileCompleted: true,
      updatedAt: new Date().getTime()
    };
    
    storeUserDetails(updatedUserDetails);
    
    // Dispatch event for header update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('user-auth-changed'));
    }
    
    return true;
  } catch (error) {
    console.error('Error capturing user name:', error);
    return false;
  }
}

/**
 * Gets user profile with enhanced display name logic.
 * Now actually calls the backend /user/api/data endpoint.
 */
export async function fetchUserProfile(): Promise<any> {
  try {
    const token = getAuthToken();
    if (!token) {
      return getUserDetails();
    }

    // Get cached user details as fallback
    const cachedDetails = getUserDetails();

    // Actually fetch from backend
    try {
      const res = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const backendUser = data.data;
          const name = backendUser.name || '';
          const nameParts = name.split(' ');

          const mergedProfile = {
            ...cachedDetails,
            ...backendUser,
            userId: backendUser._id || backendUser.id || cachedDetails?.userId,
            name: name,
            firstName: nameParts[0] || cachedDetails?.firstName || '',
            lastName: nameParts.slice(1).join(' ') || cachedDetails?.lastName || '',
            phoneNumber: backendUser.phone || backendUser.phoneNumber || cachedDetails?.phoneNumber,
            email: backendUser.email || cachedDetails?.email,
            avatar: backendUser.avatar || cachedDetails?.avatar,
            gender: backendUser.gender || cachedDetails?.gender,
            age: backendUser.age || cachedDetails?.age,
            // Normalize backend field names to frontend conventions
            topic: backendUser.talksAbout || backendUser.topic || cachedDetails?.topic,
            aboutUs: backendUser.about || backendUser.aboutUs || cachedDetails?.aboutUs,
            language: backendUser.language || cachedDetails?.language,
            dob: backendUser.dob || cachedDetails?.dob,
            placeOfBirth: backendUser.placeOfBirth || cachedDetails?.placeOfBirth,
            timeOfBirth: backendUser.timeOfBirth || cachedDetails?.timeOfBirth,
            createdAt: backendUser.createdAt || cachedDetails?.createdAt,
            displayName: name ||
                        (nameParts[0] ? `${nameParts[0]} ${nameParts.slice(1).join(' ')}`.trim() : '') ||
                        'User',
            profileCompleted: !!name,
            timestamp: new Date().getTime(),
          };

          storeUserDetails(mergedProfile);
          return mergedProfile;
        }
      } else {
        console.warn('Backend profile fetch returned:', res.status);
      }
    } catch (fetchErr) {
      console.warn('Backend profile fetch failed, using cached data:', fetchErr);
    }

    // Fallback: use cached data with session storage enhancements
    if (cachedDetails) {
      const capturedName = sessionStorage.getItem('capturedUserName');
      let enhancedProfile = { ...cachedDetails };

      if (capturedName && !cachedDetails.name && !cachedDetails.firstName) {
        const nameParts = capturedName.split(' ');
        enhancedProfile = {
          ...enhancedProfile,
          name: capturedName,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
          profileCompleted: true
        };
        sessionStorage.removeItem('capturedUserName');
        storeUserDetails(enhancedProfile);
      }

      const finalProfile = {
        ...enhancedProfile,
        displayName: enhancedProfile.name ||
                    (enhancedProfile.firstName ? `${enhancedProfile.firstName} ${enhancedProfile.lastName || ''}`.trim() : '') ||
                    'User',
        timestamp: new Date().getTime(),
      };

      storeUserDetails(finalProfile);
      return finalProfile;
    }

    return {
      phoneNumber: 'User',
      displayName: 'User',
      timestamp: new Date().getTime(),
    };

  } catch (error) {
    console.error('Error processing user profile:', error);
    return getUserDetails() || {
      phoneNumber: 'User',
      displayName: 'User',
      timestamp: new Date().getTime(),
    };
  }
}

/**
 * Updates user profile on the backend.
 * Calls POST /api/user/update-profile which proxies to /user/api/edit-profile
 */
export async function updateUserProfile(profileData: {
  name?: string;
  age?: number;
  gender?: string;
  topic?: string | string[];
  aboutUs?: string;
  language?: string | string[];
}): Promise<{ success: boolean; message: string }> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    const res = await fetch('/api/user/update-profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data = await res.json();

    if (data.success) {
      // Update local cache with new data
      const cached = getUserDetails();
      if (cached) {
        const updated = { ...cached, ...profileData, updatedAt: Date.now() };
        if (profileData.name) {
          const parts = profileData.name.split(' ');
          updated.firstName = parts[0];
          updated.lastName = parts.slice(1).join(' ');
          updated.displayName = profileData.name;
          updated.profileCompleted = true;
        }
        storeUserDetails(updated);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user-auth-changed'));
      }
    }

    return { success: data.success, message: data.message || (data.success ? 'Profile updated' : 'Update failed') };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, message: error.message || 'Failed to update profile' };
  }
}

/**
 * Saves profile after first sign-up with extended fields.
 * Calls POST /api/user/profile-after-signup
 */
export async function saveProfileAfterSignup(profileData: {
  name?: string;
  age?: number;
  gender?: string;
  dob?: string;
  placeOfBirth?: string;
  timeOfBirth?: string;
  languages?: string[];
  interests?: string[];
  topic?: string[];
  aboutUs?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const token = getAuthToken();
    if (!token) {
      return { success: false, message: 'Not authenticated' };
    }

    const res = await fetch('/api/user/profile-after-signup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data = await res.json();

    if (data.success) {
      const cached = getUserDetails();
      if (cached) {
        const updated = { ...cached, ...profileData, profileCompleted: true, updatedAt: Date.now() };
        if (profileData.name) {
          const parts = profileData.name.split(' ');
          updated.firstName = parts[0];
          updated.lastName = parts.slice(1).join(' ');
          updated.displayName = profileData.name;
        }
        storeUserDetails(updated);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user-auth-changed'));
      }
    }

    return { success: data.success, message: data.message || (data.success ? 'Profile saved' : 'Save failed') };
  } catch (error: any) {
    console.error('Error saving profile after signup:', error);
    return { success: false, message: error.message || 'Failed to save profile' };
  }
}

/**
 * Clears all authentication data from localStorage and cookies
 */
export function clearAuthData(): void {
  try {
    console.log('🧹 Starting complete logout cleanup...');
    
    // Clear all localStorage items related to authentication
    const itemsToRemove = [
      'authToken',
      'token', 
      'access_token',
      'refresh_token',
      'tokenTimestamp',
      'userDetails',
      'fcmToken',
      'sessionId',
      'user',
      'userData'
    ];
    
    itemsToRemove.forEach(item => {
      if (localStorage.getItem(item)) {
        localStorage.removeItem(item);
        console.log(`✅ Removed localStorage item: ${item}`);
      }
    });
    
    // Clear all authentication-related cookies
    const cookiesToClear = [
      'authToken',
      'token',
      'access_token', 
      'refresh_token',
      'sessionId',
      'user',
      'auth-token'
    ];
    
    cookiesToClear.forEach(cookieName => {
      // Clear for current domain
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
      // Clear for parent domain (in case of subdomain)
      const parentDomain = window.location.hostname.split('.').slice(-2).join('.');
      if (parentDomain !== window.location.hostname) {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${parentDomain}`;
      }
      // Clear without domain specification
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      console.log(`✅ Cleared cookie: ${cookieName}`);
    });
    
    // Clear using universal-cookie library as well
    try {
      const cookies = new Cookies(null, { path: '/' });
      cookiesToClear.forEach(cookieName => {
        cookies.remove(cookieName, { path: '/' });
        cookies.remove(cookieName, { path: '/', domain: window.location.hostname });
        const parentDomain = window.location.hostname.split('.').slice(-2).join('.');
        if (parentDomain !== window.location.hostname) {
          cookies.remove(cookieName, { path: '/', domain: `.${parentDomain}` });
        }
      });
    } catch (cookieError) {
      console.warn('Error clearing cookies with universal-cookie:', cookieError);
    }
    
    // Clear session storage as well
    try {
      sessionStorage.clear();
      console.log('✅ Cleared sessionStorage');
    } catch (sessionError) {
      console.warn('Error clearing sessionStorage:', sessionError);
    }
    
    // Clear any cached data in memory (if any global variables exist)
    try {
      // Reset any global auth state if it exists
      if (typeof window !== 'undefined') {
        (window as any).authState = null;
        (window as any).userProfile = null;
        
        // Dispatch logout event for components to respond
        window.dispatchEvent(new CustomEvent('user-logout'));
        console.log('📢 Dispatched user-logout event');
      }
    } catch (globalError) {
      console.warn('Error clearing global state:', globalError);
    }
    
    console.log('🎉 Logout cleanup completed successfully');
    
  } catch (e) {
    console.error("❌ Error during logout cleanup:", e);
  }
}

/**
 * Performs complete logout including backend API call and local cleanup
 */
export async function performLogout(): Promise<boolean> {
  try {
    console.log('🚪 Starting logout process...');
    
    const token = getAuthToken();
    
    // Try to call backend logout API if token exists
    if (token) {
      try {
        console.log('📡 Calling backend logout API...');
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (response.ok) {
          console.log('✅ Backend logout successful');
        } else {
          console.warn('⚠️ Backend logout failed, but continuing with local cleanup');
        }
      } catch (apiError) {
        console.warn('⚠️ Backend logout API call failed, continuing with local cleanup:', apiError);
      }
    }
    
    // Always perform local cleanup regardless of API call result
    clearAuthData();
    
    console.log('🎉 Logout process completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error during logout process:', error);
    // Even if there's an error, try to clear local data
    clearAuthData();
    return false;
  }
}

/**
 * Checks if a token exists.
 *
 * Product requirement: the session must persist until the user explicitly
 * logs out. There is no client-side TTL — if a token string is present,
 * treat the user as authenticated. The server is responsible for rejecting
 * tokens that have actually been revoked (401 → `authenticatedFetch` wipes
 * auth data), so we no longer short-circuit on a local timestamp.
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  try {
    if (token.trim() === '') return false;
    // Keep tokenTimestamp fresh so any "how old is this session?" consumers
    // (e.g. hasUserCalledBefore) still behave. Not used for expiry.
    localStorage.setItem('tokenTimestamp', Date.now().toString());
    return true;
  } catch (e) {
    console.error("Error validating token:", e);
    return true;
  }
}

/**
 * Check if the user is authenticated with valid token
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  
  // Check if token is valid (not expired)
  return isTokenValid(token);
}

/**
 * Check if the user is authenticated with activity-based token extension
 * This extends token life on each valid check
 */
export function isAuthenticatedAsync(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  
  // Check if token is valid and extend its life if valid
  return isTokenValid(token);
}

/**
 * Update token activity timestamp to extend its validity
 * Call this on user activity to keep session alive
 */
export function updateTokenActivity(): boolean {
  const token = getAuthToken();
  
  if (!token) return false;
  
  try {
    // Update the timestamp to current time to extend token life
    localStorage.setItem('tokenTimestamp', Date.now().toString());
    console.log('🔄 Token activity updated');
    return true;
  } catch (error) {
    console.error('Error updating token activity:', error);
    return false;
  }
}

/**
 * Check if a token is present. No local expiry — only the server can
 * invalidate a session (see `authenticatedFetch` 401 handling).
 */
export function refreshTokenIfNeeded(): boolean {
  const token = getAuthToken();
  return !!token;
}

/**
 * Initialize authentication state on page load/refresh
 * This should be called when the app starts to ensure valid authentication
 */
export function initializeAuth(): boolean {
  try {
    console.log('🔍 Initializing authentication...');
    
    const token = getAuthToken();
    if (!token) {
      console.log('❌ No token found during initialization');
      return false;
    }

    // Check if token is valid (this will extend its life if valid)
    if (isTokenValid(token)) {
      console.log('✅ Token is valid and extended');
      return true;
    } else {
      console.log('❌ Token expired during initialization');
      clearAuthData();
      return false;
    }
  } catch (error) {
    console.error('❌ Error during authentication initialization:', error);
    clearAuthData();
    return false;
  }
}

// export async function get(endpoint:any,access_token:any,refresh_token:any,options:any){
//   const isBlob = options ? options.blob === true : false;
//   try {
//       const apiResponse = await fetch(`${API_URL}${endpoint}`, {
//           credentials: 'include',
//           headers: {
//               'Content-Type': 'application/json',
//               'cookies': refresh_token || '',
//               'Authorization': 'Bearer ' + access_token,
//           },
//       })
      
//       return isBlob ? await apiResponse.blob() : await apiResponse.json();
//   } catch (err) {
//       console.error('Err in ' + endpoint, err)
//       return isBlob ? null : { data: null, success: false, message: 'Internal Server Error' };
//   }
// }


export const post=async(endpoint:any,access_token:any,body:any,options:any)=>{
 
  try {
      const apiResponse = await fetch(`${API_URL}${endpoint}`, {
          method:'POST',
          credentials: 'include',
          body: JSON.stringify(body),
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + access_token,
          },
      })
      updateAccessToken(apiResponse)
      return  await apiResponse.json();
  } catch (err) {
      console.error('Err in '+ endpoint, err)
      return { data: null, success: false, message: 'Internal Server Error' };
  }
}


function updateAccessToken(res:any) {
  const authToken = res.headers.get("auth-token");
  const cookies = new Cookies(null, { path: '/' })
  if (authToken) cookies.set('access_token', authToken)
  return
}

/**
 * Enhanced API wrapper that automatically updates token activity
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  // Update token activity before making the request
  updateTokenActivity();

  // Add authorization header
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If we get a 401, the token might be expired
  if (response.status === 401) {
    console.log('❌ 401 Unauthorized - token may be expired');
    clearAuthData();
    // Redirect to login would be handled by the calling component
  }

  return response;
}