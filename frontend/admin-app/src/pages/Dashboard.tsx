import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../config/api';
import { Event, User } from '../types';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalTickets: 0,
    checkedInTickets: 0,
    totalUsers: 0,
    organizers: 0,
    attendees: 0,
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#667eea', '#3498db', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6'];

  useEffect(() => {
    // Add a delay to ensure token is properly set after login
    // Check if we're in the login grace period
    const lastLoginTime = sessionStorage.getItem('lastLoginTime');
    const now = Date.now();
    const inGracePeriod = lastLoginTime && (now - parseInt(lastLoginTime)) < 15000; // Extended to 15 seconds
    
    // Much longer delay if we're in grace period (just logged in or modal was dismissed)
    // This accounts for the Google Password Manager modal that might delay interactions
    const delay = inGracePeriod ? 2000 : 500; // Increased delay to 2 seconds
    
    const timer = setTimeout(() => {
      // Double-check token exists and is valid before making API calls
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && token.trim() && user) {
        // Verify user is admin
        try {
          const userData = JSON.parse(user);
          if (userData.role === 'admin') {
            fetchData();
          } else {
            console.error('User is not an admin, cannot fetch dashboard data');
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
    // Verify token exists before making request
    const currentToken = localStorage.getItem('token');
    if (!currentToken || !currentToken.trim()) {
      console.error('Token missing before API call');
      setLoading(false);
      return;
    }

    // Make API calls separately so one failure doesn't break everything
    // This prevents logout if one endpoint fails
    try {
      const statsRes = await api.get('/reports/overview');
      setStats(statsRes.data || {
        totalEvents: 0,
        activeEvents: 0,
        totalTickets: 0,
        checkedInTickets: 0,
        totalUsers: 0,
        organizers: 0,
        attendees: 0,
      });
    } catch (statsError: any) {
      console.error('Failed to fetch stats:', statsError);
      
      // Check if we're in grace period
      const lastLoginTime = sessionStorage.getItem('lastLoginTime');
      const now = Date.now();
      const inGracePeriod = lastLoginTime && (now - parseInt(lastLoginTime)) < 15000; // Extended to 15 seconds
      
      if (statsError.response?.status === 401 && (statsError.isGracePeriod || inGracePeriod)) {
        // Still in grace period - retry stats later
        console.warn('Stats API error during grace period - will retry');
        setTimeout(() => {
          if (localStorage.getItem('token')) {
            api.get('/reports/overview').then((res) => {
              setStats(res.data || {
                totalEvents: 0,
                activeEvents: 0,
                totalTickets: 0,
                checkedInTickets: 0,
                totalUsers: 0,
                organizers: 0,
                attendees: 0,
              });
            }).catch(() => {
              // Just show empty stats, don't logout
              setStats({
                totalEvents: 0,
                activeEvents: 0,
                totalTickets: 0,
                checkedInTickets: 0,
                totalUsers: 0,
                organizers: 0,
                attendees: 0,
              });
            });
          }
        }, 3000);
      } else {
        // Show empty stats but don't logout
        setStats({
          totalEvents: 0,
          activeEvents: 0,
          totalTickets: 0,
          checkedInTickets: 0,
          totalUsers: 0,
          organizers: 0,
          attendees: 0,
        });
      }
    }

    // Fetch events separately (this endpoint is public, so it should work)
    try {
      const eventsRes = await api.get('/events');
      const eventsData = Array.isArray(eventsRes.data) ? eventsRes.data : [];
      setAllEvents(eventsData);
      setRecentEvents(eventsData.filter((e: Event) => e.isActive).slice(0, 5));
    } catch (eventsError: any) {
      console.error('Failed to fetch events:', eventsError);
      setAllEvents([]);
      setRecentEvents([]);
    }

    // Fetch all tickets for analytics
    try {
      const ticketsRes = await api.get('/tickets');
      setAllTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
    } catch (ticketsError: any) {
      console.error('Failed to fetch tickets:', ticketsError);
      setAllTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const eventStatusData = [
    { name: 'Active', value: stats.activeEvents, color: '#27ae60' },
    { name: 'Inactive', value: stats.totalEvents - stats.activeEvents, color: '#95a5a6' },
  ].filter(item => item.value > 0);

  const userRoleData = [
    { name: 'Organizers', value: stats.organizers, color: '#667eea' },
    { name: 'Attendees', value: stats.attendees, color: '#3498db' },
  ].filter(item => item.value > 0);

  const ticketStatusData = [
    { name: 'Confirmed', value: allTickets.filter(t => t.status === 'confirmed').length, color: '#3498db' },
    { name: 'Checked In', value: stats.checkedInTickets, color: '#27ae60' },
    { name: 'Cancelled', value: allTickets.filter(t => t.status === 'cancelled').length, color: '#e74c3c' },
  ].filter(item => item.value > 0);

  const eventCapacityData = allEvents.slice(0, 6).map(event => ({
    name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
    registered: event.registeredCount,
    capacity: event.capacity,
    percentage: event.capacity > 0 ? Math.round((event.registeredCount / event.capacity) * 100) : 0,
  }));

  // Registration trend data (last 7 days)
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

  const checkInRate = stats.totalTickets > 0 ? Math.round((stats.checkedInTickets / stats.totalTickets) * 100) : 0;

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Events</h3>
          <p className="stat-number">{stats.totalEvents}</p>
        </div>
        <div className="stat-card">
          <h3>Active Events</h3>
          <p className="stat-number">{stats.activeEvents}</p>
        </div>
        <div className="stat-card">
          <h3>Total Tickets</h3>
          <p className="stat-number">{stats.totalTickets}</p>
        </div>
        <div className="stat-card">
          <h3>Checked In</h3>
          <p className="stat-number">{stats.checkedInTickets}</p>
          <p className="stat-label">Check-in Rate: {checkInRate}%</p>
        </div>
        <div className="stat-card">
          <h3>Organizers</h3>
          <p className="stat-number">{stats.organizers}</p>
        </div>
        <div className="stat-card">
          <h3>Attendees</h3>
          <p className="stat-number">{stats.attendees}</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="charts-grid">
        {eventStatusData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h3>Event Status Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius="80%"
                  innerRadius="35%"
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {eventStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} events`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span style={{ color: '#555', fontSize: '0.9rem' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {userRoleData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h3>User Role Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius="80%"
                  innerRadius="35%"
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} users`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span style={{ color: '#555', fontSize: '0.9rem' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {ticketStatusData.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h3>Ticket Status Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticketStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius="80%"
                  innerRadius="35%"
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {ticketStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} tickets`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span style={{ color: '#555', fontSize: '0.9rem' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="chart-card chart-card-full">
          <div className="chart-header">
            <h3>Registration Trend (Last 7 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={registrationTrendData}>
              <defs>
                <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
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
                  padding: '10px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="registrations" 
                stroke="#667eea" 
                fillOpacity={1} 
                fill="url(#colorRegistrations)" 
                name="Registrations"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {eventCapacityData.length > 0 && (
          <div className="chart-card chart-card-full">
            <div className="chart-header">
              <h3>Event Capacity Overview</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventCapacityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'registered' ? `${value} registered` : `${value} capacity`,
                    name === 'registered' ? 'Registered' : 'Capacity'
                  ]}
                />
                <Legend />
                <Bar dataKey="registered" fill="#667eea" name="Registered" radius={[8, 8, 0, 0]} />
                <Bar dataKey="capacity" fill="#3498db" name="Capacity" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="recent-events">
        <div className="recent-events-header">
          <h2>Recent Active Events</h2>
          <Link to="/events" className="view-all-link">View All Events →</Link>
        </div>
        {recentEvents.length === 0 ? (
          <p className="no-events">No active events</p>
        ) : (
          <div className="events-list">
            {recentEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`} className="event-card">
                <div className="event-card-content">
                  <h3>{event.title}</h3>
                  <p className="event-location">{event.location}</p>
                  <p className="event-date">
                    {new Date(event.startDate).toLocaleDateString()} -{' '}
                    {new Date(event.endDate).toLocaleDateString()}
                  </p>
                  <div className="event-stats">
                    <span className="stat-badge">
                      {event.registeredCount} / {event.capacity} registered
                    </span>
                    <span className={`status-badge ${event.isActive ? 'status-active' : 'status-inactive'}`}>
                      {event.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="event-card-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
