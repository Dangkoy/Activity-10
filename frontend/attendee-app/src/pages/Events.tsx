import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../config/api';
import { Event } from '../types';
import './Events.css';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');


  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events?upcoming=true&isActive=true');
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Failed to fetch events:', error);
      // Don't clear auth or redirect on public route errors
      // Just show empty state
      setEvents([]);
      // If it's a 401 on a public route, it's likely a backend issue, not auth issue
      if (error.response?.status === 401 && error.isPublicRoute) {
        console.warn('401 on public events route - backend may require auth, showing empty');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="events-page">
      {/* Hero Section */}
      <div className="events-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Discover Amazing
            <span className="gradient-text"> Events</span>
          </h1>
          <p className="hero-subtitle">
            Find and register for exciting events happening near you
          </p>
          <div className="search-box-hero">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search events by title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input-hero"
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="search-clear"
                aria-label="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          {filteredEvents.length > 0 && (
            <p className="results-count">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </p>
          )}
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="events-section">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading amazing events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h2>No events found</h2>
            <p>{search ? 'Try adjusting your search terms' : 'Check back soon for exciting events!'}</p>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map((event, index) => {
              const startDate = new Date(event.startDate);
              const endDate = new Date(event.endDate);
              const capacityPercentage = event.capacity > 0 
                ? Math.round((event.registeredCount / event.capacity) * 100) 
                : 0;
              const isFull = event.capacity - event.registeredCount <= 0;
              const isNearFull = capacityPercentage >= 80;

              return (
                <div key={event.id} className="event-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="event-image-wrapper">
                    {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} className="event-image" />
                    ) : (
                      <div className="event-image-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                    )}
                    {isFull && (
                      <div className="event-badge full">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        SOLD OUT
                      </div>
                    )}
                    {isNearFull && !isFull && (
                      <div className="event-badge warning">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        FEW LEFT
                      </div>
                    )}
                  </div>
                  <div className="event-content">
                    <h3 className="event-title">{event.title}</h3>
                    <div className={`event-status ${event.isActive ? 'active' : 'inactive'}`}>
                      {event.isActive ? 'Active' : 'Inactive'}
                    </div>
                    
                    <div className="event-meta">
                      <div className="meta-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{event.location}</span>
                      </div>
                      <div className="meta-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="meta-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>
                          {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="event-capacity-section">
                      <div className="capacity-header">
                        <span>Capacity</span>
                        <span className="capacity-percent">{capacityPercentage}%</span>
                      </div>
                      <div className="capacity-bar">
                        <div 
                          className={`capacity-fill ${isNearFull ? 'warning' : ''} ${isFull ? 'full' : ''}`}
                          style={{ width: `${capacityPercentage}%` }}
                        ></div>
                      </div>
                      <div className="capacity-info">
                        <span>{event.registeredCount} registered</span>
                        <span>{event.capacity - event.registeredCount} remaining</span>
                      </div>
                    </div>

                    <Link to={`/events/${event.id}`} className="btn-view">
                      <span>View Details</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
