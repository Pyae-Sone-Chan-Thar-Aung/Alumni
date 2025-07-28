import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaUsers, FaBriefcase, FaNewspaper, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const [featuredNews, setFeaturedNews] = useState([
    {
      id: 1,
      title: "Alumni Homecoming 2024 Registration Now Open",
      excerpt: "Join us for the biggest alumni gathering of the year. Register now to secure your spot!",
      date: "2024-01-15",
      category: "Event",
      isImportant: true
    },
    {
      id: 2,
      title: "New Job Opportunities in Tech Industry",
      excerpt: "Multiple positions available for UIC alumni in leading technology companies.",
      date: "2024-01-14",
      category: "Career",
      isImportant: true
    },
    {
      id: 3,
      title: "Alumni Directory Update",
      excerpt: "Help us keep our alumni directory current by updating your information.",
      date: "2024-01-13",
      category: "Announcement",
      isImportant: false
    }
  ]);

  const [stats, setStats] = useState({
    totalAlumni: 25000,
    activeMembers: 18000,
    jobPlacements: 1500,
    eventsThisYear: 25
  });

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to UIC Alumni Portal</h1>
            <p>Connecting University of the Immaculate Conception graduates worldwide</p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">
                Join Our Community
              </Link>
              <Link to="/news" className="btn btn-outline">
                View Latest News
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-stats">
              <div className="stat-item">
                <FaUsers />
                <span>{stats.totalAlumni.toLocaleString()}+</span>
                <p>Alumni Worldwide</p>
              </div>
              <div className="stat-item">
                <FaBriefcase />
                <span>{stats.jobPlacements.toLocaleString()}+</span>
                <p>Job Placements</p>
              </div>
              <div className="stat-item">
                <FaCalendarAlt />
                <span>{stats.eventsThisYear}</span>
                <p>Events This Year</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important News Section */}
      <section className="important-news">
        <div className="container">
          <h2>Important Announcements</h2>
          <div className="news-grid">
            {featuredNews.filter(news => news.isImportant).map(news => (
              <div key={news.id} className="news-card important">
                <div className="news-header">
                  <span className="news-category">{news.category}</span>
                  <span className="news-date">{new Date(news.date).toLocaleDateString()}</span>
                </div>
                <h3>{news.title}</h3>
                <p>{news.excerpt}</p>
                <Link to="/news" className="read-more">Read More →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaUsers />
              </div>
              <h3>Connect with Batchmates</h3>
              <p>Reconnect with your classmates and build lasting relationships with fellow alumni.</p>
              <Link to="/batchmates" className="feature-link">Learn More</Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaBriefcase />
              </div>
              <h3>Career Opportunities</h3>
              <p>Explore job opportunities across various industries and advance your career.</p>
              <Link to="/job-opportunities" className="feature-link">Explore Jobs</Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaNewspaper />
              </div>
              <h3>Latest News & Events</h3>
              <p>Stay updated with university news, events, and important announcements.</p>
              <Link to="/news" className="feature-link">View News</Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaGraduationCap />
              </div>
              <h3>Professional Development</h3>
              <p>Access workshops, seminars, and training programs to enhance your skills.</p>
              <Link to="/news" className="feature-link">View Programs</Link>
            </div>
          </div>
        </div>
      </section>

      {/* University Info Section */}
      <section className="university-info">
        <div className="container">
          <div className="info-content">
            <div className="info-text">
              <h2>University of the Immaculate Conception</h2>
              <p>Located in the heart of Davao City, UIC has been a beacon of academic excellence since its establishment. Our commitment to quality education and character formation has produced outstanding graduates who excel in various fields worldwide.</p>
              <div className="info-stats">
                <div className="info-stat">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Years of Excellence</span>
                </div>
                <div className="info-stat">
                  <span className="stat-number">25,000+</span>
                  <span className="stat-label">Alumni Worldwide</span>
                </div>
                <div className="info-stat">
                  <span className="stat-number">100+</span>
                  <span className="stat-label">Programs Offered</span>
                </div>
              </div>
            </div>
            <div className="info-contact">
              <h3>Contact Information</h3>
              <div className="contact-item">
                <FaMapMarkerAlt />
                <span>Fr. Selga Street, Davao City, Philippines</span>
              </div>
              <div className="contact-item">
                <FaPhone />
                <span>+63 82 221-8090</span>
              </div>
              <div className="contact-item">
                <FaEnvelope />
                <span>info@uic.edu.ph</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Connect?</h2>
          <p>Join our vibrant alumni community and stay connected with your alma mater.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary">
              Register Now
            </Link>
            <Link to="/login" className="btn btn-outline">
              Login to Your Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 