import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { api } from '../../api/client';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { PASSWORD_HINT, passwordOk } from './Register';

export default function ResetPassword() {
  useDocumentTitle('Choose a new password');
  const { token } = useParams();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!passwordOk(form.password)) return setError(`Password: ${PASSWORD_HINT}.`);
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password: form.password });
      setDone(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
    return undefined;
  }

  return (
    <AuthLayout title="Fresh start," highlight="fresh password." text="Choose a new password for your MarketLink account. Use at least 8 characters with letters and numbers.">
      <h1 className="mb-1">Choose a new password</h1>
      <p className="text-muted-2 mb-4">After saving, log in with your new password.</p>
      {done ? (
        <>
          <div className="alert alert-success rounded-4">
            <i className="bi bi-check-circle" /> {done}
          </div>
          <Link to="/login" className="btn btn-primary btn-lg w-100">
            Log in
          </Link>
        </>
      ) : (
        <form onSubmit={submit}>
          {error && (
            <div className="alert alert-danger small py-2">
              {error} {/expired|invalid/.test(error) && <Link to="/forgot-password">Request a new link</Link>}
            </div>
          )}
          <label className="form-label" htmlFor="rp-pass">New password</label>
          <input id="rp-pass" type="password" className="form-control form-control-lg mb-3" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" autoFocus />
          <label className="form-label" htmlFor="rp-confirm">Confirm new password</label>
          <input id="rp-confirm" type="password" className="form-control form-control-lg mb-2" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" />
          <div className="fs-7 text-muted-2 mb-3">{PASSWORD_HINT}.</div>
          <button type="submit" className="btn btn-primary btn-lg w-100" disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm" />} Save new password
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
