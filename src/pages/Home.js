import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaUsers, FaBriefcase, FaNewspaper, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { supabase } from '../config/supabaseClient';
import './Home.css';

const Home = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAlumni: 0,
    activeMembers: 0,
    jobPlacements: 0,
    eventsThisYear: 0
  });

  useEffect(() => {
    fetchNewsAndStats();
  }, []);

  const fetchNewsAndStats = async () => {
    try {
      // Fetch published news, prioritizing important ones
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('is_important', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(6);

      if (newsError) throw newsError;

      // Fetch statistics
      const [
        { count: totalAlumni },
        { count: activeMembers },
        { count: jobCount },
        { count: eventCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('approval_status', 'approved'),
        supabase.from('job_opportunities').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('news').select('*', { count: 'exact', head: true }).eq('category', 'Event').eq('is_published', true)
      ]);

      setFeaturedNews(newsData || []);
      setStats({
        totalAlumni: totalAlumni || 0,
        activeMembers: activeMembers || 0,
        jobPlacements: jobCount || 0,
        eventsThisYear: eventCount || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-glass">
            <div className="hero-grid">
              <div className="hero-content">
                <h1>Welcome to UIC-CCS Alumni Portal</h1>
                <p style={{ whiteSpace: "pre-line" }}>
                  {`Connecting University of the Immaculate Conception,
College of Computer Studies graduates worldwide.`}
                </p>

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
                    <p>Current Registered Alumni</p>
                  </div>
                  <div className="stat-item">
                    <FaBriefcase />
                    <span>{stats.jobPlacements.toLocaleString()}+</span>
                    <p>Job Vacancies</p>
                  </div>
                  <div className="stat-item">
                    <FaCalendarAlt />
                    <span>{stats.eventsThisYear}</span>
                    <p>Events This Year</p>
                  </div>
                </div>
              </div>
            </div>
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
                <FaCalendarAlt />
              </div>
              <h3>Professional Development</h3>
              <p>Create and join alumni events with notifications. Announcements are filtered to alumni‑relevant events and sourced from the UIC website and official Facebook pages.</p>
              <Link to="/job-opportunities" className="feature-link">Browse Events</Link>
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
                  <span className="stat-number">120+</span>
                  <span className="stat-label" style={{ color: 'rgb(219, 39, 119)' }}>Years of Excellence</span>
                </div>
                <div className="info-stat">
                  <span className="stat-number">250,000+</span>
                  <span className="stat-label" style={{ color: 'rgb(219, 39, 119)' }}>Alumni Worldwide</span>
                </div>
                <div className="info-stat">
                  <span className="stat-number">55+</span>
                  <span className="stat-label" style={{ color: 'rgb(219, 39, 119)' }}>Programs Offered</span>
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
          <div className="cta-glass">
            <h2>Ready to Connect?</h2>
            <p>Join our vibrant alumni community and stay connected with your alma mater.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">
                Register Now
              </Link>
              <Link to="/login" className="btn btn-primary">
                Login to Your Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 