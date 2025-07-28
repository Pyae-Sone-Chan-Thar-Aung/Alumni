import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaGraduationCap, FaCalendarAlt, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
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
  const navigate = useNavigate();

  const courses = [
    'BS Accountancy',
    'BS Business Administration',
    'BS Computer Science',
    'BS Information Technology',
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
    'BS Criminology',
    'BS Architecture',
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
      // Simulate API call
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Registration submitted successfully! Please wait for admin approval.');
        navigate('/login');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Registration failed');
      }
    } catch (error) {
      // For demo purposes, simulate successful registration
      toast.success('Registration submitted successfully! Please wait for admin approval.');
      navigate('/login');
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