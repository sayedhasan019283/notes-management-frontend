import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hash, Search, Tags, X } from 'lucide-react';
import { useFetch } from '../api.js';
import { Avatar, Empty, Field, Msg, Pager, Spinner, Title } from '../ui.jsx';

// Admin: users grouped by interest (server-side aggregation)
export default function Interests() {
  const [page, setPage] = useState(1);
  const [input, setInput] = useState('');
  const [interest, setInterest] = useState('');
  const q = interest ? `&interest=${encodeURIComponent(interest)}` : '';
  const { data, error, loading } = useFetch(`/users/interests/grouped?page=${page}&limit=5${q}`);

  const search = (e) => { e.preventDefault(); setPage(1); setInterest(input.trim().toLowerCase()); };

  return (
    <>
      <form className="card row" onSubmit={search}>
        <Field icon={Search}><input placeholder="Filter by one interest (optional)" value={input} onChange={(e) => setInput(e.target.value)} /></Field>
        <button className="btn"><Search size={16} /> Filter</button>
        {interest && <button type="button" className="btn ghost" onClick={() => { setInput(''); setInterest(''); setPage(1); }}><X size={16} /> Clear</button>}
      </form>

      <Title icon={Tags} count={data?.totalResults}>Users by interest</Title>
      <Msg text={error} />
      {loading && !data && <Spinner />}
      {data?.results.length === 0 && <Empty icon={Tags} text="No groups found." />}
      {data?.results.map((g) => (
        <article className="card item" key={g.interest}>
          <h4 className="grouphead"><Hash size={18} />{g.interest}<span className="count">{g.count} {g.count === 1 ? 'user' : 'users'}</span></h4>
          <ul className="plain">
            {g.users.map((u) => (
              <li key={u._id}>
                <Avatar name={u.name} size={30} />
                <Link to={`/posts?user=${u._id}`}>{u.name}</Link>
                <span className="muted">{u.email}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </>
  );
}
