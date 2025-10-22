import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../config/supabaseClient';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaBuilding, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaCamera, FaCalendarAlt, FaSpinner, FaBriefcase } from 'react-icons/fa';
import './AlumniProfile_new.css';

const CompletionWidget = ({ profile }) => {
  const fields = [
    profile?.first_name,
    profile?.last_name,
    profile?.phone,
    profile?.course,
    profile?.batch_year,
    profile?.graduation_year,
    profile?.current_job,
    profile?.company,
    profile?.address,
    profile?.city,
    profile?.country,
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
    current_job: '',
    company: '',
    address: '',
    city: '',
    country: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Fetch user data with profile information
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          user_profiles (
            first_name,
            last_name,
            student_id,
            graduation_year,
            program,
            current_job,
            company,
            phone,
            address,
            city,
            country,
            profile_image_url,
            bio,
            linkedin_url
          )
        `)
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        toast.error('Failed to load profile');
        return;
      }

      const userProfileData = userData.user_profiles?.[0] || {};
      setProfile({ ...userData, ...userProfileData });

      // Set form data for editing
      setFormData({
        first_name: userProfileData.first_name || '',
        last_name: userProfileData.last_name || '',
        phone: userProfileData.phone || '',
        program: userProfileData.program || '',
        graduation_year: userProfileData.graduation_year || '',
        current_job: userProfileData.current_job || '',
        company: userProfileData.company || '',
        address: userProfileData.address || '',
        city: userProfileData.city || '',
        country: userProfileData.country || 'Philippines',
        bio: userProfileData.bio || '',
        linkedin_url: userProfileData.linkedin_url || ''
      });

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

        // Update profile with new image URL
        const { error: updateError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            profile_image_url: publicUrl,
            updated_at: new Date().toISOString()
          });

        if (updateError) {
          console.error('Error updating profile:', updateError);
          toast.error('Failed to update profile image');
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
        throw error;
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
        throw userError;
      }

      // Update or insert profile data
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          phone: formData.phone,
          course: formData.course,
          batch_year: formData.batch_year ? parseInt(formData.batch_year) : null,
          graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
          current_job: formData.current_job,
          company: formData.company,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          profile_image_url: profileImageUrl,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        throw profileError;
      }

      toast.success('Profile updated successfully!');
      setEditing(false);
      setProfileImage(null);
      fetchProfile(); // Refresh profile data

    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
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
      course: profile?.course || '',
      batch_year: profile?.batch_year || '',
      graduation_year: profile?.graduation_year || '',
      current_job: profile?.current_job || '',
      company: profile?.company || '',
      address: profile?.address || '',
      city: profile?.city || '',
      country: profile?.country || 'Philippines'
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
              <p className="profile-role">Alumni • {profile?.course}</p>
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
                <p className="info-value">25-5-2004</p>
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
                  <p className="info-value">{profile?.course || 'Not specified'}</p>
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
                  <p className="info-value">{profile?.current_job || 'Not specified'}</p>
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
                  <p className="info-value">{profile?.company || 'Not specified'}</p>
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
                <p className="info-value">1000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfile;
