import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import supabase from '../config/supabaseClient';
import './ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
      errors: [
        password.length < minLength && `At least ${minLength} characters`,
        !hasUpperCase && 'One uppercase letter',
        !hasLowerCase && 'One lowercase letter',
        !hasNumbers && 'One number',
        !hasSpecialChar && 'One special character (recommended)'
      ].filter(Boolean)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError(`Password must contain: ${validation.errors.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Updating password...');

      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('❌ Password update error:', updateError);
        setError(updateError.message);
        toast.error('Failed to update password. Please try again.');
      } else {
        console.log('✅ Password updated successfully');
        setSuccess(true);
        toast.success('Password updated successfully! You can now sign in.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="success-icon">
            <FaCheckCircle />
          </div>
          
          <h2>Password Updated Successfully!</h2>
          <p className="success-message">
            Your password has been updated. You can now sign in with your new password.
          </p>
          
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="header">
          <h2>Create New Password</h2>
          <p>Please enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FaLock /> New Password
            </label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <FaLock /> Confirm Password
            </label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {password && (
            <div className="password-requirements">
              <h4>Password Requirements:</h4>
              <ul>
                <li className={password.length >= 8 ? 'valid' : 'invalid'}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password) ? 'valid' : 'invalid'}>
                  One uppercase letter
                </li>
                <li className={/[a-z]/.test(password) ? 'valid' : 'invalid'}>
                  One lowercase letter
                </li>
                <li className={/\d/.test(password) ? 'valid' : 'invalid'}>
                  One number
                </li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'valid' : 'invalid'}>
                  One special character (recommended)
                </li>
              </ul>
            </div>
          )}

          {error && (
            <div className="error-message">
              <FaExclamationTriangle /> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary reset-btn"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>

        <div className="help-section">
          <p>
            <strong>Need help?</strong> Contact the Alumni Office at{' '}
            <a href="mailto:alumni@uic.edu.ph">alumni@uic.edu.ph</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
