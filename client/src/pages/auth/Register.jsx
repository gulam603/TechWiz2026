import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export const PASSWORD_HINT = 'At least 8 characters with letters and numbers';
export const passwordOk = (p) => /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/.test(p);

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!passwordOk(form.password)) return setError(`Password: ${PASSWORD_HINT}.`);
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      await register(form);
      toast('Welcome to MarketLink! 🎉');
      navigate('/account', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
    return undefined;
  }

  return (
    <AuthLayout title="Fresh food," highlight="zero wasted trips." text="Create a free account to pre-order from local farmers, save favourites, get restock alerts and track your pickups.">
      <h1 className="mb-1">Create your account</h1>
      <p className="text-muted-2 mb-4">It takes less than a minute.</p>
      <form onSubmit={submit}>
        {error && <div className="alert alert-danger small py-2">{error}</div>}
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label" htmlFor="r-name">Full name</label>
            <input id="r-name" name="name" className="form-control" required value={form.name} onChange={change} autoComplete="name" />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="r-email">E-mail</label>
            <input id="r-email" name="email" type="email" className="form-control" required value={form.email} onChange={change} autoComplete="email" />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="r-phone">Contact number</label>
            <input id="r-phone" name="phone" type="tel" className="form-control" required value={form.phone} onChange={change} autoComplete="tel" placeholder="+92 300 1234567" />
          </div>
          <div className="col-md-8">
            <label className="form-label" htmlFor="r-address">Address</label>
            <input id="r-address" name="address" className="form-control" required value={form.address} onChange={change} autoComplete="street-address" />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="r-city">City</label>
            <input id="r-city" name="city" className="form-control" value={form.city} onChange={change} autoComplete="address-level2" />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="r-pass">Password</label>
            <input id="r-pass" name="password" type="password" className="form-control" required value={form.password} onChange={change} autoComplete="new-password" />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="r-confirm">Confirm password</label>
            <input id="r-confirm" name="confirm" type="password" className="form-control" required value={form.confirm} onChange={change} autoComplete="new-password" />
          </div>
          <div className="col-12 fs-7 text-muted-2">{PASSWORD_HINT}.</div>
        </div>
        <button type="submit" className="btn btn-primary btn-lg w-100 mt-3" disabled={busy}>
          {busy && <span className="spinner-border spinner-border-sm" />} Create account
        </button>
      </form>
      <p className="mt-4 small text-center">
        Already have an account? <Link to="/login">Log in</Link> · Are you a farmer? <Link to="/register/farmer">Register your stall</Link>
      </p>
    </AuthLayout>
  );
}
