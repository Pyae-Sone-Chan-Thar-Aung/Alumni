import React, { useEffect, useState } from 'react';
import { fetchFacebookFeed } from '../services/facebookFeed';
import supabase from '../config/supabaseClient';
import { FaSearch, FaCalendarAlt, FaNewspaper, FaImages, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './News.css';
import './Gallery.css';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 6;

const NewsGallery = () => {
  const [items, setItems] = useState([]); // unified list: news posts + fb posts
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [fbPaging, setFbPaging] = useState(null);
  const [fbLoadedOnce, setFbLoadedOnce] = useState(false);
  const [fbHeight, setFbHeight] = useState(600);
  const { isAuthenticated } = useAuth();
  const [fbHeights, setFbHeights] = useState({ uic: 600, ccs: 600 });

  // Fallback: show Facebook Page Plugin if no token/id configured
  const hasFbCreds = !!process.env.REACT_APP_FB_PAGE_ID && !!process.env.REACT_APP_FB_PAGE_TOKEN;

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 1) Fetch published news from 'news' table (publicly accessible)
      let newsItems = [];
      try {
        const { data: publicNews } = await supabase
          .from('news')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });

        newsItems = (publicNews || []).map((n) => ({
          id: `news_${n.id}`,
          type: 'news',
          title: n.title,
          content: n.content,
          date: n.published_at || n.created_at,
          image: n.image_url || null,
          category: n.category || 'News',
          sourceUrl: null
        }));
      } catch (err) {
        console.error('Error fetching news:', err);
      }

      // 2) Fetch published gallery albums (publicly accessible)
      let galleryItems = [];
      try {
        const { data: albums } = await supabase
          .from('gallery_albums')
          .select(`
            *,
            gallery_images (id, image_url, caption)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        galleryItems = (albums || []).map((album) => ({
          id: `album_${album.id}`,
          type: 'gallery',
          title: album.title,
          content: album.description || '',
          date: album.event_date || album.created_at,
          image: album.cover_image_url || (album.gallery_images && album.gallery_images[0]?.image_url) || null,
          galleryImages: (album.gallery_images || []).map(img => img.image_url),
          category: 'Gallery',
          sourceUrl: null
        }));
      } catch (err) {
        console.error('Error fetching gallery:', err);
      }

      // 3) Fetch internal news for authenticated users only
      let internalNewsItems = [];
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData && userData.user) {
          const { data: internalNews } = await supabase
            .from('internal_news')
            .select('*')
            .eq('is_published', true)
            .order('published_at', { ascending: false });

          internalNewsItems = (internalNews || []).map((n) => ({
            id: `internal_${n.id}`,
            type: 'news',
            title: n.title,
            content: n.content,
            date: n.published_at || n.created_at,
            image: n.image_url || null,
            category: n.category || 'Alumni News',
            sourceUrl: null
          }));
        }
      } catch {}

      // 4) Load Facebook posts only if credentials are configured
      let fbItems = [];
      if (hasFbCreds) {
        const fb = await fetchFacebookFeed({ limit: 15 });
        if (!fb.error) {
          setFbPaging(fb.paging || null);
          setFbLoadedOnce(true);
          fbItems = (fb.items || []).map((p) => ({
            id: `fb_${p.id}`,
            type: p.galleryImages && p.galleryImages.length ? 'gallery' : 'news',
            title: (p.message || '').split('\n')[0].slice(0, 80) || 'Facebook Post',
            content: p.message || '',
            date: p.created_time,
            image: p.image || (p.galleryImages && p.galleryImages[0]) || null,
            galleryImages: p.galleryImages || [],
            category: 'Facebook',
            sourceUrl: p.permalink_url
          }));
        }
      }

      const unified = [...(fbItems || []), ...(newsItems || []), ...(galleryItems || []), ...(internalNewsItems || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setItems(unified);
      setLoading(false);
    };

    load();
  }, [hasFbCreds]);

  // Load Facebook SDK for Page Plugin fallback
  useEffect(() => {
    if (hasFbCreds) return; // only when no token/id
    if (window.FB) {
      try { window.FB.XFBML.parse(); } catch {}
      return;
    }
    const scriptId = 'facebook-jssdk';
    if (document.getElementById(scriptId)) return;
    const js = document.createElement('script');
    js.id = scriptId;
    js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
    const fjs = document.getElementsByTagName('script')[0];
    fjs.parentNode.insertBefore(js, fjs);
  }, [hasFbCreds]);

  const filtered = items.filter((i) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      (i.title || '').toLowerCase().includes(term) ||
      (i.content || '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const loadMoreFb = async () => {
    if (!fbPaging || !fbPaging.next) return;
    try {
      const url = new URL(fbPaging.next);
      const after = url.searchParams.get('after');
      const next = await fetchFacebookFeed({ limit: 15, after });
      if (!next.error) {
        setFbPaging(next.paging || null);
        const fbItems = (next.items || []).map((p) => ({
          id: `fb_${p.id}`,
          type: p.galleryImages && p.galleryImages.length ? 'gallery' : 'news',
          title: (p.message || '').split('\n')[0].slice(0, 80) || 'Facebook Post',
          content: p.message || '',
          date: p.created_time,
          image: p.image || (p.galleryImages && p.galleryImages[0]) || null,
          galleryImages: p.galleryImages || [],
          category: 'Facebook',
          sourceUrl: p.permalink_url
        }));
        setItems((prev) => [...prev, ...fbItems].sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch {}
  };

  return (
    <div className="news-page">
      <div className="container">
        <div className="news-header">
          <h1>News & Gallery</h1>
          <p>Fetched from UIC Facebook + internal announcements</p>
        </div>

        <div className="news-filters">
          <div className="search-bar-container">
            <div className="search-bar-input-wrapper">
              <FaSearch className="search-bar-icon" />
              <input
                type="text"
                className="search-bar-input"
                placeholder="Search posts..."
                aria-label="Search posts"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="news-grid">
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Always show internal news cards */}
            {pageItems.length > 0 && (
            <div className="news-grid">
              {pageItems.map((item) => (
                <div key={item.id} className={`news-card ${item.type === 'gallery' ? 'gallery' : ''}`}>
                  {item.image && (
                    <div className="news-image">
                      <img src={item.image} alt={item.title} />
                    </div>
                  )}
                  <div className="news-content">
                    <div className="news-header-info">
                      <span className={`news-category ${item.type}`}>
                        {item.type === 'gallery' ? <FaImages /> : <FaNewspaper />}
                        {item.type === 'gallery' ? 'Gallery' : 'News'}
                      </span>
                      <span className="news-date">
                        <FaCalendarAlt /> {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3>{item.title}</h3>
                    {item.content && <p>{item.content.substring(0, 160)}{item.content.length > 160 ? '...' : ''}</p>}
                    {item.sourceUrl && (
                      <a className="read-more" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                        View on Facebook →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
            
            {/* Show pagination if there are items */}
            {pageItems.length > 0 && (
              <div className="pagination-controls">
                <button className="page-btn" onClick={goPrev} disabled={currentPage === 1} aria-label="Previous page">
                  <FaChevronLeft /> Prev
                </button>
                <span className="page-info">Page {currentPage} of {totalPages}</span>
                <button className="page-btn" onClick={goNext} disabled={currentPage === totalPages} aria-label="Next page">
                  Next <FaChevronRight />
                </button>
              </div>
            )}
            
            {/* Show Facebook embed(s) when no API credentials */}
            {!hasFbCreds && (
              isAuthenticated ? (
                <div className="facebook-grid">
                  <div className="facebook-section">
                    <div className="section-header">
                      <h2>Latest from UIC Facebook Page</h2>
                    </div>
                    <div className="facebook-embed">
                      <iframe
                        title="UIC Facebook Page"
                        src={
                          'https://www.facebook.com/plugins/page.php' +
                          '?href=' + encodeURIComponent('https://www.facebook.com/uicph') +
                          '&tabs=' + encodeURIComponent('timeline') +
                          `&width=500&height=${fbHeights.uic}&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`
                        }
                        width="100%"
                        height={fbHeights.uic}
                        style={{ border: 'none', overflow: 'hidden', borderRadius: 12 }}
                        scrolling="no"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      />
                    </div>
                    <div className="embed-controls">
                      <button className="btn btn-primary" title={fbHeights.uic === 600 ? 'Show More' : 'Show Less'} onClick={() => setFbHeights(h => ({ ...h, uic: h.uic === 600 ? 900 : 600 }))}>
                        {fbHeights.uic === 600 ? 'Show More' : 'Show Less'}
                      </button>
                    </div>
                  </div>

                  <div className="facebook-section">
                    <div className="section-header">
                      <h2>Latest from UIC CCS Facebook Page</h2>
                    </div>
                    <div className="facebook-embed">
                      <iframe
                        title="UIC CCS Facebook Page"
                        src={
                          'https://www.facebook.com/plugins/page.php' +
                          '?href=' + encodeURIComponent('https://www.facebook.com/uic.ccs') +
                          '&tabs=' + encodeURIComponent('timeline') +
                          `&width=500&height=${fbHeights.ccs}&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`
                        }
                        width="100%"
                        height={fbHeights.ccs}
                        style={{ border: 'none', overflow: 'hidden', borderRadius: 12 }}
                        scrolling="no"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      />
                    </div>
                    <div className="embed-controls">
                      <button className="btn btn-primary" title={fbHeights.ccs === 600 ? 'Show More' : 'Show Less'} onClick={() => setFbHeights(h => ({ ...h, ccs: h.ccs === 600 ? 900 : 600 }))}>
                        {fbHeights.ccs === 600 ? 'Show More' : 'Show Less'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="fb-embed-wrap" style={{ marginTop: '2rem' }}>
                  <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Latest from UIC Facebook Page</h2>
                  <iframe
                    title="UIC Facebook Page"
                    src={
                      'https://www.facebook.com/plugins/page.php' +
                      '?href=' + encodeURIComponent('https://www.facebook.com/uicph') +
                      '&tabs=' + encodeURIComponent('timeline,photos') +
                      `&width=1000&height=${fbHeight}&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`
                    }
                    width="100%"
                    height={fbHeight}
                    style={{ border: 'none', overflow: 'hidden', borderRadius: 12 }}
                    scrolling="no"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  />
                  <div className="embed-controls">
                    <button className="btn btn-primary" onClick={() => setFbHeight(h => (h === 600 ? 900 : 600))}>
                      {fbHeight === 600 ? 'Show More' : 'Show Less'}
                    </button>
                  </div>
                </div>
              )
            )}
            
            {/* Facebook load more button when using API */}
            {hasFbCreds && fbLoadedOnce && fbPaging && fbPaging.next && (
              <div className="load-more">
                <button className="btn btn-secondary" onClick={loadMoreFb}>Load more from Facebook</button>
              </div>
            )}
            
            {/* No items message */}
            {pageItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                <p>No news or announcements available at the moment.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsGallery;
