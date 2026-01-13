import { useEffect, useState } from 'react';
import { api } from '../config/api';
import { Event } from '../types';
import './Reports.css';

export default function Reports() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventStats();
    }
  }, [selectedEvent]);

  const fetchData = async () => {
    try {
      const [eventsRes, overviewRes] = await Promise.all([
        api.get('/events'),
        api.get('/reports/overview'),
      ]);
      setEvents(eventsRes.data);
      setOverview(overviewRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventStats = async () => {
    try {
      const response = await api.get(`/reports/events/${selectedEvent}/statistics`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch event stats:', error);
    }
  };

  const handleExportCSV = async (eventId: string) => {
    if (!eventId) return;
    
    setExporting(true);
    try {
      const response = await api.get(`/reports/events/${eventId}/attendees/csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const event = events.find(e => e.id === eventId);
      const fileName = event 
        ? `attendees-${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${eventId}.csv`
        : `attendees-${eventId}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to export CSV:', error);
      alert(error.response?.data?.message || 'Failed to export CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="reports-page">
      <h1>Reports & Exports</h1>

      <div className="overview-section">
        <h2>System Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Events</h3>
            <p className="stat-number">{overview?.totalEvents || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Active Events</h3>
            <p className="stat-number">{overview?.activeEvents || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Tickets</h3>
            <p className="stat-number">{overview?.totalTickets || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Checked In</h3>
            <p className="stat-number">{overview?.checkedInTickets || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{overview?.totalUsers || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Organizers</h3>
            <p className="stat-number">{overview?.organizers || 0}</p>
          </div>
        </div>
      </div>

      <div className="event-reports-section">
        <h2>Event Reports</h2>
        <div className="event-selector">
          <label>Select Event:</label>
          <select
            value={selectedEvent || ''}
            onChange={(e) => setSelectedEvent(e.target.value || null)}
          >
            <option value="">-- Select an event --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.startDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {stats && (
          <div className="event-stats">
            <h3>{stats.eventTitle}</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <label>Capacity</label>
                <span>{stats.capacity}</span>
              </div>
              <div className="stat-item">
                <label>Total Registered</label>
                <span>{stats.totalRegistered}</span>
              </div>
              <div className="stat-item">
                <label>Confirmed</label>
                <span>{stats.confirmed}</span>
              </div>
              <div className="stat-item">
                <label>Checked In</label>
                <span>{stats.checkedIn}</span>
              </div>
              <div className="stat-item">
                <label>Cancelled</label>
                <span>{stats.cancelled}</span>
              </div>
              <div className="stat-item">
                <label>Check-in Rate</label>
                <span>{stats.checkInRate}%</span>
              </div>
            </div>
            <button
              onClick={() => handleExportCSV(selectedEvent!)}
              className="btn-export"
              disabled={exporting || !selectedEvent}
            >
              {exporting ? 'Exporting...' : 'Export Attendees CSV'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
