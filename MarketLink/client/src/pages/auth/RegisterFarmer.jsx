import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { homeFor, useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { PASSWORD_HINT, passwordOk } from './Register';

export default function RegisterFarmer() {
  useDocumentTitle('Register your stall');
  const { registerFarmer, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ stallName: '', contactPerson: '', phone: '', email: '', address: '', city: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (user && !busy) return <Navigate to={homeFor(user)} replace />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!passwordOk(form.password)) return setError(`Password: ${PASSWORD_HINT}.`);
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      await registerFarmer(form);
      toast('Registration received! An admin will review your stall shortly.');
      navigate('/farmer', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
    return undefined;
  }

  return (
    <AuthLayout title="Sell your harvest" highlight="before market day." text="Publish weekly stock and prices, take pre-orders with pickup slots, and see your best sellers. Your stall goes live after a quick admin approval.">
      <h1 className="mb-1">Register your stall</h1>
      <p className="text-muted-2 mb-4">Tell us about your farm. You can add markets, pickup windows and your map pin after logging in.</p>
      <form onSubmit={submit}>
        {error && <div className="alert alert-danger small py-2">{error}</div>}
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label" htmlFor="f-stall">Stall / business name</label>
            <input id="f-stall" name="stallName" className="form-control" required value={form.stallName} onChange={change} placeholder="e.g. Malir Green Fields" />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="f-contact">Contact person</label>
            <input id="f-contact" name="contactPerson" className="form-control" required value={form.contactPerson} onChange={change} autoComplete="name" />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="f-phone">Contact number</label>
            <input id="f-phone" name="phone" type="tel" className="form-control" required pattern="\+?[\d\s\(\)\-]{7,20}" title="7-20 digits, spaces, +, - or brackets" value={form.phone} onChange={change} autoComplete="tel" />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="f-email">E-mail</label>
            <input id="f-email" name="email" type="email" className="form-control" required value={form.email} onChange={change} autoComplete="email" />
          </div>
          <div className="col-md-8">
            <label className="form-label" htmlFor="f-address">Address</label>
            <input id="f-address" name="address" className="form-control" required value={form.address} onChange={change} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="f-city">City</label>
            <input id="f-city" name="city" className="form-control" value={form.city} onChange={change} />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="f-pass">Password</label>
            <input id="f-pass" name="password" type="password" className="form-control" required value={form.password} onChange={change} autoComplete="new-password" />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="f-confirm">Confirm password</label>
            <input id="f-confirm" name="confirm" type="password" className="form-control" required value={form.confirm} onChange={change} autoComplete="new-password" />
          </div>
          <div className="col-12 fs-7 text-muted-2">{PASSWORD_HINT}.</div>
        </div>
        <button type="submit" className="btn btn-primary btn-lg w-100 mt-3" disabled={busy}>
          {busy && <span className="spinner-border spinner-border-sm" />} Submit for approval
        </button>
      </form>
      <p className="mt-4 small text-center">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}
