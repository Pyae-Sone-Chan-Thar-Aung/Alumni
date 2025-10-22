import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../config/supabaseClient';
import { FaCheck, FaTimes, FaEye, FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaBuilding, FaMapMarkerAlt, FaClock, FaSpinner } from 'react-icons/fa';
import './AdminPendingRegistrations.css';

const AdminPendingRegistrations = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      console.log('🔍 Fetching pending registrations...');
      
      // Try to get pending users with profiles in one query
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles (
            phone,
            course,
            batch_year,
            graduation_year,
            current_job,
            company,
            address,
            city,
            country,
            profile_image_url
          )
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching pending users:', usersError);
        
        // Fallback: try with is_verified column if approval_status doesn't exist
        console.log('🔄 Trying fallback query with is_verified...');
        const { data: fallbackUsers, error: fallbackError } = await supabase
          .from('users')
          .select(`
            *,
            user_profiles (
              phone,
              course,
              batch_year,
              graduation_year,
              current_job,
              company,
              address,
              city,
              country,
              profile_image_url
            )
          `)
          .eq('is_verified', false)
          .order('created_at', { ascending: false });
        
        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          toast.error('Failed to load pending registrations. Please check database connection.');
          return;
        }
        
        console.log(`📋 Found ${fallbackUsers?.length || 0} pending users (fallback)`);
        setPendingRegistrations(fallbackUsers || []);
        return;
      }

      console.log(`📋 Found ${users?.length || 0} pending users`);
      setPendingRegistrations(users || []);
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to load pending registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, approve) => {
    setProcessingId(userId);
    
    try {
      if (approve) {
        // First, get the pending registration data
        const { data: pendingData, error: fetchError } = await supabase
          .from('pending_registrations')
          .select('*')
          .eq('email', userId) // Assuming userId is actually the email in this context
          .single();

        if (fetchError && !fetchError.message.includes('does not exist')) {
          console.error('Error fetching pending registration:', fetchError);
        }

        // Update user approval status and transfer data from pending registration
        const updateData = {
          approval_status: 'approved',
          is_verified: true,
          approved_at: new Date().toISOString()
        };

        // If we have pending registration data, transfer it to the users table
        if (pendingData) {
          updateData.batch_year = pendingData.batch_year;
          updateData.course = pendingData.course;
          updateData.current_job = pendingData.current_job;
          updateData.company = pendingData.company;
          updateData.location = pendingData.city ? `${pendingData.city}, ${pendingData.country}` : pendingData.country;
        }

        const { error: userUpdateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId);

        if (userUpdateError) {
          throw userUpdateError;
        }

        // Update pending registrations table
        const { error: pendingUpdateError } = await supabase
          .from('pending_registrations')
          .update({
            status: 'approved',
            processed_at: new Date().toISOString()
          })
          .eq('email', userId);

        // Don't fail if pending_registrations table doesn't exist
        if (pendingUpdateError && !pendingUpdateError.message.includes('does not exist')) {
          console.error('Error updating pending registration:', pendingUpdateError);
        }
      } else {
        // For rejection, just update the status
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            approval_status: 'rejected',
            is_verified: false,
            approved_at: null
          })
          .eq('id', userId);

        if (userUpdateError) {
          throw userUpdateError;
        }

        // Update pending registrations table
        const { error: pendingUpdateError } = await supabase
          .from('pending_registrations')
          .update({
            status: 'rejected',
            processed_at: new Date().toISOString()
          })
          .eq('email', userId);

        // Don't fail if pending_registrations table doesn't exist
        if (pendingUpdateError && !pendingUpdateError.message.includes('does not exist')) {
          console.error('Error updating pending registration:', pendingUpdateError);
        }
      }

      toast.success(`Registration ${approve ? 'approved' : 'rejected'} successfully!`);
      
      // Refresh the list
      fetchPendingRegistrations();
      setShowModal(false);
      setSelectedRegistration(null);
      
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error(`Failed to ${approve ? 'approve' : 'reject'} registration`);
    } finally {
      setProcessingId(null);
    }
  };

  const viewDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-pending-page">
        <div className="loading-container">
          <FaSpinner className="loading-spinner" />
          <p>Loading pending registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-pending-page">
      <div className="page-header">
        <h1>Pending Alumni Registrations</h1>
        <p>Review and approve new alumni registration requests</p>
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-number">{pendingRegistrations.length}</span>
            <span className="stat-label">Pending Approvals</span>
          </div>
        </div>
      </div>

      {pendingRegistrations.length === 0 ? (
        <div className="empty-state">
          <FaUser size={60} />
          <h3>No Pending Registrations</h3>
          <p>All registration requests have been processed.</p>
        </div>
      ) : (
        <div className="registrations-grid">
          {pendingRegistrations.map((registration) => (
            <div key={registration.id} className="registration-card">
              <div className="card-header">
                <div className="user-info">
                  {registration.user_profiles?.[0]?.profile_image_url ? (
                    <img 
                      src={registration.user_profiles[0].profile_image_url} 
                      alt="Profile" 
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-placeholder">
                      <FaUser />
                    </div>
                  )}
                  <div className="user-details">
                    <h3>{registration.first_name} {registration.last_name}</h3>
                    <p className="email">{registration.email}</p>
                    <p className="registration-date">
                      <FaClock /> Registered: {formatDate(registration.registration_date)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <FaGraduationCap />
                    <span>{registration.user_profiles?.[0]?.course || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <FaPhone />
                    <span>{registration.user_profiles?.[0]?.phone || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <FaBuilding />
                    <span>{registration.user_profiles?.[0]?.company || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <FaMapMarkerAlt />
                    <span>{registration.user_profiles?.[0]?.city || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => viewDetails(registration)}
                  className="btn btn-secondary"
                >
                  <FaEye /> View Details
                </button>
                <button
                  onClick={() => handleApproval(registration.id, false)}
                  className="btn btn-danger"
                  disabled={processingId === registration.id}
                >
                  {processingId === registration.id ? <FaSpinner className="spin" /> : <FaTimes />}
                  Reject
                </button>
                <button
                  onClick={() => handleApproval(registration.id, true)}
                  className="btn btn-success"
                  disabled={processingId === registration.id}
                >
                  {processingId === registration.id ? <FaSpinner className="spin" /> : <FaCheck />}
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedRegistration && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registration Details</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="profile-section">
                {selectedRegistration.user_profiles?.[0]?.profile_image_url ? (
                  <img 
                    src={selectedRegistration.user_profiles[0].profile_image_url} 
                    alt="Profile" 
                    className="modal-profile-image"
                  />
                ) : (
                  <div className="modal-profile-placeholder">
                    <FaUser size={60} />
                  </div>
                )}
                <h3>{selectedRegistration.first_name} {selectedRegistration.last_name}</h3>
              </div>

              <div className="details-grid">
                <div className="detail-group">
                  <h4>Contact Information</h4>
                  <div className="detail-item">
                    <FaEnvelope />
                    <span>Email: {selectedRegistration.email}</span>
                  </div>
                  <div className="detail-item">
                    <FaPhone />
                    <span>Phone: {selectedRegistration.user_profiles?.[0]?.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Academic Information</h4>
                  <div className="detail-item">
                    <FaGraduationCap />
                    <span>Course: {selectedRegistration.user_profiles?.[0]?.course || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span>Batch Year: {selectedRegistration.user_profiles?.[0]?.batch_year || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span>Graduation Year: {selectedRegistration.user_profiles?.[0]?.graduation_year || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Professional Information</h4>
                  <div className="detail-item">
                    <FaBuilding />
                    <span>Current Job: {selectedRegistration.user_profiles?.[0]?.current_job || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span>Company: {selectedRegistration.user_profiles?.[0]?.company || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Address Information</h4>
                  <div className="detail-item">
                    <FaMapMarkerAlt />
                    <span>Address: {selectedRegistration.user_profiles?.[0]?.address || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span>City: {selectedRegistration.user_profiles?.[0]?.city || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span>Country: {selectedRegistration.user_profiles?.[0]?.country || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => handleApproval(selectedRegistration.id, false)}
                className="btn btn-danger"
                disabled={processingId === selectedRegistration.id}
              >
                {processingId === selectedRegistration.id ? <FaSpinner className="spin" /> : <FaTimes />}
                Reject Registration
              </button>
              <button
                onClick={() => handleApproval(selectedRegistration.id, true)}
                className="btn btn-success"
                disabled={processingId === selectedRegistration.id}
              >
                {processingId === selectedRegistration.id ? <FaSpinner className="spin" /> : <FaCheck />}
                Approve Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingRegistrations;
