import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import { PageLoader } from '../../components/common/Loader';
import { formatDate } from '../../utils/format';

const AUDIENCE = { all: 'Everyone', customer: 'Customers', farmer: 'Farmers' };

export default function AdminAnnouncements() {
  useDocumentTitle('Announcements');
  const { toast } = useToast();
  const { data, loading, reload } = useFetch('/admin/announcements');
  const [form, setForm] = useState({ title: '', message: '', audience: 'all', notify: true });
  const [busy, setBusy] = useState(false);

  async function publish(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/admin/announcements', form);
      toast(`Published${res.delivered ? ` and sent to ${res.delivered} users` : ''}`);
      setForm({ title: '', message: '', audience: 'all', notify: true });
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function toggle(a) {
    await api.put(`/admin/announcements/${a._id}`, { isActive: !a.isActive });
    reload();
  }
  async function remove(a) {
    await api.del(`/admin/announcements/${a._id}`);
    toast('Announcement deleted');
    reload();
  }

  return (
    <>
      <DashHeader title="Announcements" subtitle="Publish platform-wide notices. Active announcements show as a banner and can be sent as in-app notifications." />
      <div className="row g-4">
        <div className="col-xl-5">
          <form className="panel" onSubmit={publish}>
            <div className="panel-head">
              <h5>
                <i className="bi bi-megaphone" /> New announcement
              </h5>
            </div>
            <div className="d-grid gap-3">
              <div>
                <label className="form-label" htmlFor="an-title">Title</label>
                <input id="an-title" className="form-control" required maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="form-label" htmlFor="an-msg">Message</label>
                <textarea id="an-msg" className="form-control" rows={4} required maxLength={1000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <div>
                <label className="form-label" htmlFor="an-aud">Audience</label>
                <select id="an-aud" className="form-select" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                  {Object.entries(AUDIENCE).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-check">
                <input id="an-notify" type="checkbox" className="form-check-input" checked={form.notify} onChange={(e) => setForm({ ...form, notify: e.target.checked })} />
                <label className="form-check-label small" htmlFor="an-notify">
                  Also send as an in-app notification
                </label>
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-3" disabled={busy}>
              <i className="bi bi-send" /> Publish
            </button>
          </form>
        </div>
        <div className="col-xl-7">
          {loading && !data ? (
            <PageLoader />
          ) : (
            <div className="d-grid gap-2">
              {data.announcements.map((a) => (
                <div key={a._id} className="panel">
                  <div className="d-flex align-items-start gap-2">
                    <div className="flex-grow-1">
                      <div className="d-flex gap-2 align-items-center flex-wrap mb-1">
                        <strong>{a.title}</strong>
                        <span className="chip chip-soft">{AUDIENCE[a.audience]}</span>
                        {a.isActive ? <span className="chip chip-lime">Live banner</span> : <span className="chip">Hidden</span>}
                      </div>
                      <p className="small mb-1">{a.message}</p>
                      <span className="fs-7 text-muted-2">
                        {formatDate(a.createdAt, { time: true })} · by {a.createdBy?.name}
                      </span>
                    </div>
                    <button type="button" className="btn btn-sm btn-white" onClick={() => toggle(a)}>
                      {a.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button type="button" className="btn btn-sm btn-white btn-icon" onClick={() => remove(a)} aria-label="Delete announcement">
                      <i className="bi bi-trash3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
