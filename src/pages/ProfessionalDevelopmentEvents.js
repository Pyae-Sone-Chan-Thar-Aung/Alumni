import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../config/supabaseClient';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaMicrophone,
  FaCheckCircle,
  FaPlus,
  FaSearch,
  FaFilter,
  FaTimes,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaPaperPlane,
  FaCheck,
  FaTimes as FaTimesIcon,
  FaClock,
  FaRegClock,
  FaRegCalendar,
  FaEnvelope,
  FaBell
} from 'react-icons/fa';
import './ProfessionalDevelopmentEvents.css';

const ProfessionalDevelopmentEvents = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [mySpeakerRoles, setMySpeakerRoles] = useState([]);
  const [participants, setParticipants] = useState({});
  const [speakers, setSpeakers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const EVENTS_PER_PAGE = 6;

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please login to view professional development events');
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
      fetchMyData();
    }
  }, [isAuthenticated, user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professional_development_events')
        .select('*')
        .in('status', ['published', 'ongoing', 'completed'])
        .order('start_date', { ascending: true });

      if (error) throw error;

      setEvents(data || []);

      // Fetch participants and speakers for each event
      if (data && data.length > 0) {
        const eventIds = data.map(e => e.id);
        await Promise.all([
          fetchParticipants(eventIds),
          fetchSpeakers(eventIds)
        ]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventIds) => {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .in('event_id', eventIds);

      if (error) throw error;

      const participantsMap = {};
      (data || []).forEach(p => {
        if (!participantsMap[p.event_id]) {
          participantsMap[p.event_id] = [];
        }
        participantsMap[p.event_id].push(p);
      });
      setParticipants(participantsMap);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchSpeakers = async (eventIds) => {
    try {
      const { data, error } = await supabase
        .from('event_speakers')
        .select('*')
        .in('event_id', eventIds);

      if (error) throw error;

      const speakersMap = {};
      (data || []).forEach(s => {
        if (!speakersMap[s.event_id]) {
          speakersMap[s.event_id] = [];
        }
        speakersMap[s.event_id].push(s);
      });
      setSpeakers(speakersMap);
    } catch (error) {
      console.error('Error fetching speakers:', error);
    }
  };

  const fetchMyData = async () => {
    if (!user?.id) return;

    try {
      // Fetch my registrations
      const { data: registrations } = await supabase
        .from('event_participants')
        .select('event_id, status')
        .eq('user_id', user.id);

      setMyRegistrations(registrations || []);

      // Fetch my speaker applications
      const { data: applications } = await supabase
        .from('speaker_applications')
        .select('*')
        .eq('user_id', user.id);

      setMyApplications(applications || []);

      // Fetch my speaker roles
      const { data: speakerRoles } = await supabase
        .from('event_speakers')
        .select('event_id, role, invitation_status')
        .eq('user_id', user.id);

      setMySpeakerRoles(speakerRoles || []);
    } catch (error) {
      console.error('Error fetching my data:', error);
    }
  };

  const handleJoinEvent = async (eventId) => {
    if (!user?.id) {
      toast.error('Please login to join events');
      return;
    }

    try {
      // Check if already registered
      const existing = myRegistrations.find(r => r.event_id === eventId);
      if (existing) {
        toast.info('You are already registered for this event');
        return;
      }

      const { data, error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'registered',
          invitation_type: 'self'
        })
        .select()
        .single();

      if (error) throw error;

      // Notify all admins about the registration
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .in('role', ['admin', 'super_admin'])
        .eq('approval_status', 'approved');

      if (admins && admins.length > 0) {
        const event = events.find(e => e.id === eventId);
        const notifications = admins.map(admin => ({
          event_id: eventId,
          user_id: admin.id,
          notification_type: 'registration_confirmed',
          title: 'New Event Registration',
          message: `${user.first_name} ${user.last_name} registered for "${event?.title || 'an event'}"`
        }));

        await supabase.from('event_notifications').insert(notifications);
      }

      toast.success('Successfully registered for the event!');
      fetchMyData();
      fetchEvents();
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error(error.message || 'Failed to register for event');
    }
  };

  const handleApplyForSpeaker = async (eventId, role) => {
    setSelectedEvent(events.find(e => e.id === eventId));
    setShowApplicationModal(true);
    // The application will be submitted through the modal form
  };

  const handleInviteAlumni = async (eventId, userId) => {
    try {
      // Check if already registered
      const { data: existing } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        toast.info('Alumni is already registered for this event');
        return;
      }

      const { data, error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
          status: 'registered',
          invitation_type: 'admin_invite',
          invited_by: user.id,
          invited_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification
      await supabase
        .from('event_notifications')
        .insert({
          event_id: eventId,
          user_id: userId,
          notification_type: 'invitation_sent',
          title: 'Event Invitation',
          message: `You have been invited to join "${selectedEvent?.title || 'an event'}"`
        });

      toast.success('Alumni invited successfully!');
      fetchEvents();
      setShowInviteModal(false);
    } catch (error) {
      console.error('Error inviting alumni:', error);
      toast.error(error.message || 'Failed to invite alumni');
    }
  };

  const handleInviteSpeaker = async (eventId, userId, role) => {
    try {
      const { data, error } = await supabase
        .from('event_speakers')
        .insert({
          event_id: eventId,
          user_id: userId,
          role: role,
          invited_by: user.id,
          invited_at: new Date().toISOString(),
          invitation_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification
      await supabase
        .from('event_notifications')
        .insert({
          event_id: eventId,
          user_id: userId,
          notification_type: 'speaker_invitation',
          title: 'Speaker Invitation',
          message: `You have been invited to be a ${role === 'keynote_speaker' ? 'keynote speaker' : 'speaker'} for "${selectedEvent?.title || 'an event'}"`
        });

      toast.success('Speaker invitation sent successfully!');
      fetchEvents();
      setShowSpeakerModal(false);
    } catch (error) {
      console.error('Error inviting speaker:', error);
      toast.error(error.message || 'Failed to invite speaker');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'upcoming' && new Date(event.start_date) > new Date()) ||
      (filterStatus === 'ongoing' && event.status === 'ongoing') ||
      (filterStatus === 'past' && new Date(event.end_date) < new Date());

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const isRegistered = (eventId) => {
    return myRegistrations.some(r => r.event_id === eventId);
  };

  const hasApplied = (eventId, role) => {
    return myApplications.some(a => a.event_id === eventId && a.desired_role === role);
  };

  const isInvitedAsSpeaker = (eventId) => {
    return mySpeakerRoles.some(s => s.event_id === eventId && s.invitation_status === 'pending');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (loading) {
    return (
      <div className="events-page">
        <div className="container">
          <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="container">
        {/* Header */}
        <div className="events-header">
          <div>
            <h1>Professional Development Events</h1>
            <p>Join alumni events, apply as speakers, and grow professionally together</p>
          </div>
          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus /> Create Event
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="events-controls">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <FaFilter className="filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past Events</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="events-grid">
          {filteredEvents.length === 0 ? (
            <div className="no-events">
              <FaCalendarAlt size={64} />
              <h3>No events found</h3>
              <p>Check back later for upcoming professional development events</p>
            </div>
          ) : (
            paginatedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                isRegistered={isRegistered(event.id)}
                hasApplied={hasApplied}
                isInvitedAsSpeaker={isInvitedAsSpeaker(event.id)}
                isAdmin={isAdmin}
                participants={participants[event.id] || []}
                speakers={speakers[event.id] || []}
                onJoin={() => handleJoinEvent(event.id)}
                onApplySpeaker={(role) => handleApplyForSpeaker(event.id, role)}
                onInviteAlumni={() => {
                  setSelectedEvent(event);
                  setShowInviteModal(true);
                }}
                onInviteSpeaker={() => {
                  setSelectedEvent(event);
                  setShowSpeakerModal(true);
                }}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEvents();
          }}
        />
      )}

      {/* Invite Alumni Modal */}
      {showInviteModal && selectedEvent && (
        <InviteAlumniModal
          event={selectedEvent}
          onClose={() => {
            setShowInviteModal(false);
            setSelectedEvent(null);
          }}
          onInvite={handleInviteAlumni}
        />
      )}

      {/* Invite Speaker Modal */}
      {showSpeakerModal && selectedEvent && (
        <InviteSpeakerModal
          event={selectedEvent}
          onClose={() => {
            setShowSpeakerModal(false);
            setSelectedEvent(null);
          }}
          onInvite={handleInviteSpeaker}
        />
      )}

      {/* Speaker Application Modal */}
      {showApplicationModal && selectedEvent && (
        <SpeakerApplicationModal
          event={selectedEvent}
          existingApplication={myApplications.find(a => a.event_id === selectedEvent.id)}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            setShowApplicationModal(false);
            setSelectedEvent(null);
            fetchMyData();
            fetchEvents();
          }}
        />
      )}
    </div>
  );
};

// Event Card Component
const EventCard = ({
  event,
  isRegistered,
  hasApplied,
  isInvitedAsSpeaker,
  isAdmin,
  participants,
  speakers,
  onJoin,
  onApplySpeaker,
  onInviteAlumni,
  onInviteSpeaker
}) => {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  const isUpcoming = startDate > new Date();
  const isPast = endDate < new Date();

  return (
    <div className={`event-card ${isPast ? 'past' : ''}`}>
      {event.cover_image_url && (
        <div className="event-image">
          <img src={event.cover_image_url} alt={event.title} />
        </div>
      )}
      <div className="event-content">
        <div className="event-header">
          <h3>{event.title}</h3>
          {event.is_featured && <span className="featured-badge">Featured</span>}
        </div>

        <p className="event-description">{event.description}</p>

        <div className="event-details">
          <div className="event-detail-item">
            <FaRegCalendar />
            <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="event-detail-item">
            <FaClock />
            <span>{startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
          </div>
          {event.location && (
            <div className="event-detail-item">
              <FaMapMarkerAlt />
              <span>{event.location}</span>
            </div>
          )}
          {event.venue && (
            <div className="event-detail-item">
              <FaMapMarkerAlt />
              <span>{event.venue}</span>
            </div>
          )}
          <div className="event-detail-item">
            <FaUsers />
            <span>{participants.length} {participants.length === 1 ? 'participant' : 'participants'}</span>
          </div>
          {speakers.length > 0 && (
            <div className="event-detail-item">
              <FaMicrophone />
              <span>{speakers.length} {speakers.length === 1 ? 'speaker' : 'speakers'}</span>
            </div>
          )}
        </div>

        <div className="event-actions">
          {isAdmin ? (
            <>
              <button className="btn btn-secondary" onClick={onInviteAlumni}>
                <FaUserPlus /> Invite Alumni
              </button>
              <button className="btn btn-secondary" onClick={onInviteSpeaker}>
                <FaMicrophone /> Invite Speaker
              </button>
            </>
          ) : (
            <>
              {isRegistered ? (
                <div className="registered-badge">
                  <FaCheckCircle /> Registered
                </div>
              ) : isUpcoming ? (
                <button className="btn btn-primary" onClick={onJoin}>
                  Join Event
                </button>
              ) : null}
              {isUpcoming && !hasApplied(event.id, 'speaker') && !hasApplied(event.id, 'keynote_speaker') && (
                <button
                  className="btn btn-outline"
                  onClick={() => onApplySpeaker('speaker')}
                >
                  <FaPaperPlane /> Apply as Speaker
                </button>
              )}
              {isUpcoming && !hasApplied(event.id, 'keynote_speaker') && (
                <button
                  className="btn btn-outline"
                  onClick={() => onApplySpeaker('keynote_speaker')}
                >
                  <FaPaperPlane /> Apply as Keynote
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Event Modal Component
const CreateEventModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'professional_development',
    venue: '',
    location: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_participants: '',
    requires_registration: true,
    is_free: true,
    registration_fee: 0,
    status: 'draft'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('professional_development_events')
        .insert({
          ...formData,
          created_by: user.id,
          updated_by: user.id,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
          registration_fee: formData.is_free ? 0 : parseFloat(formData.registration_fee) || 0
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Event created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Event</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Venue</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Max Participants</label>
            <input
              type="number"
              value={formData.max_participants}
              onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.requires_registration}
                  onChange={(e) => setFormData({ ...formData, requires_registration: e.target.checked })}
                />
                Requires Registration
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                />
                Free Event
              </label>
            </div>
          </div>
          {!formData.is_free && (
            <div className="form-group">
              <label>Registration Fee</label>
              <input
                type="number"
                step="0.01"
                value={formData.registration_fee}
                onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
              />
            </div>
          )}
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Invite Alumni Modal Component
const InviteAlumniModal = ({ event, onClose, onInvite }) => {
  const [alumni, setAlumni] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('role', 'alumni')
        .eq('approval_status', 'approved');

      if (error) throw error;
      setAlumni(data || []);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      toast.error('Failed to load alumni');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlumni = alumni.filter(a =>
    `${a.first_name} ${a.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite Alumni to "{event.title}"</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search alumni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="loading">Loading alumni...</div>
          ) : (
            <div className="alumni-list">
              {filteredAlumni.map(alumnus => (
                <div key={alumnus.id} className="alumnus-item">
                  <div>
                    <strong>{alumnus.first_name} {alumnus.last_name}</strong>
                    <span className="email">{alumnus.email}</span>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onInvite(event.id, alumnus.id)}
                  >
                    <FaUserPlus /> Invite
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Invite Speaker Modal Component
const InviteSpeakerModal = ({ event, onClose, onInvite }) => {
  const [alumni, setAlumni] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('speaker');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('role', 'alumni')
        .eq('approval_status', 'approved');

      if (error) throw error;
      setAlumni(data || []);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      toast.error('Failed to load alumni');
    } finally {
      setLoading(false);
    }
  };

  const filteredAlumni = alumni.filter(a =>
    `${a.first_name} ${a.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite Speaker for "{event.title}"</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Speaker Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="speaker">Speaker</option>
              <option value="keynote_speaker">Keynote Speaker</option>
              <option value="panelist">Panelist</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search alumni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="loading">Loading alumni...</div>
          ) : (
            <div className="alumni-list">
              {filteredAlumni.map(alumnus => (
                <div key={alumnus.id} className="alumnus-item">
                  <div>
                    <strong>{alumnus.first_name} {alumnus.last_name}</strong>
                    <span className="email">{alumnus.email}</span>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onInvite(event.id, alumnus.id, selectedRole)}
                  >
                    <FaMicrophone /> Invite as {selectedRole.replace('_', ' ')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Speaker Application Modal Component
const SpeakerApplicationModal = ({ event, existingApplication, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    desired_role: existingApplication?.desired_role || 'speaker',
    proposed_topic: existingApplication?.proposed_topic || '',
    proposed_title: existingApplication?.proposed_title || '',
    proposed_description: existingApplication?.proposed_description || '',
    speaking_experience: existingApplication?.speaking_experience || '',
    relevant_qualifications: existingApplication?.relevant_qualifications || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (existingApplication) {
        // Update existing application
        const { error } = await supabase
          .from('speaker_applications')
          .update(formData)
          .eq('id', existingApplication.id);

        if (error) throw error;
        toast.success('Application updated successfully!');
      } else {
        // Create new application
        const { error } = await supabase
          .from('speaker_applications')
          .insert({
            ...formData,
            event_id: event.id,
            user_id: user.id,
            status: 'pending'
          });

        if (error) throw error;

        // Notify all admins about the speaker application
        const { data: admins } = await supabase
          .from('users')
          .select('id')
          .in('role', ['admin', 'super_admin'])
          .eq('approval_status', 'approved');

        if (admins && admins.length > 0) {
          const notifications = admins.map(admin => ({
            event_id: event.id,
            user_id: admin.id,
            notification_type: 'speaker_application_reviewed',
            title: 'New Speaker Application',
            message: `${user.first_name} ${user.last_name} applied as ${formData.desired_role.replace('_', ' ')} for "${event.title}"`
          }));

          await supabase.from('event_notifications').insert(notifications);
        }

        toast.success('Application submitted successfully!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Apply as Speaker - {event.title}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Desired Role *</label>
            <select
              required
              value={formData.desired_role}
              onChange={(e) => setFormData({ ...formData, desired_role: e.target.value })}
            >
              <option value="speaker">Speaker</option>
              <option value="keynote_speaker">Keynote Speaker</option>
              <option value="panelist">Panelist</option>
            </select>
          </div>
          <div className="form-group">
            <label>Proposed Topic *</label>
            <input
              type="text"
              required
              value={formData.proposed_topic}
              onChange={(e) => setFormData({ ...formData, proposed_topic: e.target.value })}
              placeholder="What topic would you like to speak about?"
            />
          </div>
          <div className="form-group">
            <label>Proposed Title</label>
            <input
              type="text"
              value={formData.proposed_title}
              onChange={(e) => setFormData({ ...formData, proposed_title: e.target.value })}
              placeholder="Session title"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.proposed_description}
              onChange={(e) => setFormData({ ...formData, proposed_description: e.target.value })}
              rows="4"
              placeholder="Describe your session..."
            />
          </div>
          <div className="form-group">
            <label>Speaking Experience</label>
            <textarea
              value={formData.speaking_experience}
              onChange={(e) => setFormData({ ...formData, speaking_experience: e.target.value })}
              rows="3"
              placeholder="List your previous speaking engagements, conferences, workshops, etc."
            />
          </div>
          <div className="form-group">
            <label>Relevant Qualifications</label>
            <textarea
              value={formData.relevant_qualifications}
              onChange={(e) => setFormData({ ...formData, relevant_qualifications: e.target.value })}
              rows="3"
              placeholder="Your qualifications, certifications, achievements relevant to this topic"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {existingApplication ? 'Update Application' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalDevelopmentEvents;

