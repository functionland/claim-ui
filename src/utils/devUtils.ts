/**
 * Development utilities for email authentication
 * These functions are only available in development mode
 */

import { clearCachedEmail, getCachedEmail } from './emailAuth';

/**
 * Clear authentication for testing purposes
 * Only works in development mode
 */
export function clearAuthForTesting(): void {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('clearAuthForTesting is only available in development mode');
    return;
  }
  
  clearCachedEmail();
  console.log('Authentication cleared. Refresh the page to see the email gate.');
}

/**
 * Check current authentication status
 * Only works in development mode
 */
export function checkAuthStatus(): void {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('checkAuthStatus is only available in development mode');
    return;
  }
  
  const email = getCachedEmail();
  if (email) {
    console.log(`Currently authenticated as: ${email}`);
  } else {
    console.log('Not authenticated');
  }
}

/**
 * Add development utilities to window object for easy access in browser console
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).devAuth = {
    clear: clearAuthForTesting,
    status: checkAuthStatus,
    help: () => {
      console.log(`
Development Email Auth Utilities:
- devAuth.clear() - Clear authentication and show email gate
- devAuth.status() - Check current authentication status
- devAuth.help() - Show this help message
      `);
    }
  };
  
  console.log('Development utilities available: devAuth.help()');
}
