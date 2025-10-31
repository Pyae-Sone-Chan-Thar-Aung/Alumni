import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUpload, FaFilePdf, FaImage, FaTimes, FaSpinner } from 'react-icons/fa';
import './JobSubmission.css';

const JobSubmission = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [submissionType, setSubmissionType] = useState('form'); // 'form', 'pdf', 'image'
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'Full-time',
    salary_range: '',
    description: '',
    requirements: '',
    contact_email: '',
    contact_phone: ''
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (submissionType === 'pdf' && selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (submissionType === 'image' && 
        !['image/jpeg', 'image/jpg', 'image/png'].includes(selectedFile.type)) {
      toast.error('Please upload a JPEG or PNG image');
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (submissionType === 'image' && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const uploadFile = async () => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${user.id}.${fileExt}`;
    const filePath = `submissions/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from('job-submissions')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('job-submissions')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let fileUrl = null;
      let imageUrl = null;

      // Upload file if provided
      if (submissionType === 'pdf' && file) {
        fileUrl = await uploadFile();
      } else if (submissionType === 'image' && file) {
        imageUrl = await uploadFile();
      }

      // Prepare job submission data
      const jobData = {
        title: formData.title || 'Job Opportunity',
        company: formData.company || 'Company Name',
        location: formData.location || '',
        job_type: formData.job_type || 'Full-time',
        salary_range: formData.salary_range || null,
        description: formData.description || 
          (submissionType === 'form' 
            ? 'See attached file for job details' 
            : 'Job details provided in uploaded file'),
        requirements: formData.requirements || null,
        application_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        posted_by: user.id,
        submission_type: submissionType,
        submission_file_url: fileUrl,
        submission_image_url: imageUrl,
        approval_status: 'pending',
        is_alumni_submission: true,
        is_active: false // Inactive until approved
      };

      const { error } = await supabase
        .from('job_opportunities')
        .insert([jobData]);

      if (error) throw error;

      toast.success('Job submission sent for review! You will be notified once it is approved.');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Job submission error:', error);
      toast.error(`Failed to submit job: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="job-submission-modal">
      <div className="job-submission-content">
        <div className="job-submission-header">
          <h2>Share Job Opportunity</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="submission-type-selector">
          <h3>Choose Submission Method</h3>
          <div className="type-options">
            <button
              type="button"
              className={`type-option ${submissionType === 'form' ? 'active' : ''}`}
              onClick={() => {
                setSubmissionType('form');
                setFile(null);
                setFilePreview(null);
              }}
            >
              <span className="type-icon">📝</span>
              <span>Fill Form</span>
            </button>
            <button
              type="button"
              className={`type-option ${submissionType === 'pdf' ? 'active' : ''}`}
              onClick={() => {
                setSubmissionType('pdf');
                setFile(null);
                setFilePreview(null);
              }}
            >
              <FaFilePdf className="type-icon" />
              <span>Upload PDF</span>
            </button>
            <button
              type="button"
              className={`type-option ${submissionType === 'image' ? 'active' : ''}`}
              onClick={() => {
                setSubmissionType('image');
                setFile(null);
                setFilePreview(null);
              }}
            >
              <FaImage className="type-icon" />
              <span>Upload Image</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="job-submission-form">
          {submissionType === 'pdf' && (
            <div className="file-upload-section">
              <label className="file-upload-label">
                <FaUpload /> Upload Job Posting PDF
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="file-input"
                  required
                />
              </label>
              {file && (
                <div className="file-preview">
                  <FaFilePdf />
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFilePreview(null);
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              <p className="file-help">Please upload a PDF file (max 5MB) containing the job posting details.</p>
            </div>
          )}

          {submissionType === 'image' && (
            <div className="file-upload-section">
              <label className="file-upload-label">
                <FaUpload /> Upload Job Posting Image
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className="file-input"
                  required
                />
              </label>
              {filePreview && (
                <div className="image-preview">
                  <img src={filePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-preview"
                    onClick={() => {
                      setFile(null);
                      setFilePreview(null);
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
              <p className="file-help">Please upload an image (JPEG/PNG, max 5MB) of the job posting.</p>
            </div>
          )}

          {/* Basic info always required */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Software Engineer"
                  required={submissionType === 'form'}
                />
              </div>
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Tech Corp Inc."
                  required={submissionType === 'form'}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Davao City, Philippines"
                />
              </div>
              <div className="form-group">
                <label>Job Type</label>
                <select
                  value={formData.job_type}
                  onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>
          </div>

          {submissionType === 'form' && (
            <div className="form-section">
              <h3>Job Details</h3>
              <div className="form-group">
                <label>Job Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Describe the job role, responsibilities, and requirements..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Requirements</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows="3"
                  placeholder="List required skills, experience, qualifications..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Salary Range</label>
                  <input
                    type="text"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    placeholder="e.g., ₱25,000 - ₱35,000"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="applications@company.com"
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+63 123 456 7890"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? (
                <>
                  <FaSpinner className="spinner" /> Submitting...
                </>
              ) : (
                'Submit for Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobSubmission;

