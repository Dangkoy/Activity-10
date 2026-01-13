import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { Event, Ticket } from '../types';
import './EventDetails.css';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const [eventRes, ticketsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/tickets?eventId=${id}`),
      ]);
      setEvent(eventRes.data);
      setTickets(ticketsRes.data);
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

    setDeleting(true);
    try {
      await api.delete(`/events/${id}`);
      navigate('/events');
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      alert(error.response?.data?.message || 'Failed to delete event');
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="event-details">
      <Link to="/events" className="back-link">← Back to Events</Link>
      <div className="event-header">
        <div>
          <h1>{event.title}</h1>
          <p className="event-meta">
            {event.location} • {new Date(event.startDate).toLocaleDateString()} -{' '}
            {new Date(event.endDate).toLocaleDateString()}
          </p>
        </div>
        <button 
          onClick={handleDelete} 
          className="btn-delete"
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete Event'}
        </button>
      </div>

      <div className="event-info">
        <div className="info-section">
          <h2>Description</h2>
          <p>{event.description}</p>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <label>Capacity</label>
            <span>{event.capacity}</span>
          </div>
          <div className="stat-item">
            <label>Registered</label>
            <span>{event.registeredCount}</span>
          </div>
          <div className="stat-item">
            <label>Remaining</label>
            <span>{event.capacity - event.registeredCount}</span>
          </div>
          <div className="stat-item">
            <label>Status</label>
            <span className={event.isActive ? 'status-active' : 'status-inactive'}>
              {event.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div className="attendees-section">
        <h2>Registered Attendees ({tickets.length})</h2>
        <div className="attendees-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Ticket Code</th>
                <th>Status</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.attendee?.fullName}</td>
                  <td>{ticket.attendee?.email}</td>
                  <td>{ticket.attendee?.company || '-'}</td>
                  <td className="ticket-code">{ticket.ticketCode}</td>
                  <td>
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {tickets.length === 0 && <p className="no-data">No attendees yet</p>}
        </div>
      </div>
    </div>
  );
}
