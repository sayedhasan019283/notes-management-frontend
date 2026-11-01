import { useState } from 'react';
import { AlignLeft, Clock, Pencil, Plus, Save, StickyNote, Trash2, Type, X } from 'lucide-react';
import { api, useFetch } from '../api.js';
import { Empty, Field, Msg, Pager, Spinner, Title } from '../ui.jsx';

const empty = { title: '', content: '' };

// Own notes: create / list (paginated) / edit / delete
export default function Notes() {
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useFetch(`/notes/my?page=${page}&limit=5`);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const cancel = () => { setEditId(null); setForm(empty); };

  const save = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      if (editId) await api(`/notes/my/${editId}`, { method: 'PATCH', body: form });
      else await api('/notes', { method: 'POST', body: form });
      cancel(); setPage(1); reload();
    } catch (ex) { setMsg(ex.message); }
  };

  const del = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api(`/notes/my/${id}`, { method: 'DELETE' });
      if (data.results.length === 1 && page > 1) setPage(page - 1); else reload();
    } catch (ex) { setMsg(ex.message); }
  };

  return (
    <>
      <form className="card form" onSubmit={save}>
        <h3 className="ctitle">{editId ? <Pencil size={18} /> : <Plus size={18} />}{editId ? 'Edit note' : 'New note'}</h3>
        <Field icon={Type}>
          <input placeholder="Title" required maxLength={200} value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field icon={AlignLeft} area>
          <textarea placeholder="Write your note..." required rows={4} value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </Field>
        <Msg text={msg} />
        <div className="row">
          <button className="btn">{editId ? <><Save size={16} /> Update</> : <><Plus size={16} /> Add note</>}</button>
          {editId && <button type="button" className="btn ghost" onClick={cancel}><X size={16} /> Cancel</button>}
        </div>
      </form>

      <Title icon={StickyNote} count={data?.totalResults}>My notes</Title>
      <Msg text={error} />
      {loading && !data && <Spinner />}
      {data?.results.length === 0 && <Empty icon={StickyNote} text="No notes yet. Create your first one above." />}
      {data?.results.map((n) => (
        <article className="card item" key={n._id}>
          <h4>{n.title}</h4>
          <p className="pre">{n.content}</p>
          <div className="meta"><Clock size={14} />{new Date(n.createdAt).toLocaleString()}</div>
          <div className="row">
            <button className="btn ghost sm" onClick={() => { setEditId(n._id); setForm({ title: n.title, content: n.content }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Pencil size={15} /> Edit</button>
            <button className="btn danger sm" onClick={() => del(n._id)}><Trash2 size={15} /> Delete</button>
          </div>
        </article>
      ))}
      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </>
  );
}
