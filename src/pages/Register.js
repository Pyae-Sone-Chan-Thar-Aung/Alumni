import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../config/supabaseClient';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaGraduationCap, FaCalendarAlt, FaPhone, FaMapMarkerAlt, FaCamera, FaUpload } from 'react-icons/fa';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    phone: '',
    batch: '',
    course: '',
    graduationYear: '',
    currentJob: '',
    company: '',
    address: '',
    city: '',
    country: 'Philippines'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const courses = [
    'BS Accountancy',
    'BS Archiecture',
    'BS Psychology',
    'BS Business Administration',
    'BS Computer Science',
    'BS Information Technology',
    'BS Information Systems',
    'BS Computer Engineering',
    'BS Electronics Engineering',
    'BS Civil Engineering',
    'BS Mechanical Engineering',
    'BS Electrical Engineering',
    'BS Nursing',
    'BS Medical Technology',
    'BS Pharmacy',
    'BS Biology',
    'BS Chemistry',
    'BS Mathematics',
    'BS Physics',
    'BS Psychology',
    'BS Social Work',
    'BS Education',
    'BS Tourism Management',
    'BS Hospitality Management',
    'BS Commerce',
    'BS Accounting',
    'BS Marketing',
    'BA Communication',
    'BA English',

    'Other'
  ];

  const batches = [
    '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015',
    '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007', '2006', '2005',
    '2004', '2003', '2002', '2001', '2000', '1999', '1998', '1997', '1996', '1995'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
    }
  };

  const uploadProfileImage = async (userId) => {
    if (!profileImage) return null;

    try {
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      console.log('📤 Uploading profile image...');
      console.log('User ID:', userId);
      console.log('File:', profileImage.name);
      console.log('File size:', profileImage.size, 'bytes');
      console.log('File type:', profileImage.type);
      console.log('Target path:', filePath);
      console.log('Bucket:', 'alumni-profiles');

      const { data, error } = await supabase.storage
        .from('alumni-profiles')
        .upload(filePath, profileImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Storage upload error:', error);
        console.error('Error code:', error.statusCode);
        console.error('Error message:', error.message);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('✅ Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('alumni-profiles')
        .getPublicUrl(filePath);

      console.log('✅ Public URL generated:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('❌ Image upload error:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // First, create a pending registration record with all the form data
      const registrationData = {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        course: formData.course,
        batch_year: parseInt(formData.batch),
        graduation_year: parseInt(formData.graduationYear),
        current_job: formData.currentJob,
        company: formData.company,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        student_id: formData.studentId,
        status: 'pending',
        submitted_at: new Date().toISOString()
      };

      const { error: regError } = await supabase
        .from('pending_registrations')
        .insert(registrationData);

      if (regError) {
        console.error('Registration data error:', regError);
        toast.error('Failed to save registration data. Please try again.');
        return;
      }

      // Then create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { first_name: formData.firstName, last_name: formData.lastName } }
      });
      
      if (authError) {
        toast.error(authError.message || 'Registration failed');
        return;
      }

      toast.success('Registration created! Please check your email to confirm your account. After you sign in, your application will be submitted for admin approval.');
      navigate('/login');
    } catch (error) {
      console.error('Unexpected error during registration:', error);
      toast.error('Unexpected error during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="register-container">
          <div className="register-header">
            <h1>Join UIC Alumni Community</h1>
            <p>Register to connect with fellow alumni and stay updated with university news</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-section">
              <h3>Profile Picture</h3>
              <div className="image-upload-section">
                <div className="image-preview-container">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile Preview" className="image-preview" />
                  ) : (
                    <div className="image-placeholder">
                      <FaCamera size={40} />
                      <p>Upload Profile Picture</p>
                    </div>
                  )}
                </div>
                <div className="image-upload-controls">
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageChange}
                    className="image-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="profileImage" className="image-upload-btn">
                    <FaUpload /> Choose Image
                  </label>
                  <p className="image-help-text">
                    JPG, JPEG, or PNG. Max size: 5MB
                  </p>
                </div>
              </div>
            </div>

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
                    placeholder="Enter your first name"
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
                    placeholder="Enter your last name"
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
                    placeholder="Enter your email"
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
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Academic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="studentId" className="form-label">
                    <FaUser /> Student ID
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your student ID (optional)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="course" className="form-label">
                    <FaGraduationCap /> Course/Program
                  </label>
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select your course</option>
                    {courses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="batch" className="form-label">
                    <FaCalendarAlt /> Batch Year
                  </label>
                  <select
                    id="batch"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select your batch</option>
                    {batches.map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="graduationYear" className="form-label">
                  <FaCalendarAlt /> Graduation Year
                </label>
                <input
                  type="number"
                  id="graduationYear"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter graduation year"
                  min="1990"
                  max="2024"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Professional Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currentJob" className="form-label">
                    Current Job Title
                  </label>
                  <input
                    type="text"
                    id="currentJob"
                    name="currentJob"
                    value={formData.currentJob}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your current job title"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company" className="form-label">
                    Company/Organization
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Address Information</h3>
              <div className="form-group">
                <label htmlFor="address" className="form-label">
                  <FaMapMarkerAlt /> Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your complete address"
                  rows="3"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your city"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your country"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Account Security</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    <FaLock /> Password
                  </label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    <FaLock /> Confirm Password
                  </label>
                  <div className="password-input">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>I agree to the terms and conditions and privacy policy</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary register-btn"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="login-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 