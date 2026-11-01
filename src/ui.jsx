import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Inbox, Loader2 } from 'lucide-react';

export function Msg({ text, ok }) {
  if (!text) return null;
  const Icon = ok ? CheckCircle2 : AlertCircle;
  return <div className={ok ? 'msg ok' : 'msg'}><Icon size={16} /><span>{text}</span></div>;
}

export const Spinner = () => <div className="spin"><Loader2 size={20} /> Loading...</div>;

export const Empty = ({ icon: Icon = Inbox, text }) => (
  <div className="empty"><Icon size={34} /><p>{text}</p></div>
);

const PAL = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#3b82f6'];
export function Avatar({ name = '?', size = 38 }) {
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const ini = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  return <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: PAL[h % PAL.length] }}>{ini}</span>;
}

// input/textarea with a leading icon
export function Field({ icon: Icon, area, children }) {
  return <label className={area ? 'field area' : 'field'}><Icon size={17} />{children}</label>;
}

export function Title({ icon: Icon, count, children }) {
  return (
    <h2 className="ptitle">
      <span className="ticon"><Icon size={18} /></span>{children}
      {count !== undefined && count !== null && <small>{count}</small>}
    </h2>
  );
}

export function Pager({ page, totalPages, onPage }) {
  if (!totalPages || totalPages < 2) return null;
  return (
    <div className="pager">
      <button className="btn ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={16} /> Prev</button>
      <span>{page} / {totalPages}</span>
      <button className="btn ghost" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next <ChevronRight size={16} /></button>
    </div>
  );
}
