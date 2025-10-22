import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBriefcase, FaMapMarkerAlt, FaBuilding, FaClock, FaDollarSign, FaPlus, FaSearch, FaHeart, FaShare, FaTimes, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './JobOpportunities.css';
import supabase from '../config/supabaseClient';

const JobOpportunities = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedField, setSelectedField] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [locations, setLocations] = useState(['All']);
  const [types] = useState(['All', 'Full-time']);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary_range: '',
    description: '',
    requirements: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('job_opportunities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      const mapped = (data || []).map(j => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        type: 'Full-time', // Default since job_type column doesn't exist
        salary: j.salary_range,
        description: j.description,
        requirements: j.requirements ? j.requirements.split(',').map(s => s.trim()) : [],
        postedDate: j.created_at
      }));
      setJobs(mapped);
      const locs = Array.from(new Set(mapped.map(j => j.location).filter(Boolean))).sort();
      setLocations(['All', ...locs]);
    };
    fetchJobs();
  }, []);

  const jobFields = [
    { 
      id: 'tech', 
      name: 'Technology Field', 
      icon: '💻', 
      color: '#3b82f6',
      keywords: ['software', 'developer', 'programmer', 'tech', 'it', 'computer', 'coding', 'programming', 'web', 'mobile', 'app', 'system', 'database', 'network', 'cyber', 'digital', 'data', 'analyst', 'engineer', 'frontend', 'backend', 'fullstack', 'ui', 'ux', 'designer']
    },
    { 
      id: 'medical', 
      name: 'Medical Field', 
      icon: '🏥', 
      color: '#ef4444',
      keywords: ['medical', 'health', 'doctor', 'nurse', 'physician', 'healthcare', 'hospital', 'clinic', 'pharmacy', 'therapy', 'treatment', 'patient', 'medicine', 'nursing', 'medical technology', 'healthcare', 'wellness']
    },
    { 
      id: 'governance', 
      name: 'Governance Field', 
      icon: '🏛️', 
      color: '#8b5cf6',
      keywords: ['government', 'public', 'policy', 'administration', 'governance', 'civil', 'service', 'municipal', 'city', 'provincial', 'national', 'federal', 'bureau', 'department', 'agency', 'official', 'public service']
    },
    { 
      id: 'engineering', 
      name: 'Engineering Field', 
      icon: '⚙️', 
      color: '#f59e0b',
      keywords: ['engineer', 'engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'industrial', 'construction', 'design', 'technical', 'project', 'infrastructure', 'building', 'machinery', 'equipment', 'manufacturing']
    },
    { 
      id: 'teaching', 
      name: 'Teaching Field', 
      icon: '📚', 
      color: '#10b981',
      keywords: ['teacher', 'teaching', 'education', 'instructor', 'professor', 'educator', 'school', 'university', 'college', 'academic', 'student', 'learning', 'curriculum', 'training', 'tutor', 'mentor', 'faculty']
    },
    { 
      id: 'entertainment', 
      name: 'Entertainment Industry', 
      icon: '🎬', 
      color: '#ec4899',
      keywords: ['entertainment', 'media', 'film', 'movie', 'television', 'tv', 'radio', 'music', 'artist', 'actor', 'actress', 'director', 'producer', 'creative', 'content', 'broadcast', 'journalism', 'news', 'reporter']
    },
    { 
      id: 'business', 
      name: 'Business Field', 
      icon: '💼', 
      color: '#06b6d4',
      keywords: ['business', 'management', 'marketing', 'sales', 'finance', 'accounting', 'banking', 'retail', 'commerce', 'entrepreneur', 'startup', 'corporate', 'executive', 'manager', 'analyst', 'consultant', 'administrative']
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      job.title.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term) ||
      (job.description || '').toLowerCase().includes(term);

    // Field filtering using keywords
    const matchesField = !selectedField || (() => {
      const selectedFieldData = jobFields.find(f => f.id === selectedField);
      if (!selectedFieldData) return false;
      
      const jobText = `${job.title} ${job.company} ${job.description || ''}`.toLowerCase();
      return selectedFieldData.keywords.some(keyword => 
        jobText.includes(keyword.toLowerCase())
      );
    })();

    const matchesLocation = selectedLocation === 'All' || job.location === selectedLocation;
    const matchesType = selectedType === 'All' || (job.type || '').toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesField && matchesLocation && matchesType;
  });

  const handlePostJob = () => {
    if (user?.role === 'admin') {
      setShowJobForm(true);
    } else {
      toast.info('Only administrators can post job opportunities. Please contact the admin.');
    }
  };

  const handleJobFormChange = (e) => {
    setJobFormData({
      ...jobFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleJobFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const { error } = await supabase
        .from('job_opportunities')
        .insert({
          title: jobFormData.title,
          company: jobFormData.company,
          location: jobFormData.location,
          salary_range: jobFormData.salary_range,
          description: jobFormData.description,
          requirements: jobFormData.requirements,
          posted_by: user.id,
          is_active: true
        });

      if (error) {
        toast.error('Error posting job: ' + error.message);
        return;
      }

      toast.success('Job posted successfully!');
      setShowJobForm(false);
      setJobFormData({
        title: '',
        company: '',
        location: '',
        salary_range: '',
        description: '',
        requirements: ''
      });

      // Refresh jobs list
      const { data } = await supabase
        .from('job_opportunities')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setJobs((data || []).map(j => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        type: 'Full-time', // Default since job_type column doesn't exist
        salary: j.salary_range,
        description: j.description,
        requirements: j.requirements ? j.requirements.split(',').map(s => s.trim()) : [],
        postedDate: j.created_at
      })));

    } catch (error) {
      toast.error('Unexpected error posting job');
    } finally {
      setFormLoading(false);
    }
  };

  const closeJobForm = () => {
    setShowJobForm(false);
    setJobFormData({
      title: '',
      company: '',
      location: '',
      salary_range: '',
      description: '',
      requirements: ''
    });
  };

  const handleApplyJob = (job) => {
    toast.success(`Application submitted for ${job.title} at ${job.company}!`);
  };

  const handleSaveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      toast.info('Job removed from saved list');
    } else {
      setSavedJobs([...savedJobs, jobId]);
      toast.success('Job saved to your list');
    }
  };

  const handleShareJob = (job) => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `${job.title} at ${job.company} - ${job.salary}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${job.title} at ${job.company} - ${job.salary}`);
      toast.success('Job link copied to clipboard!');
    }
  };

  return (
    <div className="job-opportunities-page">
      <div className="container">
        <div className="page-header">
          <h1>Job Opportunities</h1>
          <p>Explore career opportunities across various fields for UIC Alumni</p>
        </div>

        <div className="search-section">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search jobs by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters-box">
            <select className="filter-select" value={selectedLocation} onChange={(e)=>setSelectedLocation(e.target.value)}>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <select className="filter-select" value={selectedType} onChange={(e)=>setSelectedType(e.target.value)}>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handlePostJob}>
            <FaPlus /> Post a Job
          </button>
        </div>

        <div className="job-fields">
          <h2>Browse by Field</h2>
          <div className="fields-grid">
            {jobFields.map(field => {
              // Calculate job count for this field
              const fieldJobCount = jobs.filter(job => {
                const jobText = `${job.title} ${job.company} ${job.description || ''}`.toLowerCase();
                return field.keywords.some(keyword => 
                  jobText.includes(keyword.toLowerCase())
                );
              }).length;

              return (
                <div
                  key={field.id}
                  className={`field-card ${selectedField === field.id ? 'active' : ''}`}
                  onClick={() => setSelectedField(selectedField === field.id ? null : field.id)}
                  style={{ borderColor: field.color }}
                >
                  <div className="field-icon" style={{ backgroundColor: field.color }}>
                    {field.icon}
                  </div>
                  <h3>{field.name}</h3>
                  <p>{fieldJobCount} opportunities</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="jobs-section">
          <div className="section-header">
            <h2>
              {selectedField ? `${jobFields.find(f => f.id === selectedField)?.name} Opportunities` : 'All Job Opportunities'}
            </h2>
            <p>{filteredJobs.length} jobs found</p>
          </div>

          <div className="jobs-grid">
            {filteredJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="job-type">{job.type}</span>
                </div>
                <div className="job-company">
                  <FaBuilding />
                  <span>{job.company}</span>
                </div>
                <div className="job-location">
                  <FaMapMarkerAlt />
                  <span>{job.location}</span>
                </div>
                <div className="job-salary">
                  <FaDollarSign />
                  <span>{job.salary}</span>
                </div>
                <p className="job-description">{job.description}</p>
                
                {job.requirements && (
                  <div className="job-requirements">
                    <h4>Requirements:</h4>
                    <div className="requirements-tags">
                      {job.requirements.map((req, index) => (
                        <span key={index} className="requirement-tag">{req}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="job-meta">
                  <span className="posted-date">Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                </div>
                
                <div className="job-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleApplyJob(job)}
                  >
                    Apply Now
                  </button>
                  <button 
                    className={`btn btn-outline ${savedJobs.includes(job.id) ? 'saved' : ''}`}
                    onClick={() => handleSaveJob(job.id)}
                  >
                    <FaHeart /> {savedJobs.includes(job.id) ? 'Saved' : 'Save Job'}
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => handleShareJob(job)}
                  >
                    <FaShare /> Share
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="no-jobs">
              <h3>No jobs found</h3>
              <p>Try adjusting your search terms or select a different field</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Posting Modal */}
      {showJobForm && (
        <div className="job-form-modal">
          <div className="job-form-container">
            <div className="job-form-header">
              <h2>Post New Job Opportunity</h2>
              <button className="close-btn" onClick={closeJobForm}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleJobFormSubmit} className="job-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Job Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={jobFormData.title}
                    onChange={handleJobFormChange}
                    required
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="company">Company *</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={jobFormData.company}
                    onChange={handleJobFormChange}
                    required
                    placeholder="e.g., TechCorp Inc."
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={jobFormData.location}
                  onChange={handleJobFormChange}
                  required
                  placeholder="e.g., Davao City, Philippines"
                />
              </div>

              <div className="form-group">
                <label htmlFor="salary_range">Salary Range</label>
                <input
                  type="text"
                  id="salary_range"
                  name="salary_range"
                  value={jobFormData.salary_range}
                  onChange={handleJobFormChange}
                  placeholder="e.g., ₱25,000 - ₱35,000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Job Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={jobFormData.description}
                  onChange={handleJobFormChange}
                  required
                  rows="4"
                  placeholder="Describe the role, responsibilities, and what the candidate will do. Include contact information (email/phone) if needed..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="requirements">Requirements</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={jobFormData.requirements}
                  onChange={handleJobFormChange}
                  rows="3"
                  placeholder="List requirements separated by commas (e.g., Bachelor's degree, 2 years experience, Python knowledge)"
                />
              </div>


              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={closeJobForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  <FaSave /> {formLoading ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobOpportunities; 