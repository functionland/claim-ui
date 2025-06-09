const EMAIL_CACHE_KEY = 'authenticated_email';

/**
 * Check if an email is cached as authenticated
 */
export function getCachedEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(EMAIL_CACHE_KEY);
}

/**
 * Cache an authenticated email
 */
export function setCachedEmail(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EMAIL_CACHE_KEY, email);
}

/**
 * Clear cached email
 */
export function clearCachedEmail(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EMAIL_CACHE_KEY);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if email is in whitelist by calling API
 */
export async function validateEmailWithServer(email: string): Promise<boolean> {
  try {
    const response = await fetch('/api/validate-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    return data.isValid;
  } catch (error) {
    console.error('Error validating email:', error);
    return false;
  }
}
