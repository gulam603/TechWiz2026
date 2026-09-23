import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { api } from '../../api/client';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function ForgotPassword() {
  useDocumentTitle('Forgot password');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      setSent(await api.post('/auth/forgot-password', { email }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Locked out?" highlight="We'll get you back in." text="Enter the e-mail you registered with and we will send you a secure link to choose a new password.">
      <h1 className="mb-1">Forgot password</h1>
      <p className="text-muted-2 mb-4">Works for customer and farmer accounts. The link is valid for 30 minutes.</p>
      {sent ? (
        <div className="alert alert-success rounded-4">
          <i className="bi bi-envelope-check" /> {sent.message}
          {sent.emailMode === 'console' && (
            <div className="small mt-2">
              Demo mode: e-mail sending is not configured, so the reset link is printed in the <strong>server terminal</strong>.
            </div>
          )}
          {sent.emailMode === 'ethereal' && <div className="small mt-2">Test inbox mode: open the “view” link printed in the server terminal.</div>}
        </div>
      ) : (
        <form onSubmit={submit}>
          {error && <div className="alert alert-danger small py-2">{error}</div>}
          <label className="form-label" htmlFor="fp-email">E-mail</label>
          <input id="fp-email" type="email" className="form-control form-control-lg mb-3" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus />
          <button type="submit" className="btn btn-primary btn-lg w-100" disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm" />} Send reset link
          </button>
        </form>
      )}
      <p className="mt-4 small text-center">
        Remembered it? <Link to="/login">Back to log in</Link>
      </p>
    </AuthLayout>
  );
}
