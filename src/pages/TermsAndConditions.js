import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaUniversity, FaShieldAlt, FaUserShield, FaLock } from 'react-icons/fa';
import './TermsAndConditions.css';

const TermsAndConditions = () => {
  return (
    <div className="terms-container">
      <div className="terms-header">
        <Link to="/register" className="back-link">
          <FaArrowLeft /> Back to Registration
        </Link>
        <div className="header-content">
          <FaUniversity className="header-icon" />
          <h1>Terms and Conditions</h1>
          <p>UIC Alumni Portal - University of the Immaculate Conception</p>
        </div>
      </div>

      <div className="terms-content">
        <div className="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using the UIC Alumni Portal, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </div>

        <div className="terms-section">
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily use the UIC Alumni Portal for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>modify or copy the materials</li>
            <li>use the materials for any commercial purpose or for any public display</li>
            <li>attempt to reverse engineer any software contained on the website</li>
            <li>remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </div>

        <div className="terms-section">
          <h2>3. User Account</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
          </p>
        </div>

        <div className="terms-section">
          <h2>4. Alumni Verification</h2>
          <p>
            All new registrations require verification by the UIC Alumni Office. This process may take 1-3 business days. We reserve the right to reject applications that cannot be verified as legitimate UIC alumni.
          </p>
        </div>

        <div className="terms-section">
          <h2>5. Content Guidelines</h2>
          <p>
            You agree not to post, upload, or transmit any content that:
          </p>
          <ul>
            <li>is unlawful, harmful, threatening, abusive, or defamatory</li>
            <li>infringes on any patent, trademark, copyright, or other proprietary rights</li>
            <li>contains software viruses or any other computer code designed to interrupt or destroy functionality</li>
            <li>is spam, unsolicited advertising, or promotional material</li>
          </ul>
        </div>

        <div className="terms-section">
          <h2>6. Privacy and Data Protection</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Portal, to understand our practices.
          </p>
        </div>

        <div className="terms-section">
          <h2>7. Intellectual Property</h2>
          <p>
            The UIC Alumni Portal and its original content, features, and functionality are and will remain the exclusive property of the University of the Immaculate Conception and its licensors.
          </p>
        </div>

        <div className="terms-section">
          <h2>8. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </div>

        <div className="terms-section">
          <h2>9. Disclaimer</h2>
          <p>
            The information on this Portal is provided on an "as is" basis. To the fullest extent permitted by law, UIC excludes all representations, warranties, conditions and terms relating to our Portal and the use of this Portal.
          </p>
        </div>

        <div className="terms-section">
          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be interpreted and governed by the laws of the Philippines. Any disputes relating to these terms will be subject to the exclusive jurisdiction of the courts of Davao City.
          </p>
        </div>

        <div className="terms-section">
          <h2>11. Contact Information</h2>
          <div className="contact-info">
            <p><strong>UIC Alumni Office</strong></p>
            <p>University of the Immaculate Conception</p>
            <p>Davao City, Philippines</p>
            <p>Email: <a href="mailto:alumni@uic.edu.ph">alumni@uic.edu.ph</a></p>
            <p>Phone: +63 82 221-8090</p>
          </div>
        </div>

        <div className="terms-footer">
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          <p>By using the UIC Alumni Portal, you acknowledge that you have read and understood these Terms and Conditions.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
