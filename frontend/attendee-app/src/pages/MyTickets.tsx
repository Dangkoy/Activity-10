import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../config/api';
import { Ticket } from '../types';
import './MyTickets.css';

export default function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const isLoggedIn = !!(token && userStr);
  
  const [email, setEmail] = useState(localStorage.getItem('lastRegisteredEmail') || '');
  const [searchMode, setSearchMode] = useState(isLoggedIn || !!localStorage.getItem('lastRegisteredEmail'));

  useEffect(() => {
    // Only fetch if we have the necessary data
    // Add a delay to ensure token is properly set after login
    // Check if we're in the login grace period (extended to 15 seconds to match interceptor)
    const lastLoginTime = sessionStorage.getItem('lastLoginTime');
    const now = Date.now();
    const inGracePeriod = lastLoginTime && (now - parseInt(lastLoginTime)) < 15000;
    
    // Longer delay if we're in grace period (just logged in)
    const delay = inGracePeriod ? 1500 : 300;
    
    const timer = setTimeout(() => {
      // Double-check auth state before making API call
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const actuallyLoggedIn = !!(token && token.trim() && userStr);

      if (actuallyLoggedIn) {
        // User is logged in, fetch tickets automatically
        fetchTickets('');
      } else if (email && searchMode) {
        // Search by email (not logged in)
        fetchTickets(email);
      } else {
        setLoading(false);
      }
    }, delay); // Delay to ensure auth state is fully set and axios interceptor has the token

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, email, searchMode]);

  const fetchTickets = async (attendeeEmail: string) => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && token.trim() && userStr) {
        try {
          // User is logged in, fetch their tickets using their ID
          const user = JSON.parse(userStr);
          
          // Verify user has an ID
          if (!user || !user.id) {
            console.error('User ID missing, cannot fetch tickets');
            setTickets([]);
            setLoading(false);
            return;
          }
          
          // Double-check token exists right before making request
          const currentToken = localStorage.getItem('token');
          if (!currentToken || !currentToken.trim()) {
            console.error('Token missing before API call, cannot fetch tickets');
            setTickets([]);
            setLoading(false);
            return;
          }
          
          // For attendee role, the backend will automatically filter by user.id (see tickets.controller.ts line 51-53)
          // So we can just call /tickets - the backend will automatically filter to user's tickets
          // The JwtStrategy will extract the user from the token via @CurrentUser decorator
          const response = await api.get('/tickets');
          setTickets(Array.isArray(response.data) ? response.data : []);
        } catch (apiError: any) {
          // Handle different error types
          const status = apiError.response?.status;
          
          if (status === 401) {
            // 401 Unauthorized - token might be invalid
            // Check if we're in the login grace period
            const lastLoginTime = sessionStorage.getItem('lastLoginTime');
            const now = Date.now();
            
            // Check if error is marked as grace period or should not logout
            if (apiError.isGracePeriod || apiError.shouldNotLogout || (lastLoginTime && (now - parseInt(lastLoginTime)) < 15000)) {
              // Still in grace period or error marked to not logout - retry
              console.warn('Authentication error during grace period - retrying in 2 seconds');
              setTickets([]);
              // Retry after a longer delay to ensure token is ready
              setTimeout(() => {
                const retryToken = localStorage.getItem('token');
                const retryUserStr = localStorage.getItem('user');
                if (retryToken && retryToken.trim() && retryUserStr) {
                  try {
                    const retryUser = JSON.parse(retryUserStr);
                    if (retryUser.id) {
                      api.get('/tickets').then((retryResponse) => {
                        setTickets(Array.isArray(retryResponse.data) ? retryResponse.data : []);
                        setLoading(false);
                      }).catch((retryError: any) => {
                        console.error('Retry also failed:', retryError);
                        // Only show empty if truly outside grace period
                        if (!retryError.isGracePeriod && !retryError.shouldNotLogout) {
                          setTickets([]);
                        }
                        setLoading(false);
                      });
                    }
                  } catch (e) {
                    console.error('Failed to parse user for retry:', e);
                    setTickets([]);
                    setLoading(false);
                  }
                } else {
                  setTickets([]);
                  setLoading(false);
                }
              }, 2000);
            } else {
              // Not in grace period - token is likely invalid
              console.error('Authentication failed - token may be invalid:', apiError.response?.data?.message);
              setTickets([]);
              // Let the interceptor handle clearing auth - it will only do so if truly invalid
            }
          } else if (status === 403) {
            // 403 Forbidden - user doesn't have permission
            console.error('Access forbidden:', apiError.response?.data?.message);
            setTickets([]);
          } else if (status >= 500) {
            // Server error
            console.error('Server error fetching tickets:', apiError.response?.data?.message);
            setTickets([]);
          } else if (apiError.code === 'ECONNREFUSED' || apiError.message.includes('Network')) {
            // Network error - backend might be down
            console.error('Network error - cannot connect to backend:', apiError.message);
            setTickets([]);
          } else {
            // Other errors
            console.error('Failed to fetch tickets:', apiError.message || apiError);
            setTickets([]);
          }
        }
      } else {
        // Not logged in, cannot fetch tickets without auth
        // The tickets endpoint requires authentication
        console.warn('User not logged in - cannot fetch tickets via API');
        setTickets([]);
      }
    } catch (error: any) {
      console.error('Unexpected error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      fetchTickets(email);
      setSearchMode(true);
    }
  };

  if (loading) {
    return <div className="loading">Loading your tickets...</div>;
  }

  return (
    <div className="tickets-page">
      <h1>My Tickets</h1>
      
      {isLoggedIn && tickets.length > 0 && (
        <p className="welcome-message">
          Welcome back! Here are your registered events.
        </p>
      )}

      {!isLoggedIn && !searchMode && (
        <div className="search-form">
          <h2>View Your Tickets</h2>
          <form onSubmit={handleSearch}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="email-input"
            />
            <button type="submit" className="btn-search">
              View My Tickets
            </button>
          </form>
          <p className="search-hint">
            Enter the email address you used to register for events.
          </p>
          <div className="auth-options">
            <p>Or create an account for easier access:</p>
            <div className="auth-buttons">
              <Link to="/login" className="btn-auth">
                Sign In
              </Link>
              <Link to="/register" className="btn-auth btn-auth-primary">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {searchMode && !isLoggedIn && (
        <button 
          onClick={() => { setSearchMode(false); setTickets([]); setEmail(''); }} 
          className="btn-reset-search"
        >
          Search with Different Email
        </button>
      )}

      {tickets.length === 0 && !loading && searchMode && (
        <div className="empty-state">
          <p>No tickets found for this email address.</p>
          <Link to="/" className="btn-browse">
            Browse Events
          </Link>
        </div>
      )}

      {tickets.length > 0 && (
        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <h3>{ticket.event?.title}</h3>
                <span className={`status-badge status-${ticket.status}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <div className="ticket-info">
                <p><strong>Location:</strong> {ticket.event?.location}</p>
                <p><strong>Date:</strong> {ticket.event?.startDate ? new Date(ticket.event.startDate).toLocaleDateString() : '-'}</p>
                <p><strong>Ticket Code:</strong> <span className="ticket-code">{ticket.ticketCode}</span></p>
                <p><strong>Registered:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
                {ticket.checkedInAt && (
                  <p><strong>Checked In:</strong> {new Date(ticket.checkedInAt).toLocaleString()}</p>
                )}
              </div>
              <Link to={`/tickets/${ticket.id}`} className="btn-view-ticket">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                View Ticket & QR Code
              </Link>
            </div>
          ))}
        </div>
      )}

      {!isLoggedIn && !searchMode && tickets.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="7" y1="8" x2="17" y2="8"></line>
              <line x1="7" y1="12" x2="17" y2="12"></line>
              <line x1="7" y1="16" x2="12" y2="16"></line>
            </svg>
          </div>
          <h2>No Tickets Yet</h2>
          <p>Sign in or enter your email to view your tickets, or browse events to get started!</p>
          <div className="empty-actions">
            <Link to="/" className="btn-browse">
              Browse Events
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
