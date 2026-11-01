import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlignLeft, Clock, FileText, Newspaper, Pencil, Save, Search, Send, Trash2, Type, User, X } from 'lucide-react';
import { api, useFetch } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Avatar, Empty, Field, Msg, Pager, Spinner, Title } from '../ui.jsx';

const empty = { title: '', content: '' };
const isId = (s) => /^[0-9a-fA-F]{24}$/.test(s);

// Feed (everyone's posts) by default; ?user=<id> shows one user's posts.
// Posts are visible to everyone; only the author sees Edit/Delete.
export default function Posts() {
  const { user: me } = useAuth();
  const [sp, setSp] = useSearchParams();
  const target = sp.get('user');           // null -> feed mode
  const feed = !target;
  const mine = target === me._id;
  const [lookup, setLookup] = useState(target || '');
  const [page, setPage] = useState(1);

  const path = feed
    ? `/posts?page=${page}&limit=5`
    : isId(target) ? `/posts/user/${target}?page=${page}&limit=5` : null;
  const { data, error, loading, reload } = useFetch(path);

  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const cancel = () => { setEditId(null); setForm(empty); };
  const showUser = (id) => { setPage(1); setLookup(id); setSp({ user: id }); };
  const showFeed = () => { setPage(1); setLookup(''); setSp({}); };

  const save = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      if (editId) await api(`/posts/${editId}`, { method: 'PATCH', body: form });
      else await api('/posts', { method: 'POST', body: form });
      cancel();
      if (!feed && !mine) showFeed(); else { setPage(1); reload(); }
    } catch (ex) { setMsg(ex.message); }
  };

  const del = async (id) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api(`/posts/${id}`, { method: 'DELETE' });
      if (data.results.length === 1 && page > 1) setPage(page - 1); else reload();
    } catch (ex) { setMsg(ex.message); }
  };

  const title = feed ? 'Latest posts' : data ? `Posts by ${mine ? 'me' : data.user.name}` : 'Posts';

  return (
    <>
      <form className="card form" onSubmit={save}>
        <h3 className="ctitle">{editId ? <Pencil size={18} /> : <Send size={18} />}{editId ? 'Edit post' : 'New post'}</h3>
        <Field icon={Type}>
          <input placeholder="Title" required maxLength={200} value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field icon={AlignLeft} area>
          <textarea placeholder="What's on your mind?" required rows={3} value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </Field>
        <Msg text={msg} />
        <div className="row">
          <button className="btn">{editId ? <><Save size={16} /> Update</> : <><Send size={16} /> Publish</>}</button>
          {editId && <button type="button" className="btn ghost" onClick={cancel}><X size={16} /> Cancel</button>}
        </div>
      </form>

      <div className="card">
        <div className="row">
          <button type="button" className={feed ? 'btn' : 'btn ghost'} onClick={showFeed}><Newspaper size={16} /> Feed</button>
          <button type="button" className={mine ? 'btn' : 'btn ghost'} onClick={() => showUser(me._id)}><User size={16} /> My posts</button>
        </div>
        <form className="row" onSubmit={(e) => { e.preventDefault(); showUser(lookup.trim()); }}>
          <Field icon={Search}><input placeholder="Find posts by user ID" value={lookup} onChange={(e) => setLookup(e.target.value)} /></Field>
          <button className="btn ghost"><Search size={16} /> Load</button>
        </form>
      </div>

      <Title icon={feed ? Newspaper : FileText} count={data?.totalResults}>{title}</Title>
      {!feed && !isId(target) && <Msg text="Enter a valid 24-character user ID." />}
      <Msg text={error} />
      {loading && !data && <Spinner />}
      {data?.results.length === 0 && <Empty icon={FileText} text="No posts here yet." />}
      {data?.results.map((p) => {
        const author = feed ? p.author : data.user;   // feed posts carry author {_id,name}; by-user posts use data.user
        const own = author?._id === me._id;
        return (
          <article className="card item" key={p._id}>
            <div className="owner">
              <Avatar name={author?.name} size={32} />
              <div>
                <button type="button" className="linkbtn" onClick={() => author?._id && showUser(author._id)}>{author?.name || 'Unknown'}</button>
              </div>
            </div>
            <h4>{p.title}</h4>
            <p className="pre">{p.content}</p>
            <div className="meta"><Clock size={14} />{new Date(p.createdAt).toLocaleString()}</div>
            {own && (
              <div className="row">
                <button className="btn ghost sm" onClick={() => { setEditId(p._id); setForm({ title: p.title, content: p.content }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Pencil size={15} /> Edit</button>
                <button className="btn danger sm" onClick={() => del(p._id)}><Trash2 size={15} /> Delete</button>
              </div>
            )}
          </article>
        );
      })}
      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </>
  );
}