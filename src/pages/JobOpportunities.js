import React, { useState } from 'react';
import { FaBriefcase, FaMapMarkerAlt, FaBuilding, FaClock, FaDollarSign, FaPlus, FaSearch } from 'react-icons/fa';
import './JobOpportunities.css';

const JobOpportunities = () => {
  const [selectedField, setSelectedField] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const jobFields = [
    {
      id: 'tech',
      name: 'Technology Field',
      icon: '💻',
      color: '#3b82f6',
      jobs: [
        {
          id: 1,
          title: 'Senior Software Engineer',
          company: 'TechCorp Inc.',
          location: 'Davao City',
          type: 'Full-time',
          salary: '₱80,000 - ₱120,000',
          description: 'Looking for experienced software engineer with 5+ years of experience in React, Node.js, and cloud technologies.'
        },
        {
          id: 2,
          title: 'Data Scientist',
          company: 'DataFlow Solutions',
          location: 'Manila',
          type: 'Full-time',
          salary: '₱90,000 - ₱150,000',
          description: 'Join our data science team to develop machine learning models and analytics solutions.'
        }
      ]
    },
    {
      id: 'medical',
      name: 'Medical Field',
      icon: '🏥',
      color: '#ef4444',
      jobs: [
        {
          id: 3,
          title: 'Nurse Practitioner',
          company: 'City Hospital',
          location: 'Cebu City',
          type: 'Full-time',
          salary: '₱60,000 - ₱90,000',
          description: 'Experienced nurse practitioner needed for our emergency department.'
        },
        {
          id: 4,
          title: 'Medical Technologist',
          company: 'LabCare Diagnostics',
          location: 'Davao City',
          type: 'Full-time',
          salary: '₱45,000 - ₱70,000',
          description: 'Perform laboratory tests and maintain quality control standards.'
        }
      ]
    },
    {
      id: 'governance',
      name: 'Governance Field',
      icon: '🏛️',
      color: '#8b5cf6',
      jobs: [
        {
          id: 5,
          title: 'Policy Analyst',
          company: 'Department of Finance',
          location: 'Manila',
          type: 'Full-time',
          salary: '₱70,000 - ₱100,000',
          description: 'Analyze economic policies and provide recommendations for government initiatives.'
        }
      ]
    },
    {
      id: 'engineering',
      name: 'Engineering Field',
      icon: '⚙️',
      color: '#f59e0b',
      jobs: [
        {
          id: 6,
          title: 'Civil Engineer',
          company: 'BuildRight Construction',
          location: 'Davao City',
          type: 'Full-time',
          salary: '₱65,000 - ₱95,000',
          description: 'Design and oversee construction projects for infrastructure development.'
        },
        {
          id: 7,
          title: 'Mechanical Engineer',
          company: 'Industrial Solutions',
          location: 'Cebu City',
          type: 'Full-time',
          salary: '₱60,000 - ₱85,000',
          description: 'Design mechanical systems and oversee manufacturing processes.'
        }
      ]
    },
    {
      id: 'teaching',
      name: 'Teaching Field',
      icon: '📚',
      color: '#10b981',
      jobs: [
        {
          id: 8,
          title: 'High School Teacher',
          company: 'St. Mary\'s Academy',
          location: 'Davao City',
          type: 'Full-time',
          salary: '₱40,000 - ₱60,000',
          description: 'Teach mathematics and science subjects to high school students.'
        }
      ]
    },
    {
      id: 'entertainment',
      name: 'Entertainment Industry',
      icon: '🎬',
      color: '#ec4899',
      jobs: [
        {
          id: 9,
          title: 'Content Creator',
          company: 'Digital Media Studio',
          location: 'Manila',
          type: 'Part-time',
          salary: '₱30,000 - ₱50,000',
          description: 'Create engaging content for social media platforms and digital marketing campaigns.'
        }
      ]
    },
    {
      id: 'business',
      name: 'Business Field',
      icon: '💼',
      color: '#06b6d4',
      jobs: [
        {
          id: 10,
          title: 'Marketing Manager',
          company: 'Global Solutions',
          location: 'Manila',
          type: 'Full-time',
          salary: '₱75,000 - ₱110,000',
          description: 'Develop and execute marketing strategies for product launches and brand awareness.'
        },
        {
          id: 11,
          title: 'Accountant',
          company: 'FinancePro Services',
          location: 'Davao City',
          type: 'Full-time',
          salary: '₱50,000 - ₱75,000',
          description: 'Handle financial records, prepare reports, and ensure compliance with regulations.'
        }
      ]
    }
  ];

  const filteredJobs = selectedField 
    ? jobFields.find(field => field.id === selectedField)?.jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    : jobFields.flatMap(field => field.jobs).filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="job-opportunities-page">
      <div className="container">
        <div className="page-header">
          <h1>Job Opportunities</h1>
          <p>Explore career opportunities across various fields</p>
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
          <button className="btn btn-primary">
            <FaPlus /> Post a Job
          </button>
        </div>

        <div className="job-fields">
          <h2>Browse by Field</h2>
          <div className="fields-grid">
            {jobFields.map(field => (
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
                <p>{field.jobs.length} opportunities</p>
              </div>
            ))}
          </div>
        </div>

        <div className="jobs-section">
          <div className="section-header">
            <h2>
              {selectedField 
                ? `${jobFields.find(f => f.id === selectedField)?.name} Opportunities`
                : 'All Job Opportunities'
              }
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
                <div className="job-actions">
                  <button className="btn btn-primary">Apply Now</button>
                  <button className="btn btn-outline">Save Job</button>
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
    </div>
  );
};

export default JobOpportunities; 