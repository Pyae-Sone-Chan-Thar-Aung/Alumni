import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  overlay = false,
  fullscreen = false 
}) => {
  const sizeClasses = {
    small: 'loading-spinner-small',
    medium: 'loading-spinner-medium',
    large: 'loading-spinner-large'
  };

  const spinnerClass = sizeClasses[size] || sizeClasses.medium;

  const LoadingContent = () => (
    <div className={`loading-container ${spinnerClass}`}>
      <div className="spinner-wrapper">
        <FaSpinner className="spinner-icon" />
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="loading-fullscreen">
        <LoadingContent />
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="loading-overlay">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

export default LoadingSpinner;
