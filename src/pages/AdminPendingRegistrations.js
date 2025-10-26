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

  // Helper: move uploaded image from temp/<file> to <userId>/<file>
  const moveImageFromTempToUser = async (userId, imageUrl) => {
    try {
      if (!imageUrl || !userId) return { publicUrl: imageUrl };
      const marker = '/object/public/alumni-profiles/';
      const idx = imageUrl.indexOf(marker);
      if (idx === -1) return { publicUrl: imageUrl };
      const oldPath = imageUrl.substring(idx + marker.length); // e.g., temp/filename.jpg
      if (!oldPath.startsWith('temp/')) return { publicUrl: imageUrl }; // nothing to move
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
      return { publicUrl, newPath };
    } catch (e) {
      console.warn('Image move failed, continuing with original URL:', e?.message);
      return { publicUrl: imageUrl };
    }
  };

  const fetchPendingRegistrations = async () => {
    try {
      console.log('🔍 Fetching pending registrations (users + pending_registrations)...');

      const [usersRes, pendRes] = await Promise.all([
        supabase
          .from('users')
          .select(`
            id, email, first_name, last_name, registration_date, approval_status, created_at,
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
          .order('created_at', { ascending: false }),
        supabase
          .from('pending_registrations')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
      ]);

      const users = usersRes.data || [];
      const pendings = pendRes.data || [];

      const pendingByEmail = new Map(pendings.map(p => [p.email, p]));

      // Normalize user-based pending items
      const normalizedUsers = users.map(u => {
        const prof = (u.user_profiles && u.user_profiles[0]) || {};
        const p = pendingByEmail.get(u.email);
        return {
          kind: 'user',
          id: u.id,
          email: u.email,
          first_name: u.first_name,
          last_name: u.last_name,
          registration_date: u.registration_date || u.created_at,
          profile: {
            phone: prof.phone || p?.phone || null,
            course: prof.course || p?.course || null,
            batch_year: prof.batch_year || p?.batch_year || null,
            graduation_year: prof.graduation_year || p?.graduation_year || null,
            current_job: prof.current_job || p?.current_job || null,
            company: prof.company || p?.company || null,
            address: prof.address || p?.address || null,
            city: prof.city || p?.city || null,
            country: prof.country || p?.country || null,
            profile_image_url: prof.profile_image_url || p?.profile_image_url || null
          },
          pendingId: p?.id || null
        };
      });

      // Add pending-only items (no users row yet)
      const userEmails = new Set(users.map(u => u.email));
      const normalizedPendingOnly = pendings
        .filter(p => !userEmails.has(p.email))
        .map(p => ({
          kind: 'pendingOnly',
          id: p.id,
          email: p.email,
          first_name: p.first_name,
          last_name: p.last_name,
          registration_date: p.created_at,
          profile: {
            phone: p.phone || null,
            course: p.course || null,
            batch_year: p.batch_year || null,
            graduation_year: p.graduation_year || null,
            current_job: p.current_job || null,
            company: p.company || null,
            address: p.address || null,
            city: p.city || null,
            country: p.country || null,
            profile_image_url: p.profile_image_url || null
          },
          pendingId: p.id
        }));

      const combined = [...normalizedUsers, ...normalizedPendingOnly];
      console.log(`📋 Combined pending items: ${combined.length}`);
      setPendingRegistrations(combined);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Failed to load pending registrations');
    } finally {
      setLoading(false);
    }
  };
  const handleApproval = async (item, approve) => {
    setProcessingId(item.id);

    try {
      if (approve) {
        if (item.kind === 'user') {
          // Get pending registration data if available
          let pendingData = null;
          if (item.pendingId) {
            const { data: pendingRes } = await supabase
              .from('pending_registrations')
              .select('*')
              .eq('id', item.pendingId)
              .single();
            pendingData = pendingRes;
          }

          // Approve existing app user and update with pending data
          const updateData = {
            approval_status: 'approved',
            is_verified: true,
            approved_at: new Date().toISOString()
          };

          // Add course information from pending data
          if (pendingData?.course) {
            updateData.course = pendingData.course;
          }

          const { error: userUpdateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', item.id);
          if (userUpdateError) throw userUpdateError;

          // If we have pending data, move image and upsert profile
          if (item.pendingId || item.profile || pendingData) {
            let imageUrl = item.profile?.profile_image_url || pendingData?.profile_image_url || null;
            if (imageUrl && imageUrl.includes('/temp/')) {
              const moved = await moveImageFromTempToUser(item.id, imageUrl);
              imageUrl = moved.publicUrl;
            }

            // Use pending data if available, otherwise use profile data
            const sourceData = pendingData || item.profile || {};

            await supabase
              .from('user_profiles')
              .upsert({
                user_id: item.id,
                phone: sourceData.phone || null,
                program: sourceData.course || null, // Map course to program
                course: sourceData.course || null,
                batch_year: sourceData.batch_year || null,
                graduation_year: sourceData.graduation_year || null,
                current_job_title: sourceData.current_job || null,
                current_company: sourceData.company || null,
                current_job: sourceData.current_job || null,
                company: sourceData.company || null,
                address: sourceData.address || null,
                city: sourceData.city || null,
                country: sourceData.country || null,
                profile_image_url: imageUrl || null,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });

            if (item.pendingId) {
              await supabase
                .from('pending_registrations')
                .update({ status: 'approved', processed_at: new Date().toISOString() })
                .eq('id', item.pendingId);
            }
          }
        } else {
          // Approve pending-only record (no users row yet)
          await supabase
            .from('pending_registrations')
            .update({ status: 'approved', processed_at: new Date().toISOString() })
            .eq('id', item.pendingId || item.id);
        }
      } else {
        // Reject
        if (item.kind === 'user') {
          await supabase
            .from('users')
            .update({ approval_status: 'rejected', is_verified: false, approved_at: null })
            .eq('id', item.id);
        }
        if (item.pendingId || item.kind === 'pendingOnly') {
          await supabase
            .from('pending_registrations')
            .update({ status: 'rejected', processed_at: new Date().toISOString() })
            .eq('id', item.pendingId || item.id);
        }
      }

      toast.success(`Registration ${approve ? 'approved' : 'rejected'} successfully!`);
      await fetchPendingRegistrations();
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
            <div key={`${registration.kind}:${registration.id}`} className="registration-card">
              <div className="card-header">
                <div className="user-info">
                  {registration.profile?.profile_image_url ? (
                    <img 
                      src={registration.profile.profile_image_url} 
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
                    <span>{registration.profile?.course || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <FaPhone />
                    <span>{registration.profile?.phone || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <FaBuilding />
                    <span>{registration.profile?.company || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <FaMapMarkerAlt />
                    <span>{registration.profile?.city || 'N/A'}</span>
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
                  onClick={() => handleApproval(registration, false)}
                  className="btn btn-danger"
                  disabled={processingId === registration.id}
                >
                  {processingId === registration.id ? <FaSpinner className="spin" /> : <FaTimes />}
                  Reject
                </button>
                <button
                  onClick={() => handleApproval(registration, true)}
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
                {selectedRegistration.profile?.profile_image_url ? (
                  <img 
                    src={selectedRegistration.profile.profile_image_url} 
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
                    <span>Phone: {selectedRegistration.profile?.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Academic Information</h4>
                  <div className="detail-item">
                    <FaGraduationCap />
                    <span>Course: {selectedRegistration.profile?.course || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span>Batch Year: {selectedRegistration.profile?.batch_year || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span>Graduation Year: {selectedRegistration.profile?.graduation_year || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Professional Information</h4>
                  <div className="detail-item">
                    <FaBuilding />
                    <span>Current Job: {selectedRegistration.profile?.current_job || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span>Company: {selectedRegistration.profile?.company || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-group">
                  <h4>Address Information</h4>
                  <div className="detail-item">
                    <FaMapMarkerAlt />
                    <span>Address: {selectedRegistration.profile?.address || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span>City: {selectedRegistration.profile?.city || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span>Country: {selectedRegistration.profile?.country || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => handleApproval(selectedRegistration, false)}
                className="btn btn-danger"
                disabled={processingId === selectedRegistration.id}
              >
                {processingId === selectedRegistration.id ? <FaSpinner className="spin" /> : <FaTimes />}
                Reject Registration
              </button>
              <button
                onClick={() => handleApproval(selectedRegistration, true)}
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
