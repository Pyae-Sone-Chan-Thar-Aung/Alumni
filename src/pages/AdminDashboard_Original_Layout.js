import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../config/supabaseClient';
import { FaUsers, FaUserCheck, FaNewspaper, FaBriefcase, FaChartBar, FaClipboardList, FaUserTimes, FaClock, FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaEye, FaImage, FaPlus, FaEdit, FaTimes, FaUserPlus, FaGraduationCap, FaBuilding } from 'react-icons/fa';
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
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Fetch dashboard statistics
  const fetchStats = async () => {
    console.log('📈 AdminDashboard: Fetching stats and pending users...');
    
    const [{ count: usersCount }, { count: newsCount }, { count: jobsCount }, { count: tracerCount }, { data: pending, error: pendingError }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('news_announcements').select('*', { count: 'exact', head: true }),
      supabase.from('job_opportunities').select('*', { count: 'exact', head: true }),
      supabase.from('tracer_study_responses').select('*', { count: 'exact', head: true }),
      supabase.from('pending_registrations').select('id, first_name, last_name, email, created_at, program, graduation_year, current_job, company, phone, address, city, country, profile_image_url').order('created_at', { ascending: false })
    ]);
    
    console.log('📈 Dashboard stats:', { usersCount, newsCount, jobsCount, tracerCount });
    console.log('👥 Pending users query result:', { data: pending, error: pendingError });
    
    if (pendingError) {
      console.error('❌ Error fetching pending users:', pendingError);
      toast.error('Failed to fetch pending users: ' + pendingError.message);
    } else {
      console.log(`🕰️ Found ${pending?.length || 0} pending users for dashboard`);
    }
    setStats(s => ({
      ...s,
      totalUsers: usersCount || 0,
      pendingApprovals: pending?.length || 0,
      totalNews: newsCount || 0,
      totalJobs: jobsCount || 0,
      tracerStudyResponses: tracerCount || 0
    }));
    setPendingUsers(pending || []);
    setLoading(false);
  };

  // Handle registration approval
  const handleApproval = async (registrationId, action) => {
    try {
      setLoading(true);
      
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
        // Create user account with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: registration.email,
          password: 'TempPassword123!', // They'll need to reset this
          email_confirm: true
        });

        if (authError) {
          toast.error('Failed to create user account: ' + authError.message);
          return;
        }

        // Insert into users table (FIXED - includes password_hash)
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: registration.email,
            password_hash: 'supabase_auth_managed',
            role: 'alumni',
            status: 'approved',
            email_verified: true
          });

        if (userError) {
          toast.error('Failed to create user record: ' + userError.message);
          return;
        }

        // Insert into user_profiles table
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            first_name: registration.first_name,
            last_name: registration.last_name,
            student_id: registration.student_id,
            graduation_year: registration.graduation_year,
            program: registration.program,
            phone: registration.phone,
            address: registration.address,
            city: registration.city,
            country: registration.country,
            current_job: registration.current_job,
            company: registration.company,
            profile_image_url: registration.profile_image_url
          });

        if (profileError) {
          toast.error('Failed to create user profile: ' + profileError.message);
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

    } catch (error) {
      console.error('Error handling approval:', error);
      toast.error('Failed to process approval');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the CCS Alumni Portal Administration</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Alumni</p>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingApprovals}</h3>
            <p>Pending Approvals</p>
          </div>
          <button 
            className="stat-action"
            onClick={() => setShowPendingModal(true)}
            disabled={stats.pendingApprovals === 0}
          >
            <FaEye /> Review
          </button>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaNewspaper />
          </div>
          <div className="stat-content">
            <h3>{stats.totalNews}</h3>
            <p>News Articles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaBriefcase />
          </div>
          <div className="stat-content">
            <h3>{stats.totalJobs}</h3>
            <p>Job Opportunities</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>{stats.tracerStudyResponses}</h3>
            <p>Tracer Responses</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => navigate('/admin/users')}>
            <FaUsers /> Manage Users
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/news')}>
            <FaNewspaper /> Manage News
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/jobs')}>
            <FaBriefcase /> Manage Jobs
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/tracer-study')}>
            <FaChartBar /> Tracer Study
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/gallery')}>
            <FaImage /> Manage Gallery
          </button>
          <button className="action-btn" onClick={() => setShowPendingModal(true)}>
            <FaUserCheck /> Pending Approvals ({stats.pendingApprovals})
          </button>
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
              {pendingUsers.length > 0 ? (
                <div className="pending-users-list">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="pending-user-card">
                      <div className="user-info">
                        {user.profile_image_url && (
                          <img 
                            src={user.profile_image_url} 
                            alt="Profile" 
                            className="user-avatar"
                          />
                        )}
                        <div className="user-details">
                          <h3>{user.first_name} {user.last_name}</h3>
                          <p><strong>Email:</strong> {user.email}</p>
                          <p><strong>Program:</strong> {user.program}</p>
                          <p><strong>Graduation Year:</strong> {user.graduation_year}</p>
                          <p><strong>Current Job:</strong> {user.current_job || 'Not specified'}</p>
                          <p><strong>Company:</strong> {user.company || 'Not specified'}</p>
                          <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                          <p><strong>Address:</strong> {user.address || 'Not provided'}</p>
                          <p><strong>Submitted:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="user-actions">
                        <button 
                          className="btn btn-success"
                          onClick={() => handleApproval(user.id, 'approve')}
                          disabled={loading}
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleApproval(user.id, 'reject')}
                          disabled={loading}
                        >
                          <FaTimes /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-pending">No pending registrations</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
