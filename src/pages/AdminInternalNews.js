import React, { useEffect, useMemo, useState, useRef } from 'react';
import supabase from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTrash, FaPen, FaChevronLeft, FaChevronRight, FaImage, FaBullhorn } from 'react-icons/fa';
import './AdminInternalNews.css';

const PAGE_SIZE = 5;

const formatTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });

const AdminInternalNews = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '', category: '', is_important: false, image: null });
  const [publishing, setPublishing] = useState(false);
  const [page, setPage] = useState(1);

  const fileInputRef = useRef(null);

  const canManage = user && (user.role === 'admin' || user.role === 'coordinator');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('internal_news')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error('Failed to load internal news');
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const canPublish = form.title.trim() && form.content.trim() && !publishing;

  const createItem = async () => {
    if (!canManage || !canPublish) return;
    try {
      setPublishing(true);
      const { error } = await supabase
        .from('internal_news')
        .insert({
          title: form.title.trim(),
          content: form.content.trim(),
          category: form.category.trim(),
          is_important: !!form.is_important,
          is_published: true,
          published_at: new Date().toISOString(),
          author_id: user.id
        });
      if (error) throw error;
      toast.success('Internal news published');
      setForm({ title: '', content: '', category: '', is_important: false, image: null });
      setPage(1);
      fetchItems();
    } catch (e) {
      toast.error('Failed to publish internal news');
    } finally {
      setPublishing(false);
    }
  };

  const updateItem = async (id, patch) => {
    const { error } = await supabase.from('internal_news').update(patch).eq('id', id);
    if (error) {
      toast.error('Update failed');
      return false;
    }
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    return true;
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    const { error } = await supabase.from('internal_news').delete().eq('id', id);
    if (error) {
      toast.error('Delete failed');
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const sorted = items.slice().sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        image: {
          file,
          preview: URL.createObjectURL(file)
        }
      }));
    }
  };

  if (!canManage) {
    return (
      <div className="min-h-[60vh] grid place-items-center" style={{ backgroundColor: '#F9FAFB' }}>
        <p className="text-gray-600">You do not have permission to manage internal news.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen internal-news" style={{ backgroundColor: '#F9FAFB' }}>
      <main className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="page-header">
          <div className="header-left">
            <h1 className="page-title">
              <FaBullhorn /> Internal Alumni News
            </h1>
            <a href="#publisher" className="header-link">Post important alumni-only announcements.</a>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="dashboard-grid mt-6">
          <div>
            {/* Publish Card */}
            <section id="publisher">
              <motion.div className="publish-card" whileHover={{ y: -1 }} transition={{ duration: 0.15 }}>
                <div className="p-4 sm:p-6">
                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-1.5">
                        <label htmlFor="title">Title</label>
                        <input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter a concise announcement title" className="input" />
                      </div>

                    </div>
                    <div className="grid gap-1.5">
                      <label htmlFor="content">Content</label>
                      <textarea id="content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write the message for alumni..." rows={5} className="textarea" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="grid gap-1.5">
                        <label htmlFor="category">Category</label>
                        <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select">
                          <option value="">Select category</option>
                          <option value="announcement">Announcement</option>
                          <option value="event">Event</option>
                          <option value="alumni">Alumni News</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-3 text-sm text-gray-700">
                          <Toggle checked={form.is_important} onChange={(val) => setForm({ ...form, is_important: val })} />
                          Mark as Important
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={createItem} disabled={!canPublish} className={`inline-flex items-center px-5 py-2.5 text-sm font-medium text-white shadow-sm transition btn ${canPublish ? 'btn-gradient' : 'btn-blue-disabled'}`}>{publishing ? 'Publishing...' : 'Publish'}</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* List */}
            <section className="mt-6">
              <div className="feed-header">
                <h2 className="feed-title">Recent announcements</h2>
                <span className="feed-sub">{items.length} total</span>
              </div>

              {loading ? (
                <div className="text-gray-500 text-sm">Loading...</div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {pageItems.map((it) => (
                      <motion.div key={it.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
                        <NewsCard item={it} onEdit={(patch) => updateItem(it.id, patch)} onDelete={() => deleteItem(it.id)} onTogglePublish={() => updateItem(it.id, { is_published: !it.is_published })} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <Pagination className="mt-8" page={page} totalPages={totalPages} onChange={(p) => setPage(p)} />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            <Stats items={items} />
          </aside>
        </div>
      </main>
    </div>
  );
};

function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      <span className="sr-only">Toggle Important</span>
    </button>
  );
}

function NewsCard({ item, onEdit, onDelete, onTogglePublish }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  const [important, setImportant] = useState(!!item.is_important);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const ok = await onEdit({ title: title.trim(), content: content.trim(), is_important: important });
    setSaving(false);
    if (ok !== false) setEditing(false);
  };

  const cardClass = `group news-card ${item.is_important ? 'important' : ''}`;
  return (
    <motion.div className={cardClass} whileHover={{ y: -2 }} transition={{ duration: 0.15 }} layout>
      <div className="p-4 sm:p-5 md:p-6 relative">
        {/* Hover actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
          {!editing && (
            <>
              <button onClick={() => setEditing(true)} className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition" aria-label="Edit"><FaPen size={14} /></button>
              <button onClick={onDelete} className="inline-flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition" aria-label="Delete"><FaTrash size={14} /></button>
            </>
          )}
        </div>

        {!editing ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2 flex-wrap">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">{item.title}</h3>
              {!!item.is_important && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium badge-important">Important</span>
              )}
              {!item.is_published && (
                <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 text-xs font-medium">Draft</span>
              )}
            </div>
            <div className="text-xs text-gray-500">{formatTime(item.created_at)}</div>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed clamp-3">{item.content}</p>
            <div className="pt-2">
              <button onClick={onTogglePublish} className={`text-xs rounded-full px-3 py-1 ring-1 transition ${item.is_published ? 'text-gray-700 ring-gray-300 hover:bg-gray-50' : 'text-white bg-blue-600 hover:bg-blue-700 ring-blue-600'}`}>
                {item.is_published ? 'Unpublish' : 'Publish now'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className="textarea" />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <Toggle checked={important} onChange={setImportant} />
                Mark as Important
              </label>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditing(false); setTitle(item.title); setContent(item.content); setImportant(!!item.is_important); }} className="px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={save} disabled={saving} className="px-4 py-2 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Pagination({ page, totalPages, onChange, className = '' }) {
  const items = [];
  const max = Math.min(totalPages, 5);
  let start = Math.max(1, page - 2);
  if (start + max - 1 > totalPages) start = Math.max(1, totalPages - max + 1);
  for (let p = start; p < start + max; p++) items.push(p);

  return (
    <div className={`pager ${className}`}>
      <PageBtn ariaLabel="Previous page" disabled={page === 1} onClick={() => onChange(page - 1)}>
        <FaChevronLeft size={12} />
        <span className="label">Prev</span>
      </PageBtn>
      {start > 1 && <Ellipsis />}
      {items.map((n) => (
        <PageBtn key={n} active={n === page} onClick={() => onChange(n)} ariaLabel={`Page ${n}`}>
          {n}
        </PageBtn>
      ))}
      {start + max - 1 < totalPages && <Ellipsis />}
      <PageBtn ariaLabel="Next page" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        <span className="label">Next</span>
        <FaChevronRight size={12} />
      </PageBtn>
    </div>
  );
}

function PageBtn({ children, onClick, active = false, disabled = false, ariaLabel }) {
  return (
    <button aria-label={ariaLabel} onClick={onClick} disabled={disabled} className={`pager-btn ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`}>
      {children}
    </button>
  );
}
function Ellipsis() { return <span className="pager-ellipsis">…</span>; }

export default AdminInternalNews;

function Stats({ items }) {
  const totals = React.useMemo(() => {
    const total = items.length;
    const published = items.filter((i) => i.is_published).length;
    const drafts = total - published;
    const important = items.filter((i) => i.is_important).length;
    return { total, published, drafts, important };
  }, [items]);
  return (
    <div className="stats-card">
      <div className="stats-title">Quick stats</div>
      <div className="stats-grid">
        <div className="stat">
          <div className="stat-label">Total</div>
          <div className="stat-value">{totals.total}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Published</div>
          <div className="stat-value text-blue">{totals.published}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Drafts</div>
          <div className="stat-value text-muted">{totals.drafts}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Important</div>
          <div className="stat-value text-amber">{totals.important}</div>
        </div>
      </div>
    </div>
  );
}
