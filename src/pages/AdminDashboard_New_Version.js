import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../config/supabaseClient';
import { 
  FaUsers, FaUserCheck, FaNewspaper, FaBriefcase, FaChartBar, 
  FaClipboardList, FaUserTimes, FaClock, FaCheckCircle, 
  FaExclamationTriangle, FaArrowRight, FaEye, FaImage, 
  FaPlus, FaEdit, FaTimes, FaUserPlus, FaGraduationCap, 
  FaBuilding, FaSpinner 
} from 'react-icons/fa';
import './AdminDashboard.css';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAlumni: 0,
    pendingApprovals: 0,
    publishedNews: 0,
    activeJobs: 0,
    tracerResponses: 0,
    galleryImages: 0
  });
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [processingApproval, setProcessingApproval] = useState(false);

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      // Use the admin dashboard stats view from your database schema
      const { data: dashboardStats, error: statsError } = await supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single();

      if (statsError) {
        console.error('Error fetching dashboard stats:', statsError);
        // Fallback to individual queries if view doesn't exist
        await fetchIndividualStats();
      } else {
        setStats({
          totalAlumni: dashboardStats.total_alumni || 0,
          pendingApprovals: dashboardStats.pending_approvals || 0,
          publishedNews: dashboardStats.published_news || 0,
          activeJobs: dashboardStats.active_jobs || 0,
          tracerResponses: dashboardStats.tracer_study_responses || 0,
          galleryImages: dashboardStats.recent_gallery_uploads || 0
        });
      }

      // Fetch pending registrations
      const { data: pending, error: pendingError } = await supabase
        .from('pending_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (pendingError) {
        console.error('Error fetching pending registrations:', pendingError);
        toast.error('Failed to fetch pending registrations');
      } else {
        setPendingRegistrations(pending || []);
      }

      // Fetch recent activities
      const { data: activities, error: activitiesError } = await supabase
        .from('recent_activities')
        .select('*')
        .limit(10);

      if (!activitiesError) {
        setRecentActivities(activities || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fallback function for individual stats
  const fetchIndividualStats = async () => {
    try {
      const [
        { count: alumniCount },
        { count: pendingCount },
        { count: newsCount },
        { count: jobsCount },
        { count: tracerCount },
        { count: galleryCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('pending_registrations').select('*', { count: 'exact', head: true }),
        supabase.from('news_announcements').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('job_opportunities').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('tracer_study_responses').select('*', { count: 'exact', head: true }),
        supabase.from('gallery_images').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalAlumni: alumniCount || 0,
        pendingApprovals: pendingCount || 0,
        publishedNews: newsCount || 0,
        activeJobs: jobsCount || 0,
        tracerResponses: tracerCount || 0,
        galleryImages: galleryCount || 0
      });
    } catch (error) {
      console.error('Error fetching individual stats:', error);
    }
  };

  // Handle registration approval
  const handleApproval = async (registrationId, action) => {
    try {
      setProcessingApproval(true);
      
      // Get the registration details
      const { data: registration, error: fetchError } = await supabase
        .from('pending_registrations')
        .select('*')
        .eq('id', registrationId)
        .single();

      if (fetchError || !registration) {
        toast.error('Registration not found');
        return;
      }

      if (action === 'approve') {
        // Delegate secure operations to backend API (uses service role)
        const response = await fetch('/api/admin/approve-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationId })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          toast.error('Failed to approve registration: ' + (result.error || response.statusText));
          return;
        }
        toast.success(`${registration.first_name} ${registration.last_name} has been approved!`);
      } else {
        toast.success(`Registration for ${registration.first_name} ${registration.last_name} has been rejected.`);
      }

      // Remove from pending registrations
      const { error: deleteError } = await supabase
        .from('pending_registrations')
        .delete()
        .eq('id', registrationId);

      if (deleteError) {
        console.error('Error removing pending registration:', deleteError);
      }

      // Refresh data
      await fetchStats();
      setShowPendingModal(false);
      setSelectedRegistration(null);

    } catch (error) {
      console.error('Error handling approval:', error);
      toast.error('Failed to process approval');
    } finally {
      setProcessingApproval(false);
    }
  };

  // Quick action functions
  const quickActions = {
    viewPendingRegistrations: () => setShowPendingModal(true),
    createNews: () => navigate('/admin/news'),
    manageJobs: () => navigate('/admin/jobs'),
    viewTracerStudy: () => navigate('/admin/tracer-study'),
    manageGallery: () => navigate('/admin/gallery'),
    viewAllUsers: () => navigate('/admin/users')
  };

  useEffect(() => {
    fetchStats();
    
    // Set up real-time updates
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-container">
          <FaSpinner className="loading-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Manage your CCS Alumni Portal</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={quickActions.viewPendingRegistrations}
          >
            <FaClock /> Pending Approvals ({stats.pendingApprovals})
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.totalAlumni}</h3>
            <p>Total Alumni</p>
          </div>
          <div className="stat-action">
            <button onClick={quickActions.viewAllUsers}>
              <FaArrowRight />
            </button>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingApprovals}</h3>
            <p>Pending Approvals</p>
          </div>
          <div className="stat-action">
            <button onClick={quickActions.viewPendingRegistrations}>
              <FaArrowRight />
            </button>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <FaNewspaper />
          </div>
          <div className="stat-content">
            <h3>{stats.publishedNews}</h3>
            <p>Published News</p>
          </div>
          <div className="stat-action">
            <button onClick={quickActions.createNews}>
              <FaArrowRight />
            </button>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <FaBriefcase />
          </div>
          <div className="stat-content">
            <h3>{stats.activeJobs}</h3>
            <p>Active Jobs</p>
          </div>
          <div className="stat-action">
            <button onClick={quickActions.manageJobs}>
              <FaArrowRight />
            </button>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>{stats.tracerResponses}</h3>
            <p>Tracer Responses</p>
          </div>
          <div className="stat-action">
            <button onClick={quickActions.viewTracerStudy}>
              <FaArrowRight />
            </button>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon">
            <FaImage />
          </div>
          <div className="stat-content">
            <h3>{stats.galleryImages}</h3>
            <p>Gallery Images</p>
          </div>
          <div className="stat-action">
            <button onClick={quickActions.manageGallery}>
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button 
            className="action-card"
            onClick={quickActions.viewPendingRegistrations}
          >
            <FaUserCheck />
            <span>Review Registrations</span>
            {stats.pendingApprovals > 0 && (
              <span className="badge">{stats.pendingApprovals}</span>
            )}
          </button>

          <button 
            className="action-card"
            onClick={quickActions.createNews}
          >
            <FaPlus />
            <span>Create News</span>
          </button>

          <button 
            className="action-card"
            onClick={quickActions.manageJobs}
          >
            <FaBriefcase />
            <span>Manage Jobs</span>
          </button>

          <button 
            className="action-card"
            onClick={quickActions.viewTracerStudy}
          >
            <FaChartBar />
            <span>Tracer Study</span>
          </button>

          <button 
            className="action-card"
            onClick={quickActions.manageGallery}
          >
            <FaImage />
            <span>Manage Gallery</span>
          </button>

          <button 
            className="action-card"
            onClick={quickActions.viewAllUsers}
          >
            <FaUsers />
            <span>All Users</span>
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <h2>Recent Activities</h2>
        <div className="activities-list">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'registration' && <FaUserPlus />}
                  {activity.type === 'news' && <FaNewspaper />}
                  {activity.type === 'job' && <FaBriefcase />}
                  {activity.type === 'gallery' && <FaImage />}
                </div>
                <div className="activity-content">
                  <h4>{activity.title}</h4>
                  <p>{activity.description}</p>
                  <span className="activity-time">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-activities">No recent activities</p>
          )}
        </div>
      </div>

      {/* Pending Registrations Modal */}
      {showPendingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Pending Registrations</h2>
              <button 
                className="modal-close"
                onClick={() => setShowPendingModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {pendingRegistrations.length > 0 ? (
                <div className="registrations-list">
                  {pendingRegistrations.map((registration) => (
                    <div key={registration.id} className="registration-card">
                      <div className="registration-info">
                        {registration.profile_image_url && (
                          <img 
                            src={registration.profile_image_url} 
                            alt="Profile" 
                            className="registration-avatar"
                          />
                        )}
                        <div className="registration-details">
                          <h3>{registration.first_name} {registration.last_name}</h3>
                          <p><strong>Email:</strong> {registration.email}</p>
                          <p><strong>Program:</strong> {registration.program}</p>
                          <p><strong>Graduation Year:</strong> {registration.graduation_year}</p>
                          <p><strong>Current Job:</strong> {registration.current_job || 'Not specified'}</p>
                          <p><strong>Company:</strong> {registration.company || 'Not specified'}</p>
                          <p><strong>Phone:</strong> {registration.phone || 'Not provided'}</p>
                          <p><strong>Address:</strong> {registration.address || 'Not provided'}</p>
                          <p><strong>Submitted:</strong> {new Date(registration.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="registration-actions">
                        <button 
                          className="btn btn-success"
                          onClick={() => handleApproval(registration.id, 'approve')}
                          disabled={processingApproval}
                        >
                          {processingApproval ? <FaSpinner className="spinning" /> : <FaCheckCircle />}
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleApproval(registration.id, 'reject')}
                          disabled={processingApproval}
                        >
                          <FaTimes />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-registrations">No pending registrations</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
