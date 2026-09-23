import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import { ConfirmModal } from '../../components/common/Modal';
import { initials } from '../../utils/format';

export function PasswordForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast('New passwords do not match', 'error');
    setBusy(true);
    try {
      const res = await api.put('/auth/password', form);
      toast(res.message);
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
    return undefined;
  }

  return (
    <form className="panel" onSubmit={submit}>
      <div className="panel-head">
        <h5>
          <i className="bi bi-shield-lock" /> Change password
        </h5>
      </div>
      <div className="d-grid gap-3">
        <div>
          <label className="form-label" htmlFor="pw-current">Current password</label>
          <input id="pw-current" type="password" className="form-control" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} autoComplete="current-password" />
        </div>
        <div>
          <label className="form-label" htmlFor="pw-new">New password</label>
          <input id="pw-new" type="password" className="form-control" required value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} autoComplete="new-password" />
          <div className="fs-7 text-muted-2 mt-1">At least 8 characters with letters and numbers.</div>
        </div>
        <div>
          <label className="form-label" htmlFor="pw-confirm">Confirm new password</label>
          <input id="pw-confirm" type="password" className="form-control" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" />
        </div>
      </div>
      <button type="submit" className="btn btn-primary mt-3" disabled={busy}>
        Update password
      </button>
    </form>
  );
}

function FamilyPanel() {
  const { toast } = useToast();
  const { refresh } = useAuth();
  const { data, reload, setData } = useFetch('/customer/family');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState(null);

  async function add(e) {
    e.preventDefault();
    setBusy(true);
    try {
      setData(await api.post('/customer/family', { email }));
      setEmail('');
      toast('Family member added');
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    try {
      setData(await api.del(`/customer/family/${removing._id}`));
      toast(removing.isMe ? 'You left the household' : 'Member removed');
      setRemoving(null);
      refresh();
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <h5>
          <i className="bi bi-people" /> Family sharing <span className="chip chip-soft ms-1">optional</span>
        </h5>
      </div>
      <p className="small text-muted-2">Link family members' accounts so everyone in the household can see each other's pre-orders and pickups.</p>
      {data?.members?.length > 0 && (
        <div className="d-grid gap-2 mb-3">
          {data.members.map((m) => (
            <div key={m._id} className="d-flex align-items-center gap-2 border rounded-4 p-2">
              <span className="avatar avatar-sm">{initials(m.name)}</span>
              <span className="flex-grow-1 small">
                <strong className="d-block">
                  {m.name} {m.isMe && '(you)'}
                </strong>
                <span className="text-muted-2">{m.email}</span>
              </span>
              {m.isOwner && <span className="chip chip-lime">Owner</span>}
              {(data.isOwner || m.isMe) && (
                <button type="button" className="btn btn-sm btn-white" onClick={() => setRemoving(m)}>
                  {m.isMe ? 'Leave' : 'Remove'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {(!data?.household || data.isOwner) && (
        <form className="d-flex gap-2" onSubmit={add}>
          <input type="email" className="form-control" placeholder="Family member's e-mail (must have an account)" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Family member e-mail" />
          <button type="submit" className="btn btn-primary text-nowrap" disabled={busy}>
            <i className="bi bi-person-plus" /> Add
          </button>
        </form>
      )}
      <ConfirmModal
        open={Boolean(removing)}
        title={removing?.isMe ? 'Leave household?' : `Remove ${removing?.name}?`}
        message={removing?.isMe && data?.isOwner ? 'You are the owner, so the whole household will be dissolved.' : 'You will no longer see each other’s orders.'}
        confirmLabel={removing?.isMe ? 'Leave' : 'Remove'}
        danger
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}

export default function Profile() {
  useDocumentTitle('Profile');
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: user.address || '', city: user.city || '' });
  const [busy, setBusy] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile(form);
      toast('Profile saved');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DashHeader title="Profile & family" subtitle="Manage your personal details, password and household sharing." />
      <div className="row g-4">
        <div className="col-xl-7">
          <form className="panel mb-4" onSubmit={save}>
            <div className="panel-head">
              <h5>
                <i className="bi bi-person" /> Personal details
              </h5>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="p-name">Full name</label>
                <input id="p-name" name="name" className="form-control" required value={form.name} onChange={change} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="p-email">E-mail</label>
                <input id="p-email" className="form-control" value={user.email} disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="p-phone">Contact number</label>
                <input id="p-phone" name="phone" className="form-control" required value={form.phone} onChange={change} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="p-city">City</label>
                <input id="p-city" name="city" className="form-control" value={form.city} onChange={change} />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="p-address">Address</label>
                <input id="p-address" name="address" className="form-control" required value={form.address} onChange={change} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-3" disabled={busy}>
              Save changes
            </button>
          </form>
          <FamilyPanel />
        </div>
        <div className="col-xl-5">
          <PasswordForm />
        </div>
      </div>
    </>
  );
}
