import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api, toFormData } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import { ApprovalBanner } from './Dashboard';
import { money } from '../../utils/format';
import { CURRENCY } from '../../config';

const EMPTY = { name: '', category: '', price: '', unit: 'kg', quantityAvailable: '', templateQuantity: '', description: '' };

export function ImageInput({ label = 'Image', current, file, onFile }) {
  // Temporary browser URL so the chosen image can be previewed before upload
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  return (
    <div>
      <span className="form-label d-block">{label}</span>
      <label className="upload-box" style={{ cursor: 'pointer' }}>
        <span className="preview">{preview || current ? <img src={preview || current} alt="" /> : <i className="bi bi-image fs-3 text-muted-2" />}</span>
        <span className="small">
          <strong className="d-block">{file ? file.name : 'Choose an image'}</strong>
          <span className="text-muted-2">JPG, PNG or WEBP · max 2 MB</span>
        </span>
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="d-none" onChange={(e) => onFile(e.target.files?.[0] || null)} />
      </label>
    </div>
  );
}

// Rendered with a `key`, so its state starts fresh for every product that is edited.
function ProductForm({ product, categories, units, onClose, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(() =>
    product
      ? {
          name: product.name,
          category: product.category?._id || '',
          price: product.price,
          unit: product.unit,
          quantityAvailable: product.quantityAvailable,
          templateQuantity: product.templateQuantity,
          description: product.description || '',
        }
      : EMPTY
  );
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const [writing, setWriting] = useState(false);
  const [variant, setVariant] = useState(0);

  // "Write with AI": a description from the product name, category, unit and the farm's practices
  async function writeDescription() {
    if (form.name.trim().length < 2) return toast('Type the product name first', 'error');
    setWriting(true);
    try {
      const res = await api.post('/farmer/products/describe', { name: form.name, category: form.category, unit: form.unit, variant });
      setForm((f) => ({ ...f, description: res.description }));
      setVariant((v) => v + 1);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setWriting(false);
    }
    return undefined;
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = toFormData(form, { image: file });
      if (product) await api.upload('PUT', `/farmer/products/${product._id}`, fd);
      else await api.upload('POST', '/farmer/products', fd);
      toast(product ? 'Product updated' : 'Product added to your stall');
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={product ? `Edit ${product.name}` : 'Add a product'} size="modal-lg">
      <form onSubmit={submit}>
        <div className="row g-3">
          <div className="col-md-7">
            <label className="form-label" htmlFor="pf-name">Product name</label>
            <input id="pf-name" name="name" className="form-control" required value={form.name} onChange={change} maxLength={100} />
          </div>
          <div className="col-md-5">
            <label className="form-label" htmlFor="pf-cat">Category</label>
            <select id="pf-cat" name="category" className="form-select" required value={form.category} onChange={change}>
              <option value="">Choose…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="pf-price">Price ({CURRENCY})</label>
            <input id="pf-price" name="price" type="number" min="0" step="0.01" className="form-control" required value={form.price} onChange={change} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="pf-unit">Unit</label>
            <select id="pf-unit" name="unit" className="form-select" value={form.unit} onChange={change}>
              {units.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="pf-qty">Available now</label>
            <input id="pf-qty" name="quantityAvailable" type="number" min="0" className="form-control" value={form.quantityAvailable} onChange={change} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="pf-tpl">Weekly template</label>
            <input id="pf-tpl" name="templateQuantity" type="number" min="0" className="form-control" value={form.templateQuantity} onChange={change} placeholder="same as stock" />
          </div>
          <div className="col-12">
            <div className="d-flex align-items-end justify-content-between gap-2 mb-1">
              <label className="form-label mb-0" htmlFor="pf-desc">Description</label>
              <button type="button" className="btn btn-sm btn-ai" onClick={writeDescription} disabled={writing}>
                {writing ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-stars" />} {variant ? 'Try another' : 'Write with AI'}
              </button>
            </div>
            <textarea id="pf-desc" name="description" rows={3} className="form-control" value={form.description} onChange={change} maxLength={1500} placeholder="Type the product name, then press Write with AI" />
          </div>
          <div className="col-12">
            <ImageInput label="Product image" current={product?.image} file={file} onFile={setFile} />
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="btn btn-white" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm" />} {product ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Parent passes key={value}, so the input resets whenever the saved value changes.
function NumberCell({ value, onSave, label, disabled }) {
  const [v, setV] = useState(value);
  const commit = () => {
    if (String(v) !== String(value) && v !== '' && Number(v) >= 0) onSave(Number(v));
    else setV(value);
  };
  return (
    <input
      type="number"
      min="0"
      className="form-control form-control-sm"
      style={{ width: 84 }}
      value={v}
      aria-label={label}
      disabled={disabled}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
    />
  );
}

export default function FarmerProducts() {
  useDocumentTitle('Weekly stock');
  const { user } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [search, setSearch] = useState('');
  const { data, loading, reload, setData } = useFetch(`/farmer/products?status=${status}&search=${encodeURIComponent(search)}`);
  const { data: catData } = useFetch('/categories');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [applying, setApplying] = useState(false);
  const approved = user.status === 'active';

  function replace(product) {
    setData((d) => ({ ...d, products: d.products.map((p) => (p._id === product._id ? { ...p, ...product, category: p.category } : p)) }));
  }

  async function quickUpdate(product, body) {
    try {
      const res = await api.put(`/farmer/products/${product._id}`, body);
      replace(res.product);
      toast('Saved');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function setStatus(product, next) {
    try {
      const res = await api.patch(`/farmer/products/${product._id}/status`, { status: next });
      replace(res.product);
      toast(`${product.name} marked as ${next.replace('_', ' ')}`);
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function applyTemplate() {
    setApplying(true);
    try {
      const res = await api.post('/farmer/template/apply');
      toast(res.message);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setApplying(false);
    }
  }

  async function toggleAuto(checked) {
    try {
      await api.put('/farmer/template', { autoApplyTemplate: checked });
      setData((d) => ({ ...d, autoApplyTemplate: checked }));
      toast(checked ? 'Weekly stock will refresh automatically every week' : 'Automatic weekly refresh turned off');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove() {
    try {
      await api.del(`/farmer/products/${deleting._id}`);
      toast('Product deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  if (loading && !data) return <PageLoader />;
  const products = data.products; // includes listings an admin removed, shown with the reason

  return (
    <>
      <DashHeader
        title="Weekly stock & pricing"
        subtitle="Add products, update quantities and prices, and mark items sold out or temporarily unavailable."
        actions={
          approved && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <i className="bi bi-plus-lg" /> Add product
            </button>
          )
        }
      />
      <ApprovalBanner status={user.status} />

      <div className="panel mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-lg-7 d-flex gap-3 align-items-center">
            <span className="kpi-icon" style={{ width: 48, height: 48, borderRadius: 14, background: '#d4f06e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bi bi-arrow-repeat fs-5 text-forest" />
            </span>
            <div>
              <strong>Recurring weekly stock template</strong>
              <div className="small text-muted-2">
                Set a “weekly template” quantity per product. Applying the template resets available stock to those amounts
                {data.templateLastAppliedWeek && ` · last applied ${data.templateLastAppliedWeek}`}.
              </div>
            </div>
          </div>
          <div className="col-lg-5 d-flex gap-3 align-items-center justify-content-lg-end flex-wrap">
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" role="switch" id="autoTpl" checked={data.autoApplyTemplate} onChange={(e) => toggleAuto(e.target.checked)} disabled={!approved} />
              <label className="form-check-label small fw-semi" htmlFor="autoTpl">
                Auto-apply every week
              </label>
            </div>
            <button type="button" className="btn btn-lime btn-sm" onClick={applyTemplate} disabled={!approved || applying}>
              {applying ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-lightning-charge" />} Apply now
            </button>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="tabs-pill">
            {[
              ['', 'All'],
              ['available', 'Available'],
              ['sold_out', 'Sold out'],
              ['unavailable', 'Unavailable'],
            ].map(([v, l]) => (
              <button key={v} type="button" className={status === v ? 'active' : ''} onClick={() => setParams(v ? { status: v } : {})}>
                {l}
              </button>
            ))}
          </div>
          <div className="search-pill" style={{ maxWidth: 260 }}>
            <i className="bi bi-search" />
            <input placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search products" />
          </div>
        </div>
        {products.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No products here" message={approved ? 'Add your first product to start taking pre-orders.' : 'You can add products once your stall is approved.'} />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>In stock</th>
                  <th>Weekly template</th>
                  <th>Status</th>
                  <th>Sold</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="thumb-sm" style={{ background: p.category?.color }}>
                          <img src={p.image} alt="" className={p.image?.includes('/seed/') ? '' : 'photo'} />
                        </span>
                        <div>
                          <strong className="d-block small">{p.name}</strong>
                          <span className="fs-7 text-muted-2">{p.category?.name}</span>
                          {p.isRemoved && <div className="fs-7 text-danger">Removed: {p.removedReason}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="small fw-semi text-nowrap">
                      {money(p.price)}/{p.unit}
                    </td>
                    <td>
                      <NumberCell key={`q${p.quantityAvailable}`} value={p.quantityAvailable} label={`Stock of ${p.name}`} disabled={!approved} onSave={(n) => quickUpdate(p, { quantityAvailable: n })} />
                    </td>
                    <td>
                      <NumberCell key={`t${p.templateQuantity}`} value={p.templateQuantity} label={`Weekly template of ${p.name}`} disabled={!approved} onSave={(n) => quickUpdate(p, { templateQuantity: n })} />
                    </td>
                    <td>
                      <select className="form-select form-select-sm" style={{ width: 140 }} value={p.status} onChange={(e) => setStatus(p, e.target.value)} aria-label={`Status of ${p.name}`} disabled={!approved}>
                        <option value="available">Available</option>
                        <option value="sold_out">Sold out</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                      <div className="mt-1 d-lg-none">
                        <StatusBadge status={p.status} />
                      </div>
                    </td>
                    <td className="small">{p.totalSold}</td>
                    <td className="text-end text-nowrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-white btn-icon"
                        onClick={() => {
                          setEditing(p);
                          setFormOpen(true);
                        }}
                        aria-label={`Edit ${p.name}`}
                        disabled={!approved}
                      >
                        <i className="bi bi-pencil" />
                      </button>{' '}
                      <button type="button" className="btn btn-sm btn-white btn-icon" onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`} disabled={!approved}>
                        <i className="bi bi-trash3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <ProductForm
          key={editing?._id || 'new'}
          product={editing}
          categories={catData?.categories || []}
          units={data.units}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            reload();
          }}
        />
      )}
      <ConfirmModal open={Boolean(deleting)} title={`Delete ${deleting?.name}?`} message="Customers will no longer see this product. Past orders keep their history." confirmLabel="Delete" danger onConfirm={remove} onClose={() => setDeleting(null)} />
    </>
  );
}
