import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../config/api';
import { Ticket } from '../types';
import './TicketDetail.css';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchTicket = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch ticket:', error);
      // Don't clear auth on ticket detail errors - might be in grace period
      if (error.isGracePeriod || error.shouldNotLogout) {
        console.warn('Ticket fetch error during grace period - will retry');
        // Retry after delay
        setTimeout(() => {
          const retryToken = localStorage.getItem('token');
          if (retryToken && retryToken.trim()) {
            api.get(`/tickets/${id}`).then((retryResponse) => {
              setTicket(retryResponse.data);
              setLoading(false);
            }).catch((retryError: any) => {
              console.error('Retry also failed:', retryError);
              setTicket(null);
              setLoading(false);
            });
          } else {
            setTicket(null);
            setLoading(false);
          }
        }, 2000);
      } else {
        setTicket(null);
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      // Add a small delay to ensure token is ready after navigation
      const lastLoginTime = sessionStorage.getItem('lastLoginTime');
      const now = Date.now();
      const inGracePeriod = lastLoginTime && (now - parseInt(lastLoginTime)) < 15000;
      const delay = inGracePeriod ? 800 : 200;
      
      const timer = setTimeout(() => {
        fetchTicket();
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [id, fetchTicket]);

  const handleCancelRegistration = async () => {
    if (!confirm('Are you sure you want to cancel your registration? This action cannot be undone.')) {
      return;
    }

    setCancelling(true);
    try {
      await api.patch(`/tickets/${id}`, { status: 'cancelled' });
      alert('Registration cancelled successfully.');
      // Use replace to prevent back navigation to cancelled ticket
      navigate('/tickets', { replace: true });
    } catch (error: any) {
      console.error('Cancel registration error:', error);
      // Don't logout on cancel errors - might be permission issue
      if (error.isGracePeriod || error.shouldNotLogout) {
        console.warn('Cancel error during grace period - ignoring logout');
      }
      alert(error.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading ticket...</div>;
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className="ticket-detail-page">
      <Link to="/tickets" className="back-link">← Back to My Tickets</Link>
      
      <div className="ticket-detail-card">
        <div className="ticket-detail-header">
          <div>
            <h1>{ticket.event?.title}</h1>
            <p className="ticket-event-date">
              {ticket.event?.startDate ? new Date(ticket.event.startDate).toLocaleDateString() : '-'} at {ticket.event?.location}
            </p>
          </div>
          <span className={`status-badge status-${ticket.status}`}>
            {ticket.status.replace('_', ' ')}
          </span>
        </div>

        <div className="ticket-detail-body">
          <div className="ticket-info-section">
            <h2>Ticket Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Attendee Name</label>
                <p>{ticket.attendee?.fullName || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{ticket.attendee?.email || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Company</label>
                <p>{ticket.attendee?.company || '-'}</p>
              </div>
              <div className="info-item">
                <label>Ticket Code</label>
                <p className="ticket-code-display">{ticket.ticketCode}</p>
              </div>
              <div className="info-item">
                <label>Registration Date</label>
                <p>{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              {ticket.checkedInAt && (
                <div className="info-item">
                  <label>Checked In</label>
                  <p>{new Date(ticket.checkedInAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="qr-code-section">
            <h2>QR Code Ticket</h2>
            <div className="qr-code-container">
              <QRCodeSVG
                value={ticket.ticketCode}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="qr-instructions">
              Present this QR code at the event entrance for check-in.
            </p>
            <p className="ticket-code-small">Code: {ticket.ticketCode}</p>
            
            {ticket.status === 'confirmed' && new Date(ticket.event?.startDate || '') > new Date() && (
              <button 
                onClick={handleCancelRegistration} 
                disabled={cancelling}
                className="btn-cancel-ticket"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Registration'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
