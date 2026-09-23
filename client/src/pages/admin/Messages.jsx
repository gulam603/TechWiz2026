import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api } from '../../api/client';
import { DashHeader } from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import { formatDate } from '../../utils/format';

export default function AdminMessages() {
  useDocumentTitle('Contact messages');
  const { data, loading, reload } = useFetch('/admin/messages');
  if (loading && !data) return <PageLoader />;

  async function mark(m) {
    await api.patch(`/admin/messages/${m._id}`, { status: m.status === 'new' ? 'read' : 'new' });
    reload();
  }
  async function remove(m) {
    await api.del(`/admin/messages/${m._id}`);
    reload();
  }

  return (
    <>
      <DashHeader title="Contact messages" subtitle="Messages sent through the Contact Us page." />
      {data.messages.length === 0 ? (
        <EmptyState title="Inbox is empty" />
      ) : (
        <div className="d-grid gap-2">
          {data.messages.map((m) => (
            <div key={m._id} className="panel" style={m.status === 'new' ? { borderColor: '#cfe9a8', background: '#fbfdf3' } : undefined}>
              <div className="d-flex gap-2 align-items-start flex-wrap">
                <div className="flex-grow-1">
                  <div className="d-flex gap-2 align-items-center flex-wrap">
                    <strong>{m.subject || '(no subject)'}</strong>
                    {m.status === 'new' && <span className="chip chip-lime">New</span>}
                  </div>
                  <div className="fs-7 text-muted-2 mb-2">
                    {m.name} · <a href={`mailto:${m.email}`}>{m.email}</a> · {formatDate(m.createdAt, { time: true })}
                  </div>
                  <p className="small mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {m.message}
                  </p>
                </div>
                <a className="btn btn-sm btn-soft" href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your message')}`}>
                  <i className="bi bi-reply" /> Reply
                </a>
                <button type="button" className="btn btn-sm btn-white" onClick={() => mark(m)}>
                  Mark {m.status === 'new' ? 'read' : 'unread'}
                </button>
                <button type="button" className="btn btn-sm btn-white btn-icon" onClick={() => remove(m)} aria-label="Delete message">
                  <i className="bi bi-trash3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
