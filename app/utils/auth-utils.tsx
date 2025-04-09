// auth-utils.ts

/**
 * Gets the authentication token from localStorage
 */
export function getAuthToken(): string | null {
  try {
    // Try localStorage first
    const token = localStorage.getItem('authToken');
    if (token) return token;

    // Try cookies as fallback
    const tokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='));
    
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }

    return null;
  } catch (e) {
    console.error("Error accessing localStorage:", e);
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
 * Clears authentication data from localStorage and cookies
 */
export function clearAuthData(): void {
  try {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenTimestamp');
    localStorage.removeItem('userDetails');
    
    // Clear cookies
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } catch (e) {
    console.error("Error clearing auth data:", e);
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
  return isTokenValid(token);
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