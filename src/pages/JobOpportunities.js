import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBriefcase, FaMapMarkerAlt, FaBuilding, FaClock, FaPlus, FaSearch, FaHeart, FaShare, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './JobOpportunities.css';
import '../components/SearchBar.css';
import supabase from '../config/supabaseClient';
import JobSubmission from '../components/JobSubmission';

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
  const [showJobSubmission, setShowJobSubmission] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase
        .from('job_opportunities')
        .select('*')
        .eq('is_active', true)
        .eq('approval_status', 'approved') // Only show approved jobs
        .order('created_at', { ascending: false });
      const mapped = (data || []).map(j => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        type: j.job_type || 'Full-time',
        salary: j.salary_range,
        description: j.description,
        requirements: j.requirements ? j.requirements.split(',').map(s => s.trim()) : [],
        postedDate: j.created_at,
        submissionType: j.submission_type,
        submissionFileUrl: j.submission_file_url,
        submissionImageUrl: j.submission_image_url
      }));
      setJobs(mapped);
      const locs = Array.from(new Set(mapped.map(j => j.location).filter(Boolean))).sort();
      setLocations(['All', ...locs]);
    };

    const fetchSavedJobs = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('user_id', user.id);
        if (data) {
          setSavedJobs(data.map(s => s.job_id));
        }
      }
    };

    fetchJobs();
    fetchSavedJobs();
  }, [user, refreshTrigger]);

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
    if (!user) {
      toast.info('Please log in to share job opportunities.');
      navigate('/login');
      return;
    }

    if (user.role === 'admin' || user.role === 'coordinator') {
      // Admins and coordinators can post directly (they'll use admin panel)
      navigate('/admin/jobs');
    } else if (user.role === 'alumni' && user.approval_status === 'approved') {
      // Alumni can submit jobs for review
      setShowJobSubmission(true);
    } else {
      toast.info('Your account needs to be approved to share job opportunities.');
    }
  };

  // Legacy job form handlers removed in favor of JobSubmission component

  const handleApplyJob = (job) => {
    window.open('https://www.uic.edu.ph/tag/uic-alumni-excellence/', '_blank');
    toast.info('Redirecting to UIC Alumni website...');
  };

  const handleSaveJob = async (jobId) => {
    if (!user?.id) {
      toast.error('Please login to save jobs');
      return;
    }

    try {
      if (savedJobs.includes(jobId)) {
        // Remove from saved jobs
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);

        if (error) throw error;
        setSavedJobs(savedJobs.filter(id => id !== jobId));
        toast.info('Job removed from saved list');
      } else {
        // Add to saved jobs
        const { error } = await supabase
          .from('saved_jobs')
          .insert({
            user_id: user.id,
            job_id: jobId
          });

        if (error) throw error;
        setSavedJobs([...savedJobs, jobId]);
        toast.success('Job saved to your list');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
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
          <div className="search-row">
            <div className="search-bar-container">
              <div className="search-bar-input-wrapper">
                <FaSearch className="search-bar-icon" />
                <input
                  type="text"
                  className="search-bar-input"
                  placeholder="Search jobs by title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="search-bar-clear" onClick={() => setSearchTerm('')}>
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
            <button className="btn btn-primary" onClick={handlePostJob}>
              <FaPlus /> {user?.role === 'alumni' ? 'Share Job' : 'Post a Job'}
            </button>
          </div>
          <div className="filters-box">
            <label className="filter-label">Field
              <select className="filter-select" aria-label="Filter by field" value={selectedField || ''} onChange={(e) => setSelectedField(e.target.value || null)}>
                <option value="">All Fields</option>
                {jobFields.map(field => {
                  const fieldJobCount = jobs.filter(job => {
                    const jobText = `${job.title} ${job.company} ${job.description || ''}`.toLowerCase();
                    return field.keywords.some(keyword =>
                      jobText.includes(keyword.toLowerCase())
                    );
                  }).length;
                  return (
                    <option key={field.id} value={field.id}>
                      {field.icon} {field.name} ({fieldJobCount})
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="filter-label">Location
              <select className="filter-select" aria-label="Filter by location" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </label>
            <label className="filter-label">Type
              <select className="filter-select" aria-label="Filter by job type" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                {types.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
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
                  <span style={{ fontWeight: '600', marginRight: '2px' }}>₱</span>
                  <span>{job.salary}</span>
                </div>
                <p className="job-description">{job.description}</p>

                {/* Display submission file or image if available */}
                {job.submissionType === 'pdf' && job.submissionFileUrl && (
                  <div className="job-attachment">
                    <h4>Job Posting Document:</h4>
                    <a
                      href={job.submissionFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-link pdf"
                    >
                      📄 View PDF Document
                    </a>
                  </div>
                )}

                {job.submissionType === 'image' && job.submissionImageUrl && (
                  <div className="job-attachment">
                    <h4>Job Posting Image:</h4>
                    <img
                      src={job.submissionImageUrl}
                      alt="Job posting"
                      className="job-posting-image"
                      onClick={() => window.open(job.submissionImageUrl, '_blank')}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                )}

                {job.requirements && job.requirements.length > 0 && (
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

      {/* Job Submission Modal for Alumni */}
      {showJobSubmission && (
        <JobSubmission
          onClose={() => setShowJobSubmission(false)}
          onSuccess={() => {
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}

      {/* Legacy Job Posting Modal removed */}
    </div>
  );
};

export default JobOpportunities;