import { useState } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { PageHero } from '../../components/common/PageHeader';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { CONTACT } from '../../config';

export default function Contact() {
  useDocumentTitle('Contact us');
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/contact', form);
      toast(res.message);
      setSent(true);
      setForm({ ...form, subject: '', message: '' });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero crumbs={[{ label: 'Contact' }]} title="Get in touch" subtitle="Questions about an order, joining as a farmer or partnering with a market? We'd love to hear from you." />
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="cta-band mb-4">
              <h2 className="h3">MarketLink team</h2>
              <ul className="list-unstyled d-grid gap-3 mt-3 mb-0">
                <li className="d-flex gap-3">
                  <i className="bi bi-geo-alt-fill text-lime fs-5" />
                  <span>{CONTACT.address}</span>
                </li>
                <li className="d-flex gap-3">
                  <i className="bi bi-envelope-fill text-lime fs-5" />
                  <a className="text-white" href={`mailto:${CONTACT.email}`}>
                    {CONTACT.email}
                  </a>
                </li>
                <li className="d-flex gap-3">
                  <i className="bi bi-telephone-fill text-lime fs-5" />
                  <span>{CONTACT.phone}</span>
                </li>
                <li className="d-flex gap-3">
                  <i className="bi bi-clock-fill text-lime fs-5" />
                  <span>{CONTACT.hours}</span>
                </li>
              </ul>
            </div>
            <div className="map-frame" style={{ height: 300 }}>
              <iframe
                title="MarketLink office on Google Maps"
                src={`https://www.google.com/maps?q=${encodeURIComponent(CONTACT.mapQuery)}&z=15&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a className="small d-inline-block mt-2" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.mapQuery)}`} target="_blank" rel="noreferrer">
              <i className="bi bi-box-arrow-up-right" /> Open in Google Maps
            </a>
          </div>
          <div className="col-lg-7">
            <form className="soft-panel" onSubmit={submit}>
              <h2 className="h4 mb-3">Send us a message</h2>
              {sent && (
                <div className="alert alert-success small">
                  <i className="bi bi-check-circle" /> Message sent. We usually reply within one working day.
                </div>
              )}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="c-name">Your name</label>
                  <input id="c-name" name="name" className="form-control" required value={form.name} onChange={change} />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="c-email">E-mail</label>
                  <input id="c-email" name="email" type="email" className="form-control" required value={form.email} onChange={change} />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="c-subject">Subject</label>
                  <input id="c-subject" name="subject" className="form-control" value={form.subject} onChange={change} maxLength={150} />
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="c-message">Message</label>
                  <textarea id="c-message" name="message" className="form-control" rows={6} required value={form.message} onChange={change} maxLength={2000} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-3" disabled={busy}>
                {busy ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-send" />} Send message
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
