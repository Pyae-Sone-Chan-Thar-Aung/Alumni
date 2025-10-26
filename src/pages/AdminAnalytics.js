import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { FaChartBar, FaUsers, FaGraduationCap, FaBriefcase, FaCalendarAlt, FaDownload, FaFilter, FaEye } from 'react-icons/fa';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { toast } from 'react-toastify';
import './AdminAnalytics.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [chartRange, setChartRange] = useState('Year');
  const [gradYearsFilter, setGradYearsFilter] = useState('10y');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalAlumni: 0,
      activeUsers: 0,
      tracerResponses: 0,
      jobApplications: 0
    },
    employment: {
      employed: 0,
      unemployed: 0,
      selfEmployed: 0,
      graduateSchool: 0
    },
    demographics: {
      genderDistribution: {},
      ageGroups: {},
      graduationYears: {}
    },
    engagement: {
      loginActivity: [],
      profileCompleteness: 0,
      activeFeatures: {}
    },
    trends: {
      registrationTrends: [],
      employmentTrends: []
    }
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch overview statistics
      const [
        { count: totalAlumni },
        { count: tracerResponses },
        { data: tracerData },
        { data: userData },
        { data: registrationData }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('tracer_study_responses').select('*', { count: 'exact', head: true }),
        supabase.from('tracer_study_responses').select('*'),
        supabase.from('users').select('*'),
        supabase.from('users').select('created_at, approval_status').order('created_at', { ascending: true })
      ]);

      // Process employment data
      const employmentStats = {
        employed: 0,
        unemployed: 0,
        selfEmployed: 0,
        graduateSchool: 0
      };

      tracerData?.forEach(response => {
        const status = response.employment_status?.toLowerCase();
        if (status?.includes('employed') && !status?.includes('unemployed')) {
          if (status?.includes('self')) {
            employmentStats.selfEmployed++;
          } else {
            employmentStats.employed++;
          }
        } else if (status?.includes('unemployed')) {
          employmentStats.unemployed++;
        } else if (status?.includes('graduate') || status?.includes('school')) {
          employmentStats.graduateSchool++;
        }
      });

      // Process demographics
      const genderDistribution = {};
      const ageGroups = { '20-25': 0, '26-30': 0, '31-35': 0, '36+': 0 };
      const graduationYears = {};

      tracerData?.forEach(response => {
        // Gender distribution
        const gender = response.gender || 'Not specified';
        genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;

        // Age groups (approximate based on graduation year)
        const gradYear = response.graduation_year;
        if (gradYear) {
          const currentYear = new Date().getFullYear();
          const age = currentYear - gradYear + 22; // Assuming graduation at 22
          if (age <= 25) ageGroups['20-25']++;
          else if (age <= 30) ageGroups['26-30']++;
          else if (age <= 35) ageGroups['31-35']++;
          else ageGroups['36+']++;

          // Graduation years
          graduationYears[gradYear] = (graduationYears[gradYear] || 0) + 1;
        }
      });

      // Process registration trends
      const registrationTrends = {};
      registrationData?.forEach(user => {
        const month = new Date(user.created_at).toISOString().substring(0, 7);
        registrationTrends[month] = (registrationTrends[month] || 0) + 1;
      });

      // Calculate profile completeness
      let completeProfiles = 0;
      userData?.forEach(user => {
        if (user.first_name && user.last_name && user.email) {
          completeProfiles++;
        }
      });

      const profileCompleteness = userData?.length ? (completeProfiles / userData.length) * 100 : 0;

      setAnalytics({
        overview: {
          totalAlumni: totalAlumni || 0,
          activeUsers: userData?.filter(u => u.approval_status === 'approved').length || 0,
          tracerResponses: tracerResponses || 0,
          jobApplications: 0 // This would need a job_applications table
        },
        employment: employmentStats,
        demographics: {
          genderDistribution,
          ageGroups,
          graduationYears
        },
        engagement: {
          profileCompleteness,
          activeFeatures: {
            'Profile Updates': userData?.filter(u => u.updated_at !== u.created_at).length || 0,
            'Tracer Study': tracerResponses || 0,
            'News Views': 0 // Would need tracking
          }
        },
        trends: {
          registrationTrends: Object.entries(registrationTrends).map(([month, count]) => ({
            month,
            count
          })),
          employmentTrends: [] // Would need historical data
        }
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alumni-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics data exported successfully!');
  };

  // Chart configurations
  const employmentChartData = {
    labels: ['Employed', 'Self-Employed', 'Unemployed', 'Graduate School'],
    datasets: [{
      data: [
        analytics.employment.employed,
        analytics.employment.selfEmployed,
        analytics.employment.unemployed,
        analytics.employment.graduateSchool
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

  // --- Gender color mapping (male = blue, female = pink) ---
  const genderColorMap = {
    male: '#1E90FF',
    m: '#1E90FF',
    man: '#1E90FF',
    female: '#FF69B4',
    f: '#FF69B4',
    woman: '#FF69B4'
  };
  const getGenderColorForLabel = (label) => {
    const key = (label || '').toString().toLowerCase().trim();
    return genderColorMap[key] || '#CBD5E1'; // fallback grey
  };

  // Replace previous genderChartData with this (keeps labels order from analytics)
  const genderLabels = Object.keys(analytics.demographics.genderDistribution);
  const genderValues = Object.values(analytics.demographics.genderDistribution);
  const genderChartData = {
    labels: genderLabels,
    datasets: [{
      data: genderValues,
      backgroundColor: genderLabels.map(getGenderColorForLabel),
      borderColor: genderLabels.map(getGenderColorForLabel),
      borderWidth: 2
    }]
  };

  const sortedYears = Object.keys(analytics.demographics.graduationYears).map(Number).sort((a, b) => a - b);
  const cutoffYears = gradYearsFilter === 'All' ? sortedYears : sortedYears.slice(- (gradYearsFilter === '20y' ? 20 : gradYearsFilter === '10y' ? 10 : 5));
  const graduationYearChartData = {
    labels: cutoffYears,
    datasets: [{
      label: 'Number of Alumni',
      data: cutoffYears.map(year => analytics.demographics.graduationYears[year] || 0),
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

  const registrationTrendData = {
    labels: analytics.trends.registrationTrends.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [{
      label: 'New Registrations',
      data: analytics.trends.registrationTrends.map(item => item.count),
      borderColor: '#8B0000',
      backgroundColor: 'rgba(139, 0, 0, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-analytics loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1><FaChartBar /> Alumni Analytics & Reports</h1>
            <p>Comprehensive insights into alumni engagement and outcomes</p>
          </div>
          <div className="header-actions">
            <div className="date-filter">
              <FaFilter />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="year">Last Year</option>
                <option value="month">Last Month</option>
                <option value="week">Last Week</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={exportData}>
              <FaDownload /> Export Data
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="overview-grid">
          <div className="overview-card">
            <div className="card-icon users">
              <FaUsers />
            </div>
            <div className="card-content">
              <h3>{analytics.overview.totalAlumni.toLocaleString()}</h3>
              <p>Total Alumni</p>
              <span className="card-trend positive">
                {analytics.overview.activeUsers} active
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon responses">
              <FaGraduationCap />
            </div>
            <div className="card-content">
              <h3>{analytics.overview.tracerResponses.toLocaleString()}</h3>
              <p>Tracer Study Responses</p>
              <span className="card-trend neutral">
                {((analytics.overview.tracerResponses / analytics.overview.totalAlumni) * 100).toFixed(1)}% response rate
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon employment">
              <FaBriefcase />
            </div>
            <div className="card-content">
              <h3>{analytics.employment.employed + analytics.employment.selfEmployed}</h3>
              <p>Currently Employed</p>
              <span className="card-trend positive">
                {(((analytics.employment.employed + analytics.employment.selfEmployed) /
                  (analytics.employment.employed + analytics.employment.selfEmployed + analytics.employment.unemployed)) * 100).toFixed(1)}% employment rate
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon completeness">
              <FaEye />
            </div>
            <div className="card-content">
              <h3>{analytics.engagement.profileCompleteness.toFixed(1)}%</h3>
              <p>Profile Completeness</p>
              <span className="card-trend neutral">
                Average completion
              </span>
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

          {analytics.trends.registrationTrends.length > 0 && (
            <div className="chart-row">
              <div className="chart-container full-width">
                <div className="chart-header">
                  <h3>Registration Trends</h3>
                  <p>New alumni registrations over time</p>
                </div>
                <div className="chart-wrapper">
                  <Line data={registrationTrendData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Statistics */}
        <div className="detailed-stats">
          <div className="stats-section">
            <h3>Employment Insights</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Employment Rate</span>
                <span className="stat-value">
                  {(((analytics.employment.employed + analytics.employment.selfEmployed) /
                    Math.max(1, analytics.employment.employed + analytics.employment.selfEmployed + analytics.employment.unemployed)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Self-Employment Rate</span>
                <span className="stat-value">
                  {((analytics.employment.selfEmployed /
                    Math.max(1, analytics.employment.employed + analytics.employment.selfEmployed + analytics.employment.unemployed)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pursuing Higher Education</span>
                <span className="stat-value">{analytics.employment.graduateSchool}</span>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h3>Engagement Metrics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Profile Completion Rate</span>
                <span className="stat-value">{analytics.engagement.profileCompleteness.toFixed(1)}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tracer Study Participation</span>
                <span className="stat-value">
                  {((analytics.overview.tracerResponses / Math.max(1, analytics.overview.totalAlumni)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Users</span>
                <span className="stat-value">
                  {((analytics.overview.activeUsers / Math.max(1, analytics.overview.totalAlumni)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Age Groups */}
        <div className="age-groups-section">
          <h3>Age Distribution</h3>
          <div className="age-groups-grid">
            {Object.entries(analytics.demographics.ageGroups).map(([ageGroup, count]) => (
              <div key={ageGroup} className="age-group-item">
                <div className="age-group-bar">
                  <div
                    className="age-group-fill"
                    style={{
                      width: `${(count / Math.max(...Object.values(analytics.demographics.ageGroups))) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="age-group-info">
                  <span className="age-range">{ageGroup}</span>
                  <span className="age-count">{count} alumni</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
