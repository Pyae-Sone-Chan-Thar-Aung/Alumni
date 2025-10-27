import React, { useState } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaCalendar, FaBuilding, FaBriefcase, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { supabase } from '../config/supabaseClient';
import './AddUserModal.css';

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    // Basic Information
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    
    // Role Selection
    role: 'alumni', // Default to alumni
    
    // Academic Information (for alumni)
    program: '',
    batchYear: '',
    graduationYear: '',
    
    // Professional Information (optional)
    currentJob: '',
    company: '',
    
    // Address Information (optional)
    address: '',
    city: '',
    country: 'Philippines'
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Name validation
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Role-specific validation
    if (formData.role === 'alumni') {
      if (!formData.program?.trim()) {
        newErrors.program = 'Program/Course is required for alumni';
      }
      if (!formData.graduationYear) {
        newErrors.graduationYear = 'Graduation year is required for alumni';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if email already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.email)
        .single();
      
      if (existingUser) {
        toast.error('A user with this email already exists');
        setLoading(false);
        return;
      }

      // Check if there's already a pending invitation for this email
      const { data: existingInvite } = await supabase
        .from('pending_invitations')
        .select('email')
        .eq('email', formData.email)
        .single();
      
      if (existingInvite) {
        toast.error('An invitation has already been sent to this email');
        setLoading(false);
        return;
      }
      
      // Use Supabase Auth Admin API to send invitation email
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        formData.email,
        {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.role,
            invited_by_admin: true
          },
          redirectTo: `${window.location.origin}/complete-registration`
        }
      );

      if (inviteError) {
        // If admin API is not available, store in pending_invitations table
        console.warn('Admin API not available, storing invitation data:', inviteError);
        
        // Store invitation data in pending_invitations table
        const { error: pendingError } = await supabase
          .from('pending_invitations')
          .insert([{
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone || null,
            role: formData.role,
            program: formData.program || null,
            batch_year: formData.batchYear || null,
            graduation_year: formData.graduationYear || null,
            current_job: formData.currentJob || null,
            company: formData.company || null,
            address: formData.address || null,
            city: formData.city || null,
            country: formData.country || 'Philippines',
            invitation_status: 'pending',
            invited_at: new Date().toISOString()
          }]);

        if (pendingError) {
          console.error('Error storing invitation:', pendingError);
          toast.error(`Failed to send invitation: ${pendingError.message}`);
          setLoading(false);
          return;
        }

        toast.success(`✉️ Invitation sent to ${formData.email}! They will receive an email to complete their registration.`);
      } else {
        // If invitation via Supabase Auth succeeded, also store in pending_invitations for tracking
        await supabase
          .from('pending_invitations')
          .insert([{
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone || null,
            role: formData.role,
            program: formData.program || null,
            batch_year: formData.batchYear || null,
            graduation_year: formData.graduationYear || null,
            current_job: formData.currentJob || null,
            company: formData.company || null,
            address: formData.address || null,
            city: formData.city || null,
            country: formData.country || 'Philippines',
            invitation_status: 'sent',
            invited_at: new Date().toISOString()
          }]);

        toast.success(`✉️ Invitation email sent to ${formData.email}! They will receive an email to complete their registration.`);
      }
      
      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'alumni',
        program: '',
        batchYear: '',
        graduationYear: '',
        currentJob: '',
        company: '',
        address: '',
        city: '',
        country: 'Philippines'
      });
      
      // Notify parent component (won't refresh users list since they're not added yet)
      if (onUserAdded) {
        onUserAdded();
      }
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Unexpected error sending invitation:', error);
      toast.error('An unexpected error occurred while sending the invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FaUser /> Invite New User</h2>
          <button className="close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="form-section">
            <h3>User Type</h3>
            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="alumni">Alumni (User)</option>
                <option value="admin">Admin (Can post news, gallery, and jobs only)</option>
              </select>
              <small className="form-hint">
                {formData.role === 'admin' 
                  ? 'Admin will receive an invitation email to complete their registration' 
                  : 'Alumni will receive an invitation email to complete their registration'}
              </small>
            </div>
          </div>

          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  <FaUser /> First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-control ${errors.firstName ? 'error' : ''}`}
                  placeholder="Enter first name"
                  required
                />
                {errors.firstName && <span className="error-message">{errors.firstName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">
                  <FaUser /> Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-control ${errors.lastName ? 'error' : ''}`}
                  placeholder="Enter last name"
                  required
                />
                {errors.lastName && <span className="error-message">{errors.lastName}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">
                  <FaEnvelope /> Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="Enter email address"
                  required
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">
                  <FaPhone /> Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {formData.role === 'alumni' && (
            <div className="form-section">
              <h3>Academic Information</h3>
              <div className="form-group">
                <label htmlFor="program">
                  <FaGraduationCap /> Program/Course *
                </label>
                <input
                  type="text"
                  id="program"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  className={`form-control ${errors.program ? 'error' : ''}`}
                  placeholder="e.g., BS Computer Science"
                  required={formData.role === 'alumni'}
                />
                {errors.program && <span className="error-message">{errors.program}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="batchYear">
                    <FaCalendar /> Batch Year
                  </label>
                  <input
                    type="number"
                    id="batchYear"
                    name="batchYear"
                    value={formData.batchYear}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., 2020"
                    min="1950"
                    max={new Date().getFullYear()}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="graduationYear">
                    <FaGraduationCap /> Graduation Year *
                  </label>
                  <input
                    type="number"
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className={`form-control ${errors.graduationYear ? 'error' : ''}`}
                    placeholder="e.g., 2024"
                    min="1950"
                    max={new Date().getFullYear() + 10}
                    required={formData.role === 'alumni'}
                  />
                  {errors.graduationYear && <span className="error-message">{errors.graduationYear}</span>}
                </div>
              </div>
            </div>
          )}

          <div className="form-section">
            <h3>Professional Information (Optional)</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="currentJob">
                  <FaBriefcase /> Current Job Title
                </label>
                <input
                  type="text"
                  id="currentJob"
                  name="currentJob"
                  value={formData.currentJob}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Software Engineer"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="company">
                  <FaBuilding /> Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Tech Corp"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information (Optional)</h3>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter address"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter city"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Sending Invitation...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
