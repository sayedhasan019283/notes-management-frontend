import { useState } from 'react';
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { Field, Msg } from '../ui.jsx';
import { Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [f, setF] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try { await login(f.email, f.password); }
    catch (ex) { setErr(ex.message); setBusy(false); }
  };

  return (
    <div className="authbg">
      <form className="card authcard" onSubmit={submit}>
        <span className="logo big"><ShieldCheck size={30} /></span>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to your secure notes</p>
        <Field icon={Mail}>
          <input type="email" placeholder="Email" required value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Field>
        <Field icon={Lock}>
          <input type={show ? 'text' : 'password'} placeholder="Password" required value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })} />
          <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Show password">
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </Field>
        <Msg text={err} />
        <button className="btn wide" disabled={busy}>
          {busy ? <><Loader2 size={17} className="rot" /> Signing in...</> : <><LogIn size={17} /> Login</>}
        </button>
        <p className="switch muted">Don't have an account? <Link to="/register">Sign up</Link></p>
      </form>
    </div>
  );
}
