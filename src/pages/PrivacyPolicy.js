import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaUniversity, FaShieldAlt, FaUserShield, FaLock, FaDatabase } from 'react-icons/fa';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <div className="privacy-header">
        <Link to="/register" className="back-link">
          <FaArrowLeft /> Back to Registration
        </Link>
        <div className="header-content">
          <FaShieldAlt className="header-icon" />
          <h1>Privacy Policy</h1>
          <p>UIC Alumni Portal - University of the Immaculate Conception</p>
        </div>
      </div>

      <div className="privacy-content">
        <div className="privacy-section">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.
          </p>
          <div className="info-types">
            <div className="info-type">
              <FaUserShield className="info-icon" />
              <h3>Personal Information</h3>
              <ul>
                <li>Name, email address, and contact information</li>
                <li>Student ID and graduation details</li>
                <li>Professional information (current job, company)</li>
                <li>Profile images and biographical information</li>
              </ul>
            </div>
            <div className="info-type">
              <FaDatabase className="info-icon" />
              <h3>Usage Information</h3>
              <ul>
                <li>Login times and activity logs</li>
                <li>Pages visited and features used</li>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="privacy-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain the Alumni Portal services</li>
            <li>Verify your identity as a UIC alumnus</li>
            <li>Send you important updates and notifications</li>
            <li>Connect you with other alumni and networking opportunities</li>
            <li>Improve our services and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2>3. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
          </p>
          <ul>
            <li><strong>With Other Alumni:</strong> Your profile information may be visible to other verified alumni</li>
            <li><strong>With UIC:</strong> We may share information with UIC administration for official purposes</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our platform</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2>4. Data Security</h2>
          <div className="security-features">
            <div className="security-feature">
              <FaLock className="security-icon" />
              <h3>Encryption</h3>
              <p>All data is encrypted in transit and at rest using industry-standard protocols.</p>
            </div>
            <div className="security-feature">
              <FaShieldAlt className="security-icon" />
              <h3>Access Control</h3>
              <p>Strict access controls ensure only authorized personnel can access your data.</p>
            </div>
            <div className="security-feature">
              <FaUserShield className="security-icon" />
              <h3>Authentication</h3>
              <p>Secure authentication systems protect your account from unauthorized access.</p>
            </div>
          </div>
        </div>

        <div className="privacy-section">
          <h2>5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data</li>
            <li><strong>Portability:</strong> Receive your data in a structured format</li>
            <li><strong>Objection:</strong> Object to processing of your data</li>
            <li><strong>Restriction:</strong> Request limitation of data processing</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. Alumni data may be retained indefinitely for historical and networking purposes, unless you request deletion.
          </p>
        </div>

        <div className="privacy-section">
          <h2>7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
          </p>
        </div>

        <div className="privacy-section">
          <h2>8. Third-Party Services</h2>
          <p>
            Our platform may integrate with third-party services (such as Supabase for data storage). These services have their own privacy policies, and we encourage you to review them.
          </p>
        </div>

        <div className="privacy-section">
          <h2>9. International Transfers</h2>
          <p>
            Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during such transfers.
          </p>
        </div>

        <div className="privacy-section">
          <h2>10. Children's Privacy</h2>
          <p>
            Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children under 18.
          </p>
        </div>

        <div className="privacy-section">
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </div>

        <div className="privacy-section">
          <h2>12. Contact Us</h2>
          <div className="contact-info">
            <p><strong>Data Protection Officer</strong></p>
            <p>UIC Alumni Office</p>
            <p>University of the Immaculate Conception</p>
            <p>Davao City, Philippines</p>
            <p>Email: <a href="mailto:alumni@uic.edu.ph">alumni@uic.edu.ph</a></p>
            <p>Phone: +63 82 221-8090</p>
          </div>
        </div>

        <div className="privacy-footer">
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          <p>This Privacy Policy is effective as of the date listed above and will remain in effect except with respect to any changes in its provisions in the future.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
