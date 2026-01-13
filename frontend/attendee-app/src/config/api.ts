import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Ensure headers object exists
  if (!config.headers) {
    config.headers = {} as any;
  }
  
  const token = localStorage.getItem('token');
  if (token && token.trim()) {
    // Set Authorization header with Bearer token
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle token expiration with grace period after login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors (Unauthorized)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/login', '/register'];
      
      // Check if the current route is public (events can be browsed without auth)
      const isPublicRoute = publicPaths.some(path => currentPath === path) || 
                           currentPath.startsWith('/events') && !currentPath.includes('/tickets');
      
      // Don't clear auth if we're on a public page
      if (!isPublicRoute) {
        const existingToken = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        // Only proceed if we have a token AND user data (meaning we were actually logged in)
        // AND it's been more than 15 seconds since login
        if (existingToken && existingToken.trim() && user) {
          // Check if this is happening right after login (grace period)
          const lastLoginTime = sessionStorage.getItem('lastLoginTime');
          const now = Date.now();
          
          // Grace period is 15 seconds (extended from 5 seconds to match other apps)
          // This prevents immediate logout after successful login due to race conditions
          if (!lastLoginTime || (now - parseInt(lastLoginTime)) > 15000) {
            // Verify the user is still valid before logging out
            try {
              const userData = JSON.parse(user);
              // Only logout if the error is on a protected route and token is truly invalid
              // Don't logout on public routes or if still in grace period
              console.warn('401 Unauthorized - clearing auth (outside grace period)');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('lastRegisteredEmail');
              sessionStorage.removeItem('lastLoginTime');
              
              // Dispatch event to notify components
              window.dispatchEvent(new CustomEvent('authChange'));
              
              // Only redirect if we're on a protected route (not public routes)
              // Protected routes: /tickets and any ticket details
              if (currentPath.startsWith('/tickets') && currentPath !== '/tickets') {
                setTimeout(() => {
                  if (window.location.pathname === currentPath && !localStorage.getItem('token')) {
                    window.location.href = '/tickets';
                  }
                }, 300);
              } else if (currentPath === '/tickets') {
                // Already on tickets page, just clear auth - don't redirect
                // The page will show the search form
              }
            } catch (e) {
              // Failed to parse user - might be corrupted, but don't logout yet
              console.error('Failed to parse user data on 401:', e);
              // Don't logout on parse errors - might be temporary
            }
          } else {
            // Still in grace period - don't clear auth, don't redirect, just log
            console.warn('401 Unauthorized during login grace period - ignoring (component will retry)');
            // Mark the error as handled during grace period so components know to retry
            error.isGracePeriod = true;
            error.shouldNotLogout = true;
          }
        } else {
          // No token or user - already logged out, nothing to do
          console.warn('401 Unauthorized but no token/user found - already logged out');
        }
      } else {
        // Public route - don't clear auth or redirect
        // Just mark error for component handling
        error.isPublicRoute = true;
        error.shouldNotLogout = true;
      }
    }
    // Always reject the error so components can handle it (outside grace period or public routes)
    return Promise.reject(error);
  }
);