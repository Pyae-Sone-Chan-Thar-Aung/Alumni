import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaNewspaper } from 'react-icons/fa';
import './AdminNews.css';

const initialNews = [
  {
    id: 1,
    title: 'Alumni Homecoming 2024 Registration Now Open',
    date: '2024-01-15',
    category: 'Event',
    isImportant: true
  },
  {
    id: 2,
    title: 'New Job Opportunities in Tech Industry',
    date: '2024-01-14',
    category: 'Career',
    isImportant: true
  },
  {
    id: 3,
    title: 'Alumni Directory Update',
    date: '2024-01-13',
    category: 'Announcement',
    isImportant: false
  }
];

const AdminNews = () => {
  const [news, setNews] = useState(initialNews);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', isImportant: false });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAddNews = (e) => {
    e.preventDefault();
    setNews([
      {
        id: news.length + 1,
        title: form.title,
        date: new Date().toISOString().slice(0, 10),
        category: form.category,
        isImportant: form.isImportant
      },
      ...news
    ]);
    setForm({ title: '', category: '', isImportant: false });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setNews(news.filter(n => n.id !== id));
  };

  return (
    <div className="admin-news-page">
      <div className="container">
        <div className="page-header">
          <h1>Manage News & Announcements</h1>
          <p>Post, edit, and highlight important news for alumni</p>
        </div>

        <div className="news-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <FaPlus /> Add News
          </button>
        </div>

        {showForm && (
          <form className="news-form" onSubmit={handleAddNews}>
            <input
              type="text"
              name="title"
              placeholder="News Title"
              value={form.title}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="category"
              placeholder="Category (e.g. Event, Career)"
              value={form.category}
              onChange={handleInputChange}
              required
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isImportant"
                checked={form.isImportant}
                onChange={handleInputChange}
              />
              Highlight as Important
            </label>
            <button type="submit" className="btn btn-success">
              <FaPlus /> Post News
            </button>
          </form>
        )}

        <div className="news-list">
          {news.map(item => (
            <div key={item.id} className={`news-item${item.isImportant ? ' important' : ''}`}>
              <div className="news-info">
                <h3>{item.title}</h3>
                <span className="news-category">{item.category}</span>
                <span className="news-date">{item.date}</span>
                {item.isImportant && <span className="important-badge">Important</span>}
              </div>
              <div className="news-actions">
                <button className="btn btn-outline" title="Edit (not implemented)"><FaEdit /></button>
                <button className="btn btn-danger" onClick={() => handleDelete(item.id)}><FaTrash /></button>
              </div>
            </div>
          ))}
          {news.length === 0 && <p>No news posted yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminNews; 