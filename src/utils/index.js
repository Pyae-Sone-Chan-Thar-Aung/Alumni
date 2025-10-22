import { FORM_VALIDATION, ERROR_MESSAGES } from '../config/constants';

// Validation utilities
export const validateEmail = (email) => {
  if (!email) return { isValid: false, error: 'Email is required' };
  if (!FORM_VALIDATION.email.pattern.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, error: 'Password is required' };
  if (password.length < FORM_VALIDATION.password.minLength) {
    return { isValid: false, error: `Password must be at least ${FORM_VALIDATION.password.minLength} characters long` };
  }
  if (password.length > FORM_VALIDATION.password.maxLength) {
    return { isValid: false, error: `Password must be less than ${FORM_VALIDATION.password.maxLength} characters long` };
  }
  return { isValid: true };
};

export const validatePhone = (phone) => {
  if (!phone) return { isValid: false, error: 'Phone number is required' };
  if (!FORM_VALIDATION.phone.pattern.test(phone)) {
    return { isValid: false, error: 'Please enter a valid Philippine phone number' };
  }
  return { isValid: true };
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

// Error handling utilities
export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.generic;
  
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  if (error.details) return error.details;
  
  if (error.code) {
    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'NETWORK_FAILURE':
        return ERROR_MESSAGES.network;
      case '401':
      case 'UNAUTHORIZED':
        return ERROR_MESSAGES.unauthorized;
      case '403':
      case 'FORBIDDEN':
        return ERROR_MESSAGES.forbidden;
      case '404':
      case 'NOT_FOUND':
        return ERROR_MESSAGES.notFound;
      case '500':
      case 'INTERNAL_SERVER_ERROR':
        return ERROR_MESSAGES.serverError;
      case 'TIMEOUT':
        return ERROR_MESSAGES.timeout;
      case 'VALIDATION_ERROR':
        return ERROR_MESSAGES.validationError;
      default:
        return ERROR_MESSAGES.generic;
    }
  }
  
  return ERROR_MESSAGES.generic;
};

export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  const errorMessage = getErrorMessage(error);
  
  // Log to external service if available
  if (window.gtag) {
    window.gtag('event', 'api_error', {
      error_description: errorMessage,
      error_fatal: false
    });
  }
  
  return errorMessage;
};

// Data transformation utilities
export const formatUserData = (user, profile = {}) => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
    role: user.role || 'alumni',
    isVerified: user.is_verified || false,
    status: user.is_verified ? 'approved' : 'pending',
    createdAt: user.created_at,
    
    // Profile data
    phone: profile.phone || '',
    address: profile.address || '',
    course: profile.course || '',
    batchYear: profile.batch_year || '',
    currentJob: profile.current_job || '',
    company: profile.company || '',
    bio: profile.bio || '',
    profileImageUrl: profile.profile_image_url || ''
  };
};

export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error('Date formatting error:', error);
    return date;
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(date);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return formatDate(date);
  }
};

// String utilities
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + suffix;
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
};

export const generateInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0) || '';
  const last = lastName?.charAt(0) || '';
  return (first + last).toUpperCase();
};

// Array utilities
export const groupBy = (array, key) => {
  if (!Array.isArray(array)) return {};
  
  return array.reduce((groups, item) => {
    const groupKey = item[key];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];
    
    // Handle null/undefined values
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';
    
    // Handle string comparison
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });
};

export const filterBySearch = (array, searchTerm, searchKeys) => {
  if (!Array.isArray(array) || !searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  
  return array.filter(item => {
    return searchKeys.some(key => {
      const value = item[key];
      return value && value.toString().toLowerCase().includes(term);
    });
  });
};

// URL utilities
export const buildUrl = (base, params = {}) => {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

export const getQueryParams = () => {
  return Object.fromEntries(new URLSearchParams(window.location.search));
};

// Storage utilities
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Local storage set error:', error);
    return false;
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Local storage get error:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Local storage remove error:', error);
    return false;
  }
};

// Debounce utility
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};

export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

// Random utilities
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Color utilities
export const hexToRgba = (hex, alpha = 1) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
    : hex;
};

// Device utilities
export const isMobile = () => {
  return window.innerWidth <= 768;
};

export const isTablet = () => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

export const isDesktop = () => {
  return window.innerWidth > 1024;
};

// Export all utilities
export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
  getErrorMessage,
  handleApiError,
  formatUserData,
  formatDate,
  formatRelativeTime,
  truncateText,
  capitalizeWords,
  generateInitials,
  groupBy,
  sortBy,
  filterBySearch,
  buildUrl,
  getQueryParams,
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  debounce,
  formatFileSize,
  getFileExtension,
  isValidFileType,
  isValidFileSize,
  generateId,
  generateSlug,
  hexToRgba,
  isMobile,
  isTablet,
  isDesktop
};
