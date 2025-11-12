import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { 
  FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, 
  FaMapMarkerAlt, FaUsers, FaMicrophone, FaCheckCircle, FaTimes, 
  FaClock, FaEyeSlash
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import './AdminProfessionalDevelopment.css';

const AdminProfessionalDevelopment = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    event_type: 'Workshop',
    max_participants: '',
    speaker_name: '',
    speaker_bio: '',
    registration_deadline: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professional_development_events')
        .select('*, created_by_user:users!created_by(first_name, last_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch professional development events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!user || !user.id) {
      toast.error('User not authenticated. Please refresh the page and try again.');
      setLoading(false);
      return;
    }
    
    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('professional_development_events')
          .update(formData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Event updated successfully!');
      } else {
        const eventData = {
          ...formData,
          created_by: user.id,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
        };
        
        const { error } = await supabase
          .from('professional_development_events')
          .insert([eventData]);

        if (error) throw error;
        toast.success('Event created successfully!');
      }

      fetchEvents();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(error.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('professional_development_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Event deleted successfully!');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (event) => {
    try {
      const newStatus = event.status === 'published' ? 'draft' : 'published';
      const { error } = await supabase
        .from('professional_development_events')
        .update({ status: newStatus })
        .eq('id', event.id);

      if (error) throw error;
      toast.success(`Event ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
      fetchEvents();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update event status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      location: '',
      event_type: 'Workshop',
      max_participants: '',
      speaker_name: '',
      speaker_bio: '',
      registration_deadline: '',
      status: 'draft'
    });
    setEditingEvent(null);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      start_date: event.start_date ? format(new Date(event.start_date), 'yyyy-MM-dd\'T\'HH:mm') : '',
      end_date: event.end_date ? format(new Date(event.end_date), 'yyyy-MM-dd\'T\'HH:mm') : '',
      location: event.location || '',
      event_type: event.event_type || 'Workshop',
      max_participants: event.max_participants || '',
      speaker_name: event.speaker_name || '',
      speaker_bio: event.speaker_bio || '',
      registration_deadline: event.registration_deadline ? format(new Date(event.registration_deadline), 'yyyy-MM-dd\'T\'HH:mm') : '',
      status: event.status || 'draft'
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const paginatedEvents = filteredEvents.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);

  return (
    <div className="admin-professional-development">
      <div className="admin-header">
        <div>
          <h2>
            <FaCalendarAlt /> Professional Development Events
          </h2>
          <p>Manage workshops, seminars, and training programs</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FaPlus /> Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <FaFilter />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="loading">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <FaCalendarAlt />
          <h3>No events found</h3>
          <p>Create your first professional development event</p>
        </div>
      ) : (
        <>
          <div className="events-table">
            <table>
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvents.map(event => (
                  <tr key={event.id}>
                    <td>
                      <div className="event-title">
                        <strong>{event.title}</strong>
                        {event.speaker_name && (
                          <span className="speaker-name">
                            <FaMicrophone /> {event.speaker_name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="event-date">
                        <FaClock />
                        {event.start_date && format(new Date(event.start_date), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </td>
                    <td>
                      <div className="event-location">
                        <FaMapMarkerAlt />
                        {event.location || 'TBA'}
                      </div>
                    </td>
                    <td>
                      <span className="event-type-badge">{event.event_type}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${event.status}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => toggleStatus(event)}
                          title={event.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {event.status === 'published' ? <FaEye /> : <FaEyeSlash />}
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => openEditModal(event)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDelete(event.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
              <button className="close-btn" onClick={() => { setShowModal(false); resetForm(); }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Career Development Workshop"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Type *</label>
                  <select name="event_type" value={formData.event_type} onChange={handleInputChange} required>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Training">Training</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} required>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  placeholder="Describe the event objectives and what participants will learn..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Conference Room A or Zoom Meeting"
                  />
                </div>

                <div className="form-group">
                  <label>Max Participants</label>
                  <input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Registration Deadline</label>
                <input
                  type="datetime-local"
                  name="registration_deadline"
                  value={formData.registration_deadline}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Speaker Name</label>
                <input
                  type="text"
                  name="speaker_name"
                  value={formData.speaker_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Dr. John Smith"
                />
              </div>

              <div className="form-group">
                <label>Speaker Bio</label>
                <textarea
                  name="speaker_bio"
                  value={formData.speaker_bio}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief background of the speaker..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setShowModal(false); resetForm(); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfessionalDevelopment;
