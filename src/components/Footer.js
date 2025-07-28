import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>University of the Immaculate Conception</h3>
            <p>Davao City, Philippines</p>
            <p>Empowering minds, Building futures</p>
            <div className="social-links">
              <a href="#" className="social-link">
                <FaFacebook />
              </a>
              <a href="#" className="social-link">
                <FaTwitter />
              </a>
              <a href="#" className="social-link">
                <FaInstagram />
              </a>
              <a href="#" className="social-link">
                <FaLinkedin />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/news">News & Announcements</Link></li>
              <li><Link to="/job-opportunities">Job Opportunities</Link></li>
              <li><Link to="/batchmates">Batchmates</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact Information</h4>
            <div className="contact-info">
              <p><FaMapMarkerAlt /> Fr. Selga Street, Davao City</p>
              <p><FaPhone /> +63 82 221-8090</p>
              <p><FaEnvelope /> info@uic.edu.ph</p>
            </div>
          </div>

          <div className="footer-section">
            <h4>Alumni Services</h4>
            <ul className="footer-links">
              <li><Link to="/register">Alumni Registration</Link></li>
              <li><Link to="/profile">Update Profile</Link></li>
              <li><Link to="/job-opportunities">Career Opportunities</Link></li>
              <li><Link to="/batchmates">Connect with Batchmates</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 University of the Immaculate Conception. All rights reserved.</p>
          <p>Alumni Portal System - Connecting UIC Graduates Worldwide</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 