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
      const publicPaths = ['/login'];
      
      // Don't clear auth if we're on a public page
      if (!publicPaths.some(path => currentPath.includes(path))) {
        const existingToken = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        // Only logout if we have a token AND user data (meaning we were actually logged in)
        // AND it's been more than 15 seconds since login
        if (existingToken && existingToken.trim() && user) {
          // Check if this is happening right after login (grace period)
          const lastLoginTime = sessionStorage.getItem('lastLoginTime');
          const now = Date.now();
          
          // Only clear auth if it's been more than 15 seconds since login
          // This prevents immediate logout after successful login due to race conditions
          // Increased to 15 seconds to account for modal interactions, API calls, and page loads
          if (!lastLoginTime || (now - parseInt(lastLoginTime)) > 15000) {
            // Verify the user is still valid before logging out
            try {
              const userData = JSON.parse(user);
              if (userData.role === 'admin' && userData.isActive !== false) {
                // User is still valid - don't logout, just log the error
                // This might be a temporary API issue, not an auth failure
                console.warn('401 Unauthorized but user appears valid - not logging out. Error:', error.response?.data);
                // Mark error for component handling but don't clear auth
                error.isGracePeriod = false;
                error.shouldNotLogout = true;
              } else {
                // User is invalid - proceed with logout
                console.warn('401 Unauthorized - user invalid, clearing auth');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('lastLoginTime');
                window.dispatchEvent(new CustomEvent('authChange'));
                
                if (currentPath !== '/' && !currentPath.startsWith('/login')) {
                  setTimeout(() => {
                    if (window.location.pathname === currentPath && !localStorage.getItem('token')) {
                      window.location.href = '/login';
                    }
                  }, 300);
                }
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
      }
    }
    // Always reject the error so components can handle it (outside grace period)
    return Promise.reject(error);
  }
);
