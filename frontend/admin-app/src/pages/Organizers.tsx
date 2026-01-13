import { useEffect, useState } from 'react';
import { api } from '../config/api';
import { User } from '../types';
import './Organizers.css';

export default function Organizers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    company: '',
    role: 'organizer' as 'organizer' | 'attendee',
    isActive: true,
  });

  useEffect(() => {
    // Add a small delay to ensure token is ready
    const timer = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token && token.trim()) {
        fetchUsers();
      } else {
        console.error('Token missing, cannot fetch users');
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const fetchUsers = async () => {
    try {
      const [organizersRes, staffRes] = await Promise.all([
        api.get('/users?role=organizer'),
        api.get('/users?role=attendee'),
      ]);
      const organizers = Array.isArray(organizersRes.data) ? organizersRes.data : [];
      const staff = Array.isArray(staffRes.data) ? staffRes.data : [];
      setUsers([...organizers, ...staff]);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/users', formData);
      setShowForm(false);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        company: '',
        role: 'organizer',
        isActive: true,
      });
      await fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setToggling(id);
    try {
      await api.patch(`/users/${id}`, { isActive: !isActive });
      await fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user');
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="organizers-page">
      <div className="page-header">
        <h1>Organizers & Staff</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="user-form">
          <h2>Create New User</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                required
              >
                <option value="organizer">Organizer</option>
                <option value="attendee">Attendee</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Company (Optional)</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      )}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.company || '-'}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td>
                  <span className={user.isActive ? 'status-active' : 'status-inactive'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    className={`btn-toggle ${user.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                    disabled={toggling === user.id}
                  >
                    {toggling === user.id ? 'Updating...' : (user.isActive ? 'Deactivate' : 'Activate')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="no-data">No users found</p>}
      </div>
    </div>
  );
}
