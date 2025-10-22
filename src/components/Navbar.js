import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Animated indicator state and ref to the links container
  const linksRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Update the sliding indicator whenever the route changes, menu toggles, or auth state changes
  useEffect(() => {
    const updateIndicator = () => {
      const container = linksRef.current;
      if (!container) return;
      const activeEl = container.querySelector('.nav-link.active');
      if (activeEl) {
        const cRect = container.getBoundingClientRect();
        const aRect = activeEl.getBoundingClientRect();
        setIndicatorStyle({
          left: aRect.left - cRect.left,
          width: aRect.width,
          opacity: 1,
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [location.pathname, isOpen, isAuthenticated]);

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <span className="logo-text"></span>
          </Link>
        </div>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <div className="nav-links" ref={linksRef}>
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/news" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
              News & Announcements
            </NavLink>
            <NavLink to="/gallery" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
              Gallery
            </NavLink>

            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
                  Login
                </NavLink>
                <NavLink to="/register" className={({ isActive }) => `nav-link btn btn-primary${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
                  Register
                </NavLink>
              </>
            ) : (
              <>
                {user?.role === 'alumni' && (
                  <NavLink to="/alumni-dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
                    Dashboard
                  </NavLink>
                )}
                {user?.role === 'admin' && (
                  <>
                    <NavLink to="/admin-dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
                      Admin Dashboard
                    </NavLink>
                  </>
                )}

                <NavLink to="/job-opportunities" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
                  Job Opportunities
                </NavLink>
                <NavLink to="/batchmates" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
                  Alumni Directory
                </NavLink>
                <NavLink to="/messages" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
                  Messages
                </NavLink>
                <NavLink to="/tracer-study" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={() => setIsOpen(false)}>
                  Tracer Study
                </NavLink>
              </>
            )}

            {/* Animated sliding indicator */}
            <span
              className="active-indicator"
              style={{ transform: `translateX(${indicatorStyle.left}px)`, width: `${indicatorStyle.width}px`, opacity: indicatorStyle.opacity }}
            />
          </div>

          {isAuthenticated && (
            <div className="nav-user">
              {user?.role === 'alumni' ? (
                <Link to="/alumni-profile" className="nav-link" onClick={() => setIsOpen(false)}>
                  <span className="user-name">
                    <FaUser /> {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.name || user?.email}
                  </span>
                </Link>
              ) : (
                <Link to="/profile" className="nav-link" onClick={() => setIsOpen(false)}>
                  <span className="user-name">
                    <FaUser /> {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.name || user?.email}
                  </span>
                </Link>
              )}
              <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
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
