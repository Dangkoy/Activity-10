import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [location]);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastRegisteredEmail');
    setIsAuthenticated(false);
    
    window.dispatchEvent(new CustomEvent('authChange'));
    navigate('/', { replace: true });
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
            Event Registration
          </Link>
          <div className="nav-menu">
            <Link
              to="/"
              className={location.pathname === '/' ? 'active' : ''}
            >
              Browse Events
            </Link>
            <Link
              to="/tickets"
              className={location.pathname === '/tickets' || location.pathname.startsWith('/tickets/') ? 'active' : ''}
            >
              My Tickets
            </Link>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="nav-logout-btn"
                type="button"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="nav-login-link">
                  Login
                </Link>
                <Link to="/register" className="nav-register-link">
                  Sign Up
                </Link>
              </>
            )}
          </div>
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={location.pathname === '/' ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Events
          </Link>
          <Link
            to="/tickets"
            className={location.pathname === '/tickets' || location.pathname.startsWith('/tickets/') ? 'active' : ''}
            onClick={() => setMobileMenuOpen(false)}
          >
            My Tickets
          </Link>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="mobile-logout-btn"
              type="button"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="mobile-link mobile-link-primary" onClick={() => setMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}