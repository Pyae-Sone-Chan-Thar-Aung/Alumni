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
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

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
        // Create user account
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: registration.email,
          password: 'TempPassword123!', // They'll need to reset this
          email_confirm: true
        });

        if (authError) {
          toast.error('Failed to create user account: ' + authError.message);
          return;
        }

        // Insert into users table
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
      setSelectedRegistration(null);

    } catch (error) {
      console.error('Error handling approval:', error);
      toast.error('Failed to process approval');
    } finally {
      setLoading(false);
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
      const employmentCounts = {
        'Employed': 0,
        'Unemployed': 0,
        'Self-employed': 0,
        'Graduate School': 0,
        'Other': 0
      };
      
      employmentStats?.forEach(response => {
        const status = response.employment_status;
        if (employmentCounts.hasOwnProperty(status)) {
          employmentCounts[status]++;
        } else {
          employmentCounts['Other']++;
        }
      });
      
      setChartEmploymentData({
        labels: Object.keys(employmentCounts),
        datasets: [{
          label: 'Employment Status',
          data: Object.values(employmentCounts),
          backgroundColor: [
            '#06d6a0', // Modern teal for employed
            '#f72585', // Vibrant pink for unemployed
            '#fb8500', // Orange for self-employed
            '#219ebc', // Blue for graduate school
            '#8338ec'  // Purple for other
          ],
          borderWidth: 0,
          hoverBackgroundColor: [
            '#05c296',
            '#e91e63',
            '#ff9800',
            '#2196f3',
            '#9c27b0'
          ]
        }]
      });
      
      // Fetch gender distribution from tracer study responses
      const { data: genderStats } = await supabase
        .from('tracer_study_responses')
        .select('gender');
      
      const genderCounts = { 'Female': 0, 'Male': 0, 'Other': 0 };
      genderStats?.forEach(response => {
        const gender = response.gender;
        if (genderCounts.hasOwnProperty(gender)) {
          genderCounts[gender]++;
        } else {
          genderCounts['Other']++;
        }
      });
      
      // Filter out zero counts for cleaner chart
      const filteredGenderLabels = [];
      const filteredGenderData = [];
      const genderColors = { 'Female': '#ec4899', 'Male': '#3b82f6', 'Other': '#8b5cf6' };
      const filteredColors = [];
      
      Object.entries(genderCounts).forEach(([key, value]) => {
        if (value > 0) {
          filteredGenderLabels.push(key);
          filteredGenderData.push(value);
          filteredColors.push(genderColors[key]);
        }
      });
      
      setChartGenderData({
        labels: filteredGenderLabels,
        datasets: [{
          label: 'Gender Distribution',
          data: filteredGenderData,
          backgroundColor: [
            '#ff6b9d', // Modern pink for female
            '#4ecdc4', // Teal for male  
            '#a8e6cf'  // Light green for other
          ],
          borderWidth: 0,
          hoverBackgroundColor: [
            '#ff5c8a',
            '#45b7aa',
            '#95d5b2'
          ]
        }]
      });
      
      // Fetch alumni by graduation year from tracer study responses
      const { data: yearStats } = await supabase
        .from('tracer_study_responses')
        .select('graduation_year')
        .not('graduation_year', 'is', null);
      
      const yearCounts = {};
      yearStats?.forEach(response => {
        const year = response.graduation_year;
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      });
      
      // Merge with any manual edits
      Object.keys(yearEditData).forEach(year => {
        yearCounts[year] = yearEditData[year];
      });
      
      // Sort years and prepare data
      const sortedYears = Object.keys(yearCounts).sort();
      const yearValues = sortedYears.map(year => yearCounts[year]);
      
      setChartYearData({
        labels: sortedYears,
        datasets: [{
          label: 'Alumni by Graduation Year',
          data: yearValues,
          backgroundColor: '#8B0000',
          borderColor: '#660000',
          borderWidth: 2
        }]
      });
      
    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast.error('Failed to fetch chart data');
    }
  };

  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true);
      
      // Fetch recent registrations
      const { data: recentUsers } = await supabase
        .from('users')
        .select('id, first_name, last_name, created_at, approval_status')
        .order('created_at', { ascending: false })
        .limit(5);
      
      // Fetch recent news
      const { data: recentNews } = await supabase
        .from('news')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(3);
      
      // Fetch recent tracer study responses
      const { data: recentResponses } = await supabase
        .from('tracer_study_responses')
        .select('id, created_at, users(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(3);
      
      const activities = [];
      
      // Add user registrations
      recentUsers?.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'registration',
          title: `New ${user.approval_status === 'pending' ? 'pending ' : ''}registration`,
          description: `${user.first_name} ${user.last_name}`,
          timestamp: user.created_at,
          icon: 'user'
        });
      });
      
      // Add news posts
      recentNews?.forEach(news => {
        activities.push({
          id: `news-${news.id}`,
          type: 'news',
          title: 'News published',
          description: news.title,
          timestamp: news.created_at,
          icon: 'news'
        });
      });
      
      // Add tracer study responses
      recentResponses?.forEach(response => {
        activities.push({
          id: `response-${response.id}`,
          type: 'tracer',
          title: 'Tracer study response',
          description: `${response.users?.first_name} ${response.users?.last_name}`,
          timestamp: response.created_at,
          icon: 'clipboard'
        });
      });
      
      // Sort by timestamp and take top 8
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 8);
      
      setRecentActivity(sortedActivities);
      
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      toast.error('Failed to fetch recent activity');
    } finally {
      setActivityLoading(false);
    }
  };

  // Functions for editing Alumni by Graduation Year
  const handleYearEdit = (year, currentValue) => {
    setEditingYear(year);
    setYearEditData(prev => ({
      ...prev,
      [year]: currentValue
    }));
    setShowYearModal(true);
  };

  const handleYearSave = () => {
    fetchChartData(); // Refresh the chart with new data
    setShowYearModal(false);
    setEditingYear(null);
    toast.success('Alumni count updated successfully!');
  };

  const handleYearCancel = () => {
    setShowYearModal(false);
    setEditingYear(null);
    // Remove the editing year from yearEditData if it was a new entry
    if (editingYear && !chartYearData?.labels.includes(editingYear)) {
      setYearEditData(prev => {
        const newData = { ...prev };
        delete newData[editingYear];
        return newData;
      });
    }
  };

  const handleAddNewYear = () => {
    const currentYear = new Date().getFullYear();
    const newYear = currentYear.toString();
    setEditingYear(newYear);
    setYearEditData(prev => ({
      ...prev,
      [newYear]: 0
    }));
    setShowYearModal(true);
  };

  const handleYearInputChange = (value) => {
    const numValue = parseInt(value) || 0;
    setYearEditData(prev => ({
      ...prev,
      [editingYear]: numValue
    }));
  };

  const handleYearChange = (newYear) => {
    if (editingYear && newYear !== editingYear) {
      setYearEditData(prev => {
        const newData = { ...prev };
        const value = newData[editingYear];
        delete newData[editingYear];
        newData[newYear] = value;
        return newData;
      });
      setEditingYear(newYear);
    }
  };

  const fetchRecentActivitySimple = async () => {
    setActivityLoading(true);
    try {
      const { data: recentRegistrations, error } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          created_at,
          approval_status
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setRecentActivity(recentRegistrations || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      toast.error('Failed to load recent activity');
    } finally {
      setActivityLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  // Set up real-time subscription for activity updates
  useEffect(() => {
    const activitySubscription = supabase
      .channel('activity_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        () => fetchRecentActivity()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_profiles' },
        () => fetchRecentActivity()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pending_registrations' },
        () => fetchRecentActivity()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activitySubscription);
    };
  }, []);

  const handleQuickAction = (action) => {
    switch (action) {
      case 'review-registrations':
        navigate('/admin/pending-registrations');
        break;
      case 'post-news':
        navigate('/admin/news');
        break;
      case 'manage-jobs':
        navigate('/admin/jobs');
        break;
      case 'view-reports':
        navigate('/admin/analytics');
        break;
      case 'view-tracer-study':
        navigate('/admin/tracer-study');
        break;
      case 'manage-gallery':
        navigate('/admin/gallery');
        break;
      case 'manage-users':
        navigate('/admin/users');
        break;
      default:
        console.log('Invalid action:', action);
        toast.error('Feature not available yet');
        break;
    }
  };


  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Alumni Statistics'
      }
    }
  };

  // Professional donut chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          },
          color: '#374151'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#8B0000',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%', // Creates donut effect
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    }
  };

  // Professional employment chart options with center text
  const employmentChartOptions = {
    ...pieOptions,
    plugins: {
      ...pieOptions.plugins,
      beforeDraw: function(chart) {
        const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;
        ctx.save();
        
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        // Calculate total
        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        
        // Draw center text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Total number
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillStyle = '#1f2937';
        ctx.fillText(total.toString(), centerX, centerY - 8);
        
        // Label
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('Total Responses', centerX, centerY + 12);
        
        ctx.restore();
      }
    }
  };

  // Professional gender chart options with center text
  const genderChartOptions = {
    ...pieOptions,
    plugins: {
      ...pieOptions.plugins,
      beforeDraw: function(chart) {
        const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;
        ctx.save();
        
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        
        // Calculate total
        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        
        // Draw center text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Total number
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillStyle = '#1f2937';
        ctx.fillText(total.toString(), centerX, centerY - 8);
        
        // Label
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('Alumni', centerX, centerY + 12);
        
        ctx.restore();
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's an overview of the UIC Alumni Portal</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.totalUsers.toLocaleString()}</h3>
              <p>Total Alumni</p>
              <span className="stat-change positive">+12% from last month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <FaUserCheck />
            </div>
            <div className="stat-content">
              <h3>{stats.pendingApprovals}</h3>
              <p>Pending Approvals</p>
              <span className="stat-change neutral">No change</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon news">
              <FaNewspaper />
            </div>
            <div className="stat-content">
              <h3>{stats.totalNews}</h3>
              <p>News & Announcements</p>
              <span className="stat-change positive">+3 this week</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon jobs">
              <FaBriefcase />
            </div>
            <div className="stat-content">
              <h3>{stats.totalJobs}</h3>
              <p>Job Opportunities</p>
              <span className="stat-change positive">+8 this month</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats.activeUsers}</h3>
              <p>Active Users</p>
              <span className="stat-change positive">+5% this week</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon new">
              <FaUserTimes />
            </div>
            <div className="stat-content">
              <h3>{stats.newRegistrations}</h3>
              <p>New Registrations</p>
              <span className="stat-change positive">+23 this week</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon tracer">
              <FaClipboardList />
            </div>
            <div className="stat-content">
              <h3>{stats.tracerStudyResponses}</h3>
              <p>Tracer Study Responses</p>
              <span className="stat-change positive">Graduate tracking</span>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="charts-section">
            <div className="chart-container">
              <div className="chart-header">
                <h3>Alumni by Graduation Year</h3>
                <div className="chart-actions">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleAddNewYear}
                    title="Add New Year"
                  >
                    <FaPlus /> Add Year
                  </button>
                </div>
              </div>
              {chartYearData ? (
                <div className="chart-wrapper">
                  <Bar data={chartYearData} options={chartOptions} />
                  <div className="chart-edit-overlay">
                    {chartYearData.labels.map((year, index) => (
                      <button
                        key={year}
                        className="year-edit-btn"
                        onClick={() => handleYearEdit(year, chartYearData.datasets[0].data[index])}
                        title={`Edit ${year}: ${chartYearData.datasets[0].data[index]} alumni`}
                        style={{
                          left: `${(index / (chartYearData.labels.length - 1)) * 85 + 7.5}%`,
                        }}
                      >
                        <FaEdit />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>Loading...</div>
              )}
            </div>

            <div className="charts-row">
              <div className="chart-container professional-chart">
                <h3>Employment Status</h3>
                <div className="chart-wrapper-donut">
                  {chartEmploymentData ? <Pie data={chartEmploymentData} options={employmentChartOptions} /> : <div>Loading...</div>}
                </div>
              </div>

              <div className="chart-container professional-chart">
                <h3>Gender Distribution</h3>
                <div className="chart-wrapper-donut">
                  {chartGenderData ? <Pie data={chartGenderData} options={genderChartOptions} /> : <div>Loading...</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="activity-section modern-card">
            <div className="section-header">
              <h3><FaClock className="section-icon" />Recent Activity</h3>
              <div className="activity-indicator">
                <div className="live-dot"></div>
                <span>Live Updates</span>
              </div>
            </div>
            
            {activityLoading ? (
              <div className="activity-loading">
                <div className="loading-spinner"></div>
                <p>Loading recent activity...</p>
              </div>
            ) : (
              <div className="activity-list modern-list">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item modern-item">
                    <div className={`activity-icon modern-icon ${activity.type}`}>
                      {activity.type === 'registration' && <FaUserCheck />}
                      {activity.type === 'news' && <FaNewspaper />}
                      {activity.type === 'job' && <FaBriefcase />}
                    </div>
                    <div className="activity-content modern-content">
                      <div className="activity-header">
                        <h4>{activity.user}</h4>
                        <span className="activity-time">{activity.time}</span>
                      </div>
                      <p className="activity-description">{activity.action}</p>
                    </div>
                    <div className={`activity-status modern-status ${activity.status}`}>
                      {activity.status === 'pending' && <FaExclamationTriangle />}
                      {activity.status === 'approved' && <FaCheckCircle />}
                      {activity.status === 'completed' && <FaCheckCircle />}
                      <span>{activity.status === 'pending' ? 'Pending' : activity.status === 'approved' ? 'Approved' : 'Completed'}</span>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div className="no-activity">
                    <FaClock className="no-activity-icon" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="activity-section">
            <h3>Pending Requests</h3>
            <div className="activity-list">
              {pendingUsers.slice(0,5).map(u => (
                <div key={u.id} className="activity-item">
                  <div className="activity-icon"><FaUserCheck /></div>
                  <div className="activity-content">
                    <h4>{`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email}</h4>
                    <p>{u.email} • Pending verification</p>
                    <span className="activity-time">Registered {u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</span>
                  </div>
                  <div>
                    <button className="btn btn-outline" onClick={() => navigate('/admin/users')}>Manage</button>
                  </div>
                </div>
              ))}
              {pendingUsers.length === 0 && (
                <div className="no-results"><p>No pending requests.</p></div>
              )}
            </div>
          </div>
        </div>

        <div className="quick-actions modern-card">
          <div className="section-header">
            <h3><FaArrowRight className="section-icon" />Quick Actions</h3>
            <span className="section-subtitle">Frequently used admin functions</span>
          </div>
          <div className="actions-grid modern-grid">
            <button 
              className="action-btn modern-action-btn primary"
              onClick={() => handleQuickAction('review-registrations')}
            >
              <div className="action-icon">
                <FaUserCheck />
                {stats.pendingApprovals > 0 && <span className="action-badge">{stats.pendingApprovals}</span>}
              </div>
              <div className="action-content">
                <span className="action-title">Review Registrations</span>
                <span className="action-description">Approve pending alumni applications</span>
              </div>
              <FaArrowRight className="action-arrow" />
            </button>
            
            <button 
              className="action-btn modern-action-btn secondary"
              onClick={() => handleQuickAction('manage-users')}
            >
              <div className="action-icon">
                <FaUsers />
              </div>
              <div className="action-content">
                <span className="action-title">Manage Users</span>
                <span className="action-description">View and manage all alumni</span>
              </div>
              <FaArrowRight className="action-arrow" />
            </button>
            
            <button 
              className="action-btn modern-action-btn tertiary"
              onClick={() => handleQuickAction('post-news')}
            >
              <div className="action-icon">
                <FaNewspaper />
              </div>
              <div className="action-content">
                <span className="action-title">News & Announcements</span>
                <span className="action-description">Create and manage news</span>
              </div>
              <FaArrowRight className="action-arrow" />
            </button>
            
            <button 
              className="action-btn modern-action-btn quaternary"
              onClick={() => handleQuickAction('manage-jobs')}
            >
              <div className="action-icon">
                <FaBriefcase />
              </div>
              <div className="action-content">
                <span className="action-title">Job Opportunities</span>
                <span className="action-description">Post and manage job listings</span>
              </div>
              <FaArrowRight className="action-arrow" />
            </button>
            
            <button 
              className="action-btn modern-action-btn quinary"
              onClick={() => handleQuickAction('view-tracer-study')}
            >
              <div className="action-icon">
                <FaClipboardList />
              </div>
              <div className="action-content">
                <span className="action-title">Tracer Study</span>
                <span className="action-description">Graduate tracking & analytics</span>
              </div>
              <FaArrowRight className="action-arrow" />
            </button>
            
            <button 
              className="action-btn modern-action-btn senary"
              onClick={() => handleQuickAction('manage-gallery')}
            >
              <div className="action-icon">
                <FaImage />
              </div>
              <div className="action-content">
                <span className="action-title">Photo Gallery</span>
                <span className="action-description">Manage event photos & albums</span>
              </div>
              <FaArrowRight className="action-arrow" />
            </button>
            
            <button 
              className="action-btn modern-action-btn septenary"
              onClick={() => handleQuickAction('view-reports')}
            >
              <div className="action-icon">
                <FaChartBar />
              </div>
              <div className="action-content">
                <span className="action-title">Analytics & Reports</span>
                <span className="action-description">Comprehensive insights & data</span>
              </div>
              <FaArrowRight className="action-arrow" />
            </button>
          </div>
        </div>

        {/* Year Edit Modal */}
        {showYearModal && (
          <div className="modal-overlay">
            <div className="modal-content year-edit-modal">
              <div className="modal-header">
                <h3>Edit Alumni Count</h3>
                <button className="modal-close" onClick={handleYearCancel}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="year-input">Graduation Year:</label>
                  <input
                    id="year-input"
                    type="number"
                    min="1990"
                    max="2030"
                    value={editingYear || ''}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="count-input">Number of Alumni:</label>
                  <input
                    id="count-input"
                    type="number"
                    min="0"
                    value={yearEditData[editingYear] || 0}
                    onChange={(e) => handleYearInputChange(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="calculation-helper">
                  <p><strong>Quick Actions:</strong></p>
                  <div className="calc-buttons">
                    <button 
                      className="btn btn-outline"
                      onClick={() => handleYearInputChange((yearEditData[editingYear] || 0) + 1)}
                    >
                      +1
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={() => handleYearInputChange((yearEditData[editingYear] || 0) + 5)}
                    >
                      +5
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={() => handleYearInputChange((yearEditData[editingYear] || 0) + 10)}
                    >
                      +10
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={() => handleYearInputChange(Math.max(0, (yearEditData[editingYear] || 0) - 1))}
                    >
                      -1
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={() => handleYearInputChange(Math.max(0, (yearEditData[editingYear] || 0) - 5))}
                    >
                      -5
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={() => handleYearInputChange(0)}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleYearCancel}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleYearSave}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 