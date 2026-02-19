/**
 * Auth token for API requests. Stored in sessionStorage so it works when
 * cross-origin cookies are blocked (e.g. mobile browsers on Vercel + Render).
 * Server accepts either cookie or Authorization: Bearer <token>.
 */
const TOKEN_KEY = 'rc_token';

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function clearAuthToken() {
  setAuthToken(null);
}

/** Headers to add to authenticated API requests (cookie is still sent with credentials: 'include'). */
export function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
