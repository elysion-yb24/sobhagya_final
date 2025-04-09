// utils/token-utility.js

/**
 * This utility helps you set and retrieve a manual token for testing
 * Run this code in your browser console when you have a working authentication
 */

// Function to retrieve and display the current token
function getToken() {
    let token = '';
    
    try {
      // Try localStorage first
      token = localStorage.getItem('authToken');
      if (token) {
        console.log('%c Current Auth Token (from localStorage):', 'color: green; font-weight: bold');
        console.log(token);
        console.log('\n');
        
        // Also show user details if available
        const userDetails = localStorage.getItem('userDetails');
        if (userDetails) {
          console.log('%c Current User Details:', 'color: blue; font-weight: bold');
          console.log(JSON.parse(userDetails));
        }
        
        return token;
      }
      
      // Try cookies as fallback
      const tokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authToken='));
      
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
        console.log('%c Current Auth Token (from cookies):', 'color: orange; font-weight: bold');
        console.log(token);
        return token;
      }
      
      console.log('%c No authentication token found!', 'color: red; font-weight: bold');
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }
  
  // Function to save a token as MANUAL_TOKEN in auth-utils.js
  function saveManualToken() {
    const token = getToken();
    
    if (!token) {
      console.error('No token available to save as manual token.');
      return;
    }
    
    // Create code snippet for the user to paste in auth-utils.js
    console.log('%c Add this line to your auth-utils.js file:', 'color: green; font-weight: bold');
    console.log(`export const MANUAL_TOKEN = "${token}";`);
    
    // Copy to clipboard if supported
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`export const MANUAL_TOKEN = "${token}";`)
        .then(() => {
          console.log('%c Copied to clipboard! ✓', 'color: green');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  }
  
  // Function to set a manual token directly
  function setManualToken(token) {
    if (!token) {
      console.error('Please provide a token to set');
      return;
    }
    
    try {
      // Store in localStorage
      localStorage.setItem('manualToken', token);
      console.log('%c Manual token stored successfully', 'color: green; font-weight: bold');
      console.log('You can access it in your code with: localStorage.getItem("manualToken")');
      
      // Create timestamp for user details if needed
      const timestamp = new Date().getTime();
      localStorage.setItem('manualTokenTimestamp', timestamp.toString());
      
      return true;
    } catch (error) {
      console.error('Error storing manual token:', error);
      return false;
    }
  }
  
  // How to use this utility
  console.log('%c Token Utility Functions', 'color: purple; font-weight: bold; font-size: 14px');
  console.log('1. getToken() - Get the current authentication token');
  console.log('2. saveManualToken() - Create code to add to auth-utils.js');
  console.log('3. setManualToken("your-token-here") - Store a specific token');
  
  // Return the functions for use in console
  return {
    getToken,
    saveManualToken,
    setManualToken
  };