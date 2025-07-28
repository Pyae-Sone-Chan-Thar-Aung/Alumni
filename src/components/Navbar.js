import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <img src="/logo.png" alt="UIC Logo" className="logo-img" />
            <span className="logo-text">UIC Alumni Portal</span>
          </Link>
        </div>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/news" className="nav-link" onClick={() => setIsOpen(false)}>
            News & Announcements
          </Link>
          
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="nav-link btn btn-primary" onClick={() => setIsOpen(false)}>
                Register
              </Link>
            </>
          ) : (
            <>
              {user?.role === 'alumni' && (
                <Link to="/alumni-dashboard" className="nav-link" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin-dashboard" className="nav-link" onClick={() => setIsOpen(false)}>
                  Admin Dashboard
                </Link>
              )}
              <Link to="/profile" className="nav-link" onClick={() => setIsOpen(false)}>
                Profile
              </Link>
              <Link to="/job-opportunities" className="nav-link" onClick={() => setIsOpen(false)}>
                Job Opportunities
              </Link>
              <Link to="/batchmates" className="nav-link" onClick={() => setIsOpen(false)}>
                Batchmates
              </Link>
              <div className="nav-user">
                <span className="user-name">
                  <FaUser /> {user?.name || user?.email}
                </span>
                <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </>
          )}
        </div>

        <div className="navbar-toggle" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 