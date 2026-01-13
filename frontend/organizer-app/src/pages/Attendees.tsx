import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../config/api';
import { Ticket } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import './Attendees.css';

const COLORS = ['#27ae60', '#3498db', '#e74c3c', '#f39c12'];

export default function Attendees() {
  const { id } = useParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        const token = localStorage.getItem('token');
        if (token && token.trim()) {
          fetchData();
        } else {
          console.error('Token missing, cannot fetch attendees');
          setLoading(false);
        }
      }, 200);

      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchData = async () => {
    try {
      let eventData = null;
      let ticketsData: any[] = [];

      try {
        const eventRes = await api.get(`/events/${id}`);
        eventData = eventRes.data;
        setEvent(eventData);
      } catch (eventError: any) {
        console.error('Failed to fetch event:', eventError);
      }

      try {
        const ticketsRes = await api.get(`/tickets?eventId=${id}`);
        ticketsData = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
        setTickets(ticketsData);
      } catch (ticketsError: any) {
        console.error('Failed to fetch tickets:', ticketsError);
        setTickets([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setEvent(null);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get(`/reports/events/${id}/attendees/csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendees-${event?.title || id}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to export CSV');
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.attendee?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.attendee?.email?.toLowerCase().includes(search.toLowerCase()) ||
      ticket.ticketCode.toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = {
    confirmed: tickets.filter(t => t.status === 'confirmed').length,
    checked_in: tickets.filter(t => t.status === 'checked_in').length,
    cancelled: tickets.filter(t => t.status === 'cancelled').length,
  };

  const statusData = [
    { name: 'Confirmed', value: statusCounts.confirmed, color: '#3498db' },
    { name: 'Checked In', value: statusCounts.checked_in, color: '#27ae60' },
    { name: 'Cancelled', value: statusCounts.cancelled, color: '#e74c3c' },
  ].filter(item => item.value > 0);

  // Registration by day (last 7 days)
  const registrationByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayTickets = tickets.filter(t => {
      const ticketDate = new Date(t.createdAt);
      return ticketDate.toDateString() === date.toDateString();
    }).length;
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      registrations: dayTickets,
    };
  });

  if (loading) {
    return (
      <div className="attendees-loading">
        <div className="loading-spinner"></div>
        <p>Loading attendees...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="attendees-error">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h2>Event Not Found</h2>
        <p>Unable to load event information.</p>
        <Link to="/events" className="btn-back-to-events">Back to Events</Link>
      </div>
    );
  }

  return (
    <div className="attendees-page">
      <div className="attendees-header">
        <div>
          <Link to="/events" className="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Events
          </Link>
          <h1>{event.title}</h1>
          <p className="event-subtitle">Attendee Management</p>
        </div>
      </div>

      <div className="attendees-stats">
        <div className="stat-box">
          <div className="stat-value">{tickets.length}</div>
          <div className="stat-label">Total Registrations</div>
        </div>
        <div className="stat-box stat-success">
          <div className="stat-value">{statusCounts.confirmed}</div>
          <div className="stat-label">Confirmed</div>
        </div>
        <div className="stat-box stat-info">
          <div className="stat-value">{statusCounts.checked_in}</div>
          <div className="stat-label">Checked In</div>
        </div>
        <div className="stat-box stat-danger">
          <div className="stat-value">{statusCounts.cancelled}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      {tickets.length > 0 && (
        <div className="attendees-charts">
          {statusData.length > 0 && (
            <div className="chart-box">
              <h3>Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="chart-box chart-box-full">
            <h3>Daily Registrations (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={registrationByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="registrations" fill="#3498db" name="Registrations" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="attendees-controls">
        <div className="search-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or ticket code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={handleExportCSV} className="btn-export" disabled={tickets.length === 0}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export CSV
        </button>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="empty-attendees">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3>{search ? 'No Attendees Found' : 'No Attendees Yet'}</h3>
          <p>
            {search 
              ? 'Try adjusting your search criteria' 
              : 'Registrations will appear here once attendees sign up for this event.'}
          </p>
        </div>
      ) : (
        <div className="attendees-table-wrapper">
          <table className="attendees-table">
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
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="attendee-row">
                  <td className="attendee-name">{ticket.attendee?.fullName || '-'}</td>
                  <td className="attendee-email">{ticket.attendee?.email || '-'}</td>
                  <td className="attendee-company">{ticket.attendee?.company || '-'}</td>
                  <td className="attendee-code">
                    <code>{ticket.ticketCode}</code>
                  </td>
                  <td>
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status === 'checked_in' ? 'Checked In' : 
                       ticket.status === 'confirmed' ? 'Confirmed' : 
                       ticket.status === 'cancelled' ? 'Cancelled' : 
                       ticket.status}
                    </span>
                  </td>
                  <td className="attendee-date">
                    {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}