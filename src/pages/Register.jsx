import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, Tags, User, UserPlus } from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { Field, Msg } from '../ui.jsx';

const toList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

export default function Register() {
  const { register } = useAuth();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', interests: '' });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (f.password !== f.confirm) return setErr('Passwords do not match');
    setBusy(true);
    try {
      // on success the user is logged in and App redirects to /notes
      await register({ name: f.name, email: f.email, password: f.password, interests: toList(f.interests) });
    } catch (ex) { setErr(ex.message); setBusy(false); }
  };

  return (
    <div className="authbg">
      <form className="card authcard" onSubmit={submit}>
        <span className="logo big"><ShieldCheck size={30} /></span>
        <h1>Create account</h1>
        <p className="muted">Start taking secure notes</p>
        <Field icon={User}><input placeholder="Full name" required value={f.name} onChange={set('name')} /></Field>
        <Field icon={Mail}><input type="email" placeholder="Email" required value={f.email} onChange={set('email')} /></Field>
        <Field icon={Lock}>
          <input type={show ? 'text' : 'password'} placeholder="Password (min 8)" required minLength={8} value={f.password} onChange={set('password')} />
          <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Show password">
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </Field>
        <Field icon={Lock}><input type={show ? 'text' : 'password'} placeholder="Confirm password" required value={f.confirm} onChange={set('confirm')} /></Field>
        <Field icon={Tags}><input placeholder="Interests, comma separated (optional)" value={f.interests} onChange={set('interests')} /></Field>
        <Msg text={err} />
        <button className="btn wide" disabled={busy}>
          {busy ? <><Loader2 size={17} className="rot" /> Creating...</> : <><UserPlus size={17} /> Sign up</>}
        </button>
        <p className="switch muted">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}