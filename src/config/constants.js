// Application Configuration Constants

export const APP_CONFIG = {
  name: 'UIC Alumni Portal',
  version: '1.0.0',
  description: 'Alumni Portal System for University of the Immaculate Conception, Davao City',
  university: 'University of the Immaculate Conception',
  department: 'College of Computer Studies',
  
  // Theme colors
  colors: {
    primary: '#8B0000',      // UIC Maroon
    primaryDark: '#660000',  // Dark Maroon
    secondary: '#FFD700',    // Gold
    secondaryLight: '#FFF8DC', // Light Gold
    tertiary: '#F5F5DC',     // Cream
    
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    
    // Neutral colors
    gray100: '#f7fafc',
    gray200: '#edf2f7',
    gray300: '#e2e8f0',
    gray400: '#cbd5e0',
    gray500: '#a0aec0',
    gray600: '#718096',
    gray700: '#4a5568',
    gray800: '#2d3748',
    gray900: '#1a202c',
  }
};

export const API_ENDPOINTS = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL || 'https://gpsbydtilgoutlltyfvl.supabase.co',
    anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwc2J5ZHRpbGdvdXRsbHR5ZnZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTgyODksImV4cCI6MjA3NTI5NDI4OX0.8tjsWB9hc_lNo0uC7chByai03F9I7sX-cLkL5Ml0eEM'
  }
};

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  
  // Alumni routes
  alumniDashboard: '/alumni-dashboard',
  profile: '/profile',
  jobOpportunities: '/job-opportunities',
  batchmates: '/batchmates',
  tracerStudy: '/tracer-study',
  news: '/news',
  
  // Admin routes
  adminDashboard: '/admin-dashboard',
  adminUsers: '/admin/users',
  adminNews: '/admin/news',
  adminTracerStudy: '/admin/tracer-study'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  ALUMNI: 'alumni'
};

export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  VERIFIED: 'verified',
  UNVERIFIED: 'unverified'
};

export const FORM_VALIDATION = {
  password: {
    minLength: 6,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    pattern: /^(\+63|0)?[0-9]{10}$/
  }
};

export const COURSES = [
  'BS Accountancy',
  'BS Architecture',
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
  'BS Social Work',
  'BS Education',
  'BS Tourism Management',
  'BS Hospitality Management',
  'BS Commerce',
  'BS Marketing',
  'BA Communication',
  'BA English',
  'Other'
];

export const BATCH_YEARS = (() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1990; year--) {
    years.push(year.toString());
  }
  return years;
})();

export const EMPLOYMENT_STATUS = [
  'Employed (Full-time)',
  'Employed (Part-time)',
  'Self-employed/Freelancer',
  'Unemployed - Looking for work',
  'Unemployed - Not looking for work',
  'Student (Graduate Studies)',
  'Other'
];

export const INCOME_LEVELS = [
  'Below ₱15,000',
  '₱15,000 - ₱25,000',
  '₱25,001 - ₱50,000',
  '₱50,001 - ₱75,000',
  '₱75,001 - ₱100,000',
  'Above ₱100,000'
];

export const JOB_SEARCH_METHODS = [
  'Online job portals',
  'Company websites',
  'Referrals from friends/family',
  'Career fairs',
  'Social media',
  'School placement office',
  'Walk-in applications',
  'Other'
];

export const TIME_TO_FIRST_JOB = [
  'Less than 1 month',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  'More than 1 year',
  'Still seeking employment'
];

export const COMPETENCY_SKILLS = [
  'Communication Skills',
  'Human Relation Skills',
  'Entrepreneurial Skills',
  'Critical Thinking Skills',
  'Problem-Solving Skills',
  'Programming Skills',
  'Other IT-related Skills'
];

export const STORAGE_KEYS = {
  auth: {
    token: 'uic_alumni_token',
    user: 'uic_alumni_user',
    refreshToken: 'uic_alumni_refresh_token'
  },
  preferences: {
    theme: 'uic_alumni_theme',
    language: 'uic_alumni_language'
  }
};

export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100]
};

export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
};

export const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: 'light'
};

export const DEMO_ACCOUNTS = {
  admin: {
    email: 'paung_230000001724@uic.edu.ph',
    password: 'UICalumni2025',
    role: 'super_admin'
  }
};

export const ERROR_MESSAGES = {
  network: 'Network error. Please check your internet connection.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'Access denied. Please contact your administrator.',
  notFound: 'The requested resource was not found.',
  serverError: 'Server error. Please try again later.',
  validationError: 'Please check your input and try again.',
  timeout: 'Request timed out. Please try again.',
  generic: 'An unexpected error occurred. Please try again.'
};

export const SUCCESS_MESSAGES = {
  login: 'Welcome back!',
  logout: 'You have been logged out successfully.',
  registration: 'Registration submitted successfully! Please wait for admin approval.',
  profileUpdate: 'Profile updated successfully.',
  dataSubmission: 'Data submitted successfully.',
  passwordChange: 'Password changed successfully.'
};

// Environment-specific configurations
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_TEST = process.env.NODE_ENV === 'test';

// Feature flags
export const FEATURES = {
  enableBatchmateMessaging: true,
  enableTracerStudy: true,
  enableJobOpportunities: true,
  enableChatbot: true,
  enableDarkMode: false,
  enableOfflineSupport: false,
  enablePushNotifications: false
};

export default {
  APP_CONFIG,
  API_ENDPOINTS,
  ROUTES,
  USER_ROLES,
  USER_STATUS,
  FORM_VALIDATION,
  COURSES,
  BATCH_YEARS,
  EMPLOYMENT_STATUS,
  INCOME_LEVELS,
  JOB_SEARCH_METHODS,
  TIME_TO_FIRST_JOB,
  COMPETENCY_SKILLS,
  STORAGE_KEYS,
  PAGINATION,
  FILE_UPLOAD,
  TOAST_CONFIG,
  DEMO_ACCOUNTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_TEST,
  FEATURES
};
