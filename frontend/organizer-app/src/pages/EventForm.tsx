import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../config/api';
import ErrorModal from '../components/ErrorModal';
import './EventForm.css';

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    capacity: 100,
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    // Only fetch event data when editing (id exists)
    if (id) {
      // Add a delay to ensure token is ready
      const timer = setTimeout(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (!token || !token.trim() || !user) {
          setErrorModalMessage('You must be logged in to edit events. Please log in again.');
          setShowErrorModal(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }

        try {
          const userData = JSON.parse(user);
          // Check if user is organizer or admin (required to edit)
          if (userData.role !== 'organizer' && userData.role !== 'admin') {
            setErrorModalMessage('You do not have permission to edit events.');
            setShowErrorModal(true);
            setTimeout(() => {
              navigate('/events');
            }, 2000);
            return;
          }
          
          // User is authorized, fetch the event
          fetchEvent();
        } catch (e) {
          console.error('Failed to parse user data:', e);
          setErrorModalMessage('Invalid user session. Please log in again.');
          setShowErrorModal(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
      }, 500);

      return () => clearTimeout(timer);
    }
    // When creating new event (no id), no need to fetch - just ensure user is logged in
    else {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !token.trim() || !user) {
        // For new events, redirect to login if not authenticated
        setErrorModalMessage('You must be logged in as an organizer to create events. Please log in.');
        setShowErrorModal(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      try {
        const userData = JSON.parse(user);
        // Ensure user is organizer or admin to create events
        if (userData.role !== 'organizer' && userData.role !== 'admin') {
          setErrorModalMessage('Only organizers and admins can create events. Please log in with an organizer account.');
          setShowErrorModal(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
        setErrorModalMessage('Invalid user session. Please log in again.');
        setShowErrorModal(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    // If we have a file, it will be handled by handleImageChange's FileReader
    // If we have imageUrl (from editing or after upload), use it for preview
    if (formData.imageUrl && formData.imageUrl.trim()) {
      setPreviewUrl(formData.imageUrl);
    } else {
      setPreviewUrl('');
    }
  }, [formData.imageUrl]);

  const fetchEvent = async () => {
    try {
      // GET single event is public, but we'll include token anyway
      const response = await api.get(`/events/${id}`);
      const event = response.data;
      setFormData({
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        capacity: event.capacity,
        imageUrl: event.imageUrl || '',
      });
      if (event.imageUrl) {
        setPreviewUrl(event.imageUrl);
      }
      // Reset image file when loading existing event
      setImageFile(null);
    } catch (error: any) {
      console.error('Failed to fetch event:', error);
      const errorMessage = error.response?.status === 404
        ? 'Event not found. It may have been deleted.'
        : error.response?.data?.message || 'Failed to load event data. Please try again.';
      setErrorModalMessage(errorMessage);
      setShowErrorModal(true);
      
      // Redirect to events list if event not found
      if (error.response?.status === 404) {
        setTimeout(() => {
          navigate('/events');
        }, 2000);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    
    if (!file) {
      setImageFile(null);
      setPreviewUrl('');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      setImageFile(null);
      setPreviewUrl('');
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setImageError('Image size must be less than 5MB. Please compress the image and try again.');
      setImageFile(null);
      setPreviewUrl('');
      e.target.value = '';
      return;
    }

    setImageFile(file);
    
    // Create preview URL immediately using object URL for instant display
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // Convert to base64 and store in formData for form submission
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prevData) => ({ ...prevData, imageUrl: base64String }));
      // Clean up object URL since we now have base64
      URL.revokeObjectURL(objectUrl);
      // Update preview to base64 to ensure consistency
      setPreviewUrl(base64String);
    };
    reader.onerror = () => {
      setImageError('Failed to process image file');
      setImageFile(null);
      setPreviewUrl('');
      URL.revokeObjectURL(objectUrl);
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setFormData({ ...formData, imageUrl: '' });
    setPreviewUrl('');
    setImageError('');
    // Reset file input
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Clear saved form data when editing (id exists)
  useEffect(() => {
    if (id) {
      sessionStorage.removeItem('eventFormData');
    }
  }, [id]);

  // Restore form data from sessionStorage on mount (only for new events)
  useEffect(() => {
    if (!id) {
      const savedData = sessionStorage.getItem('eventFormData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // Only restore if there's actual data and form is in initial state
          if ((parsed.title || parsed.description || parsed.location) && 
              !formData.title && !formData.description && !formData.location) {
            setFormData(parsed);
          }
        } catch (e) {
          console.error('Failed to restore form data:', e);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Save form data to sessionStorage periodically to prevent data loss (only for new events)
  useEffect(() => {
    if (!id && (formData.title || formData.description || formData.location)) {
      // Only save if there's actual data entered
      const timeoutId = setTimeout(() => {
        sessionStorage.setItem('eventFormData', JSON.stringify(formData));
      }, 500); // Debounce saves
      
      return () => clearTimeout(timeoutId);
    }
  }, [formData, id]);

  const showError = (message: string) => {
    setErrorModalMessage(message);
    setShowErrorModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModalMessage('');
    setShowErrorModal(false);
    setLoading(true);

    // CRITICAL: Mark form submission BEFORE any API calls
    // This prevents the API interceptor from logging out during form submission
    sessionStorage.setItem('isSubmittingEvent', 'true');

    // Validate required fields
    if (!formData.title.trim()) {
      showError('Please enter an event title.');
      setLoading(false);
      sessionStorage.removeItem('isSubmittingEvent');
      return;
    }

    if (!formData.description.trim()) {
      showError('Please enter an event description.');
      setLoading(false);
      sessionStorage.removeItem('isSubmittingEvent');
      return;
    }

    if (!formData.location.trim()) {
      showError('Please enter an event location.');
      setLoading(false);
      sessionStorage.removeItem('isSubmittingEvent');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      showError('Please select both start and end dates.');
      setLoading(false);
      sessionStorage.removeItem('isSubmittingEvent');
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const now = new Date();

    if (endDate < startDate) {
      showError('End date must be after start date. Please correct the dates.');
      setLoading(false);
      sessionStorage.removeItem('isSubmittingEvent');
      return;
    }

    if (startDate < now) {
      showError('Start date cannot be in the past. Please select a future date.');
      setLoading(false);
      sessionStorage.removeItem('isSubmittingEvent');
      return;
    }

    if (formData.capacity < 1 || formData.capacity > 10000) {
      showError('Capacity must be between 1 and 10,000 attendees.');
      setLoading(false);
      sessionStorage.removeItem('isSubmittingEvent');
      return;
    }

    // Quick check: ensure we have a token (backend will validate everything else)
    const token = localStorage.getItem('token');
    if (!token || !token.trim()) {
      showError('You must be logged in to create/edit events. Please log in again.');
      setLoading(false);
      sessionStorage.removeItem('isSubmittingEvent');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    try {
      // Make the API call - backend guards will validate token and role
      // isSubmittingEvent flag prevents automatic logout during submission
      let response;
      if (id) {
        // Update existing event
        console.log('Updating event:', id);
        response = await api.patch(`/events/${id}`, formData);
        console.log('Event updated successfully:', response.data?.id || response.data);
      } else {
        // Create new event - backend will validate organizer/admin role
        console.log('Creating event with data:', { 
          title: formData.title,
          location: formData.location,
          startDate: formData.startDate,
          endDate: formData.endDate,
          capacity: formData.capacity,
          hasImage: !!formData.imageUrl
        });
        response = await api.post('/events', formData);
        console.log('Event created successfully:', response.data?.id || response.data);
      }
      
      // Success - clear saved form data and submission flag, then navigate
      sessionStorage.removeItem('eventFormData');
      sessionStorage.removeItem('isSubmittingEvent');
      
      // Navigate to events list on success
      navigate('/events');
    } catch (error: any) {
      console.error('Failed to save event:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Is form submission:', error.isFormSubmission);
      console.error('Should not logout:', error.shouldNotLogout);
      
      // Clear submission flag
      sessionStorage.removeItem('isSubmittingEvent');
      
      let errorMessage = 'Failed to save event. Please check all fields and try again.';
      let shouldLogout = false;
      
      if (error.response?.status === 401) {
        // 401 Unauthorized - backend rejected the request
        const errorDetail = error.response?.data?.message || error.response?.data?.error || '';
        console.error('401 Unauthorized Error:', {
          status: error.response.status,
          error: errorDetail,
          url: error.config?.url,
        });
        
        // Don't logout during form submission - let backend error message guide user
        if (error.isFormSubmission && error.shouldNotLogout) {
          errorMessage = errorDetail || 'Authentication failed. Please check your account role and status, then try again.';
          shouldLogout = false;
        } else if (error.isGracePeriod) {
          errorMessage = 'Please wait a moment and try again. Your session is still initializing.';
          shouldLogout = false;
        } else {
          // Show backend error message
          errorMessage = errorDetail || 'Your session has expired or you are not authorized. Please log in again.';
          shouldLogout = true;
        }
      } else if (error.response?.status === 403) {
        // 403 Forbidden - user doesn't have permission
        const errorDetail = error.response?.data?.message || error.response?.data?.error || '';
        if (errorDetail) {
          errorMessage = `Access denied: ${errorDetail}`;
        } else {
          errorMessage = 'You do not have permission to perform this action. Only organizers and admins can create/edit events.';
        }
        // Check if user role changed
        const user = localStorage.getItem('user');
        try {
          const userData = JSON.parse(user || '{}');
          if (userData.role !== 'organizer' && userData.role !== 'admin') {
            shouldLogout = true;
            errorMessage = 'Your account does not have organizer permissions. Please contact an administrator.';
          }
        } catch (e) {
          // Invalid user data - logout
          shouldLogout = true;
        }
      } else if (error.response?.status === 400) {
        // 400 Bad Request - validation error from backend
        const backendError = error.response.data?.message || error.response.data?.error || error.response.data;
        if (Array.isArray(backendError)) {
          errorMessage = backendError.join(', ');
        } else if (typeof backendError === 'object') {
          errorMessage = JSON.stringify(backendError);
        } else {
          errorMessage = String(backendError) || 'Invalid data provided. Please check all fields.';
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message && error.message !== 'Request failed with status code 401') {
        errorMessage = error.message;
      } else if (!error.response) {
        // Network error or server not responding
        errorMessage = 'Unable to connect to the server. Please check your internet connection and ensure the backend is running on http://localhost:4000';
      }
      
      // Only logout if it's a real auth failure, not a temporary issue
      if (shouldLogout) {
        // Real auth failure - clear everything and logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('lastLoginTime');
        sessionStorage.removeItem('eventFormData');
        sessionStorage.removeItem('isSubmittingEvent');
        window.dispatchEvent(new CustomEvent('authChange'));
        showError(errorMessage);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Just show error, don't logout - form data is preserved in sessionStorage
        // User can retry after fixing the issue
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-form-page">
      <ErrorModal
        isOpen={showErrorModal}
        message={errorModalMessage}
        onClose={() => setShowErrorModal(false)}
        title="Error"
      />
      
      <div className="form-header">
        <Link to="/events" className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to Events
        </Link>
        <h1>{id ? 'Edit Event' : 'Create New Event'}</h1>
        <p className="form-subtitle">
          {id ? 'Update your event details' : 'Fill in the information below to create a new event'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="event-form">

        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., Tech Conference 2024"
              className="form-input"
            />
            <small className="form-hint">Choose a clear, descriptive title for your event</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={6}
              placeholder="Provide detailed information about your event, including agenda, speakers, topics, etc."
              className="form-textarea"
            />
            <small className="form-hint">Include all relevant details attendees should know</small>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              placeholder="e.g., Convention Center, 123 Main St, City"
              className="form-input"
            />
            <small className="form-hint">Full address or venue name</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Schedule & Capacity</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date & Time *</label>
              <input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date & Time *</label>
              <input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Maximum Capacity *</label>
            <input
              id="capacity"
              type="number"
              min="1"
              max="10000"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              required
              placeholder="100"
              className="form-input"
            />
            <small className="form-hint">Maximum number of attendees allowed</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Event Image</h3>
          
          <div className="form-group">
            <label htmlFor="imageFile">Upload Event Image (Optional)</label>
            <div className="file-upload-wrapper">
              <input
                id="imageFile"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="file-input"
              />
              <label htmlFor="imageFile" className="file-upload-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="upload-icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span className="file-name-text">
                  {imageFile ? imageFile.name : 'Choose an image file'}
                </span>
              </label>
            </div>
            {imageError && (
              <div className="form-error-small">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {imageError}
              </div>
            )}
            <small className="form-hint">Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)</small>
          </div>

          {previewUrl && (
            <div className="image-preview">
              <img 
                src={previewUrl} 
                alt="Event preview" 
                style={{
                  display: 'block',
                  visibility: 'visible',
                  opacity: 1,
                  maxWidth: '100%',
                  height: 'auto'
                }}
                onError={(e) => {
                  console.error('Image preview error:', e);
                  setPreviewUrl('');
                  setImageError('Failed to load image preview. Please try a different image.');
                }} 
                onLoad={() => {
                  console.log('Image preview loaded successfully');
                }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="btn-remove-image"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Remove Image
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/events')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <>
                <span className="spinner"></span>
                {id ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                {id ? 'Update Event' : 'Create Event'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
