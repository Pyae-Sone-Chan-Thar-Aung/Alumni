import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaBriefcase, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaMapMarkerAlt, FaBuilding, FaDollarSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './AdminJobs.css';

const AdminJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary_range: '',
    description: '',
    requirements: '',
    is_active: true
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch job opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Check if user is loaded
    if (!user || !user.id) {
      toast.error('User not authenticated. Please refresh the page and try again.');
      setLoading(false);
      return;
    }
    
    console.log('Submitting job with user:', user.id);
    console.log('Form data:', formData);
    
    try {
      if (editingJob) {
        const { error } = await supabase
          .from('job_opportunities')
          .update(formData)
          .eq('id', editingJob.id);

        if (error) throw error;
        toast.success('Job opportunity updated successfully!');
      } else {
        const jobData = {
          title: formData.title,
          company: formData.company,
          location: formData.location,
          salary_range: formData.salary_range,
          description: formData.description,
          requirements: formData.requirements,
          posted_by: user.id,
          is_active: formData.is_active
        };
        
        const { error } = await supabase
          .from('job_opportunities')
          .insert([jobData]);

        if (error) throw error;
        toast.success('Job opportunity created successfully!');
      }

      setShowModal(false);
      setEditingJob(null);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      console.error('Form data:', formData);
      toast.error('Failed to save job opportunity: ' + (error.message || error.toString()));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      salary_range: job.salary_range || '',
      description: job.description || '',
      requirements: job.requirements || '',
      is_active: job.is_active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job opportunity?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('job_opportunities')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      toast.success('Job opportunity deleted successfully!');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job opportunity');
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('job_opportunities')
        .update({ is_active: !currentStatus })
        .eq('id', jobId);

      if (error) throw error;
      toast.success(`Job ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      salary_range: '',
      description: '',
      requirements: '',
      is_active: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && job.is_active) ||
                         (filterStatus === 'inactive' && !job.is_active);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="admin-jobs loading">
        <div className="loading-spinner"></div>
        <p>Loading job opportunities...</p>
      </div>
    );
  }

  return (
    <div className="admin-jobs">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1><FaBriefcase /> Job Opportunities Management</h1>
            <p>Manage job postings and opportunities for alumni</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingJob(null);
              resetForm();
              setShowModal(true);
            }}
          >
            <FaPlus /> Post New Job
          </button>
        </div>

        <div className="jobs-controls">
          <div className="search-filter-row">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search jobs, companies, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-container">
              <FaFilter className="filter-icon" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Jobs</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="jobs-stats">
            <div className="stat-item">
              <span className="stat-number">{jobs.length}</span>
              <span className="stat-label">Total Jobs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{jobs.filter(j => j.is_active).length}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{jobs.filter(j => !j.is_active).length}</span>
              <span className="stat-label">Inactive</span>
            </div>
          </div>
        </div>

        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <div key={job.id} className={`job-card ${!job.is_active ? 'inactive' : ''}`}>
              <div className="job-header">
                <div className="job-title-section">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-badges">
                    <span className={`badge status ${job.is_active ? 'active' : 'inactive'}`}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="job-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => handleEdit(job)}
                    title="Edit Job"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className={`btn-icon ${job.is_active ? 'deactivate' : 'activate'}`}
                    onClick={() => toggleJobStatus(job.id, job.is_active)}
                    title={job.is_active ? 'Deactivate' : 'Activate'}
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="btn-icon delete"
                    onClick={() => handleDelete(job.id)}
                    title="Delete Job"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="job-details">
                <div className="job-meta">
                  <div className="meta-item">
                    <FaBuilding />
                    <span>{job.company}</span>
                  </div>
                  <div className="meta-item">
                    <FaMapMarkerAlt />
                    <span>{job.location}</span>
                  </div>
                  {job.salary_range && (
                    <div className="meta-item">
                      <FaDollarSign />
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                </div>

                <p className="job-description">
                  {job.description?.substring(0, 150)}
                  {job.description?.length > 150 && '...'}
                </p>

                <div className="job-footer">
                  <span className="job-posted">Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="no-jobs">
            <FaBriefcase className="no-jobs-icon" />
            <h3>No job opportunities found</h3>
            <p>
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by posting your first job opportunity.'
              }
            </p>
          </div>
        )}

        {/* Job Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content job-modal">
              <div className="modal-header">
                <h3>{editingJob ? 'Edit Job Opportunity' : 'Post New Job Opportunity'}</h3>
                <button 
                  className="modal-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditingJob(null);
                    resetForm();
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="job-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">Job Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Senior Software Developer"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company">Company *</label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Tech Solutions Inc."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Davao City, Philippines"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="salary_range">Salary Range</label>
                  <input
                    type="text"
                    id="salary_range"
                    name="salary_range"
                    value={formData.salary_range}
                    onChange={handleInputChange}
                    placeholder="e.g. ₱30,000 - ₱50,000"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Job Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    placeholder="Describe the job role, responsibilities, and what the company offers..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="requirements">Requirements</label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="List the required skills, experience, and qualifications..."
                  />
                </div>


                <div className="form-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Active (visible to alumni)
                  </label>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingJob(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingJob ? 'Update Job' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobs;
