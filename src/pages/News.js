import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaTag, FaNewspaper, FaBullhorn, FaGraduationCap } from 'react-icons/fa';
import './News.css';

const News = () => {
  const [news, setNews] = useState([
    {
      id: 1,
      title: "Alumni Homecoming 2024 Registration Now Open",
      content: "Join us for the biggest alumni gathering of the year. The event will feature networking sessions, career talks, and a grand dinner. Registration is now open and early bird discounts are available until February 15, 2024.",
      category: "Event",
      date: "2024-01-15",
      author: "Alumni Office",
      isImportant: true,
      image: "/news/homecoming.jpg"
    },
    {
      id: 2,
      title: "New Job Opportunities in Tech Industry",
      content: "Multiple positions available for UIC alumni in leading technology companies including Google, Microsoft, and local startups. Positions range from entry-level to senior management roles.",
      category: "Career",
      date: "2024-01-14",
      author: "Career Services",
      isImportant: true,
      image: "/news/tech-jobs.jpg"
    },
    {
      id: 3,
      title: "Alumni Directory Update",
      content: "Help us keep our alumni directory current by updating your information. This will help fellow alumni connect with you and stay informed about relevant opportunities.",
      category: "Announcement",
      date: "2024-01-13",
      author: "Alumni Office",
      isImportant: false,
      image: "/news/directory.jpg"
    },
    {
      id: 4,
      title: "Professional Development Workshop Series",
      content: "Join our monthly professional development workshops covering topics like leadership, communication, and industry trends. These sessions are free for all registered alumni.",
      category: "Professional Development",
      date: "2024-01-12",
      author: "Professional Development Office",
      isImportant: false,
      image: "/news/workshop.jpg"
    },
    {
      id: 5,
      title: "Scholarship Opportunities for Current Students",
      content: "Alumni-sponsored scholarships are now available for current UIC students. These scholarships are funded by generous alumni donations and cover various academic programs.",
      category: "Scholarship",
      date: "2024-01-11",
      author: "Student Affairs",
      isImportant: false,
      image: "/news/scholarship.jpg"
    },
    {
      id: 6,
      title: "Batch Reunion Planning Guide",
      content: "Planning a batch reunion? We've created a comprehensive guide to help you organize successful alumni gatherings. Includes templates, checklists, and venue recommendations.",
      category: "Guide",
      date: "2024-01-10",
      author: "Alumni Relations",
      isImportant: false,
      image: "/news/reunion.jpg"
    }
  ]);

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

        <div className="news-grid">
          {filteredNews.map(newsItem => (
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
          ))}
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