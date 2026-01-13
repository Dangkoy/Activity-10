import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../config/api';
import { Event } from '../types';
import './Events.css';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    // Add a small delay to ensure token is ready
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token && token.trim()) {
        fetchEvents();
      } else {
        console.error('Token missing, cannot fetch events');
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

    setDeleting(id);
    try {
      await api.delete(`/events/${id}`);
      await fetchEvents();
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      alert(error.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="events-page">
      <div className="page-header">
        <h1>Events</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="events-grid">
        {filteredEvents.length === 0 ? (
          <p>No events found</p>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              {event.imageUrl && (
                <img src={event.imageUrl} alt={event.title} className="event-image" />
              )}
              <div className="event-content">
                <h3>{event.title}</h3>
                <p className="event-location">{event.location}</p>
                <p className="event-date">
                  {new Date(event.startDate).toLocaleDateString()} -{' '}
                  {new Date(event.endDate).toLocaleDateString()}
                </p>
                <div className="event-meta-info">
                  <p className="event-capacity">
                    {event.registeredCount} / {event.capacity} registered
                  </p>
                  <span className={`event-status-badge ${event.isActive ? 'active' : 'inactive'}`}>
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="event-actions">
                  <Link to={`/events/${event.id}`} className="btn-view">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View Details
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(event.id, event.title);
                    }}
                    className="btn-delete"
                    disabled={deleting === event.id}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    {deleting === event.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
