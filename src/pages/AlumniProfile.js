import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../config/supabaseClient';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaBuilding, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaCamera, FaCalendarAlt, FaSpinner, FaBriefcase } from 'react-icons/fa';
import './AlumniProfile_new.css';

// Utility function to format date for display
const formatDateForDisplay = (dateString) => {
  if (!dateString) return 'Not specified';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Not specified';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Not specified';
  }
};

// Utility function to format date for input field
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Date input formatting error:', error);
    return '';
  }
};

const CompletionWidget = ({ profile }) => {
  const fields = [
    profile?.first_name,
    profile?.last_name,
    profile?.phone,
    profile?.program || profile?.course,
    profile?.batch_year,
    profile?.graduation_year,
    profile?.date_of_birth,
    profile?.current_job_title || profile?.current_job,
    profile?.current_company || profile?.company,
    profile?.address,
    profile?.city,
    profile?.country,
    profile?.postal_code,
    profile?.profile_image_url
  ];
  const total = fields.length || 1;
  const filled = fields.filter(v => v !== null && v !== undefined && String(v).trim() !== '').length;
  const pct = Math.round((filled / total) * 100);
  return (
    <div className="completion-widget">
      <div className="completion-top">
        <span className="completion-label">Profile completeness</span>
        <span className="completion-value">{pct}%</span>
      </div>
      <div className="completion-bar">
        <div className="completion-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const AlumniProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    course: '',
    batch_year: '',
    graduation_year: '',
    date_of_birth: '',
    current_job: '',
    company: '',
    address: '',
    city: '',
    country: '',
    postal_code: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // First fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        toast.error('Failed to load profile');
        return;
      }

      // Then fetch profile data separately to ensure we get the latest data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let userProfileData = profileData || {};

      // Fallback: if profile is missing/empty, use pending_registrations by email
      if (profileError || !userProfileData || Object.keys(userProfileData).length === 0) {
        console.log('No profile found, checking pending_registrations...');
        try {
          let { data: pending } = await supabase
            .from('pending_registrations')
            .select('*')
            .eq('email', userData.email)
            .maybeSingle();
          if (!pending) {
            const { data: pend2 } = await supabase
              .from('pending_registrations')
              .select('*')
              .ilike('email', userData.email)
              .maybeSingle();
            pending = pend2 || null;
          }
        if (pending) {
            userProfileData = {
              first_name: userData.first_name,
              last_name: userData.last_name,
              phone: pending.phone,
              program: pending.program || pending.course,
              batch_year: pending.batch_year,
              graduation_year: pending.graduation_year,
              date_of_birth: pending.date_of_birth || '',
              current_job_title: pending.current_job_title || pending.current_job,
              current_company: pending.current_company || pending.company,
              address: pending.address,
              city: pending.city,
              country: pending.country,
              postal_code: pending.postal_code || '',
              profile_image_url: pending.profile_image_url
            };

            // Try to persist into user_profiles for future loads
            try {
              await supabase
                .from('user_profiles')
                .upsert({
                  user_id: user.id,
                  ...userProfileData,
                  updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });
            } catch (persistErr) {
              console.warn('Could not persist pending data into user_profiles:', persistErr?.message);
            }
          }
        } catch (e) {
          console.warn('Pending fallback failed:', e?.message);
        }
      }

      console.log('Profile data before setting state:', userProfileData);
      console.log('Date of birth from DB:', userProfileData.date_of_birth);
      console.log('Postal code from DB:', userProfileData.postal_code);

      // Ensure profile includes all userProfileData fields
      const combinedProfile = {
        ...userData,
        ...userProfileData,
        // Explicitly ensure these fields are included
        date_of_birth: userProfileData.date_of_birth,
        postal_code: userProfileData.postal_code
      };
      
      console.log('Combined profile being set:', combinedProfile);
      setProfile(combinedProfile);

      // Set form data for editing
      const formDataToSet = {
        first_name: userProfileData.first_name || userData.first_name || '',
        last_name: userProfileData.last_name || userData.last_name || '',
        phone: userProfileData.phone || '',
        course: userProfileData.program || userProfileData.course || '',
        batch_year: userProfileData.batch_year || '',
        graduation_year: userProfileData.graduation_year || '',
        date_of_birth: formatDateForInput(userProfileData.date_of_birth),
        current_job: userProfileData.current_job_title || userProfileData.current_job || '',
        company: userProfileData.current_company || userProfileData.company || '',
        address: userProfileData.address || '',
        city: userProfileData.city || '',
        country: userProfileData.country || 'Philippines',
        postal_code: userProfileData.postal_code || ''
      };
      
      console.log('Form data being set:', formDataToSet);
      setFormData(formDataToSet);

      if (userProfileData.profile_image_url) {
        setImagePreview(userProfileData.profile_image_url);
      }

    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, JPEG, and PNG files are allowed');
        return;
      }

      setProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Auto-upload image
      try {
        const publicUrl = await uploadProfileImage(file);

        // Update profile with new image URL - include more fields to ensure upsert works
        const { error: updateError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            first_name: formData.first_name || null,
            last_name: formData.last_name || null,
            profile_image_url: publicUrl,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (updateError) {
          console.error('Error updating profile:', updateError);
          console.error('Update error details:', {
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code
          });
          toast.error(`Failed to update profile image: ${updateError.message}`);
          return;
        }

        toast.success('Profile image updated successfully!');
        fetchProfile(); // Refresh profile data
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const uploadProfileImage = async (file = profileImage) => {
    if (!file) return profile?.profile_image_url;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      console.log('Uploading profile image:', { fileName, filePath, bucketName: 'alumni-profiles' });

      const { data, error } = await supabase.storage
        .from('alumni-profiles')
        .upload(`${user.id}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading image:', error);
        console.error('Storage error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error
        });
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('alumni-profiles')
        .getPublicUrl(`${user.id}/${fileName}`);

      console.log('Profile image uploaded successfully:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image: ' + error.message);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      let profileImageUrl = profile?.profile_image_url;

      if (profileImage) {
        profileImageUrl = await uploadProfileImage();
      }

      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (userError) {
        console.error('User table update error:', userError);
        throw userError;
      }

      // Prepare profile data
      const profileData = {
        user_id: user.id,
        phone: formData.phone || null,
        program: formData.course || null,
        batch_year: formData.batch_year ? parseInt(formData.batch_year) : null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        date_of_birth: formData.date_of_birth || null,
        current_job_title: formData.current_job || null,
        current_company: formData.company || null,
        address: formData.address || null,
        city: formData.city || null,
        country: formData.country || 'Philippines',
        postal_code: formData.postal_code || null,
        profile_image_url: profileImageUrl || null,
        updated_at: new Date().toISOString()
      };

      console.log('Saving profile data:', profileData);
      console.log('Form data before save:', formData);

      // Update or insert profile data
      const { data: profileResult, error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select();

      console.log('Profile save result:', profileResult);
      console.log('Profile save error:', profileError);

      if (profileError) {
        console.error('Profile table update error:', profileError);
        throw profileError;
      }

      toast.success('Profile updated successfully!');
      setEditing(false);
      setProfileImage(null);
      await fetchProfile(); // Refresh profile data

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setProfileImage(null);
    setImagePreview(profile?.profile_image_url || null);
    // Reset form data
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
      course: profile?.program || profile?.course || '',
      batch_year: profile?.batch_year || '',
      graduation_year: profile?.graduation_year || '',
      date_of_birth: formatDateForInput(profile?.date_of_birth),
      current_job: profile?.current_job_title || profile?.current_job || '',
      company: profile?.current_company || profile?.company || '',
      address: profile?.address || '',
      city: profile?.city || '',
      country: profile?.country || 'Philippines',
      postal_code: profile?.postal_code || ''
    });
  };

  if (loading) {
    return (
      <div className="alumni-profile-page">
        <div className="loading-container">
          <FaSpinner className="loading-spinner" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alumni-profile-page">
      <div className="profile-sidebar">
        <nav className="profile-nav">
          <ul>
            <li><a href="#" className="active"><FaUser /> My Profile</a></li>
            <li><a href="#"><FaGraduationCap /> Academic Info</a></li>
            <li><a href="#"><FaBriefcase /> Professional</a></li>
            <li><a href="#"><FaMapMarkerAlt /> Address</a></li>
          </ul>
        </nav>
      </div>

      <div className="profile-main">
        <h1 className="page-title">My Profile</h1>

        <div className="profile-header">
          <div className="profile-header-content">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }}>
                <FaUser size={30} color="#64748b" />
              </div>
            )}
            <div className="profile-info">
              <h1>{profile?.first_name} {profile?.last_name}</h1>
              <p className="profile-role">Alumni • {profile?.program || profile?.course}</p>
              <p className="profile-location">{profile?.city || 'Philippines'}</p>
            </div>
            <input
              type="file"
              id="profileImageInput"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="profileImageInput" className="edit-btn">
              <FaCamera /> Change Photo
            </label>
          </div>
          <CompletionWidget profile={profile} />
        </div>

        <div className="profile-content">
          <div className="info-card">
            <div className="card-header">
              <h2 className="card-title">Personal Information</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="edit-btn">
                  <FaEdit /> Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={handleCancel} className="btn btn-secondary">
                    <FaTimes /> Cancel
                  </button>
                  <button onClick={handleSave} className="btn btn-success" disabled={saving}>
                    {saving ? <FaSpinner className="spin" /> : <FaSave />}
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
            <div className="info-grid">
              <div className="info-item">
                <p className="info-label">First Name</p>
                {editing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                ) : (
                  <p className="info-value">{profile?.first_name || 'Not specified'}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Last Name</p>
                {editing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                ) : (
                  <p className="info-value">{profile?.last_name || 'Not specified'}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Date of Birth</p>
                {editing ? (
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                ) : (
                  <p className="info-value">{formatDateForDisplay(profile?.date_of_birth)}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Email Address</p>
                <p className="info-value">{profile?.email || 'Not specified'}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Phone Number</p>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                ) : (
                  <p className="info-value">{profile?.phone || 'Not specified'}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">User Role</p>
                <p className="info-value">Alumni</p>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header">
              <h2 className="card-title">Academic Information</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="edit-btn">
                  <FaEdit /> Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={handleCancel} className="btn btn-secondary">
                    <FaTimes /> Cancel
                  </button>
                  <button onClick={handleSave} className="btn btn-success" disabled={saving}>
                    {saving ? <FaSpinner className="spin" /> : <FaSave />}
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
            <div className="info-grid">
              <div className="info-item">
                <p className="info-label">Course</p>
                {editing ? (
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                ) : (
                  <p className="info-value">{profile?.program || profile?.course || 'Not specified'}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Batch Year</p>
                {editing ? (
                  <input
                    type="number"
                    name="batch_year"
                    value={formData.batch_year}
                    onChange={handleInputChange}
                    className="form-control"
                    min="1990"
                    max="2024"
                  />
                ) : (
                  <p className="info-value">{profile?.batch_year || 'Not specified'}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Graduation Year</p>
                {editing ? (
                  <input
                    type="number"
                    name="graduation_year"
                    value={formData.graduation_year}
                    onChange={handleInputChange}
                    className="form-control"
                    min="1990"
                    max="2024"
                  />
                ) : (
                  <p className="info-value">{profile?.graduation_year || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header">
              <h2 className="card-title">Professional Information</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="edit-btn">
                  <FaEdit /> Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={handleCancel} className="btn btn-secondary">
                    <FaTimes /> Cancel
                  </button>
                  <button onClick={handleSave} className="btn btn-success" disabled={saving}>
                    {saving ? <FaSpinner className="spin" /> : <FaSave />}
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
            <div className="info-grid">
              <div className="info-item">
                <p className="info-label">Current Job</p>
                {editing ? (
                  <input
                    type="text"
                    name="current_job"
                    value={formData.current_job}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                ) : (
                  <p className="info-value">{profile?.current_job_title || profile?.current_job || 'Not specified'}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Company</p>
                {editing ? (
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                ) : (
                  <p className="info-value">{profile?.current_company || profile?.company || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header">
              <h2 className="card-title">Address</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="edit-btn">
                  <FaEdit /> Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={handleCancel} className="btn btn-secondary">
                    <FaTimes /> Cancel
                  </button>
                  <button onClick={handleSave} className="btn btn-success" disabled={saving}>
                    {saving ? <FaSpinner className="spin" /> : <FaSave />}
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
            <div className="address-grid">
              <div className="info-item">
                <p className="info-label">Address</p>
                {editing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Enter your full address"
                  />
                ) : (
                  <p className="info-value">{profile?.address || 'Not specified'}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Country</p>
                {editing ? (
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                ) : (
                  <p className="info-value">{profile?.country || 'Philippines'}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">City</p>
                {editing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                ) : (
                  <p className="info-value">{profile?.city || 'Not specified'}</p>
                )}
              </div>
              <div className="info-item">
                <p className="info-label">Postal Code</p>
                {editing ? (
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                ) : (
                  <p className="info-value">{profile?.postal_code || 'Not specified'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile;
