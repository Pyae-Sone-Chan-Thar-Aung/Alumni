import React, { useState, useEffect } from 'react';
import supabase from '../config/supabaseClient';
import { 
  FaPlus, FaEdit, FaTrash, FaNewspaper, FaSave, FaTimes, FaStar, 
  FaRegStar, FaEye, FaEyeSlash, FaTimesCircle, FaImages, FaUpload,
  FaSpinner, FaImage, FaCalendarAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import './AdminNews.css';
import '../components/gallery/AdminGallery.css';

const AdminNewsGallery = () => {
  const [activeTab, setActiveTab] = useState('news'); // 'news' or 'gallery'
  
  // News state
  const [news, setNews] = useState([]);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [newsForm, setNewsForm] = useState({ 
    title: '', 
    content: '', 
    category: 'Announcement', 
    isImportant: false,
    isPublished: true,
    imageUrl: ''
  });
  const [newsImageFile, setNewsImageFile] = useState(null);
  const [newsImagePreview, setNewsImagePreview] = useState(null);
  
  // Gallery state
  const [albums, setAlbums] = useState([]);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [albumForm, setAlbumForm] = useState({
    title: '',
    description: '',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    is_published: true,
    cover_image: null,
    cover_image_url: ''
  });
  const [viewAlbum, setViewAlbum] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [galleryTab, setGalleryTab] = useState('albums'); // 'albums' or 'manage'
  
  // Shared state
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchNews();
    fetchAlbums();
  }, []);

  // =============== NEWS FUNCTIONS ===============
  
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
        isPublished: !!item.is_published,
        imageUrl: item.image_url || null
      }));
      
      setNews(formattedNews);
    } catch (error) {
      toast.error('Failed to fetch news: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewsForm({ ...newsForm, [name]: type === 'checkbox' ? checked : value });
  };

  const handleNewsImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setNewsImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewsImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeNewsImage = () => {
    setNewsImageFile(null);
    setNewsImagePreview(null);
    setNewsForm({ ...newsForm, imageUrl: '' });
  };

  const uploadNewsImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `news_${Date.now()}.${fileExt}`;
    const filePath = `news-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('news-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('news-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = newsForm.imageUrl;

      if (newsImageFile) {
        setUploading(true);
        imageUrl = await uploadNewsImage(newsImageFile);
        setUploading(false);
      }

      const newsData = {
        title: newsForm.title,
        content: newsForm.content,
        category: newsForm.category,
        is_published: newsForm.isPublished,
        is_important: newsForm.isImportant,
        published_at: newsForm.isPublished ? new Date().toISOString() : null,
        image_url: imageUrl || null
      };

      if (editingNewsId) {
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingNewsId);
        
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
      resetNewsForm();
    } catch (error) {
      toast.error('Failed to save news: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetNewsForm = () => {
    setNewsForm({ 
      title: '', 
      content: '', 
      category: 'Announcement', 
      isImportant: false,
      isPublished: true,
      imageUrl: ''
    });
    setNewsImageFile(null);
    setNewsImagePreview(null);
    setShowNewsForm(false);
    setEditingNewsId(null);
  };

  const handleEditNews = (item) => {
    setNewsForm({
      title: item.title,
      content: item.content || '',
      category: item.category,
      isImportant: item.isImportant,
      isPublished: item.isPublished,
      imageUrl: item.imageUrl || ''
    });
    if (item.imageUrl) {
      setNewsImagePreview(item.imageUrl);
    }
    setEditingNewsId(item.id);
    setShowNewsForm(true);
  };

  const toggleNewsImportant = async (id, currentStatus) => {
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

  const toggleNewsPublished = async (id, currentStatus) => {
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

  const handleDeleteNews = async (id) => {
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

  // =============== GALLERY FUNCTIONS ===============
  
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_albums')
        .select(`
          *,
          gallery_images (id, image_url, caption, display_order)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
      toast.error('Failed to load albums: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAlbumForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    
    setAlbumForm(prev => ({
      ...prev,
      cover_image: file,
      cover_image_url: previewUrl
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && 
      file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length === 0) {
      toast.error('Please upload valid image files (JPEG, PNG, or WebP, max 5MB each)');
      return;
    }

    if (!currentAlbum || !currentAlbum.id) {
      toast.error('No album selected. Create or select an album first.');
      return;
    }

    setUploadingImages(true);
    
    const processUploads = async () => {
      try {
        const uploadPromises = validFiles.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `album-${currentAlbum.id}/${Date.now()}-${index}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('gallery')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('gallery')
            .getPublicUrl(fileName);

          const { data: imageData, error: imageError } = await supabase
            .from('gallery_images')
            .insert({
              album_id: currentAlbum.id,
              image_url: publicUrl,
              caption: '',
              display_order: 1000 + index
            })
            .select()
            .single();
            
          if (imageError) throw imageError;
          return imageData;
        });
        
        const uploadedImages = await Promise.all(uploadPromises);
        toast.success(`${uploadedImages.length} images uploaded successfully`);
        
        const { data: updatedAlbum, error: albumError } = await supabase
          .from('gallery_albums')
          .select(`
            *,
            gallery_images (id, image_url, caption, display_order)
          `)
          .eq('id', currentAlbum.id)
          .single();
        
        if (albumError) throw albumError;
        setViewAlbum(updatedAlbum);
        
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error('Failed to upload images: ' + (error.message || error));
      } finally {
        setUploadingImages(false);
      }
    };
    
    processUploads().catch(console.error);
  };

  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    
    if (!albumForm.title.trim()) {
      toast.error('Please enter a title for the album');
      return;
    }

    setUploading(true);
    
    try {
      let coverImageUrl = albumForm.cover_image_url;
      
      if (albumForm.cover_image) {
        const fileExt = albumForm.cover_image.name.split('.').pop();
        const fileName = `covers/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, albumForm.cover_image, {
            cacheControl: '3600',
            upsert: false,
            contentType: albumForm.cover_image.type
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(fileName);
        
        coverImageUrl = publicUrl;
      }
      
      const albumData = {
        title: albumForm.title.trim(),
        description: albumForm.description.trim(),
        event_date: albumForm.event_date,
        is_published: albumForm.is_published,
        cover_image_url: coverImageUrl
      };
      
      let result;
      
      if (currentAlbum) {
        const { data, error } = await supabase
          .from('gallery_albums')
          .update(albumData)
          .eq('id', currentAlbum.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        toast.success('Album updated successfully');
      } else {
        const { data, error } = await supabase
          .from('gallery_albums')
          .insert([{ ...albumData, created_by: (await supabase.auth.getUser()).data.user?.id }])
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        toast.success('Album created successfully');
      }
      
      resetAlbumForm();
      await fetchAlbums();
      
      if (!currentAlbum && result) {
        setCurrentAlbum(result);
        setViewAlbum(result);
        setGalleryTab('manage');
      }
      
    } catch (error) {
      console.error('Error saving album:', error);
      toast.error('Failed to save album: ' + (error.message || error));
    } finally {
      setUploading(false);
      setShowAlbumModal(false);
    }
  };

  const resetAlbumForm = () => {
    setAlbumForm({
      title: '',
      description: '',
      event_date: format(new Date(), 'yyyy-MM-dd'),
      is_published: true,
      cover_image: null,
      cover_image_url: ''
    });
    setCurrentAlbum(null);
  };

  const openEditAlbumModal = (album) => {
    setCurrentAlbum(album);
    setAlbumForm({
      title: album.title,
      description: album.description || '',
      event_date: album.event_date ? format(new Date(album.event_date), 'yyyy-MM-dd') : '',
      is_published: album.is_published,
      cover_image: null,
      cover_image_url: album.cover_image_url || ''
    });
    setShowAlbumModal(true);
  };

  const handleDeleteAlbum = async (idParam) => {
    const albumId = idParam || currentAlbum?.id;
    if (!albumId) {
      toast.error('No album selected to delete.');
      return;
    }

    setUploading(true);

    try {
      const { error: deleteImagesError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('album_id', albumId);

      if (deleteImagesError) {
        console.warn('Error deleting associated gallery_images rows:', deleteImagesError);
      }

      const { error: deleteAlbumError } = await supabase
        .from('gallery_albums')
        .delete()
        .eq('id', albumId);
        
      if (deleteAlbumError) throw deleteAlbumError;

      toast.success('Album deleted successfully');
      resetAlbumForm();
      await fetchAlbums();
      setIsDeleteModalOpen(false);
      setGalleryTab('albums');
      setViewAlbum(null);
    } catch (error) {
      console.error('Error deleting album:', error);
      toast.error('Failed to delete album: ' + (error.message || error));
    } finally {
      setUploading(false);
    }
  };

  const toggleAlbumPublishStatus = async (album) => {
    try {
      const { error } = await supabase
        .from('gallery_albums')
        .update({ is_published: !album.is_published })
        .eq('id', album.id);

      if (error) throw error;
      
      setAlbums(albums.map(a => 
        a.id === album.id ? { ...a, is_published: !album.is_published } : a
      ));
      
      toast.success(`Album ${!album.is_published ? 'published' : 'unpublished'} successfully`);
      await fetchAlbums();
      
      if (viewAlbum && viewAlbum.id === album.id) {
        setViewAlbum(prev => ({
          ...prev,
          is_published: !album.is_published
        }));
      }
      
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update album status');
    }
  };

  const confirmDeleteAlbum = (album) => {
    setCurrentAlbum(album);
    setIsDeleteModalOpen(true);
  };

  // =============== RENDER SECTIONS ===============

  const renderNewsSection = () => (
    <div className="admin-news-page">
      <div className="news-actions">
        <button 
          className="btn btn-primary" 
          onClick={() => {
            resetNewsForm();
            setShowNewsForm(!showNewsForm);
          }}
        >
          <FaPlus /> {showNewsForm ? 'Cancel' : 'Add News'}
        </button>
        <div className="news-stats">
          <span>Total: {news.length}</span>
          <span>Published: {news.filter(n => n.isPublished).length}</span>
          <span>Important: {news.filter(n => n.isImportant).length}</span>
        </div>
      </div>

      {showNewsForm && (
        <form className="news-form" onSubmit={handleNewsSubmit}>
          <div className="form-row">
            <input
              type="text"
              name="title"
              placeholder="News Title"
              value={newsForm.title}
              onChange={handleNewsInputChange}
              required
            />
            <select
              name="category"
              value={newsForm.category}
              onChange={handleNewsInputChange}
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
            value={newsForm.content}
            onChange={handleNewsInputChange}
            rows="4"
            required
          />
          
          <div className="image-upload-section">
            <label>Cover Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleNewsImageChange}
              className="image-file-input"
            />
            {newsImagePreview && (
              <div className="image-preview-wrapper">
                <img src={newsImagePreview} alt="Preview" />
                <button 
                  type="button" 
                  className="btn btn-sm btn-danger"
                  onClick={removeNewsImage}
                >
                  <FaTimesCircle /> Remove
                </button>
              </div>
            )}
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isImportant"
                checked={newsForm.isImportant}
                onChange={handleNewsInputChange}
              />
              <FaStar /> Highlight as Important
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublished"
                checked={newsForm.isPublished}
                onChange={handleNewsInputChange}
              />
              <FaEye /> Publish Immediately
            </label>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-success" disabled={loading || uploading}>
              <FaSave /> {uploading ? 'Uploading Image...' : editingNewsId ? 'Update News' : 'Post News'}
            </button>
            <button type="button" className="btn btn-outline" onClick={resetNewsForm}>
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
                  onClick={() => toggleNewsImportant(item.id, item.isImportant)}
                  title={item.isImportant ? 'Remove highlight' : 'Highlight as important'}
                >
                  {item.isImportant ? <FaStar /> : <FaRegStar />}
                </button>
                
                <button 
                  className={`btn btn-icon ${item.isPublished ? 'active' : ''}`}
                  onClick={() => toggleNewsPublished(item.id, item.isPublished)}
                  title={item.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {item.isPublished ? <FaEye /> : <FaEyeSlash />}
                </button>
                
                <button 
                  className="btn btn-outline" 
                  onClick={() => handleEditNews(item)}
                  title="Edit news"
                >
                  <FaEdit />
                </button>
                
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteNews(item.id)}
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
  );

  const renderGallerySection = () => {
    if (galleryTab === 'manage') {
      const album = viewAlbum || currentAlbum;
      if (!album) return (
        <div>
          <p>Select an album to manage its images.</p>
          <button className="btn btn-outline" onClick={() => setGalleryTab('albums')}>Back to Albums</button>
        </div>
      );

      return (
        <div className="manage-album">
          <div className="manage-header">
            <h3>{album.title}</h3>
            <p>{album.description}</p>
            <div className="manage-actions">
              <button className="btn btn-outline" onClick={() => { setGalleryTab('albums'); setViewAlbum(null); }}>
                Back to Albums
              </button>
              <button className="btn btn-primary" onClick={() => openEditAlbumModal(album)}>
                <FaEdit /> Edit Album
              </button>
            </div>
          </div>

          <div className="manage-upload">
            <label className="btn btn-outline">
              <FaUpload /> Upload Images
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImages} />
            </label>
            {uploadingImages && <div className="uploading-note"><FaSpinner className="spinner" /> Uploading...</div>}
          </div>

          <div className="images-grid">
            {(album.gallery_images || []).length === 0 ? (
              <p>No images in this album yet.</p>
            ) : (
              (album.gallery_images || []).sort((a,b)=> (a.display_order||0) - (b.display_order||0)).map(img => (
                <div key={img.id} className="image-card">
                  <img src={img.image_url} alt={img.caption || 'gallery image'} />
                  <div className="image-meta">
                    <p>{img.caption || ''}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="admin-gallery">
        <div className="admin-header">
          <div className="header-content">
            <h2>Gallery Albums</h2>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAlbumModal(true)}
          >
            <FaPlus /> Create Album
          </button>
        </div>

        {loading ? (
          <p>Loading albums...</p>
        ) : albums.length === 0 ? (
          <div className="albums-empty">
            <FaImages className="empty-icon" />
            <h3>No Albums Yet</h3>
            <p>Get started by creating your first photo album for events, activities, or special occasions.</p>
            <button className="btn btn-primary" onClick={() => setShowAlbumModal(true)}>
              <FaPlus /> Create Your First Album
            </button>
          </div>
        ) : (
          <div className="albums-grid">
            {albums.map(album => (
              <div key={album.id} className="album-card">
                <div className="album-cover">
                  <img
                    src={album.cover_image_url || '/placeholder-gallery.jpg'}
                    alt={album.title}
                    onError={(e)=>{ e.target.onerror = null; e.target.src = '/placeholder-gallery.jpg'; }}
                  />
                </div>
                <div className="album-info">
                  <h4>{album.title}</h4>
                  <p>{album.description}</p>
                  <div className="album-actions">
                    <button className="btn btn-sm" onClick={() => { setViewAlbum(album); setGalleryTab('manage'); setCurrentAlbum(album); }}>
                      Manage
                    </button>
                    <button className="btn btn-sm" onClick={() => openEditAlbumModal(album)}>
                      <FaEdit /> Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => confirmDeleteAlbum(album)}>
                      <FaTrash /> Delete
                    </button>
                    <button className="btn btn-sm" onClick={() => toggleAlbumPublishStatus(album)}>
                      {album.is_published ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Album Modal */}
        {showAlbumModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{currentAlbum ? 'Edit Album' : 'Create New Album'}</h3>
                <button 
                  className="close-button"
                  onClick={() => {
                    setShowAlbumModal(false);
                    resetAlbumForm();
                  }}
                  disabled={uploading}
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleAlbumSubmit}>
                <div className="form-group">
                  <label htmlFor="title">Album Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-control"
                    value={albumForm.title}
                    onChange={handleAlbumInputChange}
                    required
                    disabled={uploading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    rows="3"
                    value={albumForm.description}
                    onChange={handleAlbumInputChange}
                    disabled={uploading}
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="event_date">Event Date</label>
                  <input
                    type="date"
                    id="event_date"
                    name="event_date"
                    className="form-control"
                    value={albumForm.event_date}
                    onChange={handleAlbumInputChange}
                    disabled={uploading}
                  />
                </div>
                
                <div className="form-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="is_published"
                      checked={albumForm.is_published}
                      onChange={handleAlbumInputChange}
                      disabled={uploading}
                    />
                    <span className="checkmark"></span>
                    Publish this album
                  </label>
                </div>
                
                <div className="form-group">
                  <label>Cover Image</label>
                  <div className="cover-upload">
                    {albumForm.cover_image_url ? (
                      <div className="cover-preview">
                        <img 
                          src={albumForm.cover_image_url} 
                          alt="Cover preview" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-gallery.jpg';
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-outline change-cover"
                          onClick={() => document.getElementById('cover-upload').click()}
                          disabled={uploading}
                        >
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="upload-placeholder"
                        onClick={() => document.getElementById('cover-upload').click()}
                      >
                        <FaImage className="upload-icon" />
                        <span>Click to upload a cover image</span>
                        <span className="upload-hint">Recommended size: 1200x800px</span>
                      </div>
                    )}
                    <input
                      type="file"
                      id="cover-upload"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setShowAlbumModal(false);
                      resetAlbumForm();
                    }}
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={uploading || !albumForm.title.trim()}
                  >
                    {uploading ? (
                      <>
                        <FaSpinner className="spinner" />
                        {currentAlbum ? 'Updating...' : 'Creating...'}
                      </>
                    ) : currentAlbum ? (
                      'Update Album'
                    ) : (
                      'Create Album'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content delete-modal">
              <div className="modal-header">
                <h3>Delete Album</h3>
              </div>
              
              <div className="modal-body">
                <p>Are you sure you want to delete the album "{currentAlbum?.title}"?</p>
                <p className="text-danger">
                  <strong>Warning:</strong> This will permanently delete the album and all its images.
                  This action cannot be undone.
                </p>
              </div>
              
              <div className="modal-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setCurrentAlbum(null);
                  }}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeleteAlbum()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <FaSpinner className="spinner" /> Deleting...
                    </>
                  ) : (
                    'Delete Permanently'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-news-gallery-page">
      <div className="container">
        <div className="page-header">
          <h1>Manage News & Gallery</h1>
          <p>Create and manage news articles and photo albums for the alumni community</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <FaNewspaper /> News Articles
          </button>
          <button 
            className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('gallery');
              setGalleryTab('albums');
            }}
          >
            <FaImages /> Gallery Albums
          </button>
        </div>

        {/* Content */}
        {activeTab === 'news' ? renderNewsSection() : renderGallerySection()}
      </div>
    </div>
  );
};

export default AdminNewsGallery;
