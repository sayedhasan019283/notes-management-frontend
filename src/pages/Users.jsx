import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, KeyRound, Mail, Pencil, Save, Shield, Tag, Tags, Trash2, User, UserPlus, Users as UsersIcon, X } from 'lucide-react';
import { api, useFetch } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Avatar, Empty, Field, Msg, Pager, Spinner, Title } from '../ui.jsx';

const empty = { name: '', email: '', password: '', interests: '' };
const toList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

// Admin: add / list / update / remove users
export default function Users() {
  const { user: me } = useAuth();
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useFetch(`/users?page=${page}&limit=5`);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const cancel = () => { setEditId(null); setForm(empty); };

  const submit = async (e) => {
    e.preventDefault(); setMsg('');
    const body = { name: form.name, email: form.email, interests: toList(form.interests) };
    if (form.password) body.password = form.password;
    try {
      if (editId) await api(`/users/${editId}`, { method: 'PATCH', body });
      else await api('/users', { method: 'POST', body });
      cancel(); setPage(1); reload();
    } catch (ex) { setMsg(ex.message); }
  };

  const edit = (u) => {
    setEditId(u._id);
    setForm({ name: u.name, email: u.email, password: '', interests: (u.interests || []).join(', ') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async (u) => {
    if (!confirm(`Delete ${u.name} and all their notes/posts?`)) return;
    try {
      await api(`/users/${u._id}`, { method: 'DELETE' });
      if (data.results.length === 1 && page > 1) setPage(page - 1); else reload();
    } catch (ex) { setMsg(ex.message); }
  };

  return (
    <>
      <form className="card form" onSubmit={submit}>
        <h3 className="ctitle">{editId ? <Pencil size={18} /> : <UserPlus size={18} />}{editId ? 'Edit user' : 'Add user'}</h3>
        <div className="grid2">
          <Field icon={User}><input placeholder="Name" required value={form.name} onChange={set('name')} /></Field>
          <Field icon={Mail}><input type="email" placeholder="Email" required value={form.email} onChange={set('email')} /></Field>
        </div>
        <Field icon={KeyRound}>
          <input type="password" placeholder={editId ? 'New password (leave empty to keep)' : 'Password (min 8)'}
            required={!editId} minLength={form.password ? 8 : undefined} value={form.password} onChange={set('password')} />
        </Field>
        <Field icon={Tags}><input placeholder="Interests, comma separated" value={form.interests} onChange={set('interests')} /></Field>
        <Msg text={msg} />
        <div className="row">
          <button className="btn">{editId ? <><Save size={16} /> Update</> : <><UserPlus size={16} /> Create</>}</button>
          {editId && <button type="button" className="btn ghost" onClick={cancel}><X size={16} /> Cancel</button>}
        </div>
      </form>

      <Title icon={UsersIcon} count={data?.totalResults}>Users</Title>
      <Msg text={error} />
      {loading && !data && <Spinner />}
      {data?.results.length === 0 && <Empty icon={UsersIcon} text="No users found." />}
      {data?.results.map((u) => (
        <article className="card item" key={u._id}>
          <div className="owner">
            <Avatar name={u.name} size={44} />
            <div>
              <b>{u.name} <em className={`badge ${u.role}`}>{u.role === 'admin' && <Shield size={11} />}{u.role}</em></b>
              <span className="muted"><Mail size={13} /> {u.email}</span>
            </div>
          </div>
          <div className="tags">{(u.interests || []).map((i) => <span key={i}><Tag size={11} />{i}</span>)}</div>
          <div className="row">
            <Link className="btn ghost sm" to={`/posts?user=${u._id}`}><FileText size={15} /> Posts</Link>
            <button className="btn ghost sm" onClick={() => edit(u)}><Pencil size={15} /> Edit</button>
            {u._id !== me._id && <button className="btn danger sm" onClick={() => del(u)}><Trash2 size={15} /> Delete</button>}
          </div>
        </article>
      ))}
      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </>
  );
}
