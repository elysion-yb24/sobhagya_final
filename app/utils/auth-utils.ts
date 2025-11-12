// auth-utils.ts
import Cookies from "universal-cookie";

// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7002";

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
 * Stores the authentication token in localStorage and cookies
 */
export function storeAuthToken(token: string): boolean {
  try {
    // Store in localStorage
    localStorage.setItem('authToken', token);
    
    // Store timestamp
    localStorage.setItem('tokenTimestamp', Date.now().toString());
    
    // Store in cookies for server-side access (using same name as working APIs)
    document.cookie = `token=${token}; path=/; max-age=${60*60*24*7}; SameSite=Lax; Secure`;
    
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
    
    // Mark in localStorage for immediate UI updates
    localStorage.setItem("userHasCalledBefore", "true");
    
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
 * Gets user profile with enhanced display name logic
 */
export async function fetchUserProfile(): Promise<any> {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('No authentication token found, using cached data');
      return getUserDetails();
    }

    // Get cached user details
    const cachedDetails = getUserDetails();
    
    // For now, we'll work with the cached data since the backend user profile API isn't available
    // In the future, when the backend supports user profile API, we can add that call here
    
    if (cachedDetails) {
      // Check for captured name from session storage
      const capturedName = sessionStorage.getItem('capturedUserName');
      
      let enhancedProfile = { ...cachedDetails };
      
      // If we have a captured name and no existing name, use it
      if (capturedName && !cachedDetails.name && !cachedDetails.firstName) {
        const nameParts = capturedName.split(' ');
        enhancedProfile = {
          ...enhancedProfile,
          name: capturedName,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' '),
          profileCompleted: true
        };
        
        // Clear from session storage and update stored details
        sessionStorage.removeItem('capturedUserName');
        storeUserDetails(enhancedProfile);
      }
      
      // Enhance the cached data with better display logic
      const finalProfile = {
        ...enhancedProfile,
        displayName: enhancedProfile.name || 
                    (enhancedProfile.firstName ? `${enhancedProfile.firstName} ${enhancedProfile.lastName || ''}`.trim() : '') ||
                    enhancedProfile.phoneNumber || 'User',
        timestamp: new Date().getTime(),
      };
      
      // Update the stored details with enhanced info
      storeUserDetails(finalProfile);
      return finalProfile;
    }

    // If no cached data, return a basic profile
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
 * Checks if token exists and is valid
 * Tokens are considered valid for 7 days from last activity (not creation)
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  
  try {
    // Check if token is a non-empty string
    if (!token || token.trim() === '') return false;
    
    // Check token timestamp (last activity time)
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    if (!tokenTimestamp) {
      // If no timestamp exists, assume token is fresh and update timestamp
      localStorage.setItem('tokenTimestamp', Date.now().toString());
      return true;
    }
    
    // Token TTL: 7 days (in milliseconds)
    const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;
    const timestampNum = parseInt(tokenTimestamp, 10);
    
    if (isNaN(timestampNum)) {
      // Invalid timestamp, reset it
      localStorage.setItem('tokenTimestamp', Date.now().toString());
      return true;
    }
    
    const currentTime = Date.now();
    if (timestampNum > currentTime) {
      // Future timestamp, reset it
      localStorage.setItem('tokenTimestamp', currentTime.toString());
      return true;
    }
    
    const isValid = (currentTime - timestampNum) < TOKEN_TTL;
    
    // If token is still valid, update the timestamp to extend its life
    if (isValid) {
      localStorage.setItem('tokenTimestamp', currentTime.toString());
    }
    
    return isValid;
  } catch (e) {
    console.error("Error validating token:", e);
    return false;
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
 * Check if token is still valid or needs refresh
 * Since there's no refresh token API, we'll extend token validity on activity
 */
export function refreshTokenIfNeeded(): boolean {
  const token = getAuthToken();
  
  if (!token) return false;
  
  // If token is valid, return true
  if (isTokenValid(token)) return true;
  
  // If token exists but is expired, we can't refresh it without an API
  // So we need to clear the data and require re-authentication
  console.log('❌ Token expired and no refresh API available, clearing auth data');
  clearAuthData();
  return false;
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