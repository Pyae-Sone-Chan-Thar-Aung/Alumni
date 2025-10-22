import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { FaUsers, FaUserCheck, FaNewspaper, FaBriefcase, FaChartBar, FaClipboardList, FaUserTimes, FaClock, FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaEye, FaImage, FaPlus, FaEdit, FaTimes, FaUserPlus, FaGraduationCap, FaBuilding, FaDownload, FaLink, FaEnvelope } from 'react-icons/fa';
import './AdminDashboard.css';
import { toast } from 'react-toastify';

// Charts
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import PDFReport from '../components/PDFReport';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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

  // small UX trends for chips (purely illustrative)
  const [trends, setTrends] = useState({ users: 0, pending: 0, news: 0, jobs: 0, tracer: 0 });

  // Analytics state for charts
  const [analytics, setAnalytics] = useState({
    employment: { employed: 0, selfEmployed: 0, unemployed: 0, graduateSchool: 0 },
    gender: {},
    graduationYears: {}
  });

  // Chart range tabs: Year / Month
  const [chartRange, setChartRange] = useState('Year');
  const [gradYearsFilter, setGradYearsFilter] = useState('10y'); // '10y' | '20y' | 'All'

  // Date range helpers
  const getRangeBounds = (range) => {
    const now = new Date();
    let start, prevStart, prevEnd, end;
    if (range === 'Month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = start;
    } else {
      // Year
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      prevEnd = start;
    }
    return {
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      prevStartISO: prevStart.toISOString(),
      prevEndISO: prevEnd.toISOString()
    };
  };

  // Fetch dashboard statistics for the selected range
  const fetchStats = async (range = chartRange) => {
    console.log('📈 AdminDashboard: Fetching stats, charts, and pending users...', range);
    const { startISO, endISO, prevStartISO, prevEndISO } = getRangeBounds(range);

    const [
      // Current period counts
      { count: usersCount },
      { count: newsCount },
      { count: jobsCount },
      { count: tracerCount },
      // Pending view (not range limited)
      { data: pendingUsersView, error: pendingUsersError },
      // Analytics data (range-limited when possible)
      { data: tracerData, error: tracerDataError },
      { data: userProfiles, error: userProfilesError },
      // Pending created in current/previous periods
      { count: pendingCurr },
      { count: pendingPrev },
      // Previous period counts for trends
      { count: usersPrev },
      { count: newsPrev },
      { count: jobsPrev },
      { count: tracerPrev }
    ] = await Promise.all([
      // Current period
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startISO).lt('created_at', endISO),
      supabase
        .from('news')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .gte('published_at', startISO)
        .lt('published_at', endISO),
      supabase.from('job_opportunities').select('*', { count: 'exact', head: true }).gte('created_at', startISO).lt('created_at', endISO),
      supabase.from('tracer_study_responses').select('*', { count: 'exact', head: true }).gte('created_at', startISO).lt('created_at', endISO),

      // Pending users (all-time list for modal)
      supabase.from('user_management_view').select('*').eq('approval_status', 'pending').order('user_created_at', { ascending: false }),

      // Analytics detail
      supabase.from('tracer_study_responses').select('employment_status, graduation_year, gender, created_at').gte('created_at', startISO).lt('created_at', endISO),
      supabase.from('user_profiles').select('graduation_year'),

      // Pending created counts (for trend)
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'pending')
        .gte('created_at', startISO)
        .lt('created_at', endISO),
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('approval_status', 'pending')
        .gte('created_at', prevStartISO)
        .lt('created_at', prevEndISO),

      // Previous period counts
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', prevStartISO).lt('created_at', prevEndISO),
      supabase
        .from('news')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .gte('published_at', prevStartISO)
        .lt('published_at', prevEndISO),
      supabase.from('job_opportunities').select('*', { count: 'exact', head: true }).gte('created_at', prevStartISO).lt('created_at', prevEndISO),
      supabase.from('tracer_study_responses').select('*', { count: 'exact', head: true }).gte('created_at', prevStartISO).lt('created_at', prevEndISO)
    ]);

    // Compute analytics for charts
    const employment = { employed: 0, selfEmployed: 0, unemployed: 0, graduateSchool: 0 };
    const gender = {};
    const graduationYears = {};

    if (!tracerDataError && tracerData) {
      tracerData.forEach(r => {
        const status = (r.employment_status || '').toLowerCase();
        if (status.includes('unemployed')) {
          employment.unemployed++;
        } else if (status.includes('self')) {
          employment.selfEmployed++;
        } else if (status.includes('graduate')) {
          employment.graduateSchool++;
        } else if (status.includes('employed')) {
          employment.employed++;
        }

        const g = r.gender || 'Not specified';
        gender[g] = (gender[g] || 0) + 1;

        if (r.graduation_year) {
          graduationYears[r.graduation_year] = (graduationYears[r.graduation_year] || 0) + 1;
        }
      });
    }

    // Supplement graduation years with profiles if available
    if (!userProfilesError && userProfiles) {
      userProfiles.forEach(p => {
        if (p.graduation_year) {
          graduationYears[p.graduation_year] = (graduationYears[p.graduation_year] || 0) + 1;
        }
      });
    }

    console.log('📈 Dashboard stats:', { usersCount, newsCount, jobsCount, tracerCount });
    console.log('👥 Pending users (view) result:', { data: pendingUsersView, error: pendingUsersError });

    let processedPending = [];

    if (pendingUsersError) {
      console.warn('⚠️ user_management_view not available, falling back to users+profiles');
      // Fallback: get pending users directly from users table and left join profile client-side
      const [{ data: pendingUsersRaw, error: pendingUsersRawError }, { data: profilesRaw }] = await Promise.all([
        supabase.from('users').select('*').eq('approval_status', 'pending').order('created_at', { ascending: false }),
        supabase.from('user_profiles').select('*')
      ]);
      if (pendingUsersRawError) {
        console.error('❌ Error fetching pending users (fallback):', pendingUsersRawError);
      } else {
        const profileMap = new Map((profilesRaw || []).map(p => [p.user_id, p]));
        processedPending = (pendingUsersRaw || []).map(u => {
          const p = profileMap.get(u.id) || {};
          return {
            id: u.id,
            first_name: u.first_name || p.first_name || '',
            last_name: u.last_name || p.last_name || '',
            email: u.email,
            created_at: u.registration_date || u.created_at,
            program: p.course || null,
            graduation_year: p.graduation_year || null,
            current_job: p.current_job || null,
            company: p.company || null,
            phone: p.phone || null,
            address: p.address || null,
            city: p.city || null,
            country: p.country || null,
            profile_image_url: p.profile_image_url || null
          };
        });
      }
    } else {
      processedPending = (pendingUsersView || []).map(u => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        created_at: u.registration_date || u.user_created_at,
        program: u.course,
        graduation_year: u.graduation_year,
        current_job: u.current_job,
        company: u.company,
        phone: u.phone,
        address: u.address,
        city: u.city,
        country: u.country,
        profile_image_url: u.profile_image_url
      }));
    }

    console.log(`🕰️ Found ${processedPending.length} pending users for dashboard`);

    setStats(s => ({
      ...s,
      totalUsers: usersCount || 0,
      pendingApprovals: processedPending.length || 0,
      totalNews: newsCount || 0,
      totalJobs: jobsCount || 0,
      tracerStudyResponses: tracerCount || 0
    }));

    setAnalytics({ employment, gender, graduationYears });
    setPendingUsers(processedPending);

    // Trends: period-over-period change
    const pct = (curr, prev) => {
      if (!prev) return curr ? 100 : 0; // avoid divide by zero
      return Math.round(((curr - prev) / prev) * 1000) / 10; // one decimal
    };

    setTrends({
      users: pct(usersCount || 0, usersPrev || 0),
      pending: pct(pendingCurr || 0, pendingPrev || 0),
      news: pct(newsCount || 0, newsPrev || 0),
      jobs: pct(jobsCount || 0, jobsPrev || 0),
      tracer: pct(tracerCount || 0, tracerPrev || 0)
    });

    setLoading(false);
  };

  // Export users as CSV (id, name, email, role, status, graduation_year)
  const exportUsersCSV = async () => {
    try {
      const [{ data: users }, { data: profiles }] = await Promise.all([
        supabase.from('users').select('id, email, first_name, last_name, role, approval_status, registration_date'),
        supabase.from('user_profiles').select('user_id, graduation_year, course, country')
      ]);
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const rows = (users || []).map(u => {
        const p = profileMap.get(u.id) || {};
        return {
          id: u.id,
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
          email: u.email || '',
          role: u.role || 'alumni',
          approval_status: u.approval_status || '',
          graduation_year: p.graduation_year || '',
          course: p.course || '',
          country: p.country || '',
          registered_at: u.registration_date || ''
        };
      });
      const headers = Object.keys(rows[0] || { id: '', name: '', email: '', role: '', approval_status: '', graduation_year: '', course: '', country: '', registered_at: '' });
      const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uic_users_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Users CSV exported');
    } catch (e) {
      console.error('Export failed', e);
      toast.error('Failed to export users CSV');
    }
  };

  const copyRegistrationLink = async () => {
    try {
      const link = `${window.location.origin}${process.env.PUBLIC_URL || ''}/register`;
      await navigator.clipboard.writeText(link);
      toast.success('Registration link copied to clipboard');
    } catch (e) {
      toast.error('Copy failed');
    }
  };

  // Handle registration approval
  const handleApproval = async (userId, action) => {
    try {
      setLoading(true);

      // Fetch basic info for toast
      const { data: userRow } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', userId)
        .maybeSingle();

      const isApproved = action === 'approve';
      const { error: updateError } = await supabase
        .from('users')
        .update({
          approval_status: isApproved ? 'approved' : 'rejected',
          is_verified: isApproved,
          approved_at: isApproved ? new Date().toISOString() : null
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user approval:', updateError);
        toast.error(`Failed to ${action} registration: ${updateError.message}`);
        return;
      }

      if (isApproved) {
        toast.success(`${(userRow?.first_name || '')} ${(userRow?.last_name || '')} has been approved!`);
      } else {
        toast.success(`Registration for ${(userRow?.first_name || '')} ${(userRow?.last_name || '')} has been rejected.`);
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
    fetchStats(chartRange);
  }, [chartRange]);

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

  // Chart data for selected range (no artificial scaling; values are range-limited above)
  const mult = 1;
  const employmentChartData = {
    labels: ['Employed', 'Self-Employed', 'Unemployed', 'Graduate School'],
    datasets: [{
      data: [
        Math.round((analytics.employment.employed || 0) * mult),
        Math.round((analytics.employment.selfEmployed || 0) * mult),
        Math.round((analytics.employment.unemployed || 0) * mult),
        Math.round((analytics.employment.graduateSchool || 0) * mult)
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
      borderWidth: 0
    }]
  };

  const genderChartData = {
    labels: Object.keys(analytics.gender),
    datasets: [{
      data: Object.values(analytics.gender).map(v => Math.round((v || 0) * mult)),
      backgroundColor: ['#ec4899', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
      borderWidth: 0
    }]
  };

  // Graduation Year Top-N filter
  const sortedYears = Object.keys(analytics.graduationYears).map(Number).sort((a, b) => a - b);
  const cutoffYears = gradYearsFilter === 'All' ? sortedYears : sortedYears.slice(- (gradYearsFilter === '20y' ? 20 : gradYearsFilter === '10y' ? 10 : 5));
  const graduationYearChartData = {
    labels: cutoffYears,
    datasets: [{
      label: 'Alumni (by Grad Year)',
      data: cutoffYears.map(y => analytics.graduationYears[y] || 0),
      backgroundColor: '#8B0000',
      borderColor: '#660000',
      borderWidth: 2
    }]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } } };

  return (
    <div className="admin-layout">
      <main className="admin-content">
        <div className="page-header">
          <div className="breadcrumbs">
            <span className="current">Admin Dashboard</span>
          </div>
          <div className="kpis">
            <div className="actions">
              <button className="btn btn-secondary" onClick={() => setShowPendingModal(true)}>Pending ({stats.pendingApprovals})</button>
            </div>

          </div>
        </div>


        <div className="admin-dashboard">

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card users">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <div className="stat-top">
                  <h3>{stats.totalUsers}</h3>
                  <span className={`trend-chip ${trends.users > 0 ? 'positive' : trends.users < 0 ? 'negative' : 'neutral'}`}>
                    {trends.users > 0 ? `+${trends.users}%` : trends.users < 0 ? `${trends.users}%` : '0%'}
                  </span>
                </div>
                <p>Total Alumni</p>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">
                <FaClock />
              </div>
              <div className="stat-content">
                <div className="stat-top">
                  <h3>{stats.pendingApprovals}</h3>
                  <span className={`trend-chip ${trends.pending > 0 ? 'positive' : trends.pending < 0 ? 'negative' : 'neutral'}`}>
                    {trends.pending > 0 ? `+${trends.pending}%` : trends.pending < 0 ? `${trends.pending}%` : '0%'}
                  </span>
                </div>
                <p>Pending</p>
              </div>
              <button
                className="stat-action"
                onClick={() => setShowPendingModal(true)}
                disabled={stats.pendingApprovals === 0}
              >
                <FaEye /> Review
              </button>
            </div>

            <div className="stat-card news">
              <div className="stat-icon">
                <FaNewspaper />
              </div>
              <div className="stat-content">
                <div className="stat-top">
                  <h3>{stats.totalNews}</h3>
                  <span className={`trend-chip ${trends.news > 0 ? 'positive' : trends.news < 0 ? 'negative' : 'neutral'}`}>
                    {trends.news > 0 ? `+${trends.news}%` : trends.news < 0 ? `${trends.news}%` : '0%'}
                  </span>
                </div>
                <p>News Articles</p>
              </div>
            </div>

            <div className="stat-card jobs">
              <div className="stat-icon">
                <FaBriefcase />
              </div>
              <div className="stat-content">
                <div className="stat-top">
                  <h3>{stats.totalJobs}</h3>
                  <span className={`trend-chip ${trends.jobs > 0 ? 'positive' : trends.jobs < 0 ? 'negative' : 'neutral'}`}>
                    {trends.jobs > 0 ? `+${trends.jobs}%` : trends.jobs < 0 ? `${trends.jobs}%` : '0%'}
                  </span>
                </div>
                <p>Job Opportunities</p>
              </div>
            </div>

            <div className="stat-card tracer">
              <div className="stat-icon">
                <FaChartBar />
              </div>
              <div className="stat-content">
                <div className="stat-top">
                  <h3>{stats.tracerStudyResponses}</h3>
                  <span className={`trend-chip ${trends.tracer > 0 ? 'positive' : trends.tracer < 0 ? 'negative' : 'neutral'}`}>
                    {trends.tracer > 0 ? `+${trends.tracer}%` : trends.tracer < 0 ? `${trends.tracer}%` : '0%'}
                  </span>
                </div>
                <p>Tracer Responses</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-row">
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Employment Status</h3>
                  <div className="chart-range">
                    {['Year','Month'].map(r => (
                      <button key={r} className={`tab ${chartRange===r?'active':''}`} onClick={()=>setChartRange(r)}>{r}</button>
                    ))}
                  </div>
                </div>
                <p className="chart-sub">Distribution of alumni employment status</p>
                <div className="chart-wrapper" style={{ height: 300 }}>
                  <Doughnut data={employmentChartData} options={chartOptions} />
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-header">
                  <h3>Gender Distribution</h3>
                  <div className="chart-range">
                    {['Year', 'Month'].map(r => (
                      <button key={r} className={`tab ${chartRange === r ? 'active' : ''}`} onClick={()=>setChartRange(r)}>{r}</button>
                    ))}
                  </div>
                </div>
                <p className="chart-sub">Alumni demographics by gender</p>
                <div className="chart-wrapper" style={{ height: 300 }}>
                  <Pie data={genderChartData} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="chart-row">
              <div className="chart-container full-width">
                <div className="chart-header">
                  <h3>Alumni by Graduation Year</h3>
                  <div className="chart-range">
                    {['5y','10y','20y','All'].map(r => (
                      <button key={r} className={`tab ${gradYearsFilter===r?'active':''}`} onClick={()=>setGradYearsFilter(r)}>{r}</button>
                    ))}
                  </div>
                </div>
                <p className="chart-sub">Distribution of alumni across graduation years</p>
                <div className="chart-wrapper" style={{ height: 320 }}>
                  <Bar data={graduationYearChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-card users" onClick={() => navigate('/admin/users')}>
                <div className="action-icon users"><FaUsers /></div>
                <div className="action-text">
                  <div className="action-title">Manage Users</div>
                  <div className="action-sub">Create, approve, update alumni</div>
                </div>
              </button>

              <button className="action-card news" onClick={() => navigate('/admin/news')}>
                <div className="action-icon news"><FaNewspaper /></div>
                <div className="action-text">
                  <div className="action-title">Manage News</div>
                  <div className="action-sub">Publish announcements</div>
                </div>
              </button>

              <button className="action-card jobs" onClick={() => navigate('/admin/jobs')}>
                <div className="action-icon jobs"><FaBriefcase /></div>
                <div className="action-text">
                  <div className="action-title">Manage Jobs</div>
                  <div className="action-sub">Post & review openings</div>
                </div>
              </button>

              <button className="action-card tracer" onClick={() => navigate('/admin/tracer-study')}>
                <div className="action-icon tracer"><FaChartBar /></div>
                <div className="action-text">
                  <div className="action-title">Tracer Study</div>
                  <div className="action-sub">Analyze alumni outcomes</div>
                </div>
              </button>

              <button className="action-card analytics" onClick={() => navigate('/admin/analytics')}>
                <div className="action-icon analytics"><FaChartBar /></div>
                <div className="action-text">
                  <div className="action-title">Analytics</div>
                  <div className="action-sub">Explore key metrics</div>
                </div>
              </button>

              <button className="action-card gallery" onClick={() => navigate('/admin/gallery')}>
                <div className="action-icon gallery"><FaImage /></div>
                <div className="action-text">
                  <div className="action-title">Manage Gallery</div>
                  <div className="action-sub">Upload event photos</div>
                </div>
              </button>

              <button className="action-card export" onClick={exportUsersCSV}>
                <div className="action-icon export"><FaDownload /></div>
                <div className="action-text">
                  <div className="action-title">Export Users</div>
                  <div className="action-sub">Download CSV report</div>
                </div>
              </button>

              <button className="action-card invite" onClick={() => navigate('/admin/users')}>
                <div className="action-icon invite"><FaUserPlus /></div>
                <div className="action-text">
                  <div className="action-title">Invite Alumni</div>
                  <div className="action-sub">Bulk import & invites</div>
                </div>
              </button>

              <button className="action-card link" onClick={copyRegistrationLink}>
                <div className="action-icon link"><FaLink /></div>
                <div className="action-text">
                  <div className="action-title">Copy Registration Link</div>
                  <div className="action-sub">Share with candidates</div>
                </div>
              </button>

              <button className="action-card email" onClick={() => window.location.href = 'mailto:alumni@uic.edu.ph?subject=UIC Alumni Update'}>
                <div className="action-icon email"><FaEnvelope /></div>
                <div className="action-text">
                  <div className="action-title">Email Alumni Office</div>
                  <div className="action-sub">alumni@uic.edu.ph</div>
                </div>
              </button>

              <button className="action-card pending" onClick={() => setShowPendingModal(true)} disabled={stats.pendingApprovals === 0}>
                <div className="action-icon pending"><FaUserCheck /></div>
                <div className="action-text">
                  <div className="action-title">Pending Approvals</div>
                  <div className="action-sub">{stats.pendingApprovals} awaiting review</div>
                </div>
              </button>

              <div className="action-card utility" style={{alignItems:'stretch'}}>
                <div className="action-icon export"><FaDownload /></div>
                <div className="action-text">
                  <div className="action-title">Reports (PDF)</div>
                  <div className="action-sub">Download or print</div>
                </div>
                <div className="action-controls">
                  <PDFReport
                    data={{
                      totalUsers: stats.totalUsers,
                      totalJobs: stats.totalJobs,
                      totalNews: stats.totalNews,
                      pendingApprovals: stats.pendingApprovals,
                      employment: analytics.employment,
                      gender: analytics.gender,
                      graduationYears: analytics.graduationYears
                    }}
                    reportType="General Portal Statistics"
                  />
                </div>
              </div>
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
      </main>
    </div>
  );
};

export default AdminDashboard;
