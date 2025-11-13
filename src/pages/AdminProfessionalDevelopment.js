import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { 
  FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, 
  FaMapMarkerAlt, FaUsers, FaMicrophone, FaCheckCircle, FaTimes, 
  FaClock, FaEyeSlash, FaImage
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
    event_type: 'workshop',
    max_participants: '',
    speaker_name: '',
    speaker_bio: '',
    registration_deadline: '',
    status: 'draft'
  });
  
  // Tab management
  const [activeTab, setActiveTab] = useState('events'); // events, participants, applications
  
  // Participants state
  const [participants, setParticipants] = useState([]);
  const [participantsPage, setParticipantsPage] = useState(1);
  const [participantsSearch, setParticipantsSearch] = useState('');
  const PARTICIPANTS_PER_PAGE = 10;
  
  // Speaker applications state
  const [applications, setApplications] = useState([]);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [applicationsSearch, setApplicationsSearch] = useState('');
  const APPLICATIONS_PER_PAGE = 10;
  
  // Invite modals
  const [showInviteAlumniModal, setShowInviteAlumniModal] = useState(false);
  const [showInviteSpeakerModal, setShowInviteSpeakerModal] = useState(false);
  const [selectedEventForInvite, setSelectedEventForInvite] = useState(null);
  const [alumni, setAlumni] = useState([]);
  const [alumniSearch, setAlumniSearch] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchParticipants();
    fetchApplications();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus]);

  // Refresh data when switching tabs
  useEffect(() => {
    if (activeTab === 'participants') {
      fetchParticipants();
    } else if (activeTab === 'applications') {
      fetchApplications();
    }
  }, [activeTab]);

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

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*, professional_development_events(id, title, start_date), users(id, first_name, last_name, email)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Participants query error:', error);
        throw error;
      }
      console.log('Participants data:', data);
      console.log('Total participants found:', data?.length || 0);
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Error loading participants: ' + error.message);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('speaker_applications')
        .select('*, professional_development_events(id, title, start_date), users(id, first_name, last_name, email)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Applications query error:', error);
        throw error;
      }
      console.log('Applications data:', data);
      console.log('Total applications found:', data?.length || 0);
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error loading applications: ' + error.message);
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
          title: formData.title,
          description: formData.description,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          location: formData.location,
          event_type: formData.event_type,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
          speaker_name: formData.speaker_name || null,
          speaker_bio: formData.speaker_bio || null,
          registration_deadline: formData.registration_deadline || null,
          status: formData.status,
          created_by: user.id
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
      event_type: 'workshop',
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
      event_type: event.event_type || 'workshop',
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

  // Handle speaker application approval/rejection
  const fetchAlumni = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('role', 'alumni')
        .eq('approval_status', 'approved');

      if (error) throw error;
      setAlumni(data || []);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    }
  };

  const handleInviteAlumni = async (eventId, userId) => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
          status: 'registered',
          invitation_type: 'admin_invite',
          invited_by: user.id,
          invited_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Alumni invited successfully!');
      fetchParticipants();
    } catch (error) {
      console.error('Error inviting alumni:', error);
      toast.error(error.message || 'Failed to invite alumni');
    }
  };

  const handleInviteSpeaker = async (eventId, userId, role) => {
    try {
      const { error } = await supabase
        .from('event_speakers')
        .insert({
          event_id: eventId,
          user_id: userId,
          role: role,
          invited_by: user.id,
          invited_at: new Date().toISOString(),
          invitation_status: 'pending'
        });

      if (error) throw error;
      toast.success('Speaker invitation sent successfully!');
    } catch (error) {
      console.error('Error inviting speaker:', error);
      toast.error(error.message || 'Failed to invite speaker');
    }
  };

  const handleApplicationAction = async (applicationId, action, reviewNotes = '') => {
    try {
      const { error } = await supabase
        .from('speaker_applications')
        .update({ 
          status: action,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', applicationId);

      if (error) throw error;
      toast.success(`Application ${action === 'approved' ? 'approved' : 'rejected'} successfully!`);
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
  };

  // Filter and paginate participants
  const filteredParticipants = participants.filter(p => 
    p.users?.first_name?.toLowerCase().includes(participantsSearch.toLowerCase()) ||
    p.users?.last_name?.toLowerCase().includes(participantsSearch.toLowerCase()) ||
    p.users?.email?.toLowerCase().includes(participantsSearch.toLowerCase()) ||
    p.professional_development_events?.title?.toLowerCase().includes(participantsSearch.toLowerCase())
  );
  const paginatedParticipants = filteredParticipants.slice(
    (participantsPage - 1) * PARTICIPANTS_PER_PAGE,
    participantsPage * PARTICIPANTS_PER_PAGE
  );
  const participantsTotalPages = Math.ceil(filteredParticipants.length / PARTICIPANTS_PER_PAGE);

  // Filter and paginate applications
  const filteredApplications = applications.filter(a => 
    a.users?.first_name?.toLowerCase().includes(applicationsSearch.toLowerCase()) ||
    a.users?.last_name?.toLowerCase().includes(applicationsSearch.toLowerCase()) ||
    a.users?.email?.toLowerCase().includes(applicationsSearch.toLowerCase()) ||
    a.professional_development_events?.title?.toLowerCase().includes(applicationsSearch.toLowerCase()) ||
    a.proposed_topic?.toLowerCase().includes(applicationsSearch.toLowerCase())
  );
  const paginatedApplications = filteredApplications.slice(
    (applicationsPage - 1) * APPLICATIONS_PER_PAGE,
    applicationsPage * APPLICATIONS_PER_PAGE
  );
  const applicationsTotalPages = Math.ceil(filteredApplications.length / APPLICATIONS_PER_PAGE);

  return (
    <div className="admin-professional-development">
      <div className="admin-header">
        <div>
          <h2>
            <FaCalendarAlt /> Professional Development Events
          </h2>
          <p>Manage workshops, seminars, and training programs</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => { fetchAlumni(); setShowInviteAlumniModal(true); }}>
            <FaUsers /> Invite Alumni
          </button>
          <button className="btn btn-outline" onClick={() => { fetchAlumni(); setShowInviteSpeakerModal(true); }}>
            <FaMicrophone /> Invite Speaker
          </button>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <FaPlus /> Create Event
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <FaCalendarAlt /> Events ({events.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          <FaUsers /> Participants ({participants?.length || 0})
        </button>
        <button 
          className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <FaMicrophone /> Speaker Applications ({applications?.length || 0})
        </button>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <>
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
        </>
      )}

      {/* Participants Tab */}
      {activeTab === 'participants' && (
        <div className="admin-section">
          <div className="admin-filters">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search participants..."
                value={participantsSearch}
                onChange={(e) => setParticipantsSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredParticipants.length === 0 ? (
            <div className="empty-state">
              <FaUsers />
              <h3>No participants yet</h3>
              <p>Participants will appear here when they register for events</p>
            </div>
          ) : (
            <>
              <div className="events-table">
                <table>
                  <thead>
                    <tr>
                      <th>Participant Name</th>
                      <th>Email</th>
                      <th>Event</th>
                      <th>Status</th>
                      <th>Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedParticipants.map(participant => (
                      <tr key={participant.id}>
                        <td>
                          <strong>{participant.users?.first_name} {participant.users?.last_name}</strong>
                        </td>
                        <td>{participant.users?.email}</td>
                        <td>{participant.professional_development_events?.title}</td>
                        <td>
                          <span className={`status-badge status-${participant.status}`}>
                            {participant.status}
                          </span>
                        </td>
                        <td>{participant.created_at && format(new Date(participant.created_at), 'MMM dd, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {participantsTotalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setParticipantsPage(p => Math.max(1, p - 1))}
                    disabled={participantsPage === 1}
                  >
                    Previous
                  </button>
                  <span>Page {participantsPage} of {participantsTotalPages}</span>
                  <button
                    onClick={() => setParticipantsPage(p => Math.min(participantsTotalPages, p + 1))}
                    disabled={participantsPage === participantsTotalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Speaker Applications Tab */}
      {activeTab === 'applications' && (
        <div className="admin-section">
          <div className="admin-filters">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search applications..."
                value={applicationsSearch}
                onChange={(e) => setApplicationsSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <FaMicrophone />
              <h3>No speaker applications yet</h3>
              <p>Applications will appear here when alumni apply to be speakers</p>
            </div>
          ) : (
            <>
              <div className="events-table">
                <table>
                  <thead>
                    <tr>
                      <th>Applicant Name</th>
                      <th>Email</th>
                      <th>Event</th>
                      <th>Role</th>
                      <th>Topic</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApplications.map(application => (
                      <tr key={application.id}>
                        <td>
                          <strong>{application.users?.first_name} {application.users?.last_name}</strong>
                        </td>
                        <td>{application.users?.email}</td>
                        <td>{application.professional_development_events?.title}</td>
                        <td>
                          <span className="event-type-badge">
                            {application.desired_role?.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{application.proposed_topic}</td>
                        <td>
                          <span className={`status-badge status-${application.status}`}>
                            {application.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {application.status === 'pending' && (
                              <>
                                <button
                                  className="btn-icon btn-success"
                                  onClick={() => handleApplicationAction(application.id, 'approved')}
                                  title="Approve"
                                >
                                  <FaCheckCircle />
                                </button>
                                <button
                                  className="btn-icon btn-danger"
                                  onClick={() => handleApplicationAction(application.id, 'rejected')}
                                  title="Reject"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {applicationsTotalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setApplicationsPage(p => Math.max(1, p - 1))}
                    disabled={applicationsPage === 1}
                  >
                    Previous
                  </button>
                  <span>Page {applicationsPage} of {applicationsTotalPages}</span>
                  <button
                    onClick={() => setApplicationsPage(p => Math.min(applicationsTotalPages, p + 1))}
                    disabled={applicationsPage === applicationsTotalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
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
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="training">Training</option>
                    <option value="webinar">Webinar</option>
                    <option value="conference">Conference</option>
                    <option value="networking">Networking</option>
                    <option value="professional_development">Professional Development</option>
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

      {/* Invite Alumni Modal */}
      {showInviteAlumniModal && (
        <div className="modal-overlay" onClick={() => setShowInviteAlumniModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite Alumni to Event</h3>
              <button className="close-btn" onClick={() => setShowInviteAlumniModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="form-group">
              <label>Select Event</label>
              <select 
                value={selectedEventForInvite?.id || ''}
                onChange={(e) => setSelectedEventForInvite(events.find(ev => ev.id === e.target.value))}
              >
                <option value="">Choose an event...</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>
            {selectedEventForInvite && (
              <>
                <div className="search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search alumni..."
                    value={alumniSearch}
                    onChange={(e) => setAlumniSearch(e.target.value)}
                  />
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '1rem' }}>
                  {alumni.filter(a => 
                    `${a.first_name} ${a.last_name}`.toLowerCase().includes(alumniSearch.toLowerCase()) ||
                    a.email?.toLowerCase().includes(alumniSearch.toLowerCase())
                  ).map(alumnus => (
                    <div key={alumnus.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <strong>{alumnus.first_name} {alumnus.last_name}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{alumnus.email}</div>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          handleInviteAlumni(selectedEventForInvite.id, alumnus.id);
                          setShowInviteAlumniModal(false);
                        }}
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Invite Speaker Modal */}
      {showInviteSpeakerModal && (
        <div className="modal-overlay" onClick={() => setShowInviteSpeakerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite Speaker</h3>
              <button className="close-btn" onClick={() => setShowInviteSpeakerModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="form-group">
              <label>Select Event</label>
              <select 
                value={selectedEventForInvite?.id || ''}
                onChange={(e) => setSelectedEventForInvite(events.find(ev => ev.id === e.target.value))}
              >
                <option value="">Choose an event...</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>
            {selectedEventForInvite && (
              <>
                <div className="form-group">
                  <label>Speaker Role</label>
                  <select id="speaker-role">
                    <option value="speaker">Speaker</option>
                    <option value="keynote_speaker">Keynote Speaker</option>
                    <option value="panelist">Panelist</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
                <div className="search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search alumni..."
                    value={alumniSearch}
                    onChange={(e) => setAlumniSearch(e.target.value)}
                  />
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '1rem' }}>
                  {alumni.filter(a => 
                    `${a.first_name} ${a.last_name}`.toLowerCase().includes(alumniSearch.toLowerCase()) ||
                    a.email?.toLowerCase().includes(alumniSearch.toLowerCase())
                  ).map(alumnus => (
                    <div key={alumnus.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <strong>{alumnus.first_name} {alumnus.last_name}</strong>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{alumnus.email}</div>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          const role = document.getElementById('speaker-role').value;
                          handleInviteSpeaker(selectedEventForInvite.id, alumnus.id, role);
                          setShowInviteSpeakerModal(false);
                        }}
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfessionalDevelopment;
