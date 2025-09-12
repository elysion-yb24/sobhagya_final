// auth-utils.ts
import Cookies from "universal-cookie";

// Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7002";

/**
 * Gets the authentication token from localStorage
 */
export function getAuthToken(): string | null {
  try {
    // Try localStorage first - check both authToken and access_token keys
    const authToken = localStorage.getItem('authToken');
    if (authToken) return authToken;
    
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) return accessToken;

    // Try cookies as fallback - check both keys
    const cookies = new Cookies(null, { path: '/' });
    const cookieAccessToken = cookies.get('access_token');
    if (cookieAccessToken) return cookieAccessToken;
    
    const cookieAuthToken = cookies.get('authToken');
    if (cookieAuthToken) return cookieAuthToken;

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
    
    // Store in cookies for server-side access
    document.cookie = `authToken=${token}; path=/; max-age=${60*60*24*7}`;
    
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
      // Enhance the cached data with better display logic
      const enhancedProfile = {
        ...cachedDetails,
        displayName: cachedDetails.name || cachedDetails.firstName || cachedDetails.phoneNumber || 'User',
        timestamp: new Date().getTime(),
      };
      
      // Update the stored details with enhanced info
      storeUserDetails(enhancedProfile);
      return enhancedProfile;
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
 * Tokens are considered valid for 7 days from creation
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  
  try {
    // Check if token is a non-empty string
    if (!token || token.trim() === '') return false;
    
    // Check token timestamp
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    if (!tokenTimestamp) return false;
    
    // Token TTL: 7 days (in milliseconds)
    const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;
    const timestampNum = parseInt(tokenTimestamp, 10);
    
    if (isNaN(timestampNum)) return false;
    
    const currentTime = Date.now();
    if (timestampNum > currentTime) return false; // Future timestamp, invalid
    
    return (currentTime - timestampNum) < TOKEN_TTL;
  } catch (e) {
    console.error("Error validating token:", e);
    return false;
  }
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return token ? true : false
}

/**
 * Force refresh the token if needed
 */
export async function refreshTokenIfNeeded(): Promise<boolean> {
  const token = getAuthToken();
  
  if (!token) return false;
  
  if (isTokenValid(token)) return true;
  
  try {
    const response = await fetch('https://micro.sobhagya.in/auth/api/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        storeAuthToken(data.token);
        return true;
      }
    }
    
    clearAuthData();
    return false;
  } catch (e) {
    console.error("Error refreshing token:", e);
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