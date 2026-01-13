import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../config/api';
import { Event } from '../types';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const COLORS = ['#27ae60', '#3498db', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c'];

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, totalTickets: 0, checkedIn: 0 });
  const [loading, setLoading] = useState(true);
  const [allTickets, setAllTickets] = useState<any[]>([]);

  useEffect(() => {
    const lastLoginTime = sessionStorage.getItem('lastLoginTime');
    const now = Date.now();
    const inGracePeriod = lastLoginTime && (now - parseInt(lastLoginTime)) < 15000;
    const delay = inGracePeriod ? 2000 : 500;
    
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && token.trim() && user) {
        try {
          const userData = JSON.parse(user);
          if (userData.role === 'organizer' || userData.role === 'admin') {
            fetchData();
          } else {
            console.error('User is not an organizer, cannot fetch dashboard data');
            setLoading(false);
          }
        } catch (e) {
          console.error('Failed to parse user data:', e);
          setLoading(false);
        }
      } else {
        console.error('Token or user missing, cannot fetch dashboard data');
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const fetchData = async () => {
    const currentToken = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!currentToken || !currentToken.trim() || !userStr) {
      console.error('Token or user missing before API call');
      setLoading(false);
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr);
      if (!user || !user.id) {
        console.error('User ID missing');
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error('Failed to parse user data:', e);
      setLoading(false);
      return;
    }

    let myEvents: Event[] = [];

    try {
      const eventsRes = await api.get(`/events?organizerId=${user.id}`);
      myEvents = Array.isArray(eventsRes.data) ? eventsRes.data : [];
      setEvents(myEvents.slice(0, 5));
      
      setStats((prev) => ({
        ...prev,
        total: myEvents.length,
        active: myEvents.filter((e: Event) => e.isActive).length,
      }));
    } catch (eventsError: any) {
      console.error('Failed to fetch events:', eventsError);
      setEvents([]);
    }

    try {
      const ticketsRes = await api.get('/tickets');
      const tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
      const filteredTickets = tickets.filter((t: any) => 
        myEvents.some((e: Event) => e.id === t.eventId)
      );
      
      setAllTickets(filteredTickets);
      setStats((prev) => ({
        ...prev,
        totalTickets: filteredTickets.length,
        checkedIn: filteredTickets.filter((t: any) => t.status === 'checked_in').length,
      }));
    } catch (ticketsError: any) {
      console.error('Failed to fetch tickets:', ticketsError);
      setAllTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const statusData = [
    { name: 'Confirmed', value: allTickets.filter(t => t.status === 'confirmed').length, color: '#3498db' },
    { name: 'Checked In', value: stats.checkedIn, color: '#27ae60' },
    { name: 'Cancelled', value: allTickets.filter(t => t.status === 'cancelled').length, color: '#e74c3c' },
  ].filter(item => item.value > 0);

  const eventCapacityData = events.slice(0, 5).map(event => ({
    name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
    registered: event.registeredCount,
    capacity: event.capacity,
    percentage: event.capacity > 0 ? Math.round((event.registeredCount / event.capacity) * 100) : 0,
  }));

  // Registration trend data (last 7 days simulation)
  const registrationTrendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayTickets = allTickets.filter(t => {
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
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const checkInRate = stats.totalTickets > 0 ? Math.round((stats.checkedIn / stats.totalTickets) * 100) : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening with your events.</p>
        </div>
        <Link to="/events/new" className="btn-create-event-dashboard">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create New Event
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="stat-card-content">
            <h3>Total Events</h3>
            <p className="stat-number">{stats.total}</p>
            <span className="stat-label">{stats.active} active</span>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="stat-card-content">
            <h3>Total Tickets</h3>
            <p className="stat-number">{stats.totalTickets}</p>
            <span className="stat-label">Registered</span>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-card-content">
            <h3>Checked In</h3>
            <p className="stat-number">{stats.checkedIn}</p>
            <span className="stat-label">{checkInRate}% check-in rate</span>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-card-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="stat-card-content">
            <h3>Active Events</h3>
            <p className="stat-number">{stats.active}</p>
            <span className="stat-label">Running now</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {eventCapacityData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h3>Event Capacity Overview</h3>
              <p>Registration status across your top events</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventCapacityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="registered" fill="#3498db" name="Registered" radius={[8, 8, 0, 0]} />
                <Bar dataKey="capacity" fill="#95a5a6" name="Capacity" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {statusData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h3>Ticket Status Distribution</h3>
              <p>Breakdown of ticket statuses</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                    if (value === 0) return null;
                    const percentage = (percent * 100).toFixed(0);
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    
                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill="white" 
                        textAnchor={x > cx ? 'start' : 'end'} 
                        dominantBaseline="central"
                        fontSize={16}
                        fontWeight={700}
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))' }}
                      >
                        {`${percentage}%`}
                      </text>
                    );
                  }}
                  outerRadius="80%"
                  innerRadius="35%"
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} tickets`,
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => value}
                  wrapperStyle={{
                    paddingTop: '20px',
                    fontSize: '14px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {registrationTrendData.some(d => d.registrations > 0) && (
          <div className="chart-card chart-card-full">
            <div className="chart-header">
              <h3>Registration Trend</h3>
              <p>New registrations over the last 7 days</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={registrationTrendData}>
                <defs>
                  <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3498db" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke="#3498db" 
                  fillOpacity={1} 
                  fill="url(#colorRegistrations)"
                  name="Registrations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="recent-events-section">
        <div className="section-header">
          <h2>Recent Events</h2>
          <Link to="/events" className="view-all-link">
            View All Events
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Link>
        </div>
        {events.length === 0 ? (
          <div className="empty-events">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3>No Events Yet</h3>
            <p>Create your first event to start managing registrations and attendees.</p>
            <Link to="/events/new" className="btn-create-first-event">
              Create Your First Event
            </Link>
          </div>
        ) : (
          <div className="recent-events-grid">
            {events.map((event, index) => {
              const capacityPercentage = event.capacity > 0 
                ? Math.round((event.registeredCount / event.capacity) * 100) 
                : 0;
              const startDate = new Date(event.startDate);
              const isUpcoming = startDate > new Date();

              return (
                <div key={event.id} className="recent-event-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  {event.imageUrl ? (
                    <div className="event-card-image">
                      <img src={event.imageUrl} alt={event.title} />
                    </div>
                  ) : (
                    <div className="event-card-image-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                  )}
                  <div className="recent-event-content">
                    <div className="recent-event-header">
                      <h3>{event.title}</h3>
                      <span className={`event-status ${event.isActive ? 'active' : 'inactive'}`}>
                        {event.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="recent-event-meta">
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
                    </div>
                    <div className="capacity-info">
                      <div className="capacity-header">
                        <span>Capacity</span>
                        <span className={`capacity-percent ${capacityPercentage >= 80 ? 'warning' : ''}`}>
                          {capacityPercentage}%
                        </span>
                      </div>
                      <div className="capacity-bar">
                        <div 
                          className={`capacity-fill ${capacityPercentage >= 80 ? 'warning' : ''}`}
                          style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="capacity-numbers">
                        <span>{event.registeredCount} registered</span>
                        <span>{event.capacity - event.registeredCount} remaining</span>
                      </div>
                    </div>
                    <div className="recent-event-actions">
                      <Link to={`/events/${event.id}/attendees`} className="btn-attendees">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        View Attendees
                      </Link>
                      <Link to={`/events/${event.id}/edit`} className="btn-edit-event">
                        Edit
                      </Link>
                    </div>
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