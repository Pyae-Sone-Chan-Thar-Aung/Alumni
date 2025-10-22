import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { FaCalendarAlt, FaImages, FaChevronLeft, FaChevronRight, FaTimes, FaSearch } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Gallery.css';

const Gallery = () => {
  const [albums, setAlbums] = useState([]);
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [years, setYears] = useState(['All']);
  const navigate = useNavigate();

  // Fetch all published albums with their images
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('gallery_albums')
          .select(`
            *,
            gallery_images (id, image_url, caption, display_order)
          `)
          .eq('is_published', true)
          .order('event_date', { ascending: false });

        if (error) throw error;
        
        setAlbums(data || []);
        setFilteredAlbums(data || []);
        // Build year filters
        const yearSet = new Set((data || []).map(a => a.event_date ? new Date(a.event_date).getFullYear() : null).filter(Boolean));
        setYears(['All', ...Array.from(yearSet).sort((a,b) => b - a)]);
      } catch (error) {
        console.error('Error fetching albums:', error);
        toast.error('Failed to load gallery. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  // Filter albums based on search term and year
  useEffect(() => {
    let next = albums;

    if (selectedYear !== 'All') {
      next = next.filter(a => a.event_date && new Date(a.event_date).getFullYear() === selectedYear);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      next = next.filter(
        album =>
          album.title.toLowerCase().includes(term) ||
          (album.description && album.description.toLowerCase().includes(term))
      );
    }

    setFilteredAlbums(next);
  }, [searchTerm, albums, selectedYear]);

  // Open album in modal
  const openAlbum = (album) => {
    setSelectedAlbum(album);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'hidden';
  };

  // Close album modal
  const closeAlbum = () => {
    setSelectedAlbum(null);
    document.body.style.overflow = 'auto';
  };

  // Navigate to previous image
  const prevImage = () => {
    setCurrentImageIndex(prevIndex =>
      prevIndex > 0 ? prevIndex - 1 : selectedAlbum.gallery_images.length - 1
    );
  };

  // Navigate to next image
  const nextImage = () => {
    setCurrentImageIndex(prevIndex =>
      prevIndex < selectedAlbum.gallery_images.length - 1 ? prevIndex + 1 : 0
    );
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!selectedAlbum) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAlbum();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAlbum, currentImageIndex]);

  // Loading state
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
      <div className="gallery-header">
        <h1>College Events Gallery</h1>
        <p>Relive the memories from our college events, sports days, and special programs</p>
        
        <div className="gallery-filters">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="year-filters">
            {years.map(y => (
              <button
                key={y}
                className={`year-chip ${selectedYear === y ? 'active' : ''}`}
                onClick={() => setSelectedYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredAlbums.length === 0 ? (
        <div className="no-albums">
          <FaImages className="no-albums-icon" />
          <p>No albums found. Please check back later for updates.</p>
          {searchTerm && (
            <button 
              className="btn-clear-search"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="albums-grid">
          {filteredAlbums.map((album) => (
            <div 
              key={album.id} 
              className="album-card"
              onClick={() => openAlbum(album)}
            >
              <div className="album-cover">
                <img 
                  src={album.cover_image_url || '/placeholder-gallery.jpg'} 
                  alt={album.title}
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
                <h4>{album.title}</h4>
                {album.event_date && (
                  <div className="album-date">
                    <FaCalendarAlt /> {format(parseISO(album.event_date), 'MMMM d, yyyy')}
                  </div>
                )}
                {album.description && (
                  <p className="album-description">
                    {album.description.length > 80 
                      ? `${album.description.substring(0, 80)}...` 
                      : album.description}
                  </p>
                )}
                <div className="album-cta">
                  View Album <FaChevronRight className="cta-arrow" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Album Modal */}
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
                  aria-label="Previous image"
                >
                  <FaChevronLeft />
                </button>
                
                <div className="current-image-container">
                  {selectedAlbum.gallery_images && selectedAlbum.gallery_images.length > 0 ? (
                    <img 
                      src={selectedAlbum.gallery_images[currentImageIndex]?.image_url || '/placeholder-gallery.jpg'}
                      alt={`${selectedAlbum.title} - ${currentImageIndex + 1}`}
                      className="current-image"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="no-images">
                      <FaImages className="no-images-icon" />
                      <p>No images in this album yet.</p>
                    </div>
                  )}
                  
                  {selectedAlbum.gallery_images && selectedAlbum.gallery_images[currentImageIndex]?.caption && (
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
                  aria-label="Next image"
                >
                  <FaChevronRight />
                </button>
              </div>
              
              {selectedAlbum.gallery_images && selectedAlbum.gallery_images.length > 0 && (
                <div className="image-thumbnails">
                  {selectedAlbum.gallery_images
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                    .map((image, index) => (
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
              )}
              
              <div className="album-details">
                <div className="album-meta">
                  {selectedAlbum.event_date && (
                    <div className="meta-item">
                      <FaCalendarAlt /> 
                      <span>{format(parseISO(selectedAlbum.event_date), 'MMMM d, yyyy')}</span>
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
