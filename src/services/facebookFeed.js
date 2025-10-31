// Minimal Facebook feed service with pagination
// Requires: REACT_APP_FB_PAGE_ID and REACT_APP_FB_PAGE_TOKEN

export async function fetchFacebookFeed({ limit = 10, after = null } = {}) {
  const pageId = process.env.REACT_APP_FB_PAGE_ID;
  const token = process.env.REACT_APP_FB_PAGE_TOKEN;

  if (!pageId || !token) {
    return { items: [], paging: null, error: 'Facebook credentials not configured' };
  }

  const fields = [
    'id',
    'message',
    'created_time',
    'permalink_url',
    'full_picture',
    'attachments{media,type,url,subattachments}'
  ].join(',');

  const params = new URLSearchParams({
    access_token: token,
    fields,
    limit: String(limit)
  });

  if (after) params.append('after', after);

  const url = `https://graph.facebook.com/v18.0/${pageId}/posts?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Facebook API error ${res.status}`);
    const json = await res.json();

    const items = (json.data || []).map((p) => ({
      id: p.id,
      message: p.message || '',
      created_time: p.created_time,
      permalink_url: p.permalink_url,
      image: p.full_picture || extractImageFromAttachments(p.attachments),
      galleryImages: extractGalleryFromAttachments(p.attachments)
    }));

    return { items, paging: json.paging || null, error: null };
  } catch (e) {
    return { items: [], paging: null, error: e.message || 'Failed to fetch Facebook feed' };
  }
}

function extractImageFromAttachments(att) {
  try {
    if (!att || !att.data || !att.data.length) return null;
    const first = att.data[0];
    if (first.media && first.media.image && first.media.image.src) return first.media.image.src;
    return null;
  } catch {
    return null;
  }
}

function extractGalleryFromAttachments(att) {
  try {
    if (!att || !att.data || !att.data.length) return [];
    const first = att.data[0];
    if (first.subattachments && first.subattachments.data) {
      return first.subattachments.data
        .map((s) => (s.media && s.media.image ? s.media.image.src : null))
        .filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}
