import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaCheckCircle, FaInfoCircle, FaSave, FaSpinner } from 'react-icons/fa';
import supabase from '../config/supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils';
import './TracerStudy.css';

const TracerStudy = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    email: '',
    phone: '',
    address: '',
    sex: '',
    civil_status: '',

    // Educational Background
    degree: '',
    major: '',
    graduation_year: '',
    honors: '',

    // Employment Information
    employment_status: '',
    company_name: '',
    job_title: '',
    industry: '',
    work_location: '',
    monthly_salary: '',
    employment_type: '',

    // Job Search & Career
    first_job_related: null,
    job_search_duration: '',
    job_search_method: '',
    started_job_search: '',

    // Skills & Curriculum
    curriculum_helpful: null,
    important_skills: '',
    additional_training: '',

    // Feedback & Suggestions
    program_satisfaction: '',
    university_preparation: '',
    suggestions: '',
    recommend_program: null
  });

  const steps = [
    { id: 1, title: 'Personal Info', icon: FaUser },
    { id: 2, title: 'Education', icon: FaGraduationCap },
    { id: 3, title: 'Employment', icon: FaBriefcase },
    { id: 4, title: 'Career Path', icon: FaMapMarkerAlt },
    { id: 5, title: 'Review & Submit', icon: FaCheckCircle }
  ];

  useEffect(() => {
    if (user) {
      checkExistingResponse();
      loadUserData();
    }
  }, [user]);

  const checkExistingResponse = async () => {
    try {
      const { data, error } = await supabase
        .from('tracer_study_responses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setFormData(data);
        setHasSubmitted(true);
        toast.success('Your previous response has been loaded. You can update and resubmit.');
      }
    } catch (error) {
      console.log('No existing response found');
    }
  };

  const loadUserData = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userData && !userError) {
        setFormData(prev => ({
          ...prev,
          full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
          email: userData.email || ''
        }));
      }

      if (profileData && !profileError) {
        setFormData(prev => ({
          ...prev,
          phone: profileData.phone || '',
          address: profileData.address || '',
          major: profileData.course || '',
          graduation_year: profileData.batch_year || '',
          company_name: profileData.company || '',
          job_title: profileData.current_job || ''
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    if (type === 'checkbox') {
      processedValue = checked;
    } else if (name.includes('_related') || name.includes('_helpful') || name === 'recommend_program') {
      processedValue = value === 'true' ? true : value === 'false' ? false : null;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1: // Personal Info
        if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (!formData.phone.trim()) errors.phone = 'Phone number is required';
        if (!formData.address.trim()) errors.address = 'Address is required';
        if (!formData.sex) errors.sex = 'Please select your sex';
        if (!formData.civil_status) errors.civil_status = 'Please select your civil status';
        break;

      case 2: // Education
        if (!formData.degree.trim()) errors.degree = 'Degree is required';
        if (!formData.major.trim()) errors.major = 'Major/specialization is required';
        if (!formData.graduation_year) errors.graduation_year = 'Graduation year is required';
        break;

      case 3: // Employment
        if (!formData.employment_status) errors.employment_status = 'Employment status is required';
        if (formData.employment_status !== 'Unemployed' &&
          formData.employment_status !== 'Student (Graduate Studies)' &&
          formData.employment_status !== 'Not in Labor Force') {
          if (!formData.company_name.trim()) errors.company_name = 'Company name is required';
          if (!formData.job_title.trim()) errors.job_title = 'Job title is required';
          if (!formData.industry.trim()) errors.industry = 'Industry is required';
          if (!formData.monthly_salary) errors.monthly_salary = 'Salary range is required';
        }
        break;

      case 4: // Career Path
        if (formData.first_job_related === null) errors.first_job_related = 'Please indicate if your first job was related to your course';
        if (!formData.job_search_method) errors.job_search_method = 'Please select how you found your job';
        if (!formData.started_job_search) errors.started_job_search = 'Please indicate when you started job searching';
        if (formData.curriculum_helpful === null) errors.curriculum_helpful = 'Please indicate if the curriculum was helpful';
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      toast.error('Please complete all required fields before proceeding');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validate all steps
    let allValid = true;
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        allValid = false;
      }
    }

    if (!allValid) {
      toast.error('Please complete all required fields in all steps');
      setCurrentStep(1); // Go back to first step with errors
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean up form data before submission
      const cleanedFormData = { ...formData };

      // Convert empty strings to null for optional fields
      Object.keys(cleanedFormData).forEach(key => {
        if (cleanedFormData[key] === '') {
          cleanedFormData[key] = null;
        }
      });

      const submissionData = {
        user_id: user.id,
        ...cleanedFormData,
        graduation_year: parseInt(formData.graduation_year) || null,
        gender: formData.sex || null, // Map sex field to gender for analytics
        updated_at: new Date().toISOString()
      };

      // Debug: Log the data being submitted
      console.log('=== TRACER STUDY SUBMISSION DEBUG ===');
      console.log('User object:', user);
      console.log('User ID being submitted:', user.id);
      console.log('Submitting tracer study data:', submissionData);
      console.log('Form data object:', formData);

      // Check for any undefined or problematic values
      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] === undefined) {
          console.warn(`WARNING: Field '${key}' is undefined`);
        }
      });

      const { data, error } = await supabase
        .from('tracer_study_responses')
        .upsert(submissionData, {
          onConflict: 'user_id',
          returning: 'minimal'
        });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      setHasSubmitted(true);
      toast.success(hasSubmitted ? 'Response updated successfully!' : 'Tracer study submitted successfully!');

    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast.error('Failed to submit response: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="tracer-study-container">
        <div className="auth-required">
          <FaInfoCircle />
          <h2>Login Required</h2>
          <p>Please log in to access the Graduate Tracer Study form.</p>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {steps.map((step) => (
        <div
          key={step.id}
          className={`step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
          onClick={() => currentStep > step.id && setCurrentStep(step.id)}
        >
          <div className="step-icon">
            <step.icon />
          </div>
          <div className="step-info">
            <span className="step-number">{step.id}</span>
            <span className="step-title">{step.title}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="form-step">
      <h3>Personal Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="full_name">Full Name *</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className={formErrors.full_name ? 'error' : ''}
          />
          {formErrors.full_name && <span className="error-message">{formErrors.full_name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={formErrors.email ? 'error' : ''}
          />
          {formErrors.email && <span className="error-message">{formErrors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={formErrors.phone ? 'error' : ''}
          />
          {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="address">Current Address *</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows="3"
            className={formErrors.address ? 'error' : ''}
          />
          {formErrors.address && <span className="error-message">{formErrors.address}</span>}
        </div>

        <div className="form-group">
          <label>Sex *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="sex"
                value="Male"
                checked={formData.sex === 'Male'}
                onChange={handleInputChange}
              />
              <span>Male</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="sex"
                value="Female"
                checked={formData.sex === 'Female'}
                onChange={handleInputChange}
              />
              <span>Female</span>
            </label>
          </div>
          {formErrors.sex && <span className="error-message">{formErrors.sex}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="civil_status">Civil Status *</label>
          <select
            id="civil_status"
            name="civil_status"
            value={formData.civil_status}
            onChange={handleInputChange}
            className={formErrors.civil_status ? 'error' : ''}
          >
            <option value="">Select status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Separated">Separated</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
          {formErrors.civil_status && <span className="error-message">{formErrors.civil_status}</span>}
        </div>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="form-step">
      <h3>Educational Background</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="degree">Highest Degree from UIC *</label>
          <input
            type="text"
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleInputChange}
            placeholder="e.g., Bachelor of Science"
            className={formErrors.degree ? 'error' : ''}
          />
          {formErrors.degree && <span className="error-message">{formErrors.degree}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="major">Major/Specialization *</label>
          <input
            type="text"
            id="major"
            name="major"
            value={formData.major}
            onChange={handleInputChange}
            placeholder="e.g., Computer Science"
            className={formErrors.major ? 'error' : ''}
          />
          {formErrors.major && <span className="error-message">{formErrors.major}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="graduation_year">Year Graduated *</label>
          <input
            type="number"
            id="graduation_year"
            name="graduation_year"
            value={formData.graduation_year}
            onChange={handleInputChange}
            min="1990"
            max="2030"
            className={formErrors.graduation_year ? 'error' : ''}
          />
          {formErrors.graduation_year && <span className="error-message">{formErrors.graduation_year}</span>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="honors">Honors or Awards Received</label>
          <input
            type="text"
            id="honors"
            name="honors"
            value={formData.honors}
            onChange={handleInputChange}
            placeholder="Cum Laude, Dean's List, etc. (optional)"
          />
        </div>
      </div>
    </div>
  );

  const renderEmployment = () => (
    <div className="form-step">
      <h3>Employment Information</h3>
      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="employment_status">Current Employment Status *</label>
          <select
            id="employment_status"
            name="employment_status"
            value={formData.employment_status}
            onChange={handleInputChange}
            className={formErrors.employment_status ? 'error' : ''}
          >
            <option value="">Select status</option>
            <option value="Employed (Full-time)">Employed (Full-time)</option>
            <option value="Employed (Part-time)">Employed (Part-time)</option>
            <option value="Self-employed/Freelancer">Self-employed/Freelancer</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Student (Graduate Studies)">Student (Graduate Studies)</option>
            <option value="Not in Labor Force">Not in Labor Force</option>
          </select>
          {formErrors.employment_status && <span className="error-message">{formErrors.employment_status}</span>}
        </div>

        {formData.employment_status &&
          formData.employment_status !== 'Unemployed' &&
          formData.employment_status !== 'Student (Graduate Studies)' &&
          formData.employment_status !== 'Not in Labor Force' && (
            <>
              <div className="form-group">
                <label htmlFor="company_name">Company/Organization Name *</label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className={formErrors.company_name ? 'error' : ''}
                />
                {formErrors.company_name && <span className="error-message">{formErrors.company_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="job_title">Job Title/Position *</label>
                <input
                  type="text"
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleInputChange}
                  className={formErrors.job_title ? 'error' : ''}
                />
                {formErrors.job_title && <span className="error-message">{formErrors.job_title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="industry">Industry *</label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="e.g., Information Technology, Healthcare"
                  className={formErrors.industry ? 'error' : ''}
                />
                {formErrors.industry && <span className="error-message">{formErrors.industry}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="work_location">Work Location</label>
                <input
                  type="text"
                  id="work_location"
                  name="work_location"
                  value={formData.work_location}
                  onChange={handleInputChange}
                  placeholder="City, Province/State"
                />
              </div>

              <div className="form-group">
                <label htmlFor="monthly_salary">Monthly Salary Range (PHP) *</label>
                <select
                  id="monthly_salary"
                  name="monthly_salary"
                  value={formData.monthly_salary}
                  onChange={handleInputChange}
                  className={formErrors.monthly_salary ? 'error' : ''}
                >
                  <option value="">Select range</option>
                  <option value="Below ₱15,000">Below ₱15,000</option>
                  <option value="₱15,000 - ₱25,000">₱15,000 - ₱25,000</option>
                  <option value="₱25,001 - ₱35,000">₱25,001 - ₱35,000</option>
                  <option value="₱35,001 - ₱50,000">₱35,001 - ₱50,000</option>
                  <option value="₱50,001 - ₱75,000">₱50,001 - ₱75,000</option>
                  <option value="₱75,001 - ₱100,000">₱75,001 - ₱100,000</option>
                  <option value="Above ₱100,000">Above ₱100,000</option>
                </select>
                {formErrors.monthly_salary && <span className="error-message">{formErrors.monthly_salary}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="employment_type">Employment Type</label>
                <select
                  id="employment_type"
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleInputChange}
                >
                  <option value="">Select type</option>
                  <option value="Regular/Permanent">Regular/Permanent</option>
                  <option value="Contractual">Contractual</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Project-based">Project-based</option>
                  <option value="Probationary">Probationary</option>
                </select>
              </div>
            </>
          )}
      </div>
    </div>
  );

  const renderCareerPath = () => (
    <div className="form-step">
      <h3>Career Path & Skills</h3>
      <div className="form-grid">
        <div className="form-group full-width">
          <label>Is your first job related to your college course? *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="first_job_related"
                value="true"
                checked={formData.first_job_related === true}
                onChange={handleInputChange}
              />
              <span>Yes</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="first_job_related"
                value="false"
                checked={formData.first_job_related === false}
                onChange={handleInputChange}
              />
              <span>No</span>
            </label>
          </div>
          {formErrors.first_job_related && <span className="error-message">{formErrors.first_job_related}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="job_search_duration">How long did it take to find your first job?</label>
          <select
            id="job_search_duration"
            name="job_search_duration"
            value={formData.job_search_duration}
            onChange={handleInputChange}
          >
            <option value="">Select duration</option>
            <option value="Less than 1 month">Less than 1 month</option>
            <option value="1-3 months">1-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6-12 months">6-12 months</option>
            <option value="More than 1 year">More than 1 year</option>
            <option value="Still looking">Still looking</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="job_search_method">How did you find your first job? *</label>
          <select
            id="job_search_method"
            name="job_search_method"
            value={formData.job_search_method}
            onChange={handleInputChange}
            className={formErrors.job_search_method ? 'error' : ''}
          >
            <option value="">Select method</option>
            <option value="Online job portals">Online job portals</option>
            <option value="Company website">Company website</option>
            <option value="Walk-in application">Walk-in application</option>
            <option value="Referral from friends/family">Referral from friends/family</option>
            <option value="Career fair">Career fair</option>
            <option value="School placement office">School placement office</option>
            <option value="Social media">Social media</option>
            <option value="Professional network">Professional network</option>
            <option value="Other">Other</option>
          </select>
          {formErrors.job_search_method && <span className="error-message">{formErrors.job_search_method}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="started_job_search">When did you start looking for a job? *</label>
          <select
            id="started_job_search"
            name="started_job_search"
            value={formData.started_job_search}
            onChange={handleInputChange}
            className={formErrors.started_job_search ? 'error' : ''}
          >
            <option value="">Select timing</option>
            <option value="Before graduation">Before graduation</option>
            <option value="After graduation">After graduation</option>
            <option value="Did not actively search">Did not actively search</option>
          </select>
          {formErrors.started_job_search && <span className="error-message">{formErrors.started_job_search}</span>}
        </div>

        <div className="form-group full-width">
          <label>Was your UIC curriculum helpful in your career? *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="curriculum_helpful"
                value="true"
                checked={formData.curriculum_helpful === true}
                onChange={handleInputChange}
              />
              <span>Yes</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="curriculum_helpful"
                value="false"
                checked={formData.curriculum_helpful === false}
                onChange={handleInputChange}
              />
              <span>No</span>
            </label>
          </div>
          {formErrors.curriculum_helpful && <span className="error-message">{formErrors.curriculum_helpful}</span>}
        </div>

        <div className="form-group full-width">
          <label htmlFor="important_skills">What skills from UIC were most important in your job?</label>
          <textarea
            id="important_skills"
            name="important_skills"
            value={formData.important_skills}
            onChange={handleInputChange}
            rows="4"
            placeholder="List the skills, knowledge, or experiences from UIC that helped you in your career..."
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="additional_training">What additional training or skills did you need for your job?</label>
          <textarea
            id="additional_training"
            name="additional_training"
            value={formData.additional_training}
            onChange={handleInputChange}
            rows="3"
            placeholder="List any additional training, certifications, or skills you needed..."
          />
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="form-step">
      <h3>Feedback & Final Review</h3>
      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="program_satisfaction">How satisfied are you with your UIC program?</label>
          <select
            id="program_satisfaction"
            name="program_satisfaction"
            value={formData.program_satisfaction}
            onChange={handleInputChange}
          >
            <option value="">Select satisfaction level</option>
            <option value="Very Satisfied">Very Satisfied</option>
            <option value="Satisfied">Satisfied</option>
            <option value="Neutral">Neutral</option>
            <option value="Dissatisfied">Dissatisfied</option>
            <option value="Very Dissatisfied">Very Dissatisfied</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label htmlFor="university_preparation">How well did UIC prepare you for your career?</label>
          <select
            id="university_preparation"
            name="university_preparation"
            value={formData.university_preparation}
            onChange={handleInputChange}
          >
            <option value="">Select preparation level</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Would you recommend your program to others?</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="recommend_program"
                value="true"
                checked={formData.recommend_program === true}
                onChange={handleInputChange}
              />
              <span>Yes</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="recommend_program"
                value="false"
                checked={formData.recommend_program === false}
                onChange={handleInputChange}
              />
              <span>No</span>
            </label>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="suggestions">Suggestions for improving the UIC program</label>
          <textarea
            id="suggestions"
            name="suggestions"
            value={formData.suggestions}
            onChange={handleInputChange}
            rows="5"
            placeholder="Your suggestions, comments, or recommendations for improving the program..."
          />
        </div>

        {hasSubmitted && (
          <div className="submission-notice success">
            <FaCheckCircle />
            <div>
              <h4>Response Previously Submitted</h4>
              <p>You submitted this form on {formatDate(formData.updated_at)}. You can update your responses by clicking Submit again.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="tracer-study-container">
      <div className="tracer-study-header">
        <h1>University of the Immaculate Conception</h1>
        <h2>Graduate Tracer Study</h2>
        <p>College of Computer Studies</p>
      </div>

      <div className="tracer-study-intro">
        <div className="intro-content">
          <FaInfoCircle />
          <div>
            <p><strong>Dear UIC Graduate,</strong></p>
            <p>Help us improve our programs by sharing your post-graduation experience. This survey takes about 10 minutes and helps us enhance our curriculum and services for future students.</p>
          </div>
        </div>
      </div>

      <div className="tracer-study-form">
        {renderStepIndicator()}

        <div className="form-content">
          {currentStep === 1 && renderPersonalInfo()}
          {currentStep === 2 && renderEducation()}
          {currentStep === 3 && renderEmployment()}
          {currentStep === 4 && renderCareerPath()}
          {currentStep === 5 && renderReview()}
        </div>

        <div className="form-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handlePrevious}
            >
              Previous
            </button>
          )}

          {currentStep < 5 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
            >
              Next
            </button>
          )}

          {currentStep === 5 && (
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="spinning" />
                  {hasSubmitted ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <FaSave />
                  {hasSubmitted ? 'Update Response' : 'Submit Response'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TracerStudy;
