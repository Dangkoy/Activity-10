import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { Event } from '../types';
import './EventDetails.css';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    company: '',
  });

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
    } catch (error: any) {
      console.error('Failed to fetch event:', error);
      // Event details is a public route, don't logout on 401
      if (error.response?.status === 401 && error.isPublicRoute) {
        console.warn('401 on public event details route - backend may require auth');
      }
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);

    try {
      const response = await api.post('/tickets', {
        eventId: id,
        ...formData,
      });
      
      // Store email for later ticket lookup
      localStorage.setItem('lastRegisteredEmail', formData.email);
      
      // Store registration timestamp to prevent immediate logout
      sessionStorage.setItem('lastLoginTime', Date.now().toString());
      
      // Wait a bit to ensure token/auth is set if registration created account
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to ticket detail
      navigate(`/tickets/${response.data.id}`, { replace: true });
    } catch (error: any) {
      console.error('Registration error:', error);
      // Don't clear auth on registration errors - might be capacity issue
      if (error.isGracePeriod || error.shouldNotLogout) {
        console.warn('Registration error during grace period - will retry');
      }
      alert(error.response?.data?.message || 'Registration failed. You may already be registered for this event.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const isFull = event.capacity - event.registeredCount <= 0;

  return (
    <div className="event-details-page">
      <Link to="/" className="back-link">← Back to Events</Link>
      
      <div className="event-header">
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title} className="event-hero-image" />
        )}
        <div className="event-info">
          <h1>{event.title}</h1>
          <div className="event-meta">
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {new Date(event.startDate).toLocaleTimeString()} - {new Date(event.endDate).toLocaleTimeString()}</p>
            <p><strong>Capacity:</strong> {event.registeredCount} / {event.capacity} registered</p>
            {isFull && (
              <div className="full-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>This event is at full capacity</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="event-body">
        <div className="event-description">
          <h2>Description</h2>
          <p>{event.description}</p>
        </div>

        <div className="registration-form">
          <h2>Register for this Event</h2>
          {isFull ? (
            <p className="full-message">Sorry, this event is at full capacity.</p>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Company (Optional)</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Enter your company name"
                />
              </div>
              <button type="submit" disabled={registering} className="btn-register">
                {registering ? 'Registering...' : 'Register Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
