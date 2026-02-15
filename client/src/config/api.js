/**
 * API base URL for all backend requests.
 * - Local dev: uses http://localhost:5000 if env is unset.
 * - Production (Vercel): you MUST set VITE_API_URL in Vercel → Settings → Environment Variables
 *   to your backend URL (e.g. https://your-app.onrender.com), then redeploy.
 */
const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SERVER_URL ||
  'http://localhost:5000';

/**
 * True when the app is running in production (non-localhost) but API_BASE is still localhost.
 * Use this to show a clear error instead of a generic "Network error".
 */
export function isProductionWithoutApi() {
  if (typeof window === 'undefined') return false;
  const isProduction = !['localhost', '127.0.0.1'].includes(window.location.hostname);
  const isLocalhostApi = API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1');
  return isProduction && isLocalhostApi;
}

export const PRODUCTION_API_MESSAGE =
  'Backend not configured for production. In Vercel → Project → Settings → Environment Variables, add VITE_API_URL = your backend URL (e.g. https://your-app.onrender.com), then redeploy.';

export default API_BASE;
