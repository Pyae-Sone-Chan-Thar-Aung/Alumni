import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import { FaSearch, FaCalendarAlt, FaTag, FaNewspaper, FaBullhorn, FaGraduationCap } from 'react-icons/fa';
import './News.css';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filteredNews, setFilteredNews] = useState(news);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNews, setSelectedNews] = useState(null);

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

  return (
    <div className="news-page">
      <div className="container">
        <div className="news-header">
          <h1>News & Announcements</h1>
          <p>Stay updated with the latest news, events, and opportunities from UIC</p>
        </div>

        <div className="news-filters">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search news and announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
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
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="news-card skeleton-card">
                  <div className="skeleton skeleton-image" />
                  <div className="news-content">
                    <div className="news-header-info">
                      <span className="skeleton skeleton-pill" />
                      <span className="skeleton skeleton-text sm" />
                    </div>
                    <div className="skeleton skeleton-text lg" />
                    <div className="skeleton skeleton-text md" />
                    <div className="news-footer">
                      <span className="skeleton skeleton-text sm" />
                      <span className="skeleton skeleton-text sm" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {(() => {
            const featuredIds = new Set(filteredNews.filter(n => n.isImportant).slice(0, 1).map(n => n.id));
            const rest = filteredNews.filter(n => !featuredIds.has(n.id));
            return rest.map(newsItem => (
              <div
                key={newsItem.id}
                className={`news-card ${newsItem.isImportant ? 'important' : ''}`}
                onClick={() => handleNewsClick(newsItem)}
              >
                {newsItem.image && (
                  <div className="news-image">
                    <img src={newsItem.image} alt={newsItem.title} />
                  </div>
                )}
                <div className="news-content">
                  <div className="news-header-info">
                    <span className={`news-category ${newsItem.category.toLowerCase()}`}>
                      {getCategoryIcon(newsItem.category)}
                      {newsItem.category}
                    </span>
                    <span className="news-date">
                      {new Date(newsItem.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3>{newsItem.title}</h3>
                  <p>{newsItem.content.substring(0, 150)}...</p>
                  <div className="news-footer">
                    <span className="news-author">By {newsItem.author}</span>
                    <span className="read-more">Read More →</span>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>

        {filteredNews.length === 0 && (
          <div className="no-results">
            <h3>No news found</h3>
            <p>Try adjusting your search terms or category filter</p>
          </div>
        )}
      </div>

      {/* News Modal */}
      {selectedNews && (
        <div className="news-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <div className="modal-header">
              <div className="modal-category">
                {getCategoryIcon(selectedNews.category)}
                {selectedNews.category}
              </div>
              <div className="modal-date">
                {new Date(selectedNews.date).toLocaleDateString()}
              </div>
            </div>
            <h2>{selectedNews.title}</h2>
            <div className="modal-author">
              By {selectedNews.author}
            </div>
            {selectedNews.image && (
              <div className="modal-image">
                <img src={selectedNews.image} alt={selectedNews.title} />
              </div>
            )}
            <div className="modal-content-text">
              {selectedNews.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News; 