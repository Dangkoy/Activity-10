import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../config/api';
import { Event } from '../types';
import './Scanner.css';

interface ScanHistory {
  id: string;
  ticketCode: string;
  attendeeName: string;
  eventTitle: string;
  status: string;
  timestamp: Date;
  success: boolean;
}

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, pending: 0 });
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [continuousMode, setContinuousMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load events and stats
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      fetchEvents(user.id);
    }
  }, []);

  // Check camera permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setCameraPermission('granted');
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraPermission('denied');
        } else {
          setCameraPermission('prompt');
        }
      }
    };
    checkPermissions();
  }, []);

  // Create beep sound
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSfTQ8MUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBtpvfDkn00PDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC');
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  const fetchEvents = async (organizerId: string) => {
    try {
      const response = await api.get(`/events?organizerId=${organizerId}`);
      const eventsData = Array.isArray(response.data) ? response.data : [];
      setEvents(eventsData);
      if (eventsData.length > 0 && !selectedEvent) {
        setSelectedEvent(eventsData[0].id);
        fetchStats(eventsData[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const fetchStats = async (eventId: string) => {
    try {
      const response = await api.get(`/tickets?eventId=${eventId}`);
      const tickets = Array.isArray(response.data) ? response.data : [];
      setStats({
        total: tickets.length,
        checkedIn: tickets.filter((t: any) => t.status === 'checked_in').length,
        pending: tickets.filter((t: any) => t.status === 'confirmed' || t.status === 'pending').length,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const getAvailableCameras = async (): Promise<string> => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        // Prefer back camera (environment), fallback to any camera
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        return backCamera?.id || devices[0].id;
      }
      // Fallback to facingMode if device enumeration fails
      return 'environment';
    } catch (err) {
      console.warn('Could not enumerate cameras, using default:', err);
      return 'environment';
    }
  };

  const startScanning = async () => {
    try {
      setError('');
      
      // Check if camera is already in use
      if (scannerRef.current) {
        await stopScanning();
        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Ensure the reader element exists
      const readerElement = document.getElementById('reader');
      if (!readerElement) {
        throw new Error('Scanner container not found');
      }

      const scanner = new Html5Qrcode('reader');
      scannerRef.current = scanner;

      // Get available camera
      const cameraId = await getAvailableCameras();

      // Try to start with specific camera ID or fallback to facingMode
      let config: any;
      if (typeof cameraId === 'string' && cameraId !== 'environment' && cameraId !== 'user') {
        config = { deviceId: { exact: cameraId } };
      } else {
        config = { facingMode: cameraId === 'user' ? 'user' : 'environment' };
      }

      await scanner.start(
        config,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors (these are just "no QR code found" messages)
          console.debug('Scanning:', errorMessage);
        }
      );
      setScanning(true);
      setError('');
    } catch (err: any) {
      console.error('Camera error:', err);
      let errorMessage = 'Failed to start camera. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera access and try again.';
        setCameraPermission('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found. Please connect a camera and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please check your camera permissions and try again.';
      }
      
      setError(errorMessage);
      setScanning(false);
      
      // Clean up on error
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop().catch(() => {});
          scannerRef.current.clear();
        } catch (cleanupErr) {
          console.error('Cleanup error:', cleanupErr);
        }
        scannerRef.current = null;
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScanning(false);
  };

  const playBeep = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleScan = async (ticketCode: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/tickets/code/${ticketCode}`);
      const ticket = response.data;
      
      // Check if ticket belongs to selected event
      if (selectedEvent && ticket.eventId !== selectedEvent) {
        setError(`This ticket is for a different event: ${ticket.event?.title || 'Unknown'}`);
        setResult(null);
        addToHistory(ticketCode, ticket, false);
        if (!continuousMode) stopScanning();
        setLoading(false);
        return;
      }
      
      if (ticket.status === 'checked_in') {
        setError('Ticket already checked in');
        setResult(null);
        addToHistory(ticketCode, ticket, false);
        if (!continuousMode) stopScanning();
        setLoading(false);
        return;
      }
      
      // Verify and check in
      const verifyResponse = await api.get(`/tickets/verify/${ticketCode}`);
      const verifiedTicket = verifyResponse.data;
      setResult(verifiedTicket);
      setError('');
      playBeep();
      addToHistory(ticketCode, verifiedTicket, true);
      
      // Update stats
      if (selectedEvent) {
        fetchStats(selectedEvent);
      }
      
      // Auto-continue scanning if in continuous mode
      if (continuousMode && scanning) {
        setTimeout(() => {
          setResult(null);
        }, 2000);
      } else {
        stopScanning();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid ticket';
      setError(errorMsg);
      setResult(null);
      addToHistory(ticketCode, null, false);
      if (!continuousMode) stopScanning();
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (code: string, ticket: any, success: boolean) => {
    const historyItem: ScanHistory = {
      id: Date.now().toString(),
      ticketCode: code,
      attendeeName: ticket?.attendee?.fullName || 'Unknown',
      eventTitle: ticket?.event?.title || 'Unknown Event',
      status: ticket?.status || 'error',
      timestamp: new Date(),
      success,
    };
    setScanHistory(prev => [historyItem, ...prev].slice(0, 50)); // Keep last 50
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const ticketCode = (form.elements.namedItem('ticketCode') as HTMLInputElement).value;
    if (ticketCode) {
      handleScan(ticketCode);
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      fetchStats(selectedEvent);
    }
  }, [selectedEvent]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        stopScanning();
      }
    };
  }, []);

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <h1>Check-In Station</h1>
        {events.length > 0 && (
          <div className="event-selector">
            <label htmlFor="event-select">Event:</label>
            <select
              id="event-select"
              value={selectedEvent}
              onChange={(e) => {
                setSelectedEvent(e.target.value);
                setResult(null);
                setError('');
              }}
              className="event-select"
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Statistics Dashboard */}
      {selectedEvent && (
        <div className="stats-dashboard">
          <div className="stat-card">
            <div className="stat-icon total">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Tickets</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon checked">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.checkedIn}</div>
              <div className="stat-label">Checked In</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon percentage">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%
              </div>
              <div className="stat-label">Check-In Rate</div>
            </div>
          </div>
        </div>
      )}

      {cameraPermission === 'denied' && (
        <div className="permission-warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div>
            <strong>Camera access denied</strong>
            <p>Please enable camera permissions in your browser settings and refresh the page.</p>
          </div>
        </div>
      )}

      <div className="scanner-main-grid">
        <div className="scanner-container">
          {!scanning && !result && (
            <div className="scanner-start-section">
              <div className="scanner-controls">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={continuousMode}
                    onChange={(e) => setContinuousMode(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">Continuous Mode</span>
                </label>
              </div>
              <button onClick={startScanning} className="btn-primary btn-large" disabled={cameraPermission === 'denied' || !selectedEvent}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                Start Scanning
              </button>
              {!selectedEvent && (
                <p className="help-text error">Please select an event first</p>
              )}
              {cameraPermission === 'denied' && (
                <p className="help-text error">Enable camera permissions to use QR scanner</p>
              )}
            </div>
          )}
          
          {scanning && (
            <div className="scanner-active">
              <div className="scanner-viewport">
                <div id="reader" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}></div>
                <div className="scanning-overlay">
                  <div className="scan-frame"></div>
                  <p className="scanning-hint">Align QR code within the frame</p>
                </div>
              </div>
              <div className="scanner-controls-active">
                <button onClick={stopScanning} className="btn-secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                  </svg>
                  Stop Scanning
                </button>
                {loading && (
                  <div className="loading-indicator">
                    <div className="spinner"></div>
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </div>
          )}

        <div className="manual-verify">
          <h3>Or Enter Ticket Code Manually</h3>
          <form onSubmit={handleManualVerify}>
            <input
              type="text"
              name="ticketCode"
              placeholder="Enter ticket code"
              required
              autoComplete="off"
            />
            <button type="submit" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Verify Ticket
            </button>
          </form>
        </div>

        {error && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
            <button onClick={() => setError('')} className="error-close">×</button>
          </div>
        )}
        
        {result && (
          <div className="scan-result">
            <div className="result-header">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3>Ticket Verified Successfully!</h3>
            </div>
            <div className="result-details">
              <div className="result-item">
                <strong>Attendee:</strong>
                <span>{result.attendee?.fullName || 'N/A'}</span>
              </div>
              <div className="result-item">
                <strong>Email:</strong>
                <span>{result.attendee?.email || 'N/A'}</span>
              </div>
              <div className="result-item">
                <strong>Event:</strong>
                <span>{result.event?.title || 'N/A'}</span>
              </div>
              <div className="result-item">
                <strong>Status:</strong>
                <span className={`status-badge status-${result.status}`}>{result.status}</span>
              </div>
              {result.checkedInAt && (
                <div className="result-item">
                  <strong>Checked In At:</strong>
                  <span>{new Date(result.checkedInAt).toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="result-actions">
              {continuousMode && scanning ? (
                <button onClick={() => { setResult(null); setError(''); }} className="btn-secondary">
                  Continue Scanning
                </button>
              ) : (
                <button onClick={() => { setResult(null); setError(''); startScanning(); }} className="btn-primary">
                  Scan Another Ticket
                </button>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Scan History Sidebar */}
        <div className="scan-history-panel">
          <div className="history-header">
            <h3>Recent Scans</h3>
            <button onClick={() => setScanHistory([])} className="btn-clear" title="Clear history">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
          <div className="history-list">
            {scanHistory.length === 0 ? (
              <div className="history-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"></path>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <p>No scans yet</p>
                <span>Scan history will appear here</span>
              </div>
            ) : (
              scanHistory.map((item) => (
                <div key={item.id} className={`history-item ${item.success ? 'success' : 'error'}`}>
                  <div className="history-icon">
                    {item.success ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    )}
                  </div>
                  <div className="history-content">
                    <div className="history-name">{item.attendeeName}</div>
                    <div className="history-details">
                      <span className="history-code">{item.ticketCode}</span>
                      <span className="history-time">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
