import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api, toFormData } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import LocationPicker from '../../components/map/LocationPicker';
import DayDots from '../../components/common/DayDots';
import StatusBadge from '../../components/common/StatusBadge';
import { PageLoader } from '../../components/common/Loader';
import { ImageInput } from '../farmer/Products';
import { DAY_LETTER, DAY_NAMES, time12 } from '../../utils/format';

const EMPTY = { name: '', description: '', address: '', city: '', latitude: '', longitude: '', operatingDays: [], openTime: '07:00', closeTime: '13:00', mapProvider: 'openstreetmap', mapLink: '', isActive: true };

// Rendered with a `key`, so the form starts fresh for every market.
function MarketForm({ market, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(() => (market ? { ...EMPTY, ...market, mapLink: market.mapLink || '', description: market.description || '', city: market.city || '' } : EMPTY));
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleDay = (d) => setForm({ ...form, operatingDays: form.operatingDays.includes(d) ? form.operatingDays.filter((x) => x !== d) : [...form.operatingDays, d].sort() });

  async function submit(e) {
    e.preventDefault();
    if (form.latitude === '' || form.longitude === '') return toast('Please set the market location on the map', 'error');
    setBusy(true);
    try {
      const body = { ...form, operatingDays: form.operatingDays.join(',') };
      ['_id', 'slug', 'createdAt', 'updatedAt', '__v', 'image', 'farmerCount'].forEach((k) => delete body[k]);
      const fd = toFormData(body, { image: file });
      if (market) await api.upload('PUT', `/admin/markets/${market._id}`, fd);
      else await api.upload('POST', '/admin/markets', fd);
      toast(market ? 'Market updated' : 'Market added');
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
    return undefined;
  }

  return (
    <Modal open onClose={onClose} title={market ? `Edit ${market.name}` : 'Add a market'} size="modal-lg">
      <form onSubmit={submit}>
        <div className="row g-3">
          <div className="col-md-7">
            <label className="form-label" htmlFor="m-name">Market name</label>
            <input id="m-name" name="name" className="form-control" required value={form.name} onChange={change} />
          </div>
          <div className="col-md-5">
            <label className="form-label" htmlFor="m-city">City</label>
            <input id="m-city" name="city" className="form-control" value={form.city} onChange={change} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="m-address">Address</label>
            <input id="m-address" name="address" className="form-control" required value={form.address} onChange={change} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="m-desc">Description</label>
            <textarea id="m-desc" name="description" rows={2} className="form-control" value={form.description} onChange={change} />
          </div>
          <div className="col-md-6">
            <span className="form-label d-block">Operating days</span>
            <div className="day-picker">
              {DAY_LETTER.map((l, i) => (
                <button type="button" key={i} className={form.operatingDays.includes(i) ? 'active' : ''} onClick={() => toggleDay(i)} aria-label={DAY_NAMES[i]} aria-pressed={form.operatingDays.includes(i)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="m-open">Opens</label>
            <input id="m-open" name="openTime" type="time" className="form-control" value={form.openTime} onChange={change} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="m-close">Closes</label>
            <input id="m-close" name="closeTime" type="time" className="form-control" value={form.closeTime} onChange={change} />
          </div>
          <div className="col-12">
            <span className="form-label d-block">Map location</span>
            <LocationPicker lat={form.latitude} lng={form.longitude} onChange={(p) => setForm((f) => ({ ...f, latitude: p.lat, longitude: p.lng }))} height={260} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="m-lat">Latitude</label>
            <input id="m-lat" name="latitude" type="number" step="0.000001" className="form-control" required value={form.latitude} onChange={change} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="m-lng">Longitude</label>
            <input id="m-lng" name="longitude" type="number" step="0.000001" className="form-control" required value={form.longitude} onChange={change} />
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="m-provider">Map provider</label>
            <select id="m-provider" name="mapProvider" className="form-select" value={form.mapProvider} onChange={change}>
              <option value="openstreetmap">OpenStreetMap</option>
              <option value="google">Google Maps</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label" htmlFor="m-active">Visibility</label>
            <select id="m-active" name="isActive" className="form-select" value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
              <option value="true">Active</option>
              <option value="false">Hidden</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="m-link">Map link (optional embed / share link)</label>
            <input id="m-link" name="mapLink" className="form-control" value={form.mapLink} onChange={change} placeholder="https://www.google.com/maps/…" />
          </div>
          <div className="col-12">
            <ImageInput label="Market image" current={market?.image} file={file} onFile={setFile} />
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-white" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm" />} {market ? 'Save market' : 'Add market'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminMarkets() {
  useDocumentTitle('Manage markets');
  const { toast } = useToast();
  const { data, loading, reload } = useFetch('/admin/markets');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);

  async function remove() {
    try {
      const res = await api.del(`/admin/markets/${deleting._id}`);
      toast(res.message);
      setDeleting(null);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  if (loading && !data) return <PageLoader />;
  return (
    <>
      <DashHeader
        title="Markets"
        subtitle="Add, edit or remove farmers markets, their days, timings and map coordinates."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <i className="bi bi-plus-lg" /> Add market
          </button>
        }
      />
      <div className="table-card">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Market</th>
                <th>Days</th>
                <th>Hours</th>
                <th>Coordinates</th>
                <th className="text-end">Farmers</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.markets.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span className="thumb-sm" style={{ background: '#173b2c' }}>
                        <img src={m.image} alt="" className={m.image?.includes('/seed/') ? '' : 'photo'} />
                      </span>
                      <div>
                        <Link to={`/markets/${m.slug}`} className="fw-semi small d-block">
                          {m.name}
                        </Link>
                        <span className="fs-7 text-muted-2">{m.address}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <DayDots days={m.operatingDays} />
                  </td>
                  <td className="small text-nowrap">
                    {time12(m.openTime)} – {time12(m.closeTime)}
                  </td>
                  <td className="fs-7 text-muted-2">
                    {m.latitude.toFixed(4)}, {m.longitude.toFixed(4)}
                  </td>
                  <td className="text-end">{m.farmerCount}</td>
                  <td>
                    <StatusBadge status={m.isActive ? 'active' : 'inactive'} label={m.isActive ? 'Active' : 'Hidden'} />
                  </td>
                  <td className="text-end text-nowrap">
                    <button
                      type="button"
                      className="btn btn-sm btn-white btn-icon"
                      onClick={() => {
                        setEditing(m);
                        setOpen(true);
                      }}
                      aria-label={`Edit ${m.name}`}
                    >
                      <i className="bi bi-pencil" />
                    </button>{' '}
                    <button type="button" className="btn btn-sm btn-white btn-icon" onClick={() => setDeleting(m)} aria-label={`Remove ${m.name}`}>
                      <i className="bi bi-trash3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {open && (
        <MarketForm
          key={editing?._id || 'new'}
          market={editing}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            reload();
          }}
        />
      )}
      <ConfirmModal
        open={Boolean(deleting)}
        title={`Remove ${deleting?.name}?`}
        message="Farmers selling here will have their pickup windows for this market removed. Markets with order history are archived instead of deleted."
        confirmLabel="Remove market"
        danger
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
