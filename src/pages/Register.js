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
    '2004', '2003', '2002', '2001', '2000', '1999', '1998', '1997', '1996', '1995',
    '1994', '1993', '1992', '1991', '1990', 'Before 1990'
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

  const uploadProfileImage = async () => {
    if (!profileImage) return null;

    try {
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `temp/${fileName}`; // Use temp folder for pending registrations

      console.log('📤 Uploading profile image...');
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
      console.log('Starting registration process...');
      console.log('Form data:', formData);
      console.log('Profile image:', profileImage ? profileImage.name : 'No image selected');

      // First, upload profile image if provided
      let profileImageUrl = null;
      if (profileImage) {
        console.log('Uploading profile image...');
        try {
          profileImageUrl = await uploadProfileImage();
          console.log('Profile image uploaded successfully:', profileImageUrl);
        } catch (imageError) {
          console.error('Profile image upload failed:', imageError);
          toast.error('Failed to upload profile image. Please try again.');
          return;
        }
      }

      // Create a pending registration record with all the form data
      const registrationData = {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || null,
        course: formData.course,
        batch_year: formData.batch ? parseInt(formData.batch) : null,
        graduation_year: formData.graduationYear ? parseInt(formData.graduationYear) : null,
        current_job: formData.currentJob || null,
        company: formData.company || null,
        address: formData.address || null,
        city: formData.city || null,
        country: formData.country || 'Philippines',
        student_id: formData.studentId || null,
        profile_image_url: profileImageUrl,
        status: 'pending'
      };

      console.log('Registration data to insert:', registrationData);

      const { data: regData, error: regError } = await supabase
        .from('pending_registrations')
        .insert(registrationData)
        .select();

      if (regError) {
        console.error('Registration data error:', regError);
        console.error('Error details:', {
          message: regError.message,
          code: regError.code,
          details: regError.details,
          hint: regError.hint
        });

        // If registration fails and we uploaded an image, we should clean it up
        if (profileImageUrl) {
          try {
            const fileName = profileImageUrl.split('/').pop();
            await supabase.storage
              .from('alumni-profiles')
              .remove([`temp/${fileName}`]);
            console.log('Cleaned up uploaded image after registration failure');
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded image:', cleanupError);
          }
        }

        // Provide more specific error messages
        if (regError.message.includes('duplicate key')) {
          toast.error('An account with this email already exists. Please use a different email or try logging in.');
        } else if (regError.message.includes('violates check constraint')) {
          toast.error('Invalid data provided. Please check all required fields are filled correctly.');
        } else if (regError.message.includes('violates not-null constraint')) {
          toast.error('Please fill in all required fields (marked with *)');
        } else {
          toast.error(`Registration failed: ${regError.message}`);
        }
        return;
      }

      console.log('Registration data saved successfully:', regData);

      // Then create the auth user
      console.log('Creating Supabase auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            profile_image_url: profileImageUrl
          }
        }
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        console.error('Auth error details:', {
          message: authError.message,
          code: authError.code,
          details: authError.details
        });

        // If auth fails, we should clean up the pending registration and uploaded image
        if (regData && regData[0]) {
          await supabase
            .from('pending_registrations')
            .delete()
            .eq('id', regData[0].id);
        }

        if (profileImageUrl) {
          try {
            const fileName = profileImageUrl.split('/').pop();
            await supabase.storage
              .from('alumni-profiles')
              .remove([`temp/${fileName}`]);
            console.log('Cleaned up uploaded image after auth failure');
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded image:', cleanupError);
          }
        }

        toast.error(authError.message || 'Failed to create user account. Please try again.');
        return;
      }

      console.log('Auth user created successfully:', authData);
      toast.success('Registration successful! Please check your email to confirm your account. After you sign in, your application will be submitted for admin approval.');
      navigate('/login');
    } catch (error) {
      console.error('Unexpected error during registration:', error);
      console.error('Error stack:', error.stack);
      toast.error('An unexpected error occurred during registration. Please try again.');
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
                    <option value="">Select your year enrolled</option>
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
                <span>
                  I agree to the{' '}
                  <Link to="/terms-and-conditions" className="terms-link">
                    terms and conditions
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" className="privacy-link">
                    privacy policy
                  </Link>
                </span>
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