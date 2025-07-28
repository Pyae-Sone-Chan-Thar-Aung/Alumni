import React, { useState, useEffect } from 'react';
import { FaUsers, FaNewspaper, FaBriefcase, FaComments, FaChartBar, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './AdminDashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 1250,
    pendingApprovals: 15,
    totalNews: 45,
    totalJobs: 89,
    activeUsers: 892,
    newRegistrations: 23
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'registration',
      user: 'Maria Santos',
      action: 'New alumni registration',
      time: '2 hours ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'news',
      user: 'Admin',
      action: 'Published new announcement',
      time: '4 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'job',
      user: 'TechCorp Inc.',
      action: 'Posted new job opportunity',
      time: '6 hours ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'registration',
      user: 'John Dela Cruz',
      action: 'New alumni registration',
      time: '1 day ago',
      status: 'pending'
    }
  ]);

  // Chart data for employment statistics
  const employmentData = {
    labels: ['Employed', 'Unemployed', 'Self-employed', 'Graduate School', 'Other'],
    datasets: [
      {
        label: 'Employment Status',
        data: [65, 12, 15, 5, 3],
        backgroundColor: [
          '#10b981',
          '#ef4444',
          '#f59e0b',
          '#3b82f6',
          '#8b5cf6'
        ],
        borderWidth: 0
      }
    ]
  };

  // Chart data for gender distribution
  const genderData = {
    labels: ['Female', 'Male'],
    datasets: [
      {
        label: 'Gender Distribution',
        data: [58, 42],
        backgroundColor: [
          '#ec4899',
          '#3b82f6'
        ],
        borderWidth: 0
      }
    ]
  };

  // Chart data for alumni by year
  const yearData = {
    labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
    datasets: [
      {
        label: 'Alumni by Graduation Year',
        data: [45, 52, 48, 61, 58, 67, 72, 89],
        backgroundColor: '#e91e63',
        borderColor: '#c2185b',
        borderWidth: 2
      }
    ]
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

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's an overview of the alumni portal</p>
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
        </div>

        <div className="dashboard-content">
          <div className="charts-section">
            <div className="chart-container">
              <h3>Alumni by Graduation Year</h3>
              <Bar data={yearData} options={chartOptions} />
            </div>

            <div className="charts-row">
              <div className="chart-container">
                <h3>Employment Status</h3>
                <Pie data={employmentData} options={pieOptions} />
              </div>

              <div className="chart-container">
                <h3>Gender Distribution</h3>
                <Pie data={genderData} options={pieOptions} />
              </div>
            </div>
          </div>

          <div className="activity-section">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'registration' && <FaUserCheck />}
                    {activity.type === 'news' && <FaNewspaper />}
                    {activity.type === 'job' && <FaBriefcase />}
                  </div>
                  <div className="activity-content">
                    <h4>{activity.user}</h4>
                    <p>{activity.action}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  <div className={`activity-status ${activity.status}`}>
                    {activity.status === 'pending' ? 'Pending' : 'Completed'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn">
              <FaNewspaper />
              <span>Post News</span>
            </button>
            <button className="action-btn">
              <FaUserCheck />
              <span>Review Registrations</span>
            </button>
            <button className="action-btn">
              <FaBriefcase />
              <span>Manage Jobs</span>
            </button>
            <button className="action-btn">
              <FaChartBar />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 