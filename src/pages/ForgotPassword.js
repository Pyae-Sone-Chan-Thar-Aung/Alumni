import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import supabase from '../config/supabaseClient';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Sending password reset email to:', email);

      // Send password reset email using Supabase Auth
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        console.error('❌ Password reset error:', resetError);
        setError(resetError.message);
        toast.error('Failed to send reset email. Please try again.');
      } else {
        console.log('✅ Password reset email sent successfully');
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    await handleSubmit({ preventDefault: () => {} });
  };

  if (emailSent) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="success-icon">
            <FaCheckCircle />
          </div>
          
          <h2>Check Your Email</h2>
          <p className="success-message">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          
          <div className="instructions">
            <h3>Next Steps:</h3>
            <ol>
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the password reset link in the email</li>
              <li>Create a new password</li>
              <li>Sign in with your new password</li>
            </ol>
          </div>

          <div className="action-buttons">
            <button 
              onClick={handleResendEmail}
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Resend Email'}
            </button>
            <Link to="/login" className="btn btn-primary">
              <FaArrowLeft /> Back to Login
            </Link>
          </div>

          <div className="help-section">
            <p>
              <FaExclamationTriangle className="warning-icon" />
              <strong>Didn't receive the email?</strong>
            </p>
            <ul>
              <li>Check your spam/junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and try again</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="header">
          <h2>Forgot Your Password?</h2>
          <p>No worries! Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FaEnvelope /> Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="your.email@uic.edu.ph"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              <FaExclamationTriangle /> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary reset-btn"
            disabled={loading || !email}
          >
            {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="back-to-login">
          <Link to="/login" className="back-link">
            <FaArrowLeft /> Back to Login
          </Link>
        </div>

        <div className="help-section">
          <h3>Need More Help?</h3>
          <p>
            If you're still having trouble signing in, contact the Alumni Office:
          </p>
          <div className="contact-info">
            <p>
              <strong>Email:</strong> <a href="mailto:alumni@uic.edu.ph">alumni@uic.edu.ph</a>
            </p>
            <p>
              <strong>Phone:</strong> +63 82 221-8090
            </p>
            <p>
              <strong>Office Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
