import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { homeFor, useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import PasswordInput from '../../components/common/PasswordInput';

const DEMO = [
  { label: 'Customer', email: 'customer@marketlink.com', password: 'Customer@123' },
  { label: 'Farmer', email: 'farmer@marketlink.com', password: 'Farmer@123' },
];

export default function Login() {
  useDocumentTitle('Log in');
  const { login, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user && !busy) return <Navigate to={homeFor(user)} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      toast(`Welcome back, ${user.name.split(' ')[0]}!`);
      const from = location.state?.from;
      navigate(from && !(user.role !== 'customer' && from.startsWith('/checkout')) ? from : homeFor(user), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Your market," highlight="one tap away." text="Log in to pre-order fresh produce, track pickups and manage your favourite farmers — or run your stall if you're a farmer.">
      <h1 className="mb-1">Welcome back</h1>
      <p className="text-muted-2 mb-4">Customers and farmers log in here.</p>
      <form onSubmit={submit} noValidate>
        {error && <div className="alert alert-danger small py-2">{error}</div>}
        <div className="mb-3">
          <label className="form-label" htmlFor="email">E-mail</label>
          <input id="email" type="email" className="form-control form-control-lg" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-baseline">
            <label className="form-label" htmlFor="password">Password</label>
            <Link to="/forgot-password" className="small">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="password" size="lg" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary btn-lg w-100" disabled={busy}>
          {busy && <span className="spinner-border spinner-border-sm" />} Log in
        </button>
      </form>
      <div className="demo-box mt-4">
        <div className="fw-bold mb-2">
          <i className="bi bi-magic" /> Demo accounts
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {DEMO.map((d) => (
            <button key={d.label} type="button" onClick={() => setForm({ email: d.email, password: d.password })}>
              Use {d.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 small text-center">
        New here? <Link to="/register">Create a customer account</Link> · <Link to="/register/farmer">Register your stall</Link>
      </p>
      <p className="small text-center text-muted-2">
        Administrator? <Link to="/admin/login">Use the admin portal</Link>
      </p>
    </AuthLayout>
  );
}
