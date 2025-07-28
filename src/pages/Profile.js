import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaCamera } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentJob: user?.currentJob || '',
    company: user?.company || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || 'Philippines'
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data
      const updatedUser = { ...user, ...formData };
      updateUser(updatedUser);
      
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Update your personal and professional information</p>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="profile-image-section">
              <div className="profile-image">
                <img 
                  src={profileImage ? URL.createObjectURL(profileImage) : user?.profileImage || '/default-avatar.png'} 
                  alt="Profile" 
                />
                <label htmlFor="profile-image" className="image-upload">
                  <FaCamera />
                </label>
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
              <h3>{user?.name || 'User Name'}</h3>
              <p className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Alumni'}</p>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-label">Batch</span>
                <span className="stat-value">{user?.batch || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Course</span>
                <span className="stat-value">{user?.course || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className="stat-value approved">Approved</span>
              </div>
            </div>
          </div>

          <div className="profile-form-section">
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                <h3>Personal Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      <FaUser /> First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      <FaUser /> Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      <FaEnvelope /> Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      <FaPhone /> Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Professional Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="currentJob" className="form-label">
                      <FaBriefcase /> Current Job Title
                    </label>
                    <input
                      type="text"
                      id="currentJob"
                      name="currentJob"
                      value={formData.currentJob}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company" className="form-label">
                      <FaBriefcase /> Company/Organization
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Address Information</h3>
                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    <FaMapMarkerAlt /> Complete Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      <FaMapMarkerAlt /> City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country" className="form-label">
                      <FaMapMarkerAlt /> Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
                <button type="button" className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 