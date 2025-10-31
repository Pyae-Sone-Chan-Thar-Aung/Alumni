import React, { useEffect, useState } from 'react';
import { FaUserCheck, FaUserTimes, FaSearch, FaEye, FaDownload, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './AdminUsers.css';
import { supabase } from '../config/supabaseClient';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 10;

  // Fetch users - using the original working approach
  const fetchUsers = async () => {
    try {
      console.log('🔍 Starting to fetch users for admin dashboard...');
      
      // Try to use the user management view first
      let { data: usersData, error: usersError } = await supabase
        .from('user_management_view')
        .select('*')
        .order('user_created_at', { ascending: false });
      
      // If view doesn't exist, fall back to direct table query
      if (usersError && usersError.message.includes('user_management_view')) {
        console.log('🔄 user_management_view not found, using direct table query...');
        usersError = null;
      }
      
      console.log('📊 Users query result:', { data: usersData, error: usersError });
      
      if (usersError) {
        console.error('❌ Error fetching users:', usersError);
        
        // Fallback to direct table query
        console.log('🔄 Trying fallback query...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('users')
          .select(`
            *,
            user_profiles (
              phone,
              mobile,
              program,
              batch_year,
              graduation_year,
              current_job_title,
              current_company,
              address,
              city,
              country,
              profile_image_url
            )
          `)
          .order('created_at', { ascending: false });
        
        if (fallbackError) {
          console.error('❌ Fallback query also failed:', fallbackError);
          toast.error('Failed to fetch users. Please check database connection.');
          return;
        }
        
        // Process fallback data
        const processedUsers = (fallbackData || []).map(u => {
          const profile = u.user_profiles?.[0] || {};
          console.log('🔍 Processing fallback user:', {
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
            email: u.email,
            course: profile.program,
            profileImage: profile.profile_image_url
          });
          
          return {
            id: u.id,
            firstName: u.first_name || '',
            lastName: u.last_name || '',
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || '—',
            email: u.email || '—',
            course: profile.program || '—',
            batch: profile.batch_year || '—',
            graduationYear: profile.graduation_year || '—',
            status: u.approval_status || (u.is_verified ? 'approved' : 'pending'),
            joinedDate: u.created_at?.slice(0, 10) || '—',
            phone: profile.phone || profile.mobile || '—',
            address: profile.address || '—',
            city: profile.city || '—',
            country: profile.country || '—',
            currentJob: profile.current_job_title || '—',
            company: profile.current_company || '—',
            profileImage: profile.profile_image_url || null,
            role: u.role || 'alumni',
            isVerified: u.is_verified || false,
          };
        });
        
        console.log(`📋 Processed ${processedUsers.length} users from fallback`);
        setUsers(processedUsers);
        return;
      }
      
      if (!usersData || usersData.length === 0) {
        console.warn('⚠️ No users found in database');
        toast.info('No users found in the database');
        setUsers([]);
        return;
      }
      
      // Process view data
      const processedUsers = usersData.map(u => {
        console.log('🔍 Processing user:', {
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
          email: u.email,
          course: u.course || u.program,
          profileImage: u.profile_image_url
        });
        
        return {
          id: u.id,
          firstName: u.first_name || '',
          lastName: u.last_name || '',
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || '—',
          email: u.email || '—',
          course: u.course || u.program || '—',
          batch: u.batch_year || '—',
          graduationYear: u.graduation_year || '—',
          status: u.approval_status || (u.is_verified ? 'approved' : 'pending'),
          joinedDate: u.user_created_at?.slice(0, 10) || '—',
          phone: u.phone || '—',
          address: u.address || '—',
          city: u.city || '—',
          country: u.country || '—',
          currentJob: u.current_job || '—',
          company: u.company || '—',
          profileImage: u.profile_image_url || null,
          role: u.role || 'alumni',
          isVerified: u.is_verified || false,
        };
      });
      
      console.log(`✅ Found ${usersData.length} users`);
      console.log(`📋 Final processed users:`, processedUsers);
      setUsers(processedUsers);
      
    } catch (error) {
      console.error('❌ Unexpected error fetching users:', error);
      toast.error('An unexpected error occurred while fetching users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Get user initials
  const getUserInitials = (firstName, lastName, email) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (email) return email.charAt(0).toUpperCase();
    return 'U';
  };

  // Filter and search
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter]);

  // Handle status change
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          approval_status: newStatus,
          is_verified: newStatus === 'approved',
          approved_at: newStatus === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ));

      const user = users.find(u => u.id === userId);
      if (newStatus === 'approved') {
        toast.success(`✅ ${user?.name || 'User'} has been approved!`);
      } else {
        toast.success(`❌ ${user?.name || 'User'} has been rejected.`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Export CSV with complete data
  const exportToCSV = () => {
    if (filteredUsers.length === 0) {
      toast.warn('No users to export');
      return;
    }

    const headers = [
      'Full Name',
      'First Name', 
      'Last Name',
      'Email',
      'Phone',
      'Status',
      'Role',
      'Verified',
      'Joined Date',
      'Course/Program',
      'Batch Year',
      'Graduation Year',
      'Current Job',
      'Company',
      'Address',
      'City',
      'Country'
    ];
    
    const csvData = filteredUsers.map(user => [
      user.name,
      user.firstName,
      user.lastName,
      user.email,
      user.phone,
      user.status === 'approved' ? 'Active' : user.status === 'rejected' ? 'Banned' : user.status,
      user.role === 'admin' || user.role === 'super_admin' ? 'Admin' : 'User',
      user.isVerified ? 'Yes' : 'No',
      user.joinedDate,
      user.course,
      user.batch,
      user.graduationYear,
      user.currentJob,
      user.company,
      user.address,
      user.city,
      user.country
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${String(field || 'N/A').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `CCS_Alumni_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredUsers.length} users successfully!`);
  };

  return (
    <div className="admin-layout">
      <main className="admin-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="breadcrumbs">
            <span className="current">User Management</span>
          </div>
        </div>

        {/* Controls: Search & Filters on left, Export on right */}
        <div className="controls-bar">
          <div className="controls-left">
            <div className="search-control">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, email, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Active</option>
              <option value="rejected">Banned</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="alumni">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="export-btn" onClick={exportToCSV}>
            <FaDownload /> Export CSV
          </button>
        </div>

        {/* Users Table */}
        <div className="users-section">
          <div className="section-header">
            <h3>Users</h3>
            <span className="user-count">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </span>
          </div>

          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Course</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(user => (
                  <tr key={user.id}>
                    <td className="name-cell">
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} />
                          ) : (
                            <div className="avatar-placeholder">
                              {getUserInitials(user.firstName, user.lastName, user.email)}
                            </div>
                          )}
                        </div>
                        <span className="user-name">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {user.status === 'approved' ? 'ACTIVE' : 
                         user.status === 'rejected' ? 'BANNED' : 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' || user.role === 'super_admin' ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td>{user.joinedDate}</td>
                    <td>{user.course}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-icon-btn view"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          className="action-icon-btn approve"
                          onClick={() => handleStatusChange(user.id, 'approved')}
                          disabled={user.status !== 'pending'}
                          title="Approve User"
                        >
                          <FaUserCheck />
                        </button>
                        <button
                          className="action-icon-btn reject"
                          onClick={() => handleStatusChange(user.id, 'rejected')}
                          disabled={user.status !== 'pending'}
                          title="Reject User"
                        >
                          <FaUserTimes />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="empty-state">
                <p>No users found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="user-details-modal" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="user-details-header">
                <div className="header-profile">
                  <div className="header-avatar">
                    {selectedUser.profileImage ? (
                      <img src={selectedUser.profileImage} alt={selectedUser.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {getUserInitials(selectedUser.firstName, selectedUser.lastName, selectedUser.email)}
                      </div>
                    )}
                  </div>
                  <div className="header-info">
                    <h2>{selectedUser.name}</h2>
                    <p className="user-email">{selectedUser.email}</p>
                  </div>
                </div>
                <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                  <FaTimes />
                </button>
              </div>

              {/* Body */}
              <div className="user-details-body">
                <div className="detail-section">
                  <h3>Personal Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">{selectedUser.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedUser.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{selectedUser.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{selectedUser.address}, {selectedUser.city}, {selectedUser.country}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Academic Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Course/Program</span>
                    <span className="detail-value">{selectedUser.course}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Batch Year</span>
                    <span className="detail-value">{selectedUser.batch}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Graduation Year</span>
                    <span className="detail-value">{selectedUser.graduationYear}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Employment Information</h3>
                  <div className="detail-row">
                    <span className="detail-label">Current Position</span>
                    <span className="detail-value">{selectedUser.currentJob}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Company</span>
                    <span className="detail-value">{selectedUser.company}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Account Status</h3>
                  <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">
                      {selectedUser.status === 'approved' ? 'Active' : 
                       selectedUser.status === 'rejected' ? 'Banned' : 'Pending'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role</span>
                    <span className="detail-value">
                      {selectedUser.role === 'admin' || selectedUser.role === 'super_admin' ? 'Admin' : 'User'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Joined</span>
                    <span className="detail-value">{selectedUser.joinedDate}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              {selectedUser.status === 'pending' && (
                <div className="user-details-footer">
                  <button
                    className="btn-approve-large"
                    onClick={() => {
                      handleStatusChange(selectedUser.id, 'approved');
                      setShowModal(false);
                    }}
                  >
                    <FaUserCheck /> Approve Account
                  </button>
                  <button
                    className="btn-reject-large"
                    onClick={() => {
                      handleStatusChange(selectedUser.id, 'rejected');
                      setShowModal(false);
                    }}
                  >
                    <FaUserTimes /> Reject Account
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;
