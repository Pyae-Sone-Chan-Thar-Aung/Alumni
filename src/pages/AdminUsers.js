import React, { useState } from 'react';
import { FaUserCheck, FaUserTimes, FaSearch, FaFilter, FaEye } from 'react-icons/fa';
import './AdminUsers.css';

const AdminUsers = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    {
      id: 1,
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      course: 'BS Computer Science',
      batch: '2020',
      status: 'pending',
      registrationDate: '2024-01-10',
      phone: '+63 912 345 6789'
    },
    {
      id: 2,
      name: 'John Dela Cruz',
      email: 'john.delacruz@email.com',
      course: 'BS Information Technology',
      batch: '2019',
      status: 'approved',
      registrationDate: '2024-01-08',
      phone: '+63 923 456 7890'
    },
    {
      id: 3,
      name: 'Ana Rodriguez',
      email: 'ana.rodriguez@email.com',
      course: 'BS Computer Science',
      batch: '2020',
      status: 'pending',
      registrationDate: '2024-01-12',
      phone: '+63 934 567 8901'
    },
    {
      id: 4,
      name: 'Carlos Martinez',
      email: 'carlos.martinez@email.com',
      course: 'BS Information Technology',
      batch: '2018',
      status: 'approved',
      registrationDate: '2024-01-05',
      phone: '+63 945 678 9012'
    },
    {
      id: 5,
      name: 'Sofia Garcia',
      email: 'sofia.garcia@email.com',
      course: 'BS Computer Science',
      batch: '2021',
      status: 'rejected',
      registrationDate: '2024-01-15',
      phone: '+63 956 789 0123'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || user.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = (userId, newStatus) => {
    // In a real app, this would make an API call
    console.log(`Changing user ${userId} status to ${newStatus}`);
    alert(`User status updated to ${newStatus}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'warning', text: 'Pending' },
      approved: { color: 'success', text: 'Approved' },
      rejected: { color: 'danger', text: 'Rejected' }
    };
    
    const config = statusConfig[status];
    return (
      <span className={`status-badge ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="admin-users-page">
      <div className="container">
        <div className="page-header">
          <h1>User Management</h1>
          <p>Review and manage alumni registrations</p>
        </div>

        <div className="controls-section">
          <div className="search-filter">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search users by name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-dropdown">
              <FaFilter />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="users-table-container">
          <div className="table-header">
            <h3>Registration Requests ({filteredUsers.length})</h3>
          </div>
          
          <div className="users-table">
            <div className="table-row header">
              <div className="table-cell">Name</div>
              <div className="table-cell">Email</div>
              <div className="table-cell">Course</div>
              <div className="table-cell">Batch</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Registration Date</div>
              <div className="table-cell">Actions</div>
            </div>

            {filteredUsers.map(user => (
              <div key={user.id} className="table-row">
                <div className="table-cell">
                  <div className="user-info">
                    <div className="user-avatar">
                      <img src="/default-avatar.png" alt={user.name} />
                    </div>
                    <div>
                      <h4>{user.name}</h4>
                      <p>{user.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="table-cell">
                  <span className="email">{user.email}</span>
                </div>
                <div className="table-cell">
                  <span className="course">{user.course}</span>
                </div>
                <div className="table-cell">
                  <span className="batch">Batch {user.batch}</span>
                </div>
                <div className="table-cell">
                  {getStatusBadge(user.status)}
                </div>
                <div className="table-cell">
                  <span className="date">{user.registrationDate}</span>
                </div>
                <div className="table-cell">
                  <div className="action-buttons">
                    <button
                      className="btn btn-outline"
                      onClick={() => alert(`Viewing details for ${user.name}`)}
                    >
                      <FaEye />
                    </button>
                    {user.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() => handleStatusChange(user.id, 'approved')}
                        >
                          <FaUserCheck />
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleStatusChange(user.id, 'rejected')}
                        >
                          <FaUserTimes />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="no-results">
              <h3>No users found</h3>
              <p>Try adjusting your search terms or filter criteria</p>
            </div>
          )}
        </div>

        <div className="stats-summary">
          <div className="stat-item">
            <h4>Total Registrations</h4>
            <span className="stat-number">{users.length}</span>
          </div>
          <div className="stat-item">
            <h4>Pending Approval</h4>
            <span className="stat-number warning">
              {users.filter(u => u.status === 'pending').length}
            </span>
          </div>
          <div className="stat-item">
            <h4>Approved</h4>
            <span className="stat-number success">
              {users.filter(u => u.status === 'approved').length}
            </span>
          </div>
          <div className="stat-item">
            <h4>Rejected</h4>
            <span className="stat-number danger">
              {users.filter(u => u.status === 'rejected').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers; 