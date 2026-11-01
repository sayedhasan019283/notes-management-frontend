import { useState } from 'react';
import { Clock, Library } from 'lucide-react';
import { useFetch } from '../api.js';
import { Avatar, Empty, Msg, Pager, Spinner, Title } from '../ui.jsx';

// Admin: everyone's notes (read only)
export default function AdminNotes() {
  const [page, setPage] = useState(1);
  const { data, error, loading } = useFetch(`/notes?page=${page}&limit=5`);

  return (
    <>
      <Title icon={Library} count={data?.totalResults}>All notes</Title>
      <Msg text={error} />
      {loading && !data && <Spinner />}
      {data?.results.length === 0 && <Empty icon={Library} text="No notes in the system yet." />}
      {data?.results.map((n) => (
        <article className="card item" key={n._id}>
          <div className="owner">
            <Avatar name={n.owner?.name} size={34} />
            <div><b>{n.owner?.name}</b><span className="muted">{n.owner?.email}</span></div>
          </div>
          <h4>{n.title}</h4>
          <p className="pre">{n.content}</p>
          <div className="meta"><Clock size={14} />{new Date(n.createdAt).toLocaleString()}</div>
        </article>
      ))}
      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </>
  );
}
