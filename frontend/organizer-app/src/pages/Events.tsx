import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { Event } from '../types';
import './Events.css';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    // Add a small delay to ensure token is ready
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token && token.trim() && user?.id) {
        fetchEvents();
      } else {
        console.error('Token or user missing, cannot fetch events');
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get(`/events?organizerId=${user.id}`);
      const eventsData = Array.isArray(response.data) ? response.data : [];
      // Debug: Log image info for each event
      eventsData.forEach((event: Event) => {
        console.log(`Event: "${event.title}"`, {
          hasImage: !!event.imageUrl,
          imageUrlType: event.imageUrl ? (event.imageUrl.startsWith('data:') ? 'Base64' : 'URL') : 'None',
          imageUrlLength: event.imageUrl?.length || 0
        });
      });
      setEvents(eventsData);
    } catch (error: any) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    
    const now = new Date();
    const startDate = new Date(event.startDate);
    
    if (filter === 'upcoming') return matchesSearch && startDate > now;
    if (filter === 'past') return matchesSearch && startDate <= now;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="page-header">
        <div>
          <h1>My Events</h1>
          <p className="page-subtitle">Manage and monitor your events</p>
        </div>
        <Link to="/events/new" className="btn-create-event">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create New Event
        </Link>
      </div>

      <div className="events-controls">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Events
          </button>
          <button
            className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Past
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="empty-events">
          <div className="empty-icon-wrapper">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h2>No Events Found</h2>
          <p>
            {search || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first event to get started!'}
          </p>
          {!search && filter === 'all' && (
            <Link to="/events/new" className="btn-create-first">
              Create Your First Event
            </Link>
          )}
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);
            const isUpcoming = startDate > new Date();
            const isPast = endDate < new Date();
            const capacityPercentage = event.capacity > 0 
              ? Math.round((event.registeredCount / event.capacity) * 100) 
              : 0;
            const isNearCapacity = capacityPercentage >= 80;

            return (
              <div key={event.id} className="event-card">
                <div className="event-card-image">
                  {event.imageUrl && event.imageUrl.trim() && event.imageUrl.length > 100 ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        display: 'block',
                        visibility: 'visible',
                        opacity: 1
                      }}
                      loading="lazy"
                      crossOrigin="anonymous"
                      onLoad={() => {
                        console.log('✅ Event image loaded successfully:', event.title);
                      }}
                      onError={(e) => {
                        console.error('❌ Failed to load event image for:', event.title);
                        console.error('Image URL length:', event.imageUrl?.length);
                        console.error('Image URL starts with:', event.imageUrl?.substring(0, 100));
                        console.error('Image URL ends with:', event.imageUrl?.substring(Math.max(0, (event.imageUrl?.length || 0) - 30)));
                        console.error('Is valid base64:', event.imageUrl?.startsWith('data:image'));
                        // Check if base64 is truncated
                        if (event.imageUrl && !event.imageUrl.match(/=$/)) {
                          console.warn('⚠️ Base64 string might be incomplete (missing padding)');
                        }
                      }}
                    />
                  ) : (
                    <div 
                      className="image-placeholder"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: 600
                      }}
                    >
                      {event.title}
                    </div>
                  )}
                </div>
                <div className="event-card-content">
                  <h3 className="event-card-title">{event.title}</h3>
                  <span className={`event-status-badge ${event.isActive ? 'active' : 'inactive'}`}>
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  <div className="event-card-meta">
                    <div className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{event.location}</span>
                    </div>
                    <div className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>
                        {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="capacity-section">
                    <div className="capacity-header">
                      <span>Capacity</span>
                      <span className={`capacity-percentage ${isNearCapacity ? 'warning' : ''}`}>
                        {capacityPercentage}%
                      </span>
                    </div>
                    <div className="capacity-bar">
                      <div 
                        className={`capacity-fill ${isNearCapacity ? 'warning' : ''}`}
                        style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="capacity-numbers">
                      <span>{event.registeredCount} registered</span>
                      <span>{event.capacity - event.registeredCount} remaining</span>
                    </div>
                  </div>

                  <div className="event-card-actions">
                    <Link to={`/events/${event.id}/attendees`} className="btn-action btn-primary-action">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      Attendees
                    </Link>
                    <Link to={`/events/${event.id}/edit`} className="btn-action btn-secondary-action">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(event.id, event.title)} 
                      className="btn-action btn-danger-action"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
