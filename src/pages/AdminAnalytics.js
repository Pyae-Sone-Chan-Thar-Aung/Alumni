import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { FaChartBar, FaUsers, FaGraduationCap, FaBriefcase, FaCalendarAlt, FaDownload, FaFilter, FaEye } from 'react-icons/fa';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import './AdminAnalytics.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [chartRange, setChartRange] = useState('Year');
  const [distributionView, setDistributionView] = useState('Employment'); // 'Employment' | 'Gender' | 'Graduate School'
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
      selfEmployed: 0
    },
    graduateSchool: {
      masters: 0,
      doctorate: 0,
      notPursuing: 0
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

      // Fetch overview statistics - make queries resilient
      const results = await Promise.allSettled([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('tracer_study_responses').select('*', { count: 'exact', head: true }),
        supabase.from('tracer_study_responses').select('*'),
        supabase.from('users').select('*'),
        supabase.from('users').select('created_at, approval_status').order('created_at', { ascending: true }),
        supabase.from('user_profiles').select('graduation_year')
      ]);

      // Extract data safely from Promise.allSettled results
      const { count: totalAlumni = 0 } = results[0].status === 'fulfilled' ? results[0].value : {};
      const { count: tracerResponses = 0 } = results[1].status === 'fulfilled' ? results[1].value : {};
      const { data: tracerData = [] } = results[2].status === 'fulfilled' ? results[2].value : {};
      const { data: userData = [] } = results[3].status === 'fulfilled' ? results[3].value : {};
      const { data: registrationData = [] } = results[4].status === 'fulfilled' ? results[4].value : {};
      const { data: profilesData = [] } = results[5].status === 'fulfilled' ? results[5].value : {};

      // Log any failed queries (non-critical)
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const queryNames = ['users count', 'tracer count', 'tracer data', 'users data', 'registration data', 'user profiles'];
          console.warn(`Query ${queryNames[index]} failed:`, result.reason);
        }
      });

      // Process employment data
      const employmentStats = {
        employed: 0,
        unemployed: 0,
        selfEmployed: 0
      };

      const graduateSchoolStats = {
        masters: 0,
        doctorate: 0,
        notPursuing: 0
      };

      tracerData?.forEach(response => {
        const status = response.employment_status?.toLowerCase();
        // Employment status (excluding graduate school)
        if (status?.includes('employed') && !status?.includes('unemployed') && !status?.includes('graduate')) {
          if (status?.includes('self')) {
            employmentStats.selfEmployed++;
          } else {
            employmentStats.employed++;
          }
        } else if (status?.includes('unemployed')) {
          employmentStats.unemployed++;
        }

        // Graduate School tracking - Check BOTH new fields AND old employment_status for backward compatibility
        let graduateSchoolCounted = false;
        
        // First, check the new dedicated fields (if they exist and are set)
        if (response.pursuing_further_education === true) {
          const eduType = (response.further_education_type || '').toLowerCase();
          if (eduType.includes('masters')) {
            graduateSchoolStats.masters++;
          } else if (eduType.includes('doctorate') || eduType.includes('phd')) {
            graduateSchoolStats.doctorate++;
          } else {
            // Has pursuing_further_education but no specific type - default to masters
            graduateSchoolStats.masters++;
          }
          graduateSchoolCounted = true;
        } 
        // Backward compatibility: Check employment_status for graduate school indicators
        else if (status?.includes('graduate') || status?.includes('student')) {
          // Check if it's specifically graduate studies
          if (status.includes('masters') || status.includes('master')) {
            graduateSchoolStats.masters++;
          } else if (status.includes('doctorate') || status.includes('phd') || status.includes('doctoral')) {
            graduateSchoolStats.doctorate++;
          } else if (status.includes('graduate')) {
            // Generic "graduate studies" - default to masters
            graduateSchoolStats.masters++;
          }
          graduateSchoolCounted = true;
        }
        
        // Only count as "Not Pursuing" if we have explicit data saying so
        if (!graduateSchoolCounted && response.pursuing_further_education === false) {
          graduateSchoolStats.notPursuing++;
        }
        // If pursuing_further_education is null/undefined and no graduate status in employment, don't count
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

      // Merge graduation years from user profiles to reflect total alumni distribution
      profilesData?.forEach(p => {
        if (p?.graduation_year) {
          graduationYears[p.graduation_year] = (graduationYears[p.graduation_year] || 0) + 1;
        }
      });

      // Also check userData for graduation_year as fallback
      userData?.forEach(user => {
        if (user?.graduation_year) {
          graduationYears[user.graduation_year] = (graduationYears[user.graduation_year] || 0) + 1;
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
          totalAlumni: totalAlumni,
          activeUsers: userData?.filter(u => u.approval_status === 'approved').length || 0,
          tracerResponses: tracerResponses,
          jobApplications: 0 // This would need a job_applications table
        },
        employment: employmentStats,
        graduateSchool: graduateSchoolStats,
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

  const exportData = async () => {
    try {
      toast.info('Preparing export data...');

      // Fetch alumni data with their addresses and phone numbers - same as Admin Dashboard
      const [{ data: users }, { data: profiles }] = await Promise.all([
        supabase.from('users').select('*').order('last_name', { ascending: true }),
        supabase.from('user_profiles').select('*')
      ]);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      // Prepare data for Excel export - merge user and profile data
      const excelData = (users || []).map((u, index) => {
        const p = profileMap.get(u.id) || {};
        return {
          'No.': index + 1,
          'ID': u.id,
          'First Name': u.first_name || '',
          'Last Name': u.last_name || '',
          'Email': u.email || '',
          'Phone Number': p.phone || u.phone || '',
          'Address': p.address || u.address || '',
          'City': p.city || '',
          'Country': p.country || '',
          'Role': u.role || 'alumni',
          'Status': u.approval_status || '',
          'Course': p.course || u.course || '',
          'Graduation Year': p.graduation_year || u.graduation_year || '',
          'Batch Year': p.batch_year || '',
          'Current Job': p.current_job || '',
          'Company': p.company || '',
          'Registered At': u.registration_date || u.created_at ? new Date(u.registration_date || u.created_at).toLocaleDateString() : ''
        };
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths - same as Admin Dashboard
      worksheet['!cols'] = [
        { wch: 5 },  // No.
        { wch: 35 }, // ID
        { wch: 15 }, // First Name
        { wch: 15 }, // Last Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone Number
        { wch: 40 }, // Address
        { wch: 15 }, // City
        { wch: 15 }, // Country
        { wch: 10 }, // Role
        { wch: 12 }, // Status
        { wch: 25 }, // Course
        { wch: 15 }, // Graduation Year
        { wch: 15 }, // Batch Year
        { wch: 25 }, // Current Job
        { wch: 25 }, // Company
        { wch: 15 }  // Registered At
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumni Data');

      // Generate Excel file and trigger download
      const fileName = `alumni-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success('Alumni data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  // Chart configurations
  // Match AdminDashboard pie/doughnut styling
  const employmentChartData = {
    labels: ['Employed', 'Self-Employed', 'Unemployed'],
    datasets: [{
      data: [
        analytics.employment.employed,
        analytics.employment.selfEmployed,
        analytics.employment.unemployed
      ],
      backgroundColor: [
        '#10B981', // Soft teal-green for Employed
        '#6EE7B7', // Light mint for Self-Employed
        '#FCA5A5'  // Soft coral for Unemployed
      ],
      borderColor: [
        'rgba(16, 185, 129, 0.1)',
        'rgba(110, 231, 183, 0.1)',
        'rgba(252, 165, 165, 0.1)'
      ],
      borderWidth: 0
    }]
  };

  const graduateSchoolChartData = {
    labels: ['Master\'s Degree', 'Doctorate/PhD', 'Not Pursuing'],
    datasets: [{
      data: [
        analytics.graduateSchool.masters,
        analytics.graduateSchool.doctorate,
        analytics.graduateSchool.notPursuing
      ],
      backgroundColor: [
        '#8B5CF6', // Purple for Master's
        '#EC4899', // Pink for Doctorate
        '#94A3B8'  // Gray for Not Pursuing
      ],
      borderColor: [
        'rgba(139, 92, 246, 0.1)',
        'rgba(236, 72, 153, 0.1)',
        'rgba(148, 163, 184, 0.1)'
      ],
      borderWidth: 0
    }]
  };

  // --- Gender color mapping (male = blue, female = pink) ---
  const genderColorMap = { male: '#4A90E2', m: '#4A90E2', female: '#A78BFA', f: '#A78BFA' };
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
      borderColor: genderLabels.map(() => 'rgba(255, 255, 255, 0.3)'),
      borderWidth: 0
    }]
  };

  const sortedYears = Object.keys(analytics.demographics.graduationYears).map(Number).sort((a, b) => a - b);
  const cutoffYears = gradYearsFilter === 'All' ? sortedYears : sortedYears.slice(- (gradYearsFilter === '20y' ? 20 : gradYearsFilter === '10y' ? 10 : 5));
  const graduationYearChartData = {
    labels: cutoffYears,
    datasets: [{
      label: 'Alumni (by Grad Year)',
      data: cutoffYears.map(year => analytics.demographics.graduationYears[year] || 0),
      backgroundColor: cutoffYears.map((_, index) => {
        const colors = ['#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'];
        return colors[index % colors.length];
      }),
      borderColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 0
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
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 12,
          font: { size: 11, family: 'Inter, sans-serif', weight: 500 },
          color: '#6B7280'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: { animateRotate: true, animateScale: true, duration: 600, easing: 'easeInOutQuart' }
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
              <p>Total Alumni</p>
              <h3>{analytics.overview.totalAlumni.toLocaleString()}</h3>
              <span className="card-trend positive">
                {analytics.overview.activeUsers} Active
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon responses">
              <FaGraduationCap />
            </div>
            <div className="card-content">
              <p>Tracer Study Responses</p>
              <h3>{analytics.overview.tracerResponses.toLocaleString()}</h3>
              <span className="card-trend neutral">
                {((analytics.overview.tracerResponses / analytics.overview.totalAlumni) * 100).toFixed(1)}% Rate
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon employment">
              <FaBriefcase />
            </div>
            <div className="card-content">
              <p>Currently Employed</p>
              <h3>{analytics.employment.employed + analytics.employment.selfEmployed}</h3>
              <span className="card-trend positive">
                {analytics.employment.employed + analytics.employment.selfEmployed + analytics.employment.unemployed > 0 
                  ? (((analytics.employment.employed + analytics.employment.selfEmployed) /
                      (analytics.employment.employed + analytics.employment.selfEmployed + analytics.employment.unemployed)) * 100).toFixed(1)
                  : 0}% Rate
              </span>
            </div>
          </div>

          <div className="overview-card">
            <div className="card-icon completeness">
              <FaEye />
            </div>
            <div className="card-content">
              <p>Profile Completeness</p>
              <h3>{analytics.engagement.profileCompleteness.toFixed(1)}%</h3>
              <span className="card-trend neutral">
                Avg Completion
              </span>
            </div>
          </div>
        </div>

        {/* Side-by-side charts */}
        <div className="chart-row">
        {/* Alumni Distribution - Merged Chart with Toggle */}
        <div className="powerbi-card">
          <div className="powerbi-card-header">
            <div className="chart-header-left">
              <h3>Alumni Distribution</h3>
              <p className="card-subtitle">View alumni data by category</p>
            </div>
            <div className="distribution-toggle">
              {['Employment', 'Gender', 'Graduate School'].map(view => (
                <button 
                  key={view} 
                  className={`toggle-btn ${distributionView === view ? 'active' : ''}`} 
                  onClick={() => setDistributionView(view)}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
          <div className="powerbi-card-body">
            <div className="chart-wrapper" style={{ height: 280 }}>
              <Doughnut 
                data={
                  distributionView === 'Employment' 
                    ? employmentChartData 
                    : distributionView === 'Gender'
                    ? genderChartData
                    : graduateSchoolChartData
                } 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'bottom',
                      labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 12,
                        font: {
                          size: 11,
                          family: 'Inter, sans-serif',
                          weight: 500
                        },
                        color: '#6B7280'
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      titleColor: '#374151',
                      bodyColor: '#6B7280',
                      borderColor: '#E5E7EB',
                      borderWidth: 1,
                      padding: 10,
                      displayColors: true,
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  },
                  animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 600,
                    easing: 'easeInOutQuart'
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Graduation Year Bar Chart */}
        <div className="powerbi-card">
          <div className="powerbi-card-header">
            <h3><FaGraduationCap /> Alumni by Graduation Year</h3>
            <div className="chart-range">
              {['5y', '10y', '20y', 'All'].map(r => (
                <button key={r} className={`tab ${gradYearsFilter === r ? 'active' : ''}`} onClick={() => setGradYearsFilter(r)}>{r}</button>
              ))}
            </div>
          </div>
          <div className="powerbi-card-body">
            <div className="chart-wrapper" style={{ height: 280 }}>
              <Bar data={graduationYearChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        </div>

        {/* Registration Trends removed per request */}

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
                <span className="stat-value">{analytics.graduateSchool.masters + analytics.graduateSchool.doctorate}</span>
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
