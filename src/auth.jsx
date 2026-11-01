import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  // store tokens + user after login / register
  const save = (r) => {
    if (!r?.tokens?.accessToken) throw new Error('Unexpected response from server');
    localStorage.setItem('token', r.tokens.accessToken);
    localStorage.setItem('user', JSON.stringify(r.user));
    setUser(r.user);
  };

  const login = async (email, password) =>
    save(await api('/users/login', { method: 'POST', body: { email, password } }));

  const register = async (payload) => {
    const r = await api('/users', { method: 'POST', body: payload });
    if (r?.tokens?.accessToken) return save(r);
    // backend returned only the created user: log in with the same credentials
    return login(payload.email, payload.password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // api.js fires this when the server answers 401 (expired/invalid token)
  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, []);

  return <Ctx.Provider value={{ user, login, register, logout }}>{children}</Ctx.Provider>;
}