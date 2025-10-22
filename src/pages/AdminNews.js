import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import { FaPlus, FaEdit, FaTrash, FaNewspaper, FaSave, FaTimes, FaStar, FaRegStar, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
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
  const [news, setNews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ 
    title: '', 
    content: '', 
    category: 'Announcement', 
    isImportant: false,
    isPublished: true 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedNews = data.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        date: item.published_at?.slice(0, 10) || item.created_at?.slice(0, 10),
        category: item.category,
        isImportant: !!item.is_important,
        isPublished: !!item.is_published
      }));
      
      setNews(formattedNews);
    } catch (error) {
      toast.error('Failed to fetch news: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newsData = {
        title: form.title,
        content: form.content,
        category: form.category,
        is_published: form.isPublished,
        is_important: form.isImportant,
        published_at: form.isPublished ? new Date().toISOString() : null
      };

      if (editingId) {
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingId);
        
        if (error) throw error;
        toast.success('News updated successfully!');
      } else {
        const { error } = await supabase
          .from('news')
          .insert(newsData);
        
        if (error) throw error;
        toast.success('News posted successfully!');
      }
      
      await fetchNews();
      resetForm();
    } catch (error) {
      toast.error('Failed to save news: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ 
      title: '', 
      content: '', 
      category: 'Announcement', 
      isImportant: false,
      isPublished: true 
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title,
      content: item.content || '',
      category: item.category,
      isImportant: item.isImportant,
      isPublished: item.isPublished
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const toggleImportant = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ is_important: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchNews();
      toast.success(`News ${!currentStatus ? 'highlighted' : 'unhighlighted'} successfully!`);
    } catch (error) {
      toast.error('Failed to update news: ' + error.message);
    }
  };

  const togglePublished = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ 
          is_published: !currentStatus,
          published_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', id);
      
      if (error) throw error;
      
      await fetchNews();
      toast.success(`News ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      toast.error('Failed to update news: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news item?')) return;
    
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      
      await fetchNews();
      toast.success('News deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete news: ' + error.message);
    }
  };

  return (
    <div className="admin-news-page">
      <div className="container">
        <div className="page-header">
          <h1>Manage News & Announcements</h1>
          <p>Post, edit, and highlight important news for alumni</p>
        </div>

        <div className="news-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            <FaPlus /> {showForm ? 'Cancel' : 'Add News'}
          </button>
          <div className="news-stats">
            <span>Total: {news.length}</span>
            <span>Published: {news.filter(n => n.isPublished).length}</span>
            <span>Important: {news.filter(n => n.isImportant).length}</span>
          </div>
        </div>

        {showForm && (
          <form className="news-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <input
                type="text"
                name="title"
                placeholder="News Title"
                value={form.title}
                onChange={handleInputChange}
                required
              />
              <select
                name="category"
                value={form.category}
                onChange={handleInputChange}
                required
              >
                <option value="Announcement">Announcement</option>
                <option value="Event">Event</option>
                <option value="Career">Career</option>
                <option value="Academic">Academic</option>
                <option value="Alumni News">Alumni News</option>
                <option value="University Update">University Update</option>
              </select>
            </div>
            
            <textarea
              name="content"
              placeholder="News Content (detailed description)"
              value={form.content}
              onChange={handleInputChange}
              rows="4"
              required
            />
            
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isImportant"
                  checked={form.isImportant}
                  onChange={handleInputChange}
                />
                <FaStar /> Highlight as Important
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={form.isPublished}
                  onChange={handleInputChange}
                />
                <FaEye /> Publish Immediately
              </label>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-success" disabled={loading}>
                <FaSave /> {editingId ? 'Update News' : 'Post News'}
              </button>
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        )}

        <div className="news-list">
          {loading ? (
            <div className="loading-state">Loading news...</div>
          ) : news.length === 0 ? (
            <div className="empty-state">
              <FaNewspaper />
              <h3>No news posted yet</h3>
              <p>Start by creating your first news announcement</p>
            </div>
          ) : (
            news.map(item => (
              <div key={item.id} className={`news-item${item.isImportant ? ' important' : ''}${!item.isPublished ? ' draft' : ''}`}>
                <div className="news-info">
                  <div className="news-header">
                    <h3>{item.title}</h3>
                    <div className="news-badges">
                      {item.isImportant && <span className="important-badge"><FaStar /> Important</span>}
                      {!item.isPublished && <span className="draft-badge"><FaEyeSlash /> Draft</span>}
                    </div>
                  </div>
                  
                  {item.content && (
                    <p className="news-content">{item.content.substring(0, 150)}{item.content.length > 150 ? '...' : ''}</p>
                  )}
                  
                  <div className="news-meta">
                    <span className="news-category">{item.category}</span>
                    <span className="news-date">{item.date}</span>
                  </div>
                </div>
                
                <div className="news-actions">
                  <button 
                    className={`btn btn-icon ${item.isImportant ? 'active' : ''}`}
                    onClick={() => toggleImportant(item.id, item.isImportant)}
                    title={item.isImportant ? 'Remove highlight' : 'Highlight as important'}
                  >
                    {item.isImportant ? <FaStar /> : <FaRegStar />}
                  </button>
                  
                  <button 
                    className={`btn btn-icon ${item.isPublished ? 'active' : ''}`}
                    onClick={() => togglePublished(item.id, item.isPublished)}
                    title={item.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {item.isPublished ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  
                  <button 
                    className="btn btn-outline" 
                    onClick={() => handleEdit(item)}
                    title="Edit news"
                  >
                    <FaEdit />
                  </button>
                  
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(item.id)}
                    title="Delete news"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNews; 