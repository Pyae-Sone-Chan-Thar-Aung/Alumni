import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { FaUsers, FaUserCheck, FaNewspaper, FaBriefcase, FaChartBar, FaClipboardList, FaUserTimes, FaClock, FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaEye, FaImage, FaPlus, FaEdit, FaTimes, FaUserPlus, FaGraduationCap, FaBuilding, FaDownload, FaLink, FaEnvelope, FaUser } from 'react-icons/fa';
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
      // Pending registrations (to enrich pending users)
      { data: pendingRegs },
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
      // Pending registrations to merge details by email
      supabase.from('pending_registrations').select('email, phone, course, batch_year, graduation_year, current_job, company, address, city, country, profile_image_url, status').eq('status', 'pending'),

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

    const pendingRegMap = new Map((pendingRegs || []).map(r => [String(r.email || '').toLowerCase().trim(), r]));
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
          const r = pendingRegMap.get(String(u.email || '').toLowerCase().trim()) || {};
          return {
            id: u.id,
            first_name: u.first_name || r.first_name || p.first_name || '',
            last_name: u.last_name || r.last_name || p.last_name || '',
            email: u.email,
            created_at: u.registration_date || u.created_at,
            program: r.course || p.course || u.course || null,
            graduation_year: r.graduation_year || p.graduation_year || null,
            current_job: r.current_job || p.current_job || null,
            company: r.company || p.company || null,
            phone: r.phone || p.phone || null,
            address: r.address || p.address || null,
            city: r.city || p.city || null,
            country: r.country || p.country || null,
            profile_image_url: r.profile_image_url || p.profile_image_url || null
          };
        });
      }
    } else {
      processedPending = (pendingUsersView || []).map(u => {
        const r = pendingRegMap.get(String(u.email || '').toLowerCase().trim()) || {};
        return {
          id: u.id,
          first_name: u.first_name || r.first_name || '',
          last_name: u.last_name || r.last_name || '',
          email: u.email,
          created_at: u.registration_date || u.user_created_at,
          program: r.course || u.course || null,
          graduation_year: r.graduation_year || u.graduation_year || null,
          current_job: r.current_job || u.current_job || null,
          company: r.company || u.company || null,
          phone: r.phone || u.phone || null,
          address: r.address || u.address || null,
          city: r.city || u.city || null,
          country: r.country || u.country || null,
          profile_image_url: r.profile_image_url || u.profile_image_url || null
        };
      });
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
        // Try to import details from pending_registrations and move image out of temp
        const moveImageFromTempToUser = async (imageUrl) => {
          try {
            if (!imageUrl) return imageUrl;
            const marker = '/object/public/alumni-profiles/';
            const idx = imageUrl.indexOf(marker);
            if (idx === -1) return imageUrl;
            const oldPath = imageUrl.substring(idx + marker.length);
            if (!oldPath.startsWith('temp/')) return imageUrl;
            const fileName = oldPath.split('/').pop();
            const newPath = `${userId}/${fileName}`;
            const { error: copyErr } = await supabase.storage
              .from('alumni-profiles')
              .copy(oldPath, newPath);
            if (copyErr) throw copyErr;
            await supabase.storage.from('alumni-profiles').remove([oldPath]).catch(() => {});
            const { data: { publicUrl } } = supabase.storage
              .from('alumni-profiles')
              .getPublicUrl(newPath);
            return publicUrl;
          } catch (e) {
            console.warn('Image move skipped:', e?.message);
            return imageUrl;
          }
        };

        try {
          let { data: pending } = await supabase
            .from('pending_registrations')
            .select('*')
            .eq('email', userRow?.email || '')
            .maybeSingle();
          if (!pending) {
            const { data: pend2 } = await supabase
              .from('pending_registrations')
              .select('*')
              .ilike('email', userRow?.email || '')
              .maybeSingle();
            pending = pend2 || null;
          }
          if (pending) {
            const imageUrl = await moveImageFromTempToUser(pending.profile_image_url);
            await supabase
              .from('user_profiles')
              .upsert({
                user_id: userId,
                first_name: userRow?.first_name || null,
                last_name: userRow?.last_name || null,
                phone: pending.phone || null,
                course: pending.course || null,
                batch_year: pending.batch_year || null,
                graduation_year: pending.graduation_year || null,
                current_job: pending.current_job || null,
                company: pending.company || null,
                address: pending.address || null,
                city: pending.city || null,
                country: pending.country || null,
                profile_image_url: imageUrl || null,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });

            await supabase
              .from('pending_registrations')
              .update({ status: 'approved', processed_at: new Date().toISOString() })
              .eq('id', pending.id);
          }
        } catch (e) {
          console.warn('Pending details import failed:', e?.message);
        }

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
      backgroundColor: [
        '#10b981', // Green for Employed
        '#f59e0b', // Orange for Self-Employed
        '#ef4444', // Red for Unemployed
        '#3b82f6'  // Blue for Graduate School
      ],
      borderColor: [
        '#059669', // Darker Green
        '#d97706', // Darker Orange
        '#dc2626', // Darker Red
        '#2563eb'  // Darker Blue
      ],
      borderWidth: 2
    }]
  };

  const genderColorMap = {
    male: '#1E90FF',   // blue
    m: '#1E90FF',
    female: '#FF69B4', // pink
    f: '#FF69B4'
  };

  const getGenderColors = (labels = []) => {
    return labels.map(lbl => genderColorMap[(lbl || '').toString().toLowerCase().trim()] || '#CBD5E1');
  };

  const genderLabels = Object.keys(analytics.gender);
  const genderValues = Object.values(analytics.gender).map(v => Math.round((v || 0) * mult));
  const genderChartData = {
    labels: genderLabels,
    datasets: [{
      data: genderValues,
      backgroundColor: getGenderColors(genderLabels),
      borderColor: getGenderColors(genderLabels).map(c => c),
      borderWidth: 2
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
      backgroundColor: cutoffYears.map((_, index) => {
        const colors = [
          '#e91e63', // UIC Pink
          '#3b82f6', // Blue
          '#10b981', // Green
          '#f59e0b', // Orange
          '#8b5cf6', // Purple
          '#ef4444', // Red
          '#06b6d4', // Cyan
          '#84cc16', // Lime
          '#f97316', // Orange Red
          '#ec4899'  // Pink
        ];
        return colors[index % colors.length];
      }),
      borderColor: cutoffYears.map((_, index) => {
        const colors = [
          '#c2185b', // Darker Pink
          '#2563eb', // Darker Blue
          '#059669', // Darker Green
          '#d97706', // Darker Orange
          '#7c3aed', // Darker Purple
          '#dc2626', // Darker Red
          '#0891b2', // Darker Cyan
          '#65a30d', // Darker Lime
          '#ea580c', // Darker Orange Red
          '#db2777'  // Darker Pink
        ];
        return colors[index % colors.length];
      }),
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
                    {['Year', 'Month'].map(r => (
                      <button key={r} className={`tab ${chartRange === r ? 'active' : ''}`} onClick={() => setChartRange(r)}>{r}</button>
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
                      <button key={r} className={`tab ${chartRange === r ? 'active' : ''}`} onClick={() => setChartRange(r)}>{r}</button>
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
                    {['5y', '10y', '20y', 'All'].map(r => (
                      <button key={r} className={`tab ${gradYearsFilter === r ? 'active' : ''}`} onClick={() => setGradYearsFilter(r)}>{r}</button>
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

              <div className="action-card utility" style={{ alignItems: 'stretch' }}>
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
              <div className="pending-modal-content">
                <div className="pending-modal-header">
                  <div className="modal-title-section">
                    <h2>Pending Registrations</h2>
                    <span className="pending-count">{pendingUsers.length} pending</span>
                  </div>
                  <button
                    className="modal-close"
                    onClick={() => setShowPendingModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="pending-modal-body">
                  {pendingUsers.length > 0 ? (
                    <div className="pending-registrations-grid">
                      {pendingUsers.map((user) => (
                        <div key={user.id} className="registration-card">
                          <div className="registration-header">
                            <div className="profile-section">
                              {user.profile_image_url ? (
                                <img
                                  src={user.profile_image_url}
                                  alt="Profile"
                                  className="profile-avatar"
                                />
                              ) : (
                                <div className="profile-placeholder">
                                  <FaUser />
                                </div>
                              )}
                              <div className="profile-info">
                                <h3 className="user-name">{user.first_name} {user.last_name}</h3>
                                <p className="user-email">{user.email}</p>
                                <span className="submission-date">
                                  Submitted {new Date(user.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="status-badge pending">
                              <FaClock />
                              Pending Review
                            </div>
                          </div>

                          <div className="registration-content">
                            <div className="info-sections">
                              <div className="info-section">
                                <h4><FaGraduationCap /> Academic Information</h4>
                                <div className="info-grid">
                                  <div className="info-item">
                                    <span className="label">Program:</span>
                                    <span className="value">{user.program || 'Not specified'}</span>
                                  </div>
                                  <div className="info-item">
                                    <span className="label">Graduation Year:</span>
                                    <span className="value">{user.graduation_year || 'Not specified'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="info-section">
                                <h4><FaBuilding /> Professional Information</h4>
                                <div className="info-grid">
                                  <div className="info-item">
                                    <span className="label">Current Job:</span>
                                    <span className="value">{user.current_job || 'Not specified'}</span>
                                  </div>
                                  <div className="info-item">
                                    <span className="label">Company:</span>
                                    <span className="value">{user.company || 'Not specified'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="info-section">
                                <h4><FaEnvelope /> Contact Information</h4>
                                <div className="info-grid">
                                  <div className="info-item">
                                    <span className="label">Phone:</span>
                                    <span className="value">{user.phone || 'Not provided'}</span>
                                  </div>
                                  <div className="info-item">
                                    <span className="label">Address:</span>
                                    <span className="value">{user.address || 'Not provided'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="registration-actions">
                            <button
                              className="action-btn approve-btn"
                              onClick={() => handleApproval(user.id, 'approve')}
                              disabled={loading}
                            >
                              <FaCheckCircle />
                              Approve
                            </button>
                            <button
                              className="action-btn reject-btn"
                              onClick={() => handleApproval(user.id, 'reject')}
                              disabled={loading}
                            >
                              <FaTimes />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-pending-state">
                      <div className="no-pending-icon">
                        <FaUser />
                      </div>
                      <h3>No Pending Registrations</h3>
                      <p>All registration requests have been processed.</p>
                    </div>
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
