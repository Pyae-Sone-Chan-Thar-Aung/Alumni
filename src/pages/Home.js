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
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('approval_status', 'approved'),
        supabase.from('job_opportunities').select('*', { count: 'exact', head: true }),
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
          </div>
        </div>
      </section>

      {/* Important News Section */}
      <section className="important-news">
        <div className="container">
          <h2>Important Announcements</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading announcements...</p>
            </div>
          ) : featuredNews.length > 0 ? (
            <div className="news-grid">
              {featuredNews.filter(news => news.is_important).slice(0, 3).map(news => (
                <div key={news.id} className="news-card important">
                  <div className="news-header">
                    <span className="news-category">{news.category}</span>
                    <span className="news-date">{new Date(news.published_at || news.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3>{news.title}</h3>
                  <p>{news.excerpt || news.content?.substring(0, 150) + '...'}</p>
                  <Link to="/news" className="read-more">Read More →</Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No announcements available at this time.</p>
            </div>
          )}
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
                  <span className="stat-number">120+</span>
                  <span className="stat-label">Years of Excellence</span>
                </div>
                <div className="info-stat">
                  <span className="stat-number">250,000+</span>
                  <span className="stat-label">Alumni Worldwide</span>
                </div>
                <div className="info-stat">
                  <span className="stat-number">55+</span>
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