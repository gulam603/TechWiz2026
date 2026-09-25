import { useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

/**
 * "Subscribe to our newsletter" form. `variant="band"` is the large home page block,
 * `variant="footer"` the compact form in the footer.
 */
export default function NewsletterCta({ variant = 'band', source = 'home' }) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ busy: false, done: '', error: '' });
  const id = `newsletter-${variant}`;

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, done: '', error: '' });
    try {
      const res = await api.post('/newsletter', { email: email || user?.email, name: user?.name, source });
      setState({ busy: false, done: res.message, error: '' });
      setEmail('');
    } catch (err) {
      setState({ busy: false, done: '', error: err.message });
    }
  }

  const form = (
    <form className="nl-form" onSubmit={submit} noValidate={false}>
      <label htmlFor={id} className="visually-hidden">
        Your e-mail address
      </label>
      <div className="nl-field">
        <i className="bi bi-envelope" aria-hidden="true" />
        <input id={id} type="email" required={!user} placeholder={user?.email || 'Your e-mail address'} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={120} />
        <button type="submit" className="btn btn-lime" disabled={state.busy}>
          {state.busy ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : 'Subscribe'}
        </button>
      </div>
      <div aria-live="polite" className="nl-status">
        {state.done && (
          <span className="nl-ok">
            <i className="bi bi-check-circle-fill" aria-hidden="true" /> {state.done}
          </span>
        )}
        {state.error && (
          <span className="nl-error">
            <i className="bi bi-exclamation-circle" aria-hidden="true" /> {state.error}
          </span>
        )}
      </div>
    </form>
  );

  if (variant === 'footer') {
    return (
      <div className="nl-footer">
        <h6>Weekly harvest e-mail</h6>
        <p className="small mb-2">What is fresh, what is in season and new farmers near you. Once a week, no spam.</p>
        {form}
      </div>
    );
  }

  return (
    <section className="section pt-0" aria-labelledby="nl-title">
      <div className="container">
        <div className="nl-band">
          <div className="nl-photos" aria-hidden="true">
            {['strawberries', 'kinnow-oranges', 'vine-tomatoes'].map((name) => (
              <img key={name} src={`/uploads/photos/thumbs/${name}.webp`} alt="" loading="lazy" />
            ))}
          </div>
          <div className="row align-items-center g-4 position-relative">
            <div className="col-lg-6">
              <span className="eyebrow">Newsletter</span>
              <h2 id="nl-title" className="section-title mt-2">Get the weekly harvest list in your inbox</h2>
              <p className="mb-0">Once a week: what the markets will have, seasonal picks and new farmers. Unsubscribe with one click.</p>
            </div>
            <div className="col-lg-6">{form}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
