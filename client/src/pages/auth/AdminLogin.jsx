import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function AdminLogin() {
  useDocumentTitle('Admin login');
  const { adminLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminLogin(form.email, form.password);
      toast('Signed in to the admin console');
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout variant="admin" title="MarketLink" highlight="admin console." text="Approve farmers, manage markets and categories, moderate content and generate platform reports.">
      <span className="chip chip-dark mb-3">
        <i className="bi bi-shield-lock" /> Restricted area
      </span>
      <h1 className="mb-1">Administrator login</h1>
      <p className="text-muted-2 mb-4">Only administrator accounts can sign in here.</p>
      <form onSubmit={submit}>
        {error && <div className="alert alert-danger small py-2">{error}</div>}
        <div className="mb-3">
          <label className="form-label" htmlFor="a-email">Admin e-mail</label>
          <input id="a-email" type="email" className="form-control form-control-lg" required autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="a-password">Password</label>
          <input id="a-password" type="password" className="form-control form-control-lg" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-forest btn-lg w-100" disabled={busy}>
          {busy && <span className="spinner-border spinner-border-sm" />} Sign in securely
        </button>
      </form>
      <div className="demo-box mt-4">
        <span className="fw-bold">Demo admin:</span> admin@marketlink.com / Admin@123{' '}
        <button type="button" className="ms-1" onClick={() => setForm({ email: 'admin@marketlink.com', password: 'Admin@123' })}>
          Fill
        </button>
      </div>
    </AuthLayout>
  );
}
