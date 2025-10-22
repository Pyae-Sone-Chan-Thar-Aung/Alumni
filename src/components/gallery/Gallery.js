import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { FaCalendarAlt, FaImages, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import './Gallery.css';

const Gallery = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_albums')
        .select(`
          *,
          gallery_images (id, image_url, caption)
        `)
        .eq('is_published', true)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAlbum = (album) => {
    setSelectedAlbum(album);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const closeAlbum = () => {
    setSelectedAlbum(null);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex < selectedAlbum.gallery_images.length - 1 ? prevIndex + 1 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : selectedAlbum.gallery_images.length - 1
    );
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="spinner"></div>
        <p>Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <h1 className="gallery-title">College Events Gallery</h1>
      
      {albums.length === 0 ? (
        <div className="no-albums">
          <FaImages className="no-albums-icon" />
          <p>No albums available at the moment. Please check back later.</p>
        </div>
      ) : (
        <div className="albums-grid">
          {albums.map((album) => (
            <div 
              key={album.id} 
              className="album-card"
              onClick={() => openAlbum(album)}
            >
              <div className="album-image-container">
                <img 
                  src={album.cover_image_url || '/placeholder-gallery.jpg'} 
                  alt={album.title}
                  className="album-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-gallery.jpg';
                  }}
                />
                <div className="album-image-count">
                  <FaImages /> {album.gallery_images?.length || 0}
                </div>
              </div>
              <div className="album-info">
                <h3 className="album-title">{album.title}</h3>
                {album.event_date && (
                  <div className="album-date">
                    <FaCalendarAlt /> {format(new Date(album.event_date), 'MMMM d, yyyy')}
                  </div>
                )}
                {album.description && (
                  <p className="album-description">
                    {album.description.length > 100 
                      ? `${album.description.substring(0, 100)}...` 
                      : album.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAlbum && (
        <div className="album-modal">
          <div className="album-modal-content">
            <div className="album-modal-header">
              <h2>{selectedAlbum.title}</h2>
              <button className="close-modal" onClick={closeAlbum}>
                <FaTimes />
              </button>
            </div>
            
            <div className="album-modal-body">
              <div className="album-slideshow">
                <button 
                  className="nav-arrow prev-arrow" 
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <FaChevronLeft />
                </button>
                
                <div className="current-image-container" onClick={toggleFullscreen}>
                  <img 
                    src={selectedAlbum.gallery_images[currentImageIndex]?.image_url || '/placeholder-gallery.jpg'}
                    alt={`${selectedAlbum.title} - ${currentImageIndex + 1}`}
                    className="current-image"
                  />
                  {selectedAlbum.gallery_images[currentImageIndex]?.caption && (
                    <div className="image-caption">
                      {selectedAlbum.gallery_images[currentImageIndex].caption}
                    </div>
                  )}
                </div>
                
                <button 
                  className="nav-arrow next-arrow" 
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <FaChevronRight />
                </button>
              </div>
              
              <div className="image-thumbnails">
                {selectedAlbum.gallery_images.map((image, index) => (
                  <div 
                    key={image.id}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img 
                      src={image.image_url} 
                      alt={`Thumbnail ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-gallery.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <div className="album-details">
                <div className="album-meta">
                  {selectedAlbum.event_date && (
                    <div className="meta-item">
                      <FaCalendarAlt /> 
                      <span>{format(new Date(selectedAlbum.event_date), 'MMMM d, yyyy')}</span>
                    </div>
                  )}
                  <div className="meta-item">
                    <FaImages /> 
                    <span>{selectedAlbum.gallery_images?.length || 0} photos</span>
                  </div>
                </div>
                
                {selectedAlbum.description && (
                  <div className="album-description">
                    <h4>About This Event</h4>
                    <p>{selectedAlbum.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
