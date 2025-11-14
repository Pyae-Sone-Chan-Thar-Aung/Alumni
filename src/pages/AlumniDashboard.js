import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabaseClient';
import { FaUser, FaBriefcase, FaNewspaper, FaUsers, FaCalendarAlt, FaBell, FaEdit, FaHeart } from 'react-icons/fa';
import './AlumniDashboard.css';

const AlumniDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentNews, setRecentNews] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAlumni: 0,
    batchmates: 0,
    jobOpportunities: 0,
    eventsThisMonth: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user profile data
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      setUserProfile(profileData);

      // Fetch total alumni count (approved users)
      const { count: totalAlumni } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'approved');

      // Fetch batchmates (users with same graduation year/batch)
      let batchmates = 0;
      const batchYear = profileData?.batch_year || profileData?.graduation_year || user?.batch || user?.batch_year || user?.graduation_year;
      if (batchYear) {
        const { count: batchCount } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .or(`batch_year.eq.${batchYear},graduation_year.eq.${batchYear}`);
        batchmates = batchCount || 0;
      }

      // Fetch active job opportunities count
      const { count: jobCount } = await supabase
        .from('job_opportunities')
        .select('*', { count: 'exact', head: true });

      // Fetch recent news (last 3 published articles for alumni)
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('id, title, published_at, category')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (newsError) {
        console.error('Error fetching internal news:', newsError);
      }

      // Fetch recent job opportunities (last 3)
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_opportunities')
        .select('id, title, company, job_type, location')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
      }

      // Fetch saved jobs for the user
      const { data: savedJobsData, error: savedJobsError } = await supabase
        .from('saved_jobs')
        .select('job_id, job_opportunities(id, title, company, location, job_type)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (savedJobsError) {
        console.error('Error fetching saved jobs:', savedJobsError);
      }

      // Fetch events this month (if you have an events table)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      // For now, we'll use news with 'Event' category as events
      const { count: eventsCount } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'Event')
        .eq('is_published', true)
        .gte('published_at', startOfMonth)
        .lte('published_at', endOfMonth);

      // Update stats
      setStats({
        totalAlumni: totalAlumni || 0,
        batchmates: batchmates || 0,
        jobOpportunities: jobCount || 0,
        eventsThisMonth: eventsCount || 0
      });

      // Format and set news data
      if (newsData) {
        setRecentNews(newsData.map(news => ({
          id: news.id,
          title: news.title,
          date: news.published_at,
          category: news.category || 'General'
        })));
      }

      // Format and set jobs data
      console.log('📋 Jobs data fetched:', jobsData);
      if (jobsData && jobsData.length > 0) {
        setRecentJobs(jobsData.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          field: job.job_type || 'Full-time',
          location: job.location
        })));
      } else {
        setRecentJobs([]);
      }

      // Format and set saved jobs data
      console.log('💾 Saved jobs data fetched:', savedJobsData);
      if (savedJobsData && savedJobsData.length > 0) {
        setSavedJobs(savedJobsData
          .filter(item => item.job_opportunities)
          .map(item => ({
            id: item.job_opportunities.id,
            title: item.job_opportunities.title,
            company: item.job_opportunities.company,
            location: item.job_opportunities.location,
            type: item.job_opportunities.job_type
          }))
        );
      } else {
        setSavedJobs([]);
      }

      // Fetch upcoming events (news with 'Event' category)
      // Note: We fetch all published events and show the most recent ones
      const { data: eventsData, error: eventsError } = await supabase
        .from('news')
        .select('id, title, published_at, category, content')
        .eq('category', 'Event')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
      }

      // Format and set events data
      console.log('📅 Events data fetched:', eventsData);
      if (eventsData && eventsData.length > 0) {
        setUpcomingEvents(eventsData.map(event => ({
          id: event.id,
          title: event.title,
          date: event.published_at,
          description: event.content?.substring(0, 100) || 'Event details'
        })));
      } else {
        setUpcomingEvents([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.name || user?.email;

  if (loading) {
    return (
      <div className="alumni-dashboard">
        <div className="container">
          <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="alumni-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {displayName}!</h1>
            <p>Here's what's happening in your alumni community</p>
          </div>
          <div className="alumni-actions">
            <div className="alumni-actions-grid">
              <button className="alumni-action-card edit" type="button">
                <div className="alumni-action-icon edit"><FaEdit /></div>
                <div className="alumni-action-text">
                  <div className="alumni-action-title">Update Profile</div>
                  <div className="alumni-action-sub">Keep your info current</div>
                </div>
              </button>
              <button className="alumni-action-card notify" type="button">
                <div className="alumni-action-icon notify"><FaBell /></div>
                <div className="alumni-action-text">
                  <div className="alumni-action-title">Notifications</div>
                  <div className="alumni-action-sub">See updates & alerts</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card total">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.totalAlumni.toLocaleString()}+</h3>
              <p>Total Alumni</p>
            </div>
          </div>
          <div className="stat-card batch">
            <div className="stat-icon">
              <FaUser />
            </div>
            <div className="stat-content">
              <h3>{stats.batchmates}</h3>
              <p>Batchmates</p>
            </div>
          </div>
          <div className="stat-card jobs">
            <div className="stat-icon">
              <FaBriefcase />
            </div>
            <div className="stat-content">
              <h3>{stats.jobOpportunities}</h3>
              <p>Job Opportunities</p>
            </div>
          </div>
          <div className="stat-card events">
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
                    <a href={`/news/`} className="read-more">Read →</a>
                  </div>
                ))}
              </div>
            </div>

            <div className="content-section">
              <div className="section-header">
                <h2><FaHeart style={{ color: '#e74c3c', marginRight: '8px' }} />Saved Jobs</h2>
                <a href="/job-opportunities" className="view-all">View All</a>
              </div>
              <div className="jobs-list">
                {savedJobs.length > 0 ? (
                  savedJobs.map(job => (
                    <div key={job.id} className="job-item">
                      <div className="job-info">
                        <h4>{job.title}</h4>
                        <p className="job-company">{job.company}</p>
                        <p className="job-meta">
                          <span className="job-field">{job.type}</span>
                          <span className="job-location">{job.location}</span>
                        </p>
                      </div>
                      <a href="/job-opportunities" className="view-job" onClick={(e) => {
                        e.preventDefault();
                        navigate('/job-opportunities');
                      }}>View →</a>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>You haven't saved any jobs yet. Browse job opportunities and save the ones you're interested in!</p>
                )}
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
                <p><strong>Batch:</strong> {userProfile?.batch_year || userProfile?.graduation_year || user?.batch || user?.batch_year || 'N/A'}</p>
                <p><strong>Course:</strong> {userProfile?.course || user?.course || 'N/A'}</p>
                <p><strong>Status:</strong> <span className="status-approved">{user?.approval_status === 'approved' ? 'Approved' : user?.approval_status || 'Pending'}</span></p>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Upcoming Events</h3>
              <div className="events-list">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map(event => {
                    const eventDate = new Date(event.date);
                    const day = eventDate.getDate();
                    const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                    return (
                      <div key={event.id} className="event-item">
                        <div className="event-date">
                          <span className="day">{day}</span>
                          <span className="month">{month}</span>
                        </div>
                        <div className="event-info">
                          <h4>{event.title}</h4>
                          <p>{event.description}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '14px' }}>No upcoming events scheduled.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard; 