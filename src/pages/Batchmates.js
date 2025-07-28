import React, { useState } from 'react';
import { FaUsers, FaComments, FaSearch, FaPlus, FaUser, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import './Batchmates.css';

const Batchmates = () => {
  const [selectedBatch, setSelectedBatch] = useState('2020');
  const [searchTerm, setSearchTerm] = useState('');

  const batches = [
    { year: '2020', count: 45, active: 32 },
    { year: '2019', count: 52, active: 28 },
    { year: '2018', count: 48, active: 35 },
    { year: '2017', count: 41, active: 22 },
    { year: '2016', count: 38, active: 18 }
  ];

  const batchmates = [
    {
      id: 1,
      name: 'Maria Santos',
      course: 'BS Computer Science',
      location: 'Davao City',
      currentJob: 'Software Engineer',
      company: 'TechCorp Inc.',
      lastActive: '2 hours ago',
      avatar: '/default-avatar.png'
    },
    {
      id: 2,
      name: 'John Dela Cruz',
      course: 'BS Information Technology',
      location: 'Manila',
      currentJob: 'Data Analyst',
      company: 'DataFlow Solutions',
      lastActive: '1 day ago',
      avatar: '/default-avatar.png'
    },
    {
      id: 3,
      name: 'Ana Rodriguez',
      course: 'BS Computer Science',
      location: 'Cebu City',
      currentJob: 'UI/UX Designer',
      company: 'Creative Studio',
      lastActive: '3 hours ago',
      avatar: '/default-avatar.png'
    },
    {
      id: 4,
      name: 'Carlos Martinez',
      course: 'BS Information Technology',
      location: 'Davao City',
      currentJob: 'Network Administrator',
      company: 'IT Solutions',
      lastActive: '5 hours ago',
      avatar: '/default-avatar.png'
    }
  ];

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

  const filteredBatchmates = batchmates.filter(batchmate =>
    batchmate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batchmate.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batchmate.currentJob.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="batchmates-page">
      <div className="container">
        <div className="page-header">
          <h1>Batchmates</h1>
          <p>Connect with your fellow alumni from the same batch</p>
        </div>

        <div className="batchmates-content">
          <div className="sidebar">
            <div className="batch-selector">
              <h3>Select Your Batch</h3>
              <div className="batch-list">
                {batches.map(batch => (
                  <div
                    key={batch.year}
                    className={`batch-item ${selectedBatch === batch.year ? 'active' : ''}`}
                    onClick={() => setSelectedBatch(batch.year)}
                  >
                    <div className="batch-info">
                      <h4>Batch {batch.year}</h4>
                      <p>{batch.count} total members</p>
                      <span className="active-count">{batch.active} active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="group-sessions">
              <h3>Group Sessions</h3>
              <div className="sessions-list">
                {groupSessions.map(session => (
                  <div key={session.id} className="session-card">
                    <div className="session-header">
                      <h4>{session.title}</h4>
                      <span className="session-date">{session.date}</span>
                    </div>
                    <div className="session-details">
                      <div className="detail-item">
                        <FaClock />
                        <span>{session.time}</span>
                      </div>
                      <div className="detail-item">
                        <FaMapMarkerAlt />
                        <span>{session.location}</span>
                      </div>
                      <div className="detail-item">
                        <FaUsers />
                        <span>{session.attendees}/{session.maxAttendees} attendees</span>
                      </div>
                    </div>
                    <p className="session-description">{session.description}</p>
                    <button className="btn btn-primary">Join Session</button>
                  </div>
                ))}
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
                    placeholder="Search batchmates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn btn-primary">
                <FaPlus /> Create Group Session
              </button>
            </div>

            <div className="batchmates-grid">
              <h2>Batch {selectedBatch} Members</h2>
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
                      <p className="member-job">{batchmate.currentJob} at {batchmate.company}</p>
                      <p className="member-location">
                        <FaMapMarkerAlt />
                        {batchmate.location}
                      </p>
                      <p className="member-active">Last active: {batchmate.lastActive}</p>
                    </div>
                    <div className="member-actions">
                      <button className="btn btn-outline">Message</button>
                      <button className="btn btn-primary">Connect</button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBatchmates.length === 0 && (
                <div className="no-results">
                  <h3>No batchmates found</h3>
                  <p>Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Batchmates; 