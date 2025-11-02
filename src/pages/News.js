import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import { FaSearch, FaCalendarAlt, FaTag, FaNewspaper, FaBullhorn, FaGraduationCap, FaTimes, FaFacebook } from 'react-icons/fa';
import './News.css';
import '../components/SearchBar.css';
import { useAuth } from '../context/AuthContext';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filteredNews, setFilteredNews] = useState(news);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNews, setSelectedNews] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFacebook, setShowFacebook] = useState(true);
  const itemsPerPage = 9;

  const { isAuthenticated } = useAuth();

  // Facebook embed expand/collapse state
  const [fbExpanded, setFbExpanded] = useState({ main: false, ccs: false });
  const mainFbHeight = fbExpanded.main ? 900 : 600;
  const ccsFbHeight = fbExpanded.ccs ? 900 : 600;

  const categories = ['All', 'Event', 'Career', 'Announcement', 'Professional Development', 'Scholarship', 'Guide'];

  useEffect(() => {
    let filtered = news;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredNews(filtered);
  }, [searchTerm, selectedCategory, news]);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const mapped = data.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          category: n.category || 'Announcement',
          date: n.published_at || n.created_at,
          author: n.author || 'Alumni Office',
          isImportant: !!n.is_important,
          image: n.image_url || null
        }));
        setNews(mapped);
      }
      setLoading(false);
    };
    fetchNews();
  }, []);

  const handleNewsClick = (newsItem) => {
    setSelectedNews(newsItem);
  };

  const closeModal = () => {
    setSelectedNews(null);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Event':
        return <FaCalendarAlt />;
      case 'Career':
        return <FaNewspaper />;
      case 'Announcement':
        return <FaBullhorn />;
      case 'Professional Development':
        return <FaGraduationCap />;
      default:
        return <FaTag />;
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredNews.filter(n => !n.isImportant).length / itemsPerPage);
  const paginatedNews = (() => {
    const featuredIds = new Set(filteredNews.filter(n => n.isImportant).slice(0, 1).map(n => n.id));
    const rest = filteredNews.filter(n => !featuredIds.has(n.id));
    const startIndex = (currentPage - 1) * itemsPerPage;
    return rest.slice(startIndex, startIndex + itemsPerPage);
  })();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="news-page">
      <div className="container">
        <div className="news-header">
          <div>
            <h1>News & Gallery</h1>
            <span className="subtitle">Fetched from UIC Facebook + Internal Announcements</span>
          </div>
        </div>

        <div className="news-filters">
          <div className="search-container">
            <div className="search-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search news and announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm('')}>
                  <FaTimes />
                </button>
              )}
            </div>
            <div className="filter-dropdown">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Featured important news */}
        {(() => {
          const featured = filteredNews.filter(n => n.isImportant);
          if (loading) return null;
          if (featured.length === 0) return null;
          const top = featured[0];
          return (
            <div className="news-featured" onClick={() => handleNewsClick(top)}>
              {top.image && (
                <div className="featured-image">
                  <img src={top.image} alt={top.title} />
                  <div className="featured-gradient" />
                </div>
              )}
              <div className="featured-content">
                <div className="featured-meta">
                  <span className={`news-category ${top.category.toLowerCase()}`}>
                    {getCategoryIcon(top.category)}
                    {top.category}
                  </span>
                  <span className="news-date">{new Date(top.date).toLocaleDateString()}</span>
                </div>
                <h2 className="featured-title">{top.title}</h2>
                <p className="featured-excerpt">{top.content.substring(0, 180)}...</p>
                <div className="featured-footer">
                  <span className="news-author">By {top.author}</span>
                  <span className="read-more">Read More →</span>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="news-grid">
          {loading && (
            <>
              {Array.from({ length: 9 }).map((_, idx) => (
                <div key={idx} className="news-card skeleton-card">
                  <div className="skeleton skeleton-image" />
                  <div className="news-card-content">
                    <div className="card-meta">
                      <span className="skeleton skeleton-pill" />
                      <span className="skeleton skeleton-text sm" />
                    </div>
                    <div className="skeleton skeleton-text lg" />
                    <div className="skeleton skeleton-text md" />
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && paginatedNews.map(newsItem => (
            <div
              key={newsItem.id}
              className="news-card"
              onClick={() => handleNewsClick(newsItem)}
            >
              {newsItem.image && (
                <div className="card-image">
                  <img src={newsItem.image} alt={newsItem.title} />
                </div>
              )}
              <div className="news-card-content">
                <div className="card-meta">
                  <span className={`category-badge ${newsItem.category.toLowerCase().replace(/ /g, '-')}`}>
                    {newsItem.category}
                  </span>
                  <span className="card-date">
                    {new Date(newsItem.date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="card-title">{newsItem.title}</h3>
                <p className="card-preview">{newsItem.content.substring(0, 140)}...</p>
                <div className="card-footer">
                  <span className="read-more-link">Read more →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && filteredNews.length === 0 && (
          <div className="no-results">
            <h3>No news found</h3>
            <p>Try adjusting your search terms or category filter</p>
          </div>
        )}

        {!loading && filteredNews.length > 0 && totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button
              className="page-btn"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Facebook Feed Section */}
        {showFacebook && (
          isAuthenticated ? (
            <div className="facebook-grid">
              <div className="facebook-section">
                <div className="section-header">
                  <h2>
                    <FaFacebook /> Latest from UIC Facebook Page
                  </h2>
                </div>
                <div className="facebook-embed">
                  <iframe
                    src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fuicph&tabs=timeline&width=500&height=600&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&appId"
                    width="100%"
                    height={mainFbHeight}
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  />
                </div>
                <div className="facebook-actions" style={{ gap: 12, display: 'flex', justifyContent: 'center' }}>
                  <button className="btn-primary" title={fbExpanded.main ? 'Show Less' : 'Show More'} onClick={() => setFbExpanded((s) => ({ ...s, main: !s.main }))}>
                    {fbExpanded.main ? 'Show Less' : 'Show More'}
                  </button>
                  <button className="btn-primary" onClick={() => window.open('https://www.facebook.com/uicph', '_blank')}>
                    Visit Facebook Page
                  </button>
                </div>
              </div>

              <div className="facebook-section">
                <div className="section-header">
                  <h2>
                    <FaFacebook /> Latest from UIC CCS Facebook Page
                  </h2>
                </div>
                <div className="facebook-embed">
                  <iframe
                    src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fuic.ccs&tabs=timeline&width=500&height=600&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&appId"
                    width="100%"
                    height={ccsFbHeight}
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  />
                </div>
                <div className="facebook-actions" style={{ gap: 12, display: 'flex', justifyContent: 'center' }}>
                  <button className="btn-primary" title={fbExpanded.ccs ? 'Show Less' : 'Show More'} onClick={() => setFbExpanded((s) => ({ ...s, ccs: !s.ccs }))}>
                    {fbExpanded.ccs ? 'Show Less' : 'Show More'}
                  </button>
                  <button className="btn-primary" onClick={() => window.open('https://www.facebook.com/uic.ccs', '_blank')}>
                    Visit CCS Page
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="facebook-section">
              <div className="section-header">
                <h2>
                  <FaFacebook /> Latest from UIC Facebook Page
                </h2>
              </div>
              <div className="facebook-embed">
                <iframe
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fuicofficial&tabs=timeline&width=500&height=600&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false&appId"
                  width="100%"
                  height="600"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>
              <div className="facebook-actions">
                  <button className="btn-primary" onClick={() => window.open('https://www.facebook.com/uicph', '_blank')}>
                    Visit Facebook Page
                  </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* News Modal */}
      {selectedNews && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Close">
              <FaTimes />
            </button>
            {selectedNews.image && (
              <div className="modal-image">
                <img src={selectedNews.image} alt={selectedNews.title} />
              </div>
            )}
            <div className="modal-body">
              <div className="modal-meta">
                <span className={`category-badge ${selectedNews.category.toLowerCase().replace(/ /g, '-')}`}>
                  {selectedNews.category}
                </span>
                <span className="modal-date">
                  {new Date(selectedNews.date).toLocaleDateString()}
                </span>
              </div>
              <h2 className="modal-title">{selectedNews.title}</h2>
              <p className="modal-author">By {selectedNews.author}</p>
              <div className="modal-text">
                {selectedNews.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News; 
