import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Profile.css';
import { supabase } from '../config/supabaseClient';

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

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.first_name || user?.firstName || '',
    lastName: user?.last_name || user?.lastName || '',
    email: user?.email || '',
    phone: '',
    currentJob: '',
    company: '',
    address: '',
    city: '',
    country: 'Philippines',
    dateOfBirth: '',
    course: '',
    postalCode: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profile_image_url || user?.profileImage || '/default-avatar.png');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    batch_year: null,
    course: null
  });
  const [completion, setCompletion] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        console.log('No user ID available for profile fetch');
        setProfileLoading(false);
        setProfileError('No user ID available');
        return;
      }

      setProfileLoading(true);
      setProfileError(null);

      try {
        console.log('Fetching profile for user:', user.id);
        
        // First, try to get data from user_profiles table
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
        }

        // Also get data from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (userError) {
          console.error('Error fetching user data:', userError);
        }

        // If no profile found, check pending registrations as fallback
        let pendingData = null;
        if (!profile && userData?.email) {
          const { data: pending, error: pendingError } = await supabase
            .from('pending_registrations')
            .select('*')
            .eq('email', userData.email)
            .maybeSingle();

          if (pendingError) {
            console.error('Error fetching pending registration:', pendingError);
          } else if (pending) {
            pendingData = pending;
            console.log('Found pending registration data:', pending);
          }
        }

        console.log('Profile data:', profile);
        console.log('User data:', userData);

        // Update form data with available information (prioritize profile > user > pending > current)
        setFormData((prev) => ({
          firstName: profile?.first_name || userData?.first_name || user?.first_name || pendingData?.first_name || prev.firstName || '',
          lastName: profile?.last_name || userData?.last_name || user?.last_name || pendingData?.last_name || prev.lastName || '',
          email: userData?.email || user?.email || pendingData?.email || prev.email || '',
          phone: profile?.phone || pendingData?.phone || prev.phone || '',
          currentJob: profile?.current_job || pendingData?.current_job || prev.currentJob || '',
          company: profile?.company || pendingData?.company || prev.company || '',
          address: profile?.address || pendingData?.address || prev.address || '',
          city: profile?.city || pendingData?.city || prev.city || '',
          country: profile?.country || pendingData?.country || prev.country || 'Philippines',
          dateOfBirth: formatDateForInput(profile?.date_of_birth || pendingData?.date_of_birth),
          course: profile?.course || profile?.program || pendingData?.course || prev.course || '',
          postalCode: profile?.postal_code || pendingData?.postal_code || prev.postalCode || ''
        }));

        // Set profile image
        if (profile?.profile_image_url) {
          setProfileImageUrl(profile.profile_image_url);
        } else if (userData?.profile_image_url) {
          setProfileImageUrl(userData.profile_image_url);
        } else if (pendingData?.profile_image_url) {
          setProfileImageUrl(pendingData.profile_image_url);
        } else {
          setProfileImageUrl('/default-avatar.png');
        }
        
        console.log('Profile image URL set to:', profile?.profile_image_url || userData?.profile_image_url || pendingData?.profile_image_url || '/default-avatar.png');

        // Set academic data
        setProfileData({
          batch_year: profile?.batch_year || profile?.graduation_year || pendingData?.batch_year || pendingData?.graduation_year,
          course: profile?.course || profile?.program || pendingData?.course
        });

        console.log('Profile loaded successfully');
        setProfileError(null);
      } catch (error) {
        console.error('Unexpected error fetching profile:', error);
        setProfileError('Failed to load profile data');
        toast.error('Failed to load profile data');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  useEffect(() => {
    // compute profile completeness based on filled fields
    const fields = [
      formData.firstName,
      formData.lastName,
      formData.phone,
      formData.currentJob,
      formData.company,
      formData.address,
      formData.city,
      formData.country,
      formData.dateOfBirth,
      formData.course,
      formData.postalCode,
      profileImageUrl
    ];
    
    console.log('Profile completion fields:', fields.map((field, index) => ({
      field: ['firstName', 'lastName', 'phone', 'currentJob', 'company', 'address', 'city', 'country', 'dateOfBirth', 'course', 'postalCode', 'profileImage'][index],
      value: field,
      filled: field !== null && field !== undefined && String(field).trim() !== ''
    })));
    
    const total = fields.length;
    const filled = fields.filter(v => v !== null && v !== undefined && String(v).trim() !== '').length;
    console.log(`Profile completion: ${filled}/${total} = ${Math.round((filled / total) * 100)}%`);
    setCompletion(Math.round((filled / total) * 100));
  }, [formData, profileImageUrl]);

  const handleChange = (e) => {
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

      // Check if user is authenticated
      if (!user || !user.id) {
        toast.error('User not authenticated. Please log in again.');
        return;
      }

      setProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Auto-upload image
      await uploadProfileImage(file);
    }
  };

  const uploadProfileImage = async (file) => {
    try {
      console.log('Starting image upload for user:', user.id);
      console.log('File details:', { name: file.name, size: file.size, type: file.type });

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading to path:', filePath);

      const { data, error } = await supabase.storage
        .from('alumni-profiles')
        .upload(filePath, file, { upsert: true });

      if (error) {
        console.error('Storage upload error:', error);
        console.error('Error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error
        });
        toast.error(`Failed to upload image: ${error.message}`);
        return;
      }

      console.log('Upload successful:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('alumni-profiles')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          profile_image_url: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (updateError) {
        console.error('Database update error:', updateError);
        console.error('Update error details:', {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details
        });
        toast.error(`Failed to update profile image: ${updateError.message}`);
        return;
      }

      console.log('Profile updated successfully');
      setProfileImageUrl(publicUrl);
      toast.success('Profile image updated successfully!');

      // Update user context
      if (updateUser) {
        updateUser({ ...user, profile_image_url: publicUrl });
      }
    } catch (error) {
      console.error('Unexpected error during upload:', error);
      toast.error(`Failed to upload image: ${error.message}`);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
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
          phone: formData.phone || null,
          address: formData.address || null,
          city: formData.city || null,
          country: formData.country || 'Philippines',
          current_job: formData.currentJob || null,
          company: formData.company || null,
          date_of_birth: formData.dateOfBirth || null,
          course: formData.course || null,
          program: formData.course || null,
          postal_code: formData.postalCode || null,
          profile_image_url: profileImageUrl || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        throw profileError;
      }

      // Update auth context
      updateUser({
        ...user,
        first_name: formData.firstName,
        last_name: formData.lastName,
        profile_image_url: profileImageUrl
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (profileLoading) {
    return (
      <div className="profile-page">
        <div className="profile-main">
          <div className="loading-container">
            <h1 className="page-title">My Profile</h1>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading profile data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (profileError) {
    return (
      <div className="profile-page">
        <div className="profile-main">
          <div className="error-container">
            <h1 className="page-title">My Profile</h1>
            <div className="error-message">
              <h3>Failed to load profile</h3>
              <p>{profileError}</p>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
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
            <img
              src={profileImage ? URL.createObjectURL(profileImage) : profileImageUrl}
              alt="Profile"
              className="profile-avatar"
            />
            <div className="profile-info">
              <h1>{user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User Name'}</h1>
              <p className="profile-role">{user?.role === 'admin' ? 'Administrator' : 'Alumni'}</p>
              <p className="profile-location">Philippines</p>
            </div>
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="profile-image" className="edit-btn">
              <FaCamera /> Change Photo
            </label>
          </div>
          <div className="completion-widget">
            <div className="completion-top">
              <span className="completion-label">Profile completeness</span>
              <span className="completion-value">{completion}%</span>
            </div>
            <div className="completion-bar">
              <div className="completion-fill" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="info-card">
            <div className="card-header">
              <h2 className="card-title">Personal Information</h2>
              <button onClick={handleSave} className="edit-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <p className="info-label">First Name</p>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="info-item">
                <p className="info-label">Last Name</p>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="info-item">
                <p className="info-label">Date of Birth</p>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="info-item">
                <p className="info-label">Email Address</p>
                <p className="info-value">{formData.email || 'Not specified'}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Phone Number</p>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="info-item">
                <p className="info-label">User Role</p>
                <p className="info-value">{user?.role === 'admin' ? 'Administrator' : 'Alumni'}</p>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header">
              <h2 className="card-title">Professional Information</h2>
              <button onClick={handleSave} className="edit-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <p className="info-label">Current Job</p>
                <input
                  type="text"
                  name="currentJob"
                  value={formData.currentJob}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="info-item">
                <p className="info-label">Company</p>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="info-item">
                <p className="info-label">Course</p>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your course"
                />
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header">
              <h2 className="card-title">Address</h2>
              <button onClick={handleSave} className="edit-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div className="address-grid">
              <div className="info-item">
                <p className="info-label">Address</p>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your full address"
                />
              </div>
              <div className="info-item">
                <p className="info-label">Country</p>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="info-item">
                <p className="info-label">City</p>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="info-item">
                <p className="info-label">Postal Code</p>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter postal code"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 