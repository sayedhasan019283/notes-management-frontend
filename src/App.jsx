import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { FileText, Library, LogOut, ShieldCheck, StickyNote, Tags, Users as UsersIcon } from 'lucide-react';
import { useAuth } from './auth.jsx';
import { Avatar } from './ui.jsx';
import Login from './pages/Login.jsx';
import Notes from './pages/Notes.jsx';
import Posts from './pages/Posts.jsx';
import AdminNotes from './pages/AdminNotes.jsx';
import Users from './pages/Users.jsx';
import Interests from './pages/Interests.jsx';
import Register from './pages/Register.jsx';
// UI-level RBAC only (the API enforces the same rules on the server)
function Guard({ roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/notes" replace />;
  return <Outlet />;
}

const LINKS = [
  ['/notes', 'My notes', StickyNote, ['user', 'admin']],
  ['/posts', 'Posts', FileText, ['user', 'admin']],
  ['/admin/notes', 'All notes', Library, ['admin']],
  ['/admin/users', 'Users', UsersIcon, ['admin']],
  ['/admin/interests', 'Interests', Tags, ['admin']],
];

function Layout() {
  const { user, logout } = useAuth();
  const Brand = () => <div className="brand"><span className="logo"><ShieldCheck size={20} /></span>Secure Notes</div>;
  return (
    <div className="shell">
      <aside className="side">
        <Brand />
        <nav>
          {LINKS.filter(([, , , roles]) => roles.includes(user.role)).map(([to, label, Icon]) => (
            <NavLink key={to} to={to}><Icon size={19} /><span>{label}</span></NavLink>
          ))}
        </nav>
        <div className="me">
          <Avatar name={user.name} />
          <div className="meinfo"><b>{user.name}</b><em className={`badge ${user.role}`}>{user.role}</em></div>
          <button className="icon-btn" title="Logout" onClick={logout}><LogOut size={18} /></button>
        </div>
      </aside>

      <header className="mtop">
        <Brand />
        <div className="mright">
          <Avatar name={user.name} size={32} />
          <em className={`badge ${user.role}`}>{user.role}</em>
          <button className="icon-btn" title="Logout" onClick={logout}><LogOut size={18} /></button>
        </div>
      </header>

      <main><Outlet /></main>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/notes" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/notes" replace /> : <Register />} />
      <Route element={<Guard />}>
        <Route element={<Layout />}>
          <Route path="/notes" element={<Notes />} />
          <Route path="/posts" element={<Posts />} />
          <Route element={<Guard roles={['admin']} />}>
            <Route path="/admin/notes" element={<AdminNotes />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/interests" element={<Interests />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/notes" replace />} />
    </Routes>
  );
}
