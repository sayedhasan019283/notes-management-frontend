import { useEffect, useState } from 'react';
import { ROUTES } from './config.js';

const BASE = import.meta.env.VITE_API_URL || '/api/v1';

// '/users/..' -> '/user/..' etc. (see config.js)
const fix = (p) => p.replace(/^\/(users|notes|posts)(?=[/?]|$)/, (_, r) => '/' + ROUTES[r]);

// Backend wraps results as { code, message, data: { attributes } } -> return the attributes
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(BASE + fix(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try { json = await res.json(); } catch { /* empty body */ }

  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event('auth:logout'));
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  return json?.data?.attributes ?? json?.data ?? null;
}

// GET helper: refetches when `path` changes (pass null to skip), reload() forces a refetch
export function useFetch(path) {
  const [state, setState] = useState({ data: null, error: '', loading: !!path });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!path) { setState({ data: null, error: '', loading: false }); return; }
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    api(path)
      .then((data) => alive && setState({ data, error: '', loading: false }))
      .catch((e) => alive && setState({ data: null, error: e.message, loading: false }));
    return () => { alive = false; };
  }, [path, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}
