import React, { useState, useEffect } from 'react';
import { FaChartBar, FaDownload, FaEye, FaSearch, FaFilter, FaUsers, FaBriefcase, FaGraduationCap, FaFileAlt, FaCalendar, FaMapMarkerAlt, FaFilePdf, FaFileExcel, FaChartPie, FaArrowUp, FaExclamationTriangle, FaRedo, FaInbox } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import supabase from '../config/supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';
import ChatBot from '../components/Chatbot';
import { formatDate, groupBy, sortBy, filterBySearch } from '../utils';
import './AdminTracerStudy.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminTracerStudy = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [graduationYearFilter, setGraduationYearFilter] = useState('all');
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalResponses: 0,
    employmentRate: 0,
    avgSalary: '',
    topIndustries: [],
    graduationYears: [],
    jobSearchMethods: [],
    curriculumRelevance: { yes: 0, no: 0 }
  });

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch tracer study responses with user data
      const { data, error } = await supabase
        .from('tracer_study_responses')
        .select(`
          *,
          users(
            id,
            first_name,
            last_name,
            email,
            created_at
          )
        `)
        .order('updated_at', { ascending: false });

      // Debug: log counts to verify data/RLS
      console.log('[TracerStudy] fetched rows:', data?.length || 0);

      if (error) {
        console.error('Error fetching responses:', error);
        const errorMsg = 'Failed to load tracer study data. Please check your database connection and permissions.';
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      console.log('Fetched responses:', data);

      setResponses(data || []);
      generateAnalytics(data || []);

    } catch (error) {
      console.error('Unexpected error:', error);
      const errorMsg = 'Unexpected error occurred while loading data. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Alias for the error retry functionality
  const fetchTracerStudyData = fetchResponses;

  const generateAnalytics = (data) => {
    if (!data || data.length === 0) {
      setAnalytics({
        totalResponses: 0,
        employmentRate: 0,
        avgSalary: 'No data',
        topIndustries: [],
        graduationYears: [],
        jobSearchMethods: [],
        curriculumRelevance: { yes: 0, no: 0 }
      });
      return;
    }

    const employed = data.filter(r =>
      r.employment_status &&
      r.employment_status.includes('Employed') ||
      r.employment_status === 'Self-employed/Freelancer'
    );

    const employmentRate = Math.round((employed.length / data.length) * 100);

    // Top industries
    const industries = data
      .filter(r => r.industry && r.industry.trim())
      .map(r => r.industry);
    const industryCount = groupBy(industries.map(i => ({ industry: i })), 'industry');
    const topIndustries = Object.entries(industryCount)
      .map(([name, items]) => ({ name, count: items.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Graduation years
    const years = data
      .filter(r => r.graduation_year)
      .map(r => r.graduation_year.toString());
    const yearCount = groupBy(years.map(y => ({ year: y })), 'year');
    const graduationYears = Object.entries(yearCount)
      .map(([year, items]) => ({ year, count: items.length }))
      .sort((a, b) => b.year.localeCompare(a.year));

    // Job search methods
    const methods = data
      .filter(r => r.job_search_method && r.job_search_method.trim())
      .map(r => r.job_search_method);
    const methodCount = groupBy(methods.map(m => ({ method: m })), 'method');
    const jobSearchMethods = Object.entries(methodCount)
      .map(([method, items]) => ({ method, count: items.length }))
      .sort((a, b) => b.count - a.count);

    // Curriculum relevance
    const curriculumRelevance = {
      yes: data.filter(r => r.curriculum_helpful === true).length,
      no: data.filter(r => r.curriculum_helpful === false).length
    };

    setAnalytics({
      totalResponses: data.length,
      employmentRate,
      avgSalary: 'Various ranges', // Could calculate actual average if needed
      topIndustries,
      graduationYears,
      jobSearchMethods,
      curriculumRelevance
    });
  };

  const getFilteredResponses = () => {
    let filtered = responses;

    // Search filter
    if (searchTerm) {
      const searchKeys = ['full_name', 'email', 'company_name', 'job_title', 'industry'];
      filtered = filterBySearch(filtered, searchTerm, searchKeys);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(response => {
        switch (statusFilter) {
          case 'employed':
            return response.employment_status &&
              (response.employment_status.includes('Employed') ||
                response.employment_status === 'Self-employed/Freelancer');
          case 'unemployed':
            return response.employment_status === 'Unemployed';
          case 'student':
            return response.employment_status === 'Student (Graduate Studies)';
          default:
            return true;
        }
      });
    }

    // Graduation year filter
    if (graduationYearFilter !== 'all') {
      filtered = filtered.filter(response =>
        response.graduation_year &&
        response.graduation_year.toString() === graduationYearFilter
      );
    }

    return filtered;
  };

  const handleViewDetails = (response) => {
    setSelectedResponse(response);
    setShowDetailModal(true);
  };

  const exportToCSV = () => {
    const filteredData = getFilteredResponses();

    if (filteredData.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const headers = [
      'Name', 'Email', 'Phone', 'Sex', 'Civil Status', 'Address',
      'Degree', 'Major', 'Graduation Year', 'Honors',
      'Employment Status', 'Company', 'Job Title', 'Industry', 'Location', 'Salary',
      'First Job Related', 'Job Search Duration', 'Job Search Method', 'Started Job Search',
      'Curriculum Helpful', 'Important Skills', 'Additional Training',
      'Program Satisfaction', 'University Preparation', 'Recommend Program', 'Suggestions',
      'Submitted Date'
    ];

    const csvData = filteredData.map(response => [
      response.full_name || '',
      response.users?.email || '',
      response.phone || '',
      response.sex || '',
      response.civil_status || '',
      response.address || '',
      response.degree || '',
      response.major || '',
      response.graduation_year || '',
      response.honors || '',
      response.employment_status || '',
      response.company_name || '',
      response.job_title || '',
      response.industry || '',
      response.work_location || '',
      response.monthly_salary || '',
      response.first_job_related === true ? 'Yes' : response.first_job_related === false ? 'No' : '',
      response.job_search_duration || '',
      response.job_search_method || '',
      response.started_job_search || '',
      response.curriculum_helpful === true ? 'Yes' : response.curriculum_helpful === false ? 'No' : '',
      response.important_skills || '',
      response.additional_training || '',
      response.program_satisfaction || '',
      response.university_preparation || '',
      response.recommend_program === true ? 'Yes' : response.recommend_program === false ? 'No' : '',
      response.suggestions || '',
      formatDate(response.updated_at) || formatDate(response.created_at) || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row =>
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tracer-study-responses-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredData.length} responses to CSV`);
  };

  const generatePDFReport = () => {
    const filteredData = getFilteredResponses();

    if (filteredData.length === 0) {
      toast.warning('No data to export');
      return;
    }

    toast.info('Generating PDF report...');

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(139, 0, 0); // UIC Maroon
      doc.text('University of the Immaculate Conception', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(16);
      doc.text('Graduate Tracer Study Report', pageWidth / 2, 30, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 40, { align: 'center' });

      // Analytics Summary
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Analytics Summary', 20, 60);

      const summaryData = [
        ['Total Responses', analytics.totalResponses.toString()],
        ['Employment Rate', `${analytics.employmentRate}%`],
        ['Found Curriculum Helpful', analytics.curriculumRelevance.yes.toString()],
        ['Industries Represented', analytics.topIndustries.length.toString()],
        ['Report Date', new Date().toLocaleDateString()]
      ];

      autoTable(doc, {
        startY: 70,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [139, 0, 0] }
      });

      // Employment Distribution
      let currentY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.text('Employment Status Distribution', 20, currentY);

      const employmentData = [
        ['Employed (Full-time)', responses.filter(r => r.employment_status === 'Employed (Full-time)').length],
        ['Employed (Part-time)', responses.filter(r => r.employment_status === 'Employed (Part-time)').length],
        ['Self-employed/Freelancer', responses.filter(r => r.employment_status === 'Self-employed/Freelancer').length],
        ['Unemployed', responses.filter(r => r.employment_status === 'Unemployed').length],
        ['Graduate Student', responses.filter(r => r.employment_status === 'Student (Graduate Studies)').length],
        ['Other', responses.filter(r => r.employment_status === 'Not in Labor Force').length]
      ].map(([status, count]) => [status, count.toString(), `${Math.round((count / responses.length) * 100)}%`]);

      autoTable(doc, {
        startY: currentY + 10,
        head: [['Employment Status', 'Count', 'Percentage']],
        body: employmentData,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [139, 0, 0] }
      });

      // Top Industries
      currentY = doc.lastAutoTable.finalY + 20;
      if (currentY > 250) {
        doc.addPage();
        currentY = 30;
      }

      doc.setFontSize(14);
      doc.text('Top Industries', 20, currentY);

      const industryData = analytics.topIndustries.slice(0, 10).map(industry => [
        industry.name,
        industry.count.toString(),
        `${Math.round((industry.count / responses.length) * 100)}%`
      ]);

      if (industryData.length > 0) {
        autoTable(doc, {
          startY: currentY + 10,
          head: [['Industry', 'Count', 'Percentage']],
          body: industryData,
          theme: 'striped',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [139, 0, 0] }
        });
      }

      // Job Search Methods
      currentY = doc.lastAutoTable.finalY + 20;
      if (currentY > 220) {
        doc.addPage();
        currentY = 30;
      }

      doc.setFontSize(14);
      doc.text('Job Search Methods', 20, currentY);

      const methodData = analytics.jobSearchMethods.slice(0, 8).map(method => [
        method.method,
        method.count.toString(),
        `${Math.round((method.count / responses.length) * 100)}%`
      ]);

      if (methodData.length > 0) {
        autoTable(doc, {
          startY: currentY + 10,
          head: [['Method', 'Count', 'Percentage']],
          body: methodData,
          theme: 'striped',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [139, 0, 0] }
        });
      }

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `UIC Alumni Portal - Tracer Study Report - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const fileName = `UIC-Tracer-Study-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success(`PDF report generated successfully! (${filteredData.length} responses)`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report: ' + error.message);
    }
  };

  // Chart configurations
  const employmentChartData = {
    labels: ['Employed (Full-time)', 'Employed (Part-time)', 'Self-employed', 'Unemployed', 'Student', 'Other'],
    datasets: [{
      data: [
        responses.filter(r => r.employment_status === 'Employed (Full-time)').length,
        responses.filter(r => r.employment_status === 'Employed (Part-time)').length,
        responses.filter(r => r.employment_status === 'Self-employed/Freelancer').length,
        responses.filter(r => r.employment_status === 'Unemployed').length,
        responses.filter(r => r.employment_status === 'Student (Graduate Studies)').length,
        responses.filter(r => r.employment_status && !['Employed (Full-time)', 'Employed (Part-time)', 'Self-employed/Freelancer', 'Unemployed', 'Student (Graduate Studies)'].includes(r.employment_status)).length
      ],
      backgroundColor: [
        '#06d6a0', // Modern teal for full-time
        '#4ecdc4', // Light teal for part-time
        '#fb8500', // Orange for self-employed
        '#f72585', // Vibrant pink for unemployed
        '#219ebc', // Blue for students
        '#8338ec'  // Purple for other
      ],
      borderWidth: 0,
      hoverBackgroundColor: [
        '#05c296',
        '#45b7aa',
        '#ff9800',
        '#e91e63',
        '#2196f3',
        '#9c27b0'
      ]
    }]
  };

  const industryChartData = {
    labels: analytics.topIndustries.slice(0, 10).map(i => i.name),
    datasets: [{
      label: 'Number of Graduates',
      data: analytics.topIndustries.slice(0, 10).map(i => i.count),
      backgroundColor: analytics.topIndustries.slice(0, 10).map((_, index) => {
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
      borderColor: analytics.topIndustries.slice(0, 10).map((_, index) => {
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

  const pieChartOptions = {
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
      title: {
        display: false
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
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      },
      beforeDraw: function (chart) {
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
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.fillStyle = '#1f2937';
        ctx.fillText(total.toString(), centerX, centerY - 10);

        // Label
        ctx.font = '14px Inter, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('Total Responses', centerX, centerY + 15);

        ctx.restore();
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

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.8,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Top Industries',
        font: { size: 14, weight: 'bold' },
        color: '#8B0000'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  const openView = (response) => {
    setSelectedResponse(response);
    setViewModalOpen(true);
  };

  const closeView = () => {
    setViewModalOpen(false);
    setSelectedResponse(null);
  };

  // Helper function to get employment status badge color
  const getEmploymentStatusBadgeColor = (status) => {
    switch (status) {
      case 'Employed (Full-time)':
        return 'success';
      case 'Employed (Part-time)':
        return 'primary';
      case 'Self-employed/Freelancer':
        return 'info';
      case 'Student (Graduate Studies)':
        return 'warning';
      case 'Unemployed':
      case 'Not in Labor Force':
        return 'secondary';
      default:
        return 'light';
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Helper function to get response statistics
  const getResponseStats = () => {
    if (!responses || responses.length === 0) {
      return {
        total: 0,
        employed: 0,
        unemployed: 0,
        students: 0
      };
    }

    const stats = responses.reduce((acc, response) => {
      acc.total++;
      const status = response.employment_status;
      if (status?.includes('Employed') || status === 'Self-employed/Freelancer') {
        acc.employed++;
      } else if (status === 'Unemployed' || status === 'Not in Labor Force') {
        acc.unemployed++;
      } else if (status === 'Student (Graduate Studies)') {
        acc.students++;
      }
      return acc;
    }, { total: 0, employed: 0, unemployed: 0, students: 0 });

    return stats;
  };

  // Gender color mapping
  const genderColorMap = {
    male: '#1E90FF',
    m: '#1E90FF',
    female: '#FF69B4',
    f: '#FF69B4'
  };
  const getGenderColors = (labels = []) => labels.map(lbl => genderColorMap[(lbl || '').toString().toLowerCase().trim()] || '#CBD5E1');

  if (loading) {
    return <LoadingSpinner size="large" message="Loading tracer study data..." fullscreen />;
  }

  return (
    <>
      <div className="admin-tracer-study">
        <div className="container">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div className="header-content">
              <div className="header-main">
                <FaChartBar className="header-icon" />
                <div className="header-text">
                  <h1>Tracer Study Management</h1>
                  <p>Analyze graduate employment outcomes and program effectiveness</p>
                </div>
              </div>
              <div className="header-stats">
                <div className="quick-stat">
                  <FaUsers className="stat-icon" />
                  <div>
                    <span className="stat-number">{analytics.totalResponses}</span>
                    <span className="stat-label">Total Responses</span>
                  </div>
                </div>
                <div className="quick-stat">
                  <FaArrowUp className="stat-icon success" />
                  <div>
                    <span className="stat-number">{analytics.employmentRate}%</span>
                    <span className="stat-label">Employment Rate</span>
                  </div>
                </div>
              </div>
              <div className="header-actions">
                <button className="btn btn-primary" onClick={generatePDFReport}>
                  <FaFilePdf /> Tracer Report PDF
                </button>
                <button className="btn btn-success" onClick={exportToCSV}>
                  <FaFileExcel /> Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-danger mb-4" role="alert">
              <div className="d-flex align-items-center">
                <FaExclamationTriangle className="me-3 text-danger" />
                <div>
                  <h5 className="alert-heading mb-1">Error Loading Data</h5>
                  <p className="mb-0">{error}</p>
                </div>
              </div>
              <button
                className="btn btn-outline-danger btn-sm mt-3"
                onClick={() => {
                  setError('');
                  fetchTracerStudyData();
                }}
              >
                <FaRedo className="me-2" />Try Again
              </button>
            </div>
          )}

          {/* Analytics Dashboard */}
          <div className="analytics-dashboard">
            <div className="dashboard-section">
              <div className="section-header">
                <h2><FaChartPie /> Key Metrics</h2>
                <p>Overview of graduate tracer study responses and outcomes</p>
              </div>

              <div className="metrics-grid">
                <div className="metric-card primary">
                  <div className="metric-icon">
                    <FaUsers />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{analytics.totalResponses}</div>
                    <div className="metric-label">Total Responses</div>
                    <div className="metric-trend">Active alumni participation</div>
                  </div>
                </div>

                <div className="metric-card success">
                  <div className="metric-icon">
                    <FaBriefcase />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{analytics.employmentRate}%</div>
                    <div className="metric-label">Employment Rate</div>
                    <div className="metric-trend">Currently employed graduates</div>
                  </div>
                </div>

                <div className="metric-card info">
                  <div className="metric-icon">
                    <FaGraduationCap />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{analytics.curriculumRelevance.yes}</div>
                    <div className="metric-label">Curriculum Relevance</div>
                    <div className="metric-trend">Found curriculum helpful</div>
                  </div>
                </div>

                <div className="metric-card warning">
                  <div className="metric-icon">
                    <FaChartBar />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{analytics.topIndustries.length}</div>
                    <div className="metric-label">Industries</div>
                    <div className="metric-trend">Different sectors represented</div>
                  </div>
                </div>

                <div className="metric-card secondary">
                  <div className="metric-icon">
                    <FaSearch />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      {getResponseStats().employed > 0
                        ? Math.round((getResponseStats().employed / responses.length) * 100)
                        : 0}%
                    </div>
                    <div className="metric-label">Job Relevance</div>
                    <div className="metric-trend">Work related to studies</div>
                  </div>
                </div>

                <div className="metric-card info">
                  <div className="metric-icon">
                    <FaCalendar />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      {responses.length > 0
                        ? new Set(responses.map(r => r.graduation_year).filter(Boolean)).size
                        : 0}
                    </div>
                    <div className="metric-label">Graduation Years</div>
                    <div className="metric-trend">Data range coverage</div>
                  </div>
                </div>

                <div className="metric-card warning">
                  <div className="metric-icon">
                    <FaFileAlt />
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">
                      {responses.length > 0
                        ? Math.round((responses.filter(r => r.monthly_salary).length / responses.length) * 100)
                        : 0}%
                    </div>
                    <div className="metric-label">Response Rate</div>
                    <div className="metric-trend">Complete responses</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-container professional-tracer-chart">
                <h3>Employment Status Distribution</h3>
                <div className="chart-wrapper-donut">
                  <Pie data={employmentChartData} options={pieChartOptions} />
                </div>
              </div>

              <div className="chart-container">
                <div className="chart-wrapper">
                  <Bar data={industryChartData} options={barChartOptions} />
                </div>
              </div>
            </div>

            {/* Additional Analytics */}
            <div className="additional-analytics">
              <div className="chart-container">
                <h3>Curriculum Relevance Feedback</h3>
                <div className="curriculum-stats">
                  <div className="curriculum-metric positive">
                    <div className="metric-value">{analytics.curriculumRelevance.yes}</div>
                    <div className="metric-label">Found Helpful</div>
                    <div className="metric-bar">
                      <div
                        className="metric-fill"
                        style={{
                          width: `${analytics.curriculumRelevance.yes + analytics.curriculumRelevance.no > 0
                            ? (analytics.curriculumRelevance.yes / (analytics.curriculumRelevance.yes + analytics.curriculumRelevance.no)) * 100
                            : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="curriculum-metric negative">
                    <div className="metric-value">{analytics.curriculumRelevance.no}</div>
                    <div className="metric-label">Needs Improvement</div>
                    <div className="metric-bar">
                      <div
                        className="metric-fill"
                        style={{
                          width: `${analytics.curriculumRelevance.yes + analytics.curriculumRelevance.no > 0
                            ? (analytics.curriculumRelevance.no / (analytics.curriculumRelevance.yes + analytics.curriculumRelevance.no)) * 100
                            : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <h3>Job Search Success Methods</h3>
                <div className="job-methods-list">
                  {analytics.jobSearchMethods.slice(0, 5).map((method, index) => (
                    <div key={index} className="method-item">
                      <div className="method-info">
                        <span className="method-name">{method.method}</span>
                        <span className="method-count">{method.count} graduates</span>
                      </div>
                      <div className="method-progress">
                        <div
                          className="method-bar"
                          style={{
                            width: `${responses.length > 0 ? (method.count / responses.length) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-top-row">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, company, job title, or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              className="btn-download-excel"
              onClick={exportToCSV}
              title="Download Excel file with all response details"
            >
              <FaFileExcel />
              <span>Download Excel</span>
            </button>
          </div>

          <div className="filter-divider"></div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="employed">Employed</option>
                <option value="unemployed">Unemployed</option>
                <option value="student">Graduate Student</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Graduation Year</label>
              <select value={graduationYearFilter} onChange={(e) => setGraduationYearFilter(e.target.value)}>
                <option value="all">All Years</option>
                {analytics.graduationYears.map(({ year }) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Responses Table */}
        <div className="responses-section">
          <div className="section-header">
            <h3>Graduate Responses ({getFilteredResponses().length})</h3>
          </div>

          <div className="responses-table">
            <div className="table-header" role="row">
              <div>Graduate</div>
              <div>Program</div>
              <div>Employment</div>
              <div>Company</div>
              <div>Location</div>
              <div>Submitted</div>
              <div>Actions</div>
            </div>

            <div className="table-body" role="rowgroup">
              {getFilteredResponses().map(response => {
                const fullName = response.full_name || `${response.users?.first_name || ''} ${response.users?.last_name || ''}`.trim() || 'N/A';
                const email = response.email || response.users?.email || 'N/A';
                const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'NA';
                const submittedDate = response.updated_at || response.created_at;

                return (
                  <div className="table-row" role="row" key={response.id}>
                    {/* Graduate Column */}
                    <div className="graduate-info">
                      <div className="name">{fullName}</div>
                      <div className="sub">{email}</div>
                      {response.phone && <div className="phone">{response.phone}</div>}
                    </div>

                    {/* Program Column */}
                    <div className="program-info">
                      <strong>{response.major || response.degree || '—'}</strong>
                      <p>{response.degree || '—'}</p>
                      <div className="year">Class of {response.graduation_year || 'N/A'}</div>
                    </div>

                    {/* Employment Column */}
                    <div className="employment-info">
                      <div className={`status-badge badge bg-${getEmploymentStatusBadgeColor(response.employment_status)}`}>
                        {response.employment_status || 'Not specified'}
                      </div>
                      {response.job_title && (
                        <div className="job-title">{response.job_title}</div>
                      )}
                      {response.monthly_salary && (
                        <div className="salary">{response.monthly_salary}</div>
                      )}
                    </div>

                    {/* Company Column */}
                    <div className="company-info">
                      <strong>{response.company_name || '—'}</strong>
                      {response.industry && <p>{response.industry}</p>}
                    </div>

                    {/* Location Column */}
                    <div className="location-info">
                      <FaMapMarkerAlt />
                      <span>{response.work_location || response.address || '—'}</span>
                    </div>

                    {/* Submitted Date Column */}
                    <div className="date-info">
                      <FaCalendar />
                      <span>{submittedDate ? formatDate(submittedDate) : '—'}</span>
                    </div>

                    {/* Actions Column */}
                    <div className="col-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => handleViewDetails(response)}
                        title="View full response"
                      >
                        <FaEye /> View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {getFilteredResponses().length === 0 && !loading && !error && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FaInbox />
              </div>
              <h3>No tracer study responses found</h3>
              {searchTerm || statusFilter !== 'all' || graduationYearFilter !== 'all' ? (
                <>
                  <p>No results match your current search criteria.</p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setGraduationYearFilter('all');
                    }}
                  >
                    Clear Filters
                  </button>
                </>
              ) : responses.length === 0 ? (
                <>
                  <p>No tracer study responses have been submitted yet.</p>
                  <p className="text-muted">Encourage graduates to complete the tracer study survey to populate this dashboard.</p>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedResponse && (
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Graduate Response Details</h2>
                <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
              </div>

              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-section">
                    <h3>Personal Information</h3>
                    <div className="detail-row">
                      <label>Name:</label>
                      <span>{selectedResponse.full_name}</span>
                    </div>
                    <div className="detail-row">
                      <label>Email:</label>
                      <span>{selectedResponse.users?.email || selectedResponse.email}</span>
                    </div>
                    <div className="detail-row">
                      <label>Phone:</label>
                      <span>{selectedResponse.phone}</span>
                    </div>
                    <div className="detail-row">
                      <label>Address:</label>
                      <span>{selectedResponse.address}</span>
                    </div>
                    <div className="detail-row">
                      <label>Sex:</label>
                      <span>{selectedResponse.sex}</span>
                    </div>
                    <div className="detail-row">
                      <label>Civil Status:</label>
                      <span>{selectedResponse.civil_status}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Education</h3>
                    <div className="detail-row">
                      <label>Degree:</label>
                      <span>{selectedResponse.degree}</span>
                    </div>
                    <div className="detail-row">
                      <label>Major:</label>
                      <span>{selectedResponse.major}</span>
                    </div>
                    <div className="detail-row">
                      <label>Graduation Year:</label>
                      <span>{selectedResponse.graduation_year}</span>
                    </div>
                    <div className="detail-row">
                      <label>Honors:</label>
                      <span>{selectedResponse.honors || 'None'}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Employment</h3>
                    <div className="detail-row">
                      <label>Status:</label>
                      <span>{selectedResponse.employment_status}</span>
                    </div>
                    <div className="detail-row">
                      <label>Company:</label>
                      <span>{selectedResponse.company_name}</span>
                    </div>
                    <div className="detail-row">
                      <label>Job Title:</label>
                      <span>{selectedResponse.job_title}</span>
                    </div>
                    <div className="detail-row">
                      <label>Industry:</label>
                      <span>{selectedResponse.industry}</span>
                    </div>
                    <div className="detail-row">
                      <label>Location:</label>
                      <span>{selectedResponse.work_location}</span>
                    </div>
                    <div className="detail-row">
                      <label>Salary:</label>
                      <span>{selectedResponse.monthly_salary}</span>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Career Path</h3>
                    <div className="detail-row">
                      <label>First job related to course:</label>
                      <span>{selectedResponse.first_job_related === true ? 'Yes' : selectedResponse.first_job_related === false ? 'No' : 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Job search duration:</label>
                      <span>{selectedResponse.job_search_duration}</span>
                    </div>
                    <div className="detail-row">
                      <label>How found job:</label>
                      <span>{selectedResponse.job_search_method}</span>
                    </div>
                    <div className="detail-row">
                      <label>Started job search:</label>
                      <span>{selectedResponse.started_job_search}</span>
                    </div>
                    <div className="detail-row">
                      <label>Curriculum helpful:</label>
                      <span>{selectedResponse.curriculum_helpful === true ? 'Yes' : selectedResponse.curriculum_helpful === false ? 'No' : 'N/A'}</span>
                    </div>
                  </div>

                  {(selectedResponse.important_skills || selectedResponse.additional_training || selectedResponse.suggestions) && (
                    <div className="detail-section full-width">
                      <h3>Feedback & Skills</h3>
                      {selectedResponse.important_skills && (
                        <div className="detail-row">
                          <label>Important skills from UIC:</label>
                          <div className="text-content">{selectedResponse.important_skills}</div>
                        </div>
                      )}
                      {selectedResponse.additional_training && (
                        <div className="detail-row">
                          <label>Additional training needed:</label>
                          <div className="text-content">{selectedResponse.additional_training}</div>
                        </div>
                      )}
                      {selectedResponse.suggestions && (
                        <div className="detail-row">
                          <label>Suggestions for program improvement:</label>
                          <div className="text-content">{selectedResponse.suggestions}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Modal - Simplified for quick viewing */}
        {viewModalOpen && selectedResponse && (
          <div className="modal-overlay" onClick={() => setViewModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedResponse.full_name || `${selectedResponse.users?.first_name || ''} ${selectedResponse.users?.last_name || ''}`.trim() || 'Graduate Response'}</h3>
                <button className="modal-close" onClick={() => setViewModalOpen(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-section">
                    <h4>Basic Information</h4>
                    <div className="detail-row">
                      <label>Email:</label>
                      <span>{selectedResponse.email || selectedResponse.users?.email || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Phone:</label>
                      <span>{selectedResponse.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Employment Status:</label>
                      <span className={`status-badge badge bg-${getEmploymentStatusBadgeColor(selectedResponse.employment_status)}`}>
                        {selectedResponse.employment_status || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  <div className="detail-section">
                    <h4>Education & Career</h4>
                    <div className="detail-row">
                      <label>Program:</label>
                      <span>{selectedResponse.major || selectedResponse.degree || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Graduation Year:</label>
                      <span>{selectedResponse.graduation_year || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Company:</label>
                      <span>{selectedResponse.company_name || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Job Title:</label>
                      <span>{selectedResponse.job_title || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => {
                  setViewModalOpen(false);
                  setShowDetailModal(true);
                }}>
                  View Full Details
                </button>
                <button className="btn btn-outline" onClick={() => setViewModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Chatbot for Tracer Study Insights */}
      <ChatBot tracerStudyData={responses} />
    </>
  );
};


export default AdminTracerStudy;
