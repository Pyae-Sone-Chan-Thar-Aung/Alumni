import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { 
  FaPlus, FaTrash, FaEdit, FaImage, FaImages, FaCalendarAlt, 
  FaCheck, FaTimes, FaUpload, FaSpinner, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { format } from 'date-fns';
import './AdminGallery.css';
import { toast } from 'react-toastify';

const AdminGallery = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: format(new Date(), 'yyyy-MM-dd'),
    is_published: true,
    cover_image: null,
    cover_image_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState('albums');
  const [viewAlbum, setViewAlbum] = useState(null);

  // Fetch all albums
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

  useEffect(() => {
    fetchAlbums();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle cover image upload
  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setFormData(prev => ({
      ...prev,
      cover_image: file,
      cover_image_url: previewUrl
    }));
  };

  // Handle image uploads (for managing images in an album)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter valid files
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
    
    // Process uploads in a separate async function
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

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('gallery')
            .getPublicUrl(fileName);

          // Add to database
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
        
        // Refresh the current album view
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
    
    // Execute the async function
    processUploads().catch(console.error);
  };

  // Handle create/update album form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the album');
      return;
    }

    setUploading(true);
    
    try {
      let coverImageUrl = formData.cover_image_url;
      
      // Upload cover image if a new one was selected
      if (formData.cover_image) {
        const fileExt = formData.cover_image.name.split('.').pop();
        const fileName = `covers/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, formData.cover_image, {
            cacheControl: '3600',
            upsert: false,
            contentType: formData.cover_image.type
          });

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(fileName);
        
        coverImageUrl = publicUrl;
      }
      
      // Prepare album data
      const albumData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        event_date: formData.event_date,
        is_published: formData.is_published,
        cover_image_url: coverImageUrl
      };
      
      let result;
      
      if (currentAlbum) {
        // Update existing album
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
        // Create new album
        const { data, error } = await supabase
          .from('gallery_albums')
          .insert([{ ...albumData, created_by: (await supabase.auth.getUser()).data.user?.id }])
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        toast.success('Album created successfully');
      }
      
      // Reset form and refresh albums
      resetForm();
      await fetchAlbums();
      
      // If this was a new album, switch to manage images
      if (!currentAlbum && result) {
        setCurrentAlbum(result);
        setViewAlbum(result);
        setActiveTab('manage');
      }
      
    } catch (error) {
      console.error('Error saving album:', error);
      toast.error('Failed to save album: ' + (error.message || error));
    } finally {
      setUploading(false);
      setIsModalOpen(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_date: format(new Date(), 'yyyy-MM-dd'),
      is_published: true,
      cover_image: null,
      cover_image_url: ''
    });
    setCurrentAlbum(null);
  };

  // Open edit modal
  const openEditModal = (album) => {
    setCurrentAlbum(album);
    setFormData({
      title: album.title,
      description: album.description || '',
      event_date: album.event_date ? format(new Date(album.event_date), 'yyyy-MM-dd') : '',
      is_published: album.is_published,
      cover_image: null,
      cover_image_url: album.cover_image_url || ''
    });
    setIsModalOpen(true);
  };

  // Handle album deletion (renamed from the accidental second handleSubmit)
  const handleDeleteAlbum = async (idParam) => {
    const albumId = idParam || currentAlbum?.id;
    if (!albumId) {
      toast.error('No album selected to delete.');
      return;
    }

    setUploading(true);

    try {
      // First delete album images records
      const { error: deleteImagesError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('album_id', albumId);

      if (deleteImagesError) {
        console.warn('Error deleting associated gallery_images rows:', deleteImagesError);
        // continue, attempt to delete album anyway
      }

      // Then delete the album record
      const { error: deleteAlbumError } = await supabase
        .from('gallery_albums')
        .delete()
        .eq('id', albumId);
        
      if (deleteAlbumError) throw deleteAlbumError;
      
      // Optionally delete cover image from storage if currentAlbum has it (best-effort)
      if (currentAlbum?.cover_image_url) {
        try {
          const coverPath = currentAlbum.cover_image_url.split('/').pop();
          await supabase.storage
            .from('gallery')
            .remove([`covers/${coverPath}`]);
        } catch (err) {
          console.warn('Failed to remove cover from storage (non-fatal):', err);
        }
      }

      toast.success('Album deleted successfully');
      resetForm();
      await fetchAlbums();
      setIsDeleteModalOpen(false);
      setActiveTab('albums');
      setViewAlbum(null);
    } catch (error) {
      console.error('Error deleting album:', error);
      toast.error('Failed to delete album: ' + (error.message || error));
    } finally {
      setUploading(false);
    }
  };

  // Helper used by delete modal confirm button
  const confirmDeleteAlbum = () => {
    // If there's a current album in state, delete it; otherwise do nothing
    handleDeleteAlbum();
  };

  // Toggle album published status
  const togglePublishStatus = async (album) => {
    try {
      const { error } = await supabase
        .from('gallery_albums')
        .update({ is_published: !album.is_published })
        .eq('id', album.id);

      if (error) throw error;
      
      // Update local state
      setAlbums(albums.map(a => 
        a.id === album.id ? { ...a, is_published: !album.is_published } : a
      ));
      
      toast.success(`Album ${!album.is_published ? 'published' : 'unpublished'} successfully`);
      await fetchAlbums();
      
      // Update view album if it's the current one
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

  // Open delete confirmation for a specific album
  const confirmDelete = (album) => {
    setCurrentAlbum(album);
    setIsDeleteModalOpen(true);
  };

  // Minimal renderer for albums list (keeps your original design intent)
  const renderAlbumsList = () => {
    if (loading) return <p>Loading albums...</p>;
    if (!albums || albums.length === 0) return (
      <div className="albums-empty">
        <FaImages className="empty-icon" />
        <h3>No Albums Yet</h3>
        <p>Get started by creating your first photo album for events, activities, or special occasions.</p>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Create Your First Album
        </button>
      </div>
    );

    return (
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
                <button className="btn btn-sm" onClick={() => { setViewAlbum(album); setActiveTab('manage'); setCurrentAlbum(album); }}>
                  Manage
                </button>
                <button className="btn btn-sm" onClick={() => openEditModal(album)}>
                  <FaEdit /> Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(album)}>
                  <FaTrash /> Delete
                </button>
                <button className="btn btn-sm" onClick={() => togglePublishStatus(album)}>
                  {album.is_published ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Minimal renderer for manage album tab
  const renderManageAlbum = () => {
    const album = viewAlbum || currentAlbum;
    if (!album) return (
      <div>
        <p>Select an album to manage its images.</p>
        <button className="btn btn-outline" onClick={() => setActiveTab('albums')}>Back to Albums</button>
      </div>
    );

    return (
      <div className="manage-album">
        <div className="manage-header">
          <h3>{album.title}</h3>
          <p>{album.description}</p>
          <div className="manage-actions">
            <button className="btn btn-outline" onClick={() => { setActiveTab('albums'); setViewAlbum(null); }}>
              Back to Albums
            </button>
            <button className="btn btn-primary" onClick={() => openEditModal(album)}>
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
  };

  return (
    <div className="admin-gallery">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <h2>Gallery Management</h2>
          <p>Create and manage photo albums for events, activities, and special occasions</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <FaPlus /> Create Album
        </button>
      </div>

      {/* Delete Confirmation Modal (top-level modal used in earlier code) */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Delete Album</h3>
              <button className="close-button" onClick={() => setIsDeleteModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this album? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={confirmDeleteAlbum}
              >
                Delete Album
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'albums' ? renderAlbumsList() : renderManageAlbum()}
      
      {/* Add/Edit Album Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{currentAlbum ? 'Edit Album' : 'Create New Album'}</h3>
              <button 
                className="close-button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                disabled={uploading}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Album Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleInputChange}
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
                  value={formData.description}
                  onChange={handleInputChange}
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
                  value={formData.event_date}
                  onChange={handleInputChange}
                  disabled={uploading}
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={handleInputChange}
                    disabled={uploading}
                  />
                  <span className="checkmark"></span>
                  Publish this album
                </label>
              </div>
              
              <div className="form-group">
                <label>Cover Image</label>
                <div className="cover-upload">
                  {formData.cover_image_url ? (
                    <div className="cover-preview">
                      <img 
                        src={formData.cover_image_url} 
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
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={uploading || !formData.title.trim()}
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
      
      {/* Delete Confirmation Modal (detailed one used elsewhere in file) */}
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

export default AdminGallery;
