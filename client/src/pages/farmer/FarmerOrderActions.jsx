import { useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';

const ACTIONS = {
  placed: [
    { action: 'accept', label: 'Accept', icon: 'bi-check-lg', cls: 'btn-primary' },
    { action: 'decline', label: 'Decline', icon: 'bi-x-lg', cls: 'btn-outline-danger' },
  ],
  accepted: [
    { action: 'ready', label: 'Mark ready for pickup', icon: 'bi-bag-check', cls: 'btn-primary' },
    { action: 'decline', label: 'Decline', icon: 'bi-x-lg', cls: 'btn-outline-danger' },
  ],
  ready: [{ action: 'complete', label: 'Mark picked up', icon: 'bi-check2-all', cls: 'btn-forest' }],
};

/** Accept / decline / ready / complete buttons for a farmer's pre-order. */
export default function FarmerOrderActions({ order, onChange, compact = false }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState('');
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const actions = ACTIONS[order.status] || [];
  if (!actions.length) return null;

  async function run(action, note) {
    setBusy(action);
    try {
      const res = await api.post(`/farmer/orders/${order._id}/${action}`, { note });
      toast(
        { accept: 'Order accepted — customer notified', decline: 'Order declined and stock released', ready: 'Customer notified that the order is ready', complete: 'Order completed' }[action]
      );
      setDeclining(false);
      onChange?.(res.order);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className={compact ? 'd-flex gap-2 flex-wrap' : 'panel mb-4 d-flex align-items-center gap-2 flex-wrap'}>
      {!compact && <strong className="me-auto">Update this pre-order</strong>}
      {actions.map((a) => (
        <button
          key={a.action}
          type="button"
          className={`btn ${a.cls} ${compact ? 'btn-sm' : ''}`}
          disabled={Boolean(busy)}
          onClick={() => (a.action === 'decline' ? setDeclining(true) : run(a.action))}
        >
          {busy === a.action ? <span className="spinner-border spinner-border-sm" /> : <i className={`bi ${a.icon}`} />} {a.label}
        </button>
      ))}
      <Modal
        open={declining}
        title={`Decline ${order.orderNumber}?`}
        onClose={() => setDeclining(false)}
        footer={
          <>
            <button type="button" className="btn btn-white" onClick={() => setDeclining(false)}>
              Back
            </button>
            <button type="button" className="btn btn-danger" disabled={busy === 'decline'} onClick={() => run('decline', reason)}>
              Decline order
            </button>
          </>
        }
      >
        <p className="small text-muted-2">The reserved stock goes back to your inventory and the customer receives an e-mail with your reason.</p>
        <label className="form-label" htmlFor="decline-reason">Reason (shown to the customer)</label>
        <textarea id="decline-reason" className="form-control" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Harvest was smaller than expected this week" maxLength={300} />
      </Modal>
    </div>
  );
}
