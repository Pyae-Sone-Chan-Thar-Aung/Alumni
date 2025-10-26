import React, { useEffect, useState } from 'react';
import supabase from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaComments, FaSearch, FaPlus, FaUser, FaClock, FaMapMarkerAlt, FaTimes, FaPaperPlane, FaUserCheck, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Batchmates.css';

const Batchmates = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [showBatchmatesOnly, setShowBatchmatesOnly] = useState(false);
  const [batchmates, setBatchmates] = useState([]);
  const [currentUserBatchYear, setCurrentUserBatchYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedBatchmate, setSelectedBatchmate] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Load all alumni and current user info
  useEffect(() => {
    const loadBatchmates = async () => {
      try {
        setLoading(true);
        if (!user?.id) return;
        
        // Load current user's batch year
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('batch_year')
          .eq('id', user.id)
          .single();
          
        if (userError) console.error('Error loading user batch year:', userError);
        setCurrentUserBatchYear(userData?.batch_year);
        
        console.log('🔍 Loading alumni data...');
        
        // Load ALL alumni from users table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('is_verified', true)
          .neq('id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('❌ Error loading alumni:', error);
          throw error;
        }
        
        console.log('📊 Raw alumni data from database:', data);
        
        setBatchmates((data || []).map(u => {
          console.log('Processing user:', {
            name: `${u.first_name} ${u.last_name}`,
            course: u.course,
            batch_year: u.batch_year,
            current_job: u.current_job,
            company: u.company,
            location: u.location
          });
          
          return {
            id: u.id,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'No name',
            course: u.course || 'Course not specified',
            location: u.location || 'Location not specified',
            currentJob: u.current_job || 'Job not specified',
            company: u.company || '',
            lastActive: u.last_login_at ? formatLastActive(u.last_login_at) : 'Never logged in',
            avatar: u.profile_picture || '/default-avatar.png',
            email: u.email,
            batchYear: u.batch_year || 'Not specified'
          };
        }));
      } catch (error) {
        console.error('Error loading batchmates:', error);
        toast.error('Failed to load batchmates');
      } finally {
        setLoading(false);
      }
    };
    
    loadBatchmates();
  }, [user?.id]);
  
  // Load user connections
  useEffect(() => {
    const loadConnections = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_connections')
          .select('*')
          .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);
          
        if (error) throw error;
        setConnections(data || []);
      } catch (error) {
        console.error('Error loading connections:', error);
      }
    };
    
    loadConnections();
  }, [user?.id]);

  // Helper function to format last active time
  const formatLastActive = (timestamp) => {
    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffInMinutes = Math.floor((now - lastActive) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return diffInMinutes < 5 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };
  
  // Get connection status with a batchmate
  const getConnectionStatus = (batchmateId) => {
    const connection = connections.find(conn => 
      (conn.requester_id === user.id && conn.recipient_id === batchmateId) ||
      (conn.recipient_id === user.id && conn.requester_id === batchmateId)
    );
    return connection?.status || 'none';
  };
  
  // Send connection request
  const sendConnectionRequest = async (batchmateId) => {
    try {
      const { error } = await supabase
        .from('user_connections')
        .insert({
          requester_id: user.id,
          recipient_id: batchmateId,
          status: 'pending',
          message: 'Hello! I would like to connect with you.'
        });
        
      if (error) throw error;
      
      // Refresh connections
      const { data } = await supabase
        .from('user_connections')
        .select('*')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);
      setConnections(data || []);
      
      toast.success('Connection request sent! The recipient will be notified.');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  };
  
  // Open message modal
  const openMessageModal = (batchmate) => {
    setSelectedBatchmate(batchmate);
    setShowMessageModal(true);
    setMessageContent('');
  };
  
  // Send message
  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedBatchmate) return;
    
    try {
      setSendingMessage(true);
      
      console.log('Sending message from batchmates:', {
        sender_id: user.id,
        recipient_id: selectedBatchmate.id,
        subject: 'Message from Alumni Directory',
        content: messageContent.trim()
      });
      
      // Send message using the new messages table
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedBatchmate.id,
          subject: 'Message from Alumni Directory',
          content: messageContent.trim()
        })
        .select();
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Message sent successfully:', data);
      toast.success(`Message sent to ${selectedBatchmate.name}! The recipient will be notified.`);
      setShowMessageModal(false);
      setMessageContent('');
      setSelectedBatchmate(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message}`);
    } finally {
      setSendingMessage(false);
    }
  };

  // Removed batches variable since we're showing all alumni

  const groupSessions = [
    {
      id: 1,
      title: 'Career Development Workshop',
      date: '2024-01-15',
      time: '2:00 PM',
      location: 'Online (Zoom)',
      attendees: 15,
      maxAttendees: 30,
      description: 'Join us for a workshop on career development and professional growth.'
    },
    {
      id: 2,
      title: 'Alumni Networking Event',
      date: '2024-01-20',
      time: '6:00 PM',
      location: 'UIC Campus, Davao City',
      attendees: 25,
      maxAttendees: 50,
      description: 'Annual networking event for alumni to connect and share experiences.'
    },
    {
      id: 3,
      title: 'Tech Talk: AI in 2024',
      date: '2024-01-25',
      time: '3:00 PM',
      location: 'Online (Google Meet)',
      attendees: 8,
      maxAttendees: 20,
      description: 'Discussion about the latest trends in artificial intelligence and machine learning.'
    }
  ];

  const filteredBatchmates = batchmates.filter(batchmate => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
      batchmate.name.toLowerCase().includes(term) || 
      batchmate.course.toLowerCase().includes(term) || 
      (batchmate.currentJob || '').toLowerCase().includes(term) ||
      (batchmate.company || '').toLowerCase().includes(term) ||
      (batchmate.batchYear || '').toString().includes(term);
    const matchesCourse = selectedCourse === 'All' || batchmate.course === selectedCourse;
    const matchesBatchYear = !showBatchmatesOnly || batchmate.batchYear === currentUserBatchYear;
    return matchesSearch && matchesCourse && matchesBatchYear;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="batchmates-page">
        <div className="container">
          <div className="page-header">
            <h1>Alumni Directory</h1>
            <p>Connect with all alumni from the College of Computer Studies</p>
          </div>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading alumni directory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="batchmates-page">
      <div className="container">
        <div className="page-header">
          <h1>Alumni Directory</h1>
          <p>Connect with all alumni from the College of Computer Studies</p>
        </div>

        <div className="batchmates-content">
          <div className="sidebar">
            <div className="alumni-stats">
              <h3>Alumni Statistics</h3>
              <div className="stats-card">
                <div className="stat-item">
                  <span className="stat-number">{batchmates.length}</span>
                  <span className="stat-label">Total Alumni</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{new Set(batchmates.map(b => b.batchYear)).size}</span>
                  <span className="stat-label">Batch Years</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{new Set(batchmates.map(b => b.course)).size}</span>
                  <span className="stat-label">Programs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="main-content">
            <div className="content-header">
              <div className="search-section">
                <div className="search-box">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search alumni by name, course, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="controls-section">
                <div className="view-toggle">
                  <button className="toggle-btn" onClick={() => setViewMode('grid')} aria-pressed={viewMode==='grid'}>Grid</button>
                  <button className="toggle-btn" onClick={() => setViewMode('list')} aria-pressed={viewMode==='list'}>List</button>
                </div>
                <div className="course-chips">
                  <button 
                    className={`chip ${showBatchmatesOnly?'active':''}`} 
                    onClick={()=>setShowBatchmatesOnly(!showBatchmatesOnly)}
                  >
                    Batchmates
                  </button>
                  {['All', 'BS Computer Science', 'BS Information Technology', 'BS Information Systems'].map(c => (
                    <button key={c} className={`chip ${selectedCourse===c?'active':''}`} onClick={()=>setSelectedCourse(c)}>{c}</button>
                  ))}
                </div>
              </div>
              {/* Remove create group session */}
            </div>

            <div className="batchmates-grid">
              <h2>All Alumni ({filteredBatchmates.length})</h2>
              {viewMode === 'grid' ? (
                <div className="members-grid">
                  {filteredBatchmates.map(batchmate => (
                    <div key={batchmate.id} className="member-card">
                      <div className="member-avatar">
                        <img src={batchmate.avatar} alt={batchmate.name} />
                        <div className="online-status"></div>
                      </div>
                      <div className="member-info">
                        <h3>{batchmate.name}</h3>
                        <p className="member-course">{batchmate.course}</p>
                        <p className="member-batch">Batch {batchmate.batchYear}</p>
                        <p className="member-job">{batchmate.currentJob} {batchmate.company && `at ${batchmate.company}`}</p>
                        <p className="member-location">
                          <FaMapMarkerAlt />
                          {batchmate.location}
                        </p>
                        <p className="member-active">Last active: {batchmate.lastActive}</p>
                      </div>
                      <div className="member-actions">
                        <button 
                          className="btn btn-outline" 
                          onClick={() => openMessageModal(batchmate)}
                          disabled={getConnectionStatus(batchmate.id) === 'blocked'}
                        >
                          <FaComments /> Message
                        </button>
                        {getConnectionStatus(batchmate.id) === 'none' && (
                          <button 
                            className="btn btn-primary" 
                            onClick={() => sendConnectionRequest(batchmate.id)}
                          >
                            <FaUserPlus /> Connect
                          </button>
                        )}
                        {getConnectionStatus(batchmate.id) === 'pending' && (
                          <button className="btn btn-secondary" disabled>
                            <FaClock /> Pending
                          </button>
                        )}
                        {getConnectionStatus(batchmate.id) === 'accepted' && (
                          <button className="btn btn-success" disabled>
                            <FaUserCheck /> Connected
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="members-list">
                  <div className="list-header">
                    <span>Name</span>
                    <span>Course</span>
                    <span>Batch</span>
                    <span>Job</span>
                    <span>Location</span>
                    <span>Active</span>
                  </div>
                  {filteredBatchmates.map(batchmate => (
                    <div key={batchmate.id} className="list-row">
                      <span>{batchmate.name}</span>
                      <span>{batchmate.course}</span>
                      <span>{batchmate.batchYear}</span>
                      <span>{batchmate.currentJob} {batchmate.company ? `at ${batchmate.company}` : ''}</span>
                      <span>{batchmate.location}</span>
                      <span>{batchmate.lastActive}</span>
                    </div>
                  ))}
                </div>
              )}

              {filteredBatchmates.length === 0 && (
                <div className="no-results">
                  <h3>No alumni found</h3>
                  <p>Try adjusting your search terms or filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Message Modal */}
      {showMessageModal && selectedBatchmate && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Send Message to {selectedBatchmate.name}</h3>
              <button 
                className="close-button"
                onClick={() => setShowMessageModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="recipient-info">
                <img 
                  src={selectedBatchmate.avatar} 
                  alt={selectedBatchmate.name}
                  className="recipient-avatar"
                />
                <div className="recipient-details">
                  <h4>{selectedBatchmate.name}</h4>
                  <p>{selectedBatchmate.course}</p>
                  {selectedBatchmate.currentJob !== 'Job not specified' && (
                    <p className="job-info">{selectedBatchmate.currentJob} {selectedBatchmate.company && `at ${selectedBatchmate.company}`}</p>
                  )}
                </div>
              </div>
              
              <div className="message-input-container">
                <label htmlFor="messageContent">Your Message:</label>
                <textarea
                  id="messageContent"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  maxLength={1000}
                  disabled={sendingMessage}
                />
                <div className="character-count">
                  {messageContent.length}/1000
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-outline"
                onClick={() => setShowMessageModal(false)}
                disabled={sendingMessage}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={!messageContent.trim() || sendingMessage}
              >
                {sendingMessage ? (
                  <>Sending...</>
                ) : (
                  <><FaPaperPlane /> Send Message</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batchmates;
