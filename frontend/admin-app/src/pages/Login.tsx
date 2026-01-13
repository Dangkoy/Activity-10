import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import './Login.css';

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function Login({ setIsAuthenticated }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('rememberedEmail_admin');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Extract accessToken and user data from response
      // Backend returns: { ...userData, accessToken }
      const { accessToken, password: _, ...userData } = response.data;

      // Verify we have the required fields
      if (!accessToken || !userData.id) {
        throw new Error('Invalid login response: missing token or user ID');
      }

      // Check if user role is admin (required for admin app)
      const userRole = userData.role || 'attendee';
      if (userRole !== 'admin') {
        setError('Access denied. Admin account required.');
        setLoading(false);
        return;
      }

      // Store authentication in localStorage FIRST
      // Use the actual role from backend response
      const userToStore = {
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,
        company: userData.company || undefined,
        role: userRole, // Use actual role from backend
        isActive: userData.isActive !== false, // Default to true if not specified
      };
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userToStore));

      // Remember email if checkbox is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail_admin', email);
      } else {
        localStorage.removeItem('rememberedEmail_admin');
      }

      // Store login timestamp for grace period (prevents immediate logout)
      sessionStorage.setItem('lastLoginTime', Date.now().toString());

      // Update authentication state immediately
      setIsAuthenticated(true);

      // IMPORTANT: Wait to ensure localStorage is fully set and axios interceptor picks up the token
      // This prevents the API interceptor from catching a 401 immediately after login
      // Longer delay accounts for modal interactions (like Google Password Manager)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Increased to 1.5 seconds

      // Verify token was stored correctly
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!storedToken || storedToken !== accessToken || !storedUser) {
        console.error('Token or user storage failed - retrying');
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userToStore));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Verify the token is valid by checking it's not empty
      const finalToken = localStorage.getItem('token');
      if (!finalToken || !finalToken.trim()) {
        throw new Error('Token storage failed - please try again');
      }

      // Trigger custom event for same-tab auth state update
      window.dispatchEvent(new CustomEvent('authChange'));
      
      // Navigate after everything is set and token is verified
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials and try again.');
      setLoading(false);
      
      // Clear any partial data if login failed
      if (err.message && err.message.includes('storage failed')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('lastLoginTime');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Admin Login</h1>
          <p className="subtitle">System Administration Portal</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  setRememberMe(e.target.checked);
                  if (!e.target.checked) {
                    localStorage.removeItem('rememberedEmail_admin');
                  }
                }}
              />
              <span>Remember me</span>
            </label>
          </div>
          {error && (
            <div className="error-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="error-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
          <div className="login-footer">
            <p className="admin-note">
              <small>
                Admin accounts are created by system administrators. 
                Contact your administrator for account access.
              </small>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
