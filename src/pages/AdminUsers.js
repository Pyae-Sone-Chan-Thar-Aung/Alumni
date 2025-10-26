import React, { useEffect, useState } from 'react';
import { FaUserCheck, FaUserTimes, FaSearch, FaFilter, FaEye, FaUser, FaEnvelope, FaPhone, FaBuilding, FaGraduationCap, FaCalendar, FaTimes, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './AdminUsers.css';
import { supabase } from '../config/supabaseClient';

const AdminUsers = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Helper function to get user initials for avatar
  const getUserInitials = (firstName, lastName, email) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('🔍 Starting to fetch users for admin dashboard...');
        
        // Try to use the user management view first
        let { data: usersData, error: usersError } = await supabase
          .from('user_management_view')
          .select('*')
          .order('user_created_at', { ascending: false });
        
        // If view doesn't exist, fall back to direct table query immediately
        if (usersError && usersError.message.includes('user_management_view')) {
          console.log('🔄 user_management_view not found, using direct table query...');
          usersError = null; // Clear the error to proceed with fallback
        }
        
        console.log('📊 Users query result:', { data: usersData, error: usersError });
        
        if (usersError) {
          console.error('❌ Error fetching users:', usersError);
          
          // Fallback to direct table query if view doesn't exist
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
          
          // Process fallback data with proper placeholders
          const processedUsers = (fallbackData || []).map(u => {
            const profile = u.user_profiles?.[0] || {};
            console.log('🔍 Processing fallback user:', {
              name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
              email: u.email,
              course: profile.program,
              profileImage: profile.profile_image_url,
              profileData: profile,
              userData: u
            });
            
            return {
              id: u.id,
              firstName: u.first_name || '',
              lastName: u.last_name || '',
              name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || '—',
              email: u.email || '—',
              course: profile.program || '—',  // 'program' in database
              batch: profile.batch_year || '—',
              graduationYear: profile.graduation_year || '—',
              status: u.approval_status || (u.is_verified ? 'approved' : 'pending'),
              registrationDate: u.registration_date?.slice(0,10) || u.created_at?.slice(0,10) || '—',
              joinedDate: u.created_at?.slice(0,10) || '—',
              lastActive: u.last_login?.slice(0,10) || 'Never',
              phone: profile.phone || profile.mobile || '—',  // Use phone or mobile
              address: profile.address || '—',
              city: profile.city || '—',
              country: profile.country || '—',
              currentJob: profile.current_job_title || '—',
              company: profile.current_company || '—',
              profileImage: profile.profile_image_url || null,
              role: u.role || 'alumni',
              isVerified: u.is_verified || false,
              isActive: u.is_active !== false,
              approvedAt: u.approved_at,
              bio: profile.bio || ''
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
        
        // Process view data with proper placeholders
        const processedUsers = usersData.map(u => {
          console.log('🔍 Processing user:', {
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
            email: u.email,
            course: u.course || u.program,
            profileImage: u.profile_image_url,
            rawData: u
          });
          
          return {
            id: u.id,
            firstName: u.first_name || '',
            lastName: u.last_name || '',
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || '—',
            email: u.email || '—',
            course: u.course || u.program || '—',  // Handle both column names
            batch: u.batch_year || '—',
            graduationYear: u.graduation_year || '—',
            status: u.approval_status || (u.is_verified ? 'approved' : 'pending'),
            registrationDate: u.registration_date?.slice(0,10) || u.user_created_at?.slice(0,10) || '—',
            joinedDate: u.user_created_at?.slice(0,10) || '—',
            lastActive: 'Never', // View doesn't include last_login
            phone: u.phone || '—',
            address: u.address || '—',
            city: u.city || '—',
            country: u.country || '—',
            currentJob: u.current_job || '—',
            company: u.company || '—',
            profileImage: u.profile_image_url || null,
            role: u.role || 'alumni',
            isVerified: u.is_verified || false,
            isActive: true, // Assume active if in view
            approvedAt: u.approved_at,
            bio: ''
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
    
    fetchUsers();
  }, []);

  // Sorting handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.course.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filter === 'all' || user.status === filter;
      
      let matchesDate = true;
      if (dateFilter) {
        const userDate = new Date(user.joinedDate || user.registrationDate);
        const filterDate = new Date(dateFilter);
        matchesDate = userDate.toDateString() === filterDate.toDateString();
      }
      
      return matchesSearch && matchesFilter && matchesDate;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle placeholder values
      if (aValue === '—') aValue = '';
      if (bValue === '—') bValue = '';
      
      // Convert to lowercase for string comparison
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const handleCloseProfile = () => {
    setSelectedUser(null);
    setShowUserProfile(false);
  };

  const exportToCSV = () => {
    if (filteredUsers.length === 0) {
      toast.warn('No users to export');
      return;
    }

    const headers = ['Full Name', 'Email', 'Status', 'Role', 'Joined Date', 'Course', 'Batch Year', 'Phone', 'Address'];
    
    const csvData = filteredUsers.map((user, index) => [
      user.name,
      user.email,
      user.status === 'approved' ? 'Active' : user.status === 'rejected' ? 'Banned' : user.status,
      user.role === 'admin' || user.role === 'super_admin' ? 'Admin' : 'User',
      user.joinedDate || user.registrationDate,
      user.course,
      user.batch,
      user.phone,
      `${user.address}, ${user.city}, ${user.country}`
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${String(field || 'N/A').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `User List of CCS Alumni Portal System - ${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Users data exported successfully!');
    }
  };

  const handleEditUser = (user) => {
    // TODO: Implement edit user functionality
    toast.info(`Edit functionality for ${user.name} - Coming soon!`);
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id);

        if (error) {
          console.error('Error deleting user:', error);
          toast.error(`Failed to delete user: ${error.message}`);
          return;
        }

        // Remove user from local state
        setUsers(prev => prev.filter(u => u.id !== user.id));
        toast.success(`${user.name} has been deleted successfully`);
        
        // Close profile if deleted user was selected
        if (selectedUser?.id === user.id) {
          handleCloseProfile();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const isApproved = newStatus === 'approved';
      
      // Update both approval_status and is_verified for consistency
      const { error } = await supabase
        .from('users')
        .update({ 
          approval_status: newStatus,
          is_verified: isApproved,
          approved_at: isApproved ? new Date().toISOString() : null
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating user status:', error);
        toast.error(`Error updating user status: ${error.message}`);
        return;
      }
      
      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      
      // Show success message
      const user = users.find(u => u.id === userId);
      if (isApproved) {
        toast.success(`✅ ${user?.name || 'User'} has been approved and can now login!`);
      } else {
        toast.success(`❌ ${user?.name || 'User'} has been rejected.`);
      }
    } catch (error) {
      console.error('Unexpected error updating user status:', error);
      toast.error('An unexpected error occurred while updating user status');
    }
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
    <div className="admin-layout">
      <main className="admin-content">
        <div className="page-header">
          <div className="breadcrumbs">
            <span className="current">User Management</span>
          </div>
          <div className="admin-topbar-actions">
            <button className="btn btn-primary">
              <FaUser /> Add User
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="controls-bar">
          <div className="search-control">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <FaFilter className="filter-icon" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Active</option>
                <option value="rejected">Banned</option>
              </select>
            </div>
            
            <div className="filter-group">
              <FaCalendar className="filter-icon" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="date-filter"
                title="Filter by registration date"
              />
            </div>
            
            <button className="export-btn" onClick={exportToCSV}>
              <FaDownload /> Export CSV
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`main-content ${showUserProfile ? 'with-sidebar' : ''}`}>
          {/* Users Table */}
          <div className="users-section">
            <div className="section-header">
              <h3>Users</h3>
              <span className="user-count">
                {filteredUsers.length > 0 
                  ? `Showing ${filteredUsers.length} of ${users.length} users`
                  : `${users.length} users total`
                }
              </span>
            </div>
            
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th className="sortable-header name-header" onClick={() => handleSort('name')}>
                      <div className="header-content">
                        Full Name
                        <span className="sort-indicator">↕</span>
                      </div>
                    </th>
                    <th className="sortable-header email-header" onClick={() => handleSort('email')}>
                      <div className="header-content">
                        Email
                        <span className="sort-indicator">↕</span>
                      </div>
                    </th>
                    <th className="sortable-header status-header" onClick={() => handleSort('status')}>
                      <div className="header-content">
                        Status
                        <span className="sort-indicator">↕</span>
                      </div>
                    </th>
                    <th className="sortable-header role-header" onClick={() => handleSort('role')}>
                      <div className="header-content">
                        Role
                        <span className="sort-indicator">↕</span>
                      </div>
                    </th>
                    <th className="sortable-header date-header" onClick={() => handleSort('joinedDate')}>
                      <div className="header-content">
                        Joined Date
                        <span className="sort-indicator">↕</span>
                      </div>
                    </th>
                    <th className="sortable-header course-header" onClick={() => handleSort('course')}>
                      <div className="header-content">
                        Course
                        <span className="sort-indicator">↕</span>
                      </div>
                    </th>
                    <th className="actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr 
                      key={user.id} 
                      className={`table-row ${
                        selectedUser?.id === user.id ? 'selected' : ''
                      } ${
                        user.status === 'pending' ? 'pending-row' : ''
                      }`}
                      onClick={() => handleRowClick(user)}
                    >
                      <td className="name-cell">
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.profileImage ? (
                              <img 
                                src={user.profileImage} 
                                alt={user.name}
                                onError={(e) => {
                                  console.log('❌ Image failed to load:', user.profileImage, 'for user:', user.name);
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="avatar-placeholder"
                              style={{ display: user.profileImage ? 'none' : 'flex' }}
                            >
                              {getUserInitials(user.firstName, user.lastName, user.email)}
                            </div>
                          </div>
                          <span className="user-name">{user.name}</span>
                        </div>
                      </td>
                      <td className="email-cell">
                        {user.email !== '—' ? user.email : <span className="placeholder-text">—</span>}
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge ${user.status.toLowerCase()}`}>
                          {user.status === 'approved' ? 'ACTIVE' : 
                           user.status === 'rejected' ? 'BANNED' : 
                           user.status === 'pending' ? 'PENDING' :
                           user.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="role-cell">
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role === 'admin' ? 'ADMIN' : 
                           user.role === 'super_admin' ? 'ADMIN' :
                           'USER'}
                        </span>
                      </td>
                      <td className="date-cell">
                        {user.joinedDate !== '—' ? user.joinedDate : 
                         user.registrationDate !== '—' ? user.registrationDate : 
                         <span className="placeholder-text">—</span>}
                      </td>
                      <td className="course-cell">
                        {user.course !== '—' ? user.course : <span className="placeholder-text">—</span>}
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button 
                            className="action-btn view" 
                            title="View Details"
                            onClick={(e) => { e.stopPropagation(); handleRowClick(user); }}
                          >
                            <FaEye />
                          </button>
                          <button 
                            className="action-btn edit" 
                            title="Edit User"
                            disabled={user.status === 'pending'}
                            onClick={(e) => { e.stopPropagation(); handleEditUser(user); }}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="action-btn delete" 
                            title="Delete User"
                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(user); }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="empty-state">
                  <FaUser className="empty-icon" />
                  <h3>No users found</h3>
                  <p>Try adjusting your search terms or filter criteria</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            <div className="pagination">
              <span className="pagination-info">
                Rows per page: 
                <select className="rows-select">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </span>
              <div className="pagination-controls">
                <button className="pagination-btn">‹</button>
                <span className="page-number active">1</span>
                <span className="page-number">2</span>
                <span className="page-number">3</span>
                <span className="pagination-dots">...</span>
                <span className="page-number">10</span>
                <button className="pagination-btn">›</button>
              </div>
            </div>
          </div>

          {/* User Profile Sidebar */}
          {showUserProfile && selectedUser && (
            <div className="user-profile-sidebar">
              <div className="sidebar-header">
                <div className="sidebar-title">
                  <FaUser className="sidebar-icon" />
                  <span>User Information</span>
                  <span className={`user-status ${selectedUser.status.toLowerCase()}`}>
                    {selectedUser.status === 'approved' ? 'Active' : 
                     selectedUser.status === 'rejected' ? 'Not active' : 
                     selectedUser.status}
                  </span>
                </div>
                <button className="close-btn" onClick={handleCloseProfile}>
                  <FaTimes />
                </button>
              </div>
              
              <div className="sidebar-content">
                <div className="user-profile-header">
                  <div className="profile-avatar">
                    {selectedUser.profileImage ? (
                      <img src={selectedUser.profileImage} alt={selectedUser.name} />
                    ) : (
                      <div className="avatar-placeholder large">
                        {getUserInitials(selectedUser.firstName, selectedUser.lastName, selectedUser.email)}
                      </div>
                    )}
                  </div>
                  <div className="profile-info">
                    <h2>{selectedUser.name}</h2>
                    <p className="profile-email">
                      <FaEnvelope /> Email: {selectedUser.email}
                    </p>
                    <p className="profile-roles">
                      <FaUser /> Roles ({selectedUser.role === 'admin' || selectedUser.role === 'super_admin' ? '1' : '1'}): {selectedUser.role === 'admin' || selectedUser.role === 'super_admin' ? 'Admin' : 'User'}
                    </p>
                  </div>
                </div>
                
                <div className="profile-details">
                  <div className="detail-section">
                    <h3>Personal Information</h3>
                    <div className="detail-row">
                      <span className="detail-label">Full Name:</span>
                      <span className="detail-value">{selectedUser.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedUser.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{selectedUser.phone}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">{selectedUser.address}, {selectedUser.city}, {selectedUser.country}</span>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h3>Academic Information</h3>
                    <div className="detail-row">
                      <span className="detail-label">Course/Program:</span>
                      <span className="detail-value">{selectedUser.course}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Batch Year:</span>
                      <span className="detail-value">{selectedUser.batch}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Graduation Year:</span>
                      <span className="detail-value">{selectedUser.graduationYear}</span>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h3>Employment Information</h3>
                    <div className="detail-row">
                      <span className="detail-label">Current Position:</span>
                      <span className="detail-value">{selectedUser.currentJob}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Company:</span>
                      <span className="detail-value">{selectedUser.company}</span>
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h3>Account Status</h3>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value status-${selectedUser.status}`}>
                        {selectedUser.status === 'approved' ? 'Active' : 
                         selectedUser.status === 'rejected' ? 'Banned' : 
                         selectedUser.status}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Verified:</span>
                      <span className="detail-value">{selectedUser.isVerified ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Joined:</span>
                      <span className="detail-value">{selectedUser.joinedDate}</span>
                    </div>
                    {selectedUser.approvedAt && (
                      <div className="detail-row">
                        <span className="detail-label">Approved:</span>
                        <span className="detail-value">{selectedUser.approvedAt.slice(0,10)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="sidebar-actions">
                  {selectedUser.status === 'pending' && (
                    <>
                      <button 
                        className="btn btn-success" 
                        onClick={() => handleStatusChange(selectedUser.id, 'approved')}
                      >
                        <FaUserCheck /> Approve User
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleStatusChange(selectedUser.id, 'rejected')}
                      >
                        <FaUserTimes /> Reject User
                      </button>
                    </>
                  )}
                  <button className="btn btn-outline">
                    <FaEdit /> Edit User
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUsers; 