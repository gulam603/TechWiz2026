import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api, toFormData } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import DataGrid from '../../components/admin/DataGrid';
import { display, esc, iconAction, numberInput, selectInput, thumbCell } from '../../utils/cells';
import { imageKind } from '../../utils/images';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import { ApprovalBanner } from './Dashboard';
import { money } from '../../utils/format';
import { CURRENCY } from '../../config';
import SearchSelect from '../../components/common/SearchSelect';

const EMPTY = { name: '', category: '', price: '', unit: 'kg', quantityAvailable: '', templateQuantity: '', description: '', metaTitle: '', metaDescription: '', keywords: '' };

const clipText = (text, n) => {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : t;
};

/**
 * Optional search engine (SEO) details: the title and text Google shows, and keywords that also help
 * the MarketLink search. "Fill in for me" writes them from the product name, category and description.
 */
function SeoFields({ form, setForm, categoryName }) {
  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const words = form.keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  function suggest() {
    const name = form.name.trim();
    const cat = (categoryName || '').toLowerCase();
    setForm((f) => ({
      ...f,
      metaTitle: clipText(`${name}${cat ? `, fresh ${cat} from a local farmer` : ''}`, 60),
      metaDescription: clipText(f.description || `Fresh ${name.toLowerCase()} from a local farmer. Pre-order on MarketLink and pay at the stall when you pick it up.`, 160),
      keywords: [...new Set([name.toLowerCase(), `fresh ${name.toLowerCase()}`, cat, cat && `buy ${cat}`, 'local farmer'].filter(Boolean))].join(', '),
    }));
  }

  return (
    <details className="seo-fields" open={Boolean(form.metaTitle || form.metaDescription || form.keywords)}>
      <summary>
        <i className="bi bi-google" aria-hidden="true" /> Search engines (SEO) <span className="text-muted-2 fw-normal">· optional, helps people find this product on Google</span>
      </summary>
      <div className="row g-3 mt-1">
        <div className="col-12 d-flex justify-content-between align-items-center gap-2 flex-wrap">
          <span className="small text-muted-2">Leave empty to use the product name and description.</span>
          <button type="button" className="btn btn-sm btn-soft" onClick={suggest} disabled={form.name.trim().length < 2}>
            <i className="bi bi-magic" aria-hidden="true" /> Fill in for me
          </button>
        </div>
        <div className="col-md-6">
          <label className="form-label d-flex justify-content-between" htmlFor="pf-mtitle">
            SEO title <span className="text-muted-2 fw-normal">{form.metaTitle.length}/70</span>
          </label>
          <input id="pf-mtitle" name="metaTitle" className="form-control" maxLength={70} value={form.metaTitle} onChange={change} placeholder={form.name ? `${form.name}, fresh from the farm` : 'e.g. Sindhri mangoes, fresh fruit'} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="pf-keywords">Keywords</label>
          <input id="pf-keywords" name="keywords" className="form-control" value={form.keywords} onChange={change} placeholder="mangoes, sindhri, fresh fruit" aria-describedby="pf-keywords-help" />
          <div id="pf-keywords-help" className="form-text">
            Separate with commas, up to 12. {words.length > 0 && <span className={words.length > 12 ? 'text-danger' : ''}>{words.length} added.</span>}
          </div>
        </div>
        <div className="col-12">
          <label className="form-label d-flex justify-content-between" htmlFor="pf-mdesc">
            SEO description <span className="text-muted-2 fw-normal">{form.metaDescription.length}/170</span>
          </label>
          <textarea id="pf-mdesc" name="metaDescription" rows={2} className="form-control" maxLength={170} value={form.metaDescription} onChange={change} placeholder="One or two sentences shown under the title in Google." />
        </div>
        <div className="col-12">
          <div className="seo-preview" aria-label="Google preview">
            <span className="seo-preview-url">marketlink.pk › products › {(form.name || 'your-product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
            <strong className="seo-preview-title">{form.metaTitle || form.name || 'Product name'} · MarketLink</strong>
            <span className="seo-preview-desc">{form.metaDescription || clipText(form.description, 160) || 'Your description appears here.'}</span>
          </div>
        </div>
      </div>
    </details>
  );
}

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

const MAX_GALLERY = 4;

/** Extra product photos (up to 4) shown as a gallery on the product page. */
function GalleryInput({ current, removed, onToggleRemove, files, onFiles }) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const kept = current.filter((g) => !removed.includes(g.url)).length;
  const room = MAX_GALLERY - kept - files.length;
  return (
    <div>
      <span className="form-label d-block">
        More photos <span className="text-muted-2 fw-normal">(optional, up to {MAX_GALLERY})</span>
      </span>
      <div className="gallery-input">
        {current.map((g) => {
          const gone = removed.includes(g.url);
          return (
            <div key={g.url} className={`gallery-thumb ${gone ? 'is-removed' : ''}`}>
              <img src={g.url} alt="" />
              <button type="button" onClick={() => onToggleRemove(g.url)} aria-label={gone ? 'Keep this photo' : 'Remove this photo'} title={gone ? 'Keep' : 'Remove'}>
                <i className={`bi ${gone ? 'bi-arrow-counterclockwise' : 'bi-x-lg'}`} />
              </button>
            </div>
          );
        })}
        {files.map((f, i) => (
          <div key={previews[i]} className="gallery-thumb is-new">
            <img src={previews[i]} alt="" />
            <button type="button" onClick={() => onFiles(files.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`} title="Remove">
              <i className="bi bi-x-lg" />
            </button>
          </div>
        ))}
        {room > 0 && (
          <label className="gallery-add">
            <i className="bi bi-images" aria-hidden="true" />
            <span>Add photos</span>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="d-none"
              aria-label="Add more product photos"
              onChange={(e) => {
                onFiles([...files, ...Array.from(e.target.files || [])].slice(0, MAX_GALLERY - kept));
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>
      <span className="fs-7 text-muted-2">Show the harvest, the packing or the farm. JPG, PNG or WEBP, max 2 MB each.</span>
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
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          keywords: (product.keywords || []).join(', '),
        }
      : EMPTY
  );
  const [file, setFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [removeGallery, setRemoveGallery] = useState([]);
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
      galleryFiles.forEach((f) => fd.append('gallery', f));
      if (removeGallery.length) fd.append('removeGallery', removeGallery.join(','));
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
            <SearchSelect id="pf-cat" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} required ariaLabel="Category" options={categories.map((c) => ({ value: c._id, label: c.name }))} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="pf-price">Price ({CURRENCY})</label>
            <input id="pf-price" name="price" type="number" min="0" step="0.01" className="form-control" required value={form.price} onChange={change} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="pf-unit">Unit</label>
            <SearchSelect id="pf-unit" value={form.unit} onChange={(v) => setForm((f) => ({ ...f, unit: v }))} ariaLabel="Unit" options={units.map((u) => ({ value: u, label: u }))} />
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
            <SeoFields form={form} setForm={setForm} categoryName={categories.find((c) => c._id === form.category)?.name} />
          </div>
          <div className="col-md-5">
            <ImageInput label="Main photo" current={product?.image} file={file} onFile={setFile} />
          </div>
          <div className="col-md-7">
            <GalleryInput
              current={product?.gallery || []}
              removed={removeGallery}
              onToggleRemove={(url) => setRemoveGallery((r) => (r.includes(url) ? r.filter((u) => u !== url) : [...r, url]))}
              files={galleryFiles}
              onFiles={setGalleryFiles}
            />
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

const STATUS_OPTIONS = [
  ['available', 'Available'],
  ['sold_out', 'Sold out'],
  ['unavailable', 'Unavailable'],
];

/** Weekly stock table: stock, weekly template and status can be changed right in the table. */
const stockColumns = (approved) => [
  {
    data: 'name',
    title: 'Product',
    responsivePriority: 1,
    render: display(
      (v, p) =>
        thumbCell(p.image, v, `${esc(p.category?.name || '')}${p.gallery?.length ? ` · <i class="bi bi-images"></i> ${p.gallery.length + 1} photos` : ''}${p.isRemoved ? `<div class="fs-7 text-danger">Removed: ${esc(p.removedReason)}</div>` : ''}`, {
          bg: p.category?.color,
          cls: imageKind(p.image),
        }),
      (v, p) => `${v} ${p.category?.name || ''}`
    ),
  },
  { data: 'price', title: 'Price', className: 'dt-nowrap', render: display((v, p) => `<span class="small fw-semi">${esc(money(v))}/${esc(p.unit)}</span>`) },
  { data: 'quantityAvailable', title: 'In stock', responsivePriority: 3, render: display((v, p) => numberInput('quantityAvailable', v, `Stock of ${p.name}`, !approved)) },
  { data: 'templateQuantity', title: 'Weekly template', render: display((v, p) => numberInput('templateQuantity', v, `Weekly template of ${p.name}`, !approved)) },
  { data: 'status', title: 'Status', responsivePriority: 4, render: display((v, p) => selectInput('status', v, STATUS_OPTIONS, `Status of ${p.name}`, !approved), (v) => v.replace('_', ' ')) },
  { data: 'totalSold', title: 'Sold', className: 'text-end' },
  {
    data: null,
    title: 'Actions',
    orderable: false,
    className: 'text-end text-nowrap no-export',
    responsivePriority: 2,
    render: (v, type, p) => `${iconAction('edit', `Edit ${p.name}`, 'bi-pencil', 'btn-white', !approved)} ${iconAction('delete', `Delete ${p.name}`, 'bi-trash3', 'btn-white', !approved)}`,
  },
];

export default function FarmerProducts() {
  useDocumentTitle('Weekly stock');
  const { user } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const { data, loading, reload, setData } = useFetch(`/farmer/products?status=${status}`);
  const { data: catData } = useFetch('/categories');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [applying, setApplying] = useState(false);
  const approved = user.status === 'active';
  const showForm = formOpen || (approved && params.get('new') === '1');

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    if (params.get('new')) {
      const next = new URLSearchParams(params);
      next.delete('new');
      setParams(next, { replace: true });
    }
  }

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
      setData((d) => ({ ...d, products: [...d.products] })); // show the saved value again
    }
  }

  async function setStatus(product, next) {
    try {
      const res = await api.patch(`/farmer/products/${product._id}/status`, { status: next });
      replace(res.product);
      toast(`${product.name} marked as ${next.replace('_', ' ')}`);
    } catch (err) {
      toast(err.message, 'error');
      setData((d) => ({ ...d, products: [...d.products] })); // show the saved status again
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
        </div>
        {products.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No products here" message={approved ? 'Add your first product to start taking pre-orders.' : 'You can add products once your stall is approved.'} />
          </div>
        ) : (
          <DataGrid
            key={status}
            data={products}
            columns={stockColumns(approved)}
            order={[]}
            exportName="MarketLink weekly stock"
            searchPlaceholder="Search products…"
            emptyText="No products here"
            onEdit={(field, p, value) => {
              if (field === 'status') setStatus(p, value);
              else if (value !== '' && Number(value) >= 0 && Number(value) !== p[field]) quickUpdate(p, { [field]: Number(value) });
            }}
            onAction={(name, p) => {
              if (name === 'edit') {
                setEditing(p);
                setFormOpen(true);
              }
              if (name === 'delete') setDeleting(p);
            }}
          />
        )}
      </div>

      {showForm && (
        <ProductForm
          key={editing?._id || 'new'}
          product={editing}
          categories={catData?.categories || []}
          units={data.units}
          onClose={closeForm}
          onSaved={() => {
            closeForm();
            reload();
          }}
        />
      )}
      <ConfirmModal open={Boolean(deleting)} title={`Delete ${deleting?.name}?`} message="Customers will no longer see this product. Past orders keep their history." confirmLabel="Delete" danger onConfirm={remove} onClose={() => setDeleting(null)} />
    </>
  );
}
