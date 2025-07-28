import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaBriefcase, FaNewspaper, FaUsers, FaCalendarAlt, FaBell, FaEdit } from 'react-icons/fa';
import './AlumniDashboard.css';

const AlumniDashboard = () => {
  const { user } = useAuth();
  const [recentNews, setRecentNews] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [stats, setStats] = useState({
    totalAlumni: 25000,
    batchmates: 150,
    jobOpportunities: 25,
    eventsThisMonth: 3
  });

  useEffect(() => {
    // Simulate fetching data
    setRecentNews([
      {
        id: 1,
        title: "Alumni Homecoming 2024 Registration",
        date: "2024-01-15",
        category: "Event"
      },
      {
        id: 2,
        title: "New Job Opportunities in Tech",
        date: "2024-01-14",
        category: "Career"
      },
      {
        id: 3,
        title: "Professional Development Workshop",
        date: "2024-01-13",
        category: "Professional Development"
      }
    ]);

    setRecentJobs([
      {
        id: 1,
        title: "Senior Software Engineer",
        company: "TechCorp Inc.",
        field: "Technology",
        location: "Davao City"
      },
      {
        id: 2,
        title: "Marketing Manager",
        company: "Global Solutions",
        field: "Business",
        location: "Manila"
      },
      {
        id: 3,
        title: "Nurse Practitioner",
        company: "City Hospital",
        field: "Medical",
        location: "Cebu City"
      }
    ]);
  }, []);

  return (
    <div className="alumni-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {user?.name}!</h1>
            <p>Here's what's happening in your alumni community</p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-primary">
              <FaEdit /> Update Profile
            </button>
            <button className="btn btn-outline">
              <FaBell /> View Notifications
            </button>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.totalAlumni.toLocaleString()}+</h3>
              <p>Total Alumni</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaUser />
            </div>
            <div className="stat-content">
              <h3>{stats.batchmates}</h3>
              <p>Batchmates</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaBriefcase />
            </div>
            <div className="stat-content">
              <h3>{stats.jobOpportunities}</h3>
              <p>Job Opportunities</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3>{stats.eventsThisMonth}</h3>
              <p>Events This Month</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="content-grid">
            <div className="content-section">
              <div className="section-header">
                <h2>Recent News & Announcements</h2>
                <a href="/news" className="view-all">View All</a>
              </div>
              <div className="news-list">
                {recentNews.map(news => (
                  <div key={news.id} className="news-item">
                    <div className="news-info">
                      <h4>{news.title}</h4>
                      <p className="news-meta">
                        <span className="news-category">{news.category}</span>
                        <span className="news-date">{new Date(news.date).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <a href={`/news/${news.id}`} className="read-more">Read →</a>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-section">
              <div className="section-header">
                <h2>Recent Job Opportunities</h2>
                <a href="/job-opportunities" className="view-all">View All</a>
              </div>
              <div className="jobs-list">
                {recentJobs.map(job => (
                  <div key={job.id} className="job-item">
                    <div className="job-info">
                      <h4>{job.title}</h4>
                      <p className="job-company">{job.company}</p>
                      <p className="job-meta">
                        <span className="job-field">{job.field}</span>
                        <span className="job-location">{job.location}</span>
                      </p>
                    </div>
                    <a href={`/job-opportunities/${job.id}`} className="view-job">View →</a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar">
            <div className="sidebar-section">
              <h3>Quick Links</h3>
              <div className="quick-links">
                <a href="/profile" className="quick-link">
                  <FaUser /> Update Profile
                </a>
                <a href="/job-opportunities" className="quick-link">
                  <FaBriefcase /> Browse Jobs
                </a>
                <a href="/batchmates" className="quick-link">
                  <FaUsers /> Connect with Batchmates
                </a>
                <a href="/news" className="quick-link">
                  <FaNewspaper /> Read News
                </a>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Your Information</h3>
              <div className="user-info">
                <p><strong>Batch:</strong> {user?.batch}</p>
                <p><strong>Course:</strong> {user?.course}</p>
                <p><strong>Status:</strong> <span className="status-approved">Approved</span></p>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Upcoming Events</h3>
              <div className="events-list">
                <div className="event-item">
                  <div className="event-date">
                    <span className="day">15</span>
                    <span className="month">MAR</span>
                  </div>
                  <div className="event-info">
                    <h4>Alumni Homecoming 2024</h4>
                    <p>Registration Deadline</p>
                  </div>
                </div>
                <div className="event-item">
                  <div className="event-date">
                    <span className="day">20</span>
                    <span className="month">APR</span>
                  </div>
                  <div className="event-info">
                    <h4>Career Fair 2024</h4>
                    <p>Professional Networking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard; 