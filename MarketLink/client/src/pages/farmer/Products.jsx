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
import { money, offerPercent } from '../../utils/format';
import { CURRENCY } from '../../config';
import SearchSelect from '../../components/common/SearchSelect';
import { categoryName, productName, t, unitName } from '../../i18n';

const EMPTY = { name: '', nameUr: '', category: '', price: '', compareAtPrice: '', unit: 'kg', quantityAvailable: '', templateQuantity: '', description: '', descriptionUr: '', metaTitle: '', metaDescription: '', keywords: '', schemaSummary: '', schemaSeason: '', schemaStorage: '', schemaUses: '' };

const SCHEMA_KEYS = ['schemaSummary', 'schemaSeason', 'schemaStorage', 'schemaUses'];
const SOURCE_LABEL = { claude: 'Written by AI (Claude)', builtin: 'Written by the built-in AI', farmer: 'Written by you' };

const clipText = (text, n) => {
  const tx = String(text || '').replace(/\s+/g, ' ').trim();
  return tx.length > n ? `${tx.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : tx;
};

/**
 * Optional search engine (SEO) details: the title and text Google shows, and keywords that also help
 * the MarketLink search. "Write with AI" fills them (and the product schema below) from the product.
 */
function SeoFields({ form, setForm, onAi, aiBusy }) {
  // Open at the start when something is filled in; afterwards only the farmer opens or closes it
  // (it must not snap shut while the last field is being cleared)
  const [open, setOpen] = useState(() => Boolean(form.metaTitle || form.metaDescription || form.keywords));
  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const words = form.keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  return (
    <details className="seo-fields" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <i className="bi bi-google" aria-hidden="true" /> {t('Search engines (SEO)')} <span className="text-muted-2 fw-normal">{t('· optional, helps people find this product on Google')}</span>
      </summary>
      <div className="row g-3 mt-1">
        <div className="col-12 d-flex justify-content-between align-items-center gap-2 flex-wrap">
          <span className="small text-muted-2">{t('Leave empty to use the product name and description.')}</span>
          <button type="button" className="btn btn-sm btn-ai" onClick={onAi} disabled={form.name.trim().length < 2 || aiBusy}>
            {aiBusy ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-stars" aria-hidden="true" />} {t('Fill in with AI')}
          </button>
        </div>
        <div className="col-md-6">
          <label className="form-label d-flex justify-content-between" htmlFor="pf-mtitle">
            {t('SEO title')} <span className="text-muted-2 fw-normal">{form.metaTitle.length}/70</span>
          </label>
          <input id="pf-mtitle" name="metaTitle" className="form-control" maxLength={70} value={form.metaTitle} onChange={change} placeholder={form.name ? t('{name}, fresh from the farm', { name: form.name }) : t('e.g. Sindhri mangoes, fresh fruit')} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="pf-keywords">{t('Keywords')}</label>
          <input id="pf-keywords" name="keywords" className="form-control" value={form.keywords} onChange={change} placeholder={t('mangoes, sindhri, fresh fruit')} aria-describedby="pf-keywords-help" />
          <div id="pf-keywords-help" className="form-text">
            {t('Separate with commas, up to 12.')} {words.length > 0 && <span className={words.length > 12 ? 'text-danger' : ''}>{t('{n} added.', { n: words.length })}</span>}
          </div>
        </div>
        <div className="col-12">
          <label className="form-label d-flex justify-content-between" htmlFor="pf-mdesc">
            {t('SEO description')} <span className="text-muted-2 fw-normal">{form.metaDescription.length}/170</span>
          </label>
          <textarea id="pf-mdesc" name="metaDescription" rows={2} className="form-control" maxLength={170} value={form.metaDescription} onChange={change} placeholder={t('One or two sentences shown under the title in Google.')} />
        </div>
        <div className="col-12">
          <div className="seo-preview" aria-label={t('Google preview')}>
            <span className="seo-preview-url">marketlink.pk › products › {(form.name || 'your-product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span>
            <strong className="seo-preview-title">{form.metaTitle || form.name || t('Product name')} · MarketLink</strong>
            <span className="seo-preview-desc">{form.metaDescription || clipText(form.description, 160) || t('Your description appears here.')}</span>
          </div>
        </div>
      </div>
    </details>
  );
}

/**
 * Product schema (schema.org structured data) for Google and AI assistants: a one-sentence summary,
 * the season, a storage tip and what the product is best for. Written by AI automatically when the
 * product is saved; the farmer can correct any of it.
 */
function SchemaFields({ form, onChange, source, onAi, aiBusy, categoryName }) {
  const [open, setOpen] = useState(() => Boolean(form.schemaSummary));
  const preview = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: form.name || t('Product name'),
    alternateName: form.nameUr || undefined,
    disambiguatingDescription: form.schemaSummary || undefined,
    category: categoryName ? `Fresh food > ${categoryName}` : undefined,
    additionalProperty: [
      ['Season', form.schemaSeason],
      ['Storage', form.schemaStorage],
      ['Best for', form.schemaUses],
    ]
      .filter(([, v]) => v)
      .map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
    offers: { '@type': 'Offer', price: Number(form.price) || undefined, priceCurrency: 'PKR', availableDeliveryMethod: 'Pickup at the market' },
  };
  return (
    <details className="seo-fields schema-fields" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>
        <i className="bi bi-diagram-3" aria-hidden="true" /> {t('Product schema')} <span className="text-muted-2 fw-normal">{t('· structured data for Google and AI assistants')}</span>
      </summary>
      <div className="row g-3 mt-1">
        <div className="col-12 d-flex justify-content-between align-items-center gap-2 flex-wrap">
          <span className="small text-muted-2">
            {source ? (
              <span className="chip chip-soft">
                <i className="bi bi-stars" aria-hidden="true" /> {t(SOURCE_LABEL[source])}
              </span>
            ) : (
              t('Leave empty: AI writes it when you save.')
            )}
          </span>
          <button type="button" className="btn btn-sm btn-ai" onClick={onAi} disabled={form.name.trim().length < 2 || aiBusy}>
            {aiBusy ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-stars" aria-hidden="true" />} {source ? t('Write the schema again with AI') : t('Write the schema with AI')}
          </button>
        </div>
        <div className="col-12">
          <label className="form-label d-flex justify-content-between" htmlFor="pf-ssum">
            {t('Summary')} <span className="text-muted-2 fw-normal">{form.schemaSummary.length}/300</span>
          </label>
          <textarea id="pf-ssum" name="schemaSummary" rows={2} className="form-control" maxLength={300} value={form.schemaSummary} onChange={onChange} placeholder={t('One sentence: what it is, who grows it, price and unit.')} />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="pf-sseason">{t('Season')}</label>
          <input id="pf-sseason" name="schemaSeason" className="form-control" maxLength={80} value={form.schemaSeason} onChange={onChange} placeholder={t('e.g. May to August')} />
        </div>
        <div className="col-md-8">
          <label className="form-label" htmlFor="pf-suses">{t('Best for')}</label>
          <input id="pf-suses" name="schemaUses" className="form-control" maxLength={200} value={form.schemaUses} onChange={onChange} placeholder={t('e.g. Salads, raita and summer drinks')} />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="pf-sstore">{t('How to keep it')}</label>
          <input id="pf-sstore" name="schemaStorage" className="form-control" maxLength={200} value={form.schemaStorage} onChange={onChange} placeholder={t('e.g. Refrigerate and use within a week.')} />
        </div>
        <div className="col-12">
          <details className="schema-code">
            <summary className="small fw-semi">{t('Show the structured data (JSON-LD)')}</summary>
            <pre>{JSON.stringify(preview, null, 2)}</pre>
          </details>
        </div>
      </div>
    </details>
  );
}

export function ImageInput({ label = t('Image'), current, file, onFile }) {
  // Temporary browser URL so the chosen image can be previewed before upload
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);
  return (
    <div>
      <span className="form-label d-block">{label}</span>
      <label className="upload-box" style={{ cursor: 'pointer' }}>
        <span className="preview">{preview || current ? <img src={preview || current} alt="" /> : <i className="bi bi-image fs-3 text-muted-2" />}</span>
        <span className="small">
          <strong className="d-block">{file ? file.name : t('Choose an image')}</strong>
          <span className="text-muted-2">{t('JPG, PNG or WEBP · max 2 MB')}</span>
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
        {t('More photos')} <span className="text-muted-2 fw-normal">{t('(optional, up to {n})', { n: MAX_GALLERY })}</span>
      </span>
      <div className="gallery-input">
        {current.map((g) => {
          const gone = removed.includes(g.url);
          return (
            <div key={g.url} className={`gallery-thumb ${gone ? 'is-removed' : ''}`}>
              <img src={g.url} alt="" />
              <button type="button" onClick={() => onToggleRemove(g.url)} aria-label={gone ? t('Keep this photo') : t('Remove this photo')} title={gone ? t('Keep') : t('Remove')}>
                <i className={`bi ${gone ? 'bi-arrow-counterclockwise' : 'bi-x-lg'}`} />
              </button>
            </div>
          );
        })}
        {files.map((f, i) => (
          <div key={previews[i]} className="gallery-thumb is-new">
            <img src={previews[i]} alt="" />
            <button type="button" onClick={() => onFiles(files.filter((_, j) => j !== i))} aria-label={t('Remove {name}', { name: f.name })} title={t('Remove')}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        ))}
        {room > 0 && (
          <label className="gallery-add">
            <i className="bi bi-images" aria-hidden="true" />
            <span>{t('Add photos')}</span>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="d-none"
              aria-label={t('Add more product photos')}
              onChange={(e) => {
                onFiles([...files, ...Array.from(e.target.files || [])].slice(0, MAX_GALLERY - kept));
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>
      <span className="fs-7 text-muted-2">{t('Show the harvest, the packing or the farm. JPG, PNG or WEBP, max 2 MB each.')}</span>
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
          compareAtPrice: product.compareAtPrice || '',
          unit: product.unit,
          quantityAvailable: product.quantityAvailable,
          templateQuantity: product.templateQuantity,
          nameUr: product.nameUr || '',
          description: product.description || '',
          descriptionUr: product.descriptionUr || '',
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          keywords: (product.keywords || []).join(', '),
          schemaSummary: product.aiSchema?.summary || '',
          schemaSeason: product.aiSchema?.season || '',
          schemaStorage: product.aiSchema?.storage || '',
          schemaUses: product.aiSchema?.uses || '',
        }
      : EMPTY
  );
  // Product schema: sent only when it was written with AI in this form or changed by hand
  const [schema, setSchema] = useState({ dirty: false, source: product?.aiSchema?.source || '' });
  const [aiBusy, setAiBusy] = useState(false);
  const changeSchema = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSchema({ dirty: true, source: 'farmer' });
  };

  // "Write with AI" for SEO + product schema (+ the Urdu name when it is empty)
  async function writeSeoWithAi() {
    setAiBusy(true);
    try {
      const res = await api.post('/farmer/products/ai-seo', { name: form.name, category: form.category, unit: form.unit, price: form.price, description: form.description });
      setForm((f) => ({
        ...f,
        nameUr: f.nameUr || res.nameUr || '',
        metaTitle: res.metaTitle || f.metaTitle,
        metaDescription: res.metaDescription || f.metaDescription,
        keywords: (res.keywords || []).join(', ') || f.keywords,
        schemaSummary: res.summary || '',
        schemaSeason: res.season || '',
        schemaStorage: res.storage || '',
        schemaUses: res.uses || '',
      }));
      setSchema({ dirty: true, source: res.source });
      toast(res.source === 'claude' ? t('Written by AI (Claude). Check it and save.') : t('Written by the built-in AI. Check it and save.'));
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setAiBusy(false);
    }
  }
  const [file, setFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [removeGallery, setRemoveGallery] = useState([]);
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const [writing, setWriting] = useState(false);
  const [variant, setVariant] = useState(0);

  // "Write with AI": a description from the product name, category, unit and the farm's practices
  async function writeDescription() {
    if (form.name.trim().length < 2) return toast(t('Type the product name first'), 'warning');
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
      const payload = { ...form };
      if (schema.dirty) payload.schemaSource = schema.source;
      else SCHEMA_KEYS.forEach((k) => delete payload[k]);
      const fd = toFormData(payload, { image: file });
      galleryFiles.forEach((f) => fd.append('gallery', f));
      if (removeGallery.length) fd.append('removeGallery', removeGallery.join(','));
      if (product) await api.upload('PUT', `/farmer/products/${product._id}`, fd);
      else await api.upload('POST', '/farmer/products', fd);
      toast(product ? t('Product updated') : t('Product added to your stall'));
      onSaved();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={product ? t('Edit {name}', { name: productName(product) }) : t('Add a product')} size="modal-lg">
      <form onSubmit={submit}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="pf-name">{t('Product name')}</label>
            <input id="pf-name" name="name" className="form-control" required value={form.name} onChange={change} maxLength={100} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="pf-nameur">
              {t('Name in Urdu')} <span className="text-muted-2 fw-normal">{t('(optional)')}</span>
            </label>
            <input id="pf-nameur" name="nameUr" className="form-control" dir="rtl" lang="ur" value={form.nameUr} onChange={change} maxLength={100} placeholder="مثلاً سندھڑی آم" />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="pf-cat">{t('Category')}</label>
            <SearchSelect id="pf-cat" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} required ariaLabel={t('Category')} options={categories.map((c) => ({ value: c._id, label: c.name }))} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="pf-price">{t('Price ({currency})', { currency: t(CURRENCY) })}</label>
            <input id="pf-price" name="price" type="number" min="0" step="0.01" className="form-control" required value={form.price} onChange={change} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="pf-unit">{t('Unit')}</label>
            <SearchSelect id="pf-unit" value={form.unit} onChange={(v) => setForm((f) => ({ ...f, unit: v }))} ariaLabel={t('Unit')} options={units.map((u) => ({ value: u, label: u }))} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="pf-qty">{t('Available now')}</label>
            <input id="pf-qty" name="quantityAvailable" type="number" min="0" className="form-control" value={form.quantityAvailable} onChange={change} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="pf-tpl">{t('Weekly template')}</label>
            <input id="pf-tpl" name="templateQuantity" type="number" min="0" className="form-control" value={form.templateQuantity} onChange={change} placeholder={t('same as stock')} />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="pf-was">
              {t('Usual price, for an offer')} <span className="text-muted-2 fw-normal">{t('(optional)')}</span>
            </label>
            <input id="pf-was" name="compareAtPrice" type="number" min="0" step="0.01" className="form-control" value={form.compareAtPrice} onChange={change} aria-describedby="pf-was-help" />
            <div id="pf-was-help" className="form-text">
              {offerPercent(form) > 0 ? t('Customers see {old} crossed out and "{n}% off".', { old: money(form.compareAtPrice), n: offerPercent(form) }) : t('Selling for less this week? Type the usual price here. Leave it empty when there is no offer.')}
            </div>
          </div>
          <div className="col-12">
            <div className="d-flex align-items-end justify-content-between gap-2 mb-1">
              <label className="form-label mb-0" htmlFor="pf-desc">{t('Description')}</label>
              <button type="button" className="btn btn-sm btn-ai" onClick={writeDescription} disabled={writing}>
                {writing ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-stars" />} {variant ? t('Try another') : t('Write with AI')}
              </button>
            </div>
            <textarea id="pf-desc" name="description" rows={3} className="form-control" value={form.description} onChange={change} maxLength={1500} placeholder={t('Type the product name, then press Write with AI')} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="pf-desc-ur">
              {t('Description in Urdu')} <span className="text-muted-2 fw-normal">{t('(optional)')}</span>
            </label>
            <textarea id="pf-desc-ur" name="descriptionUr" rows={2} className="form-control" dir="rtl" lang="ur" value={form.descriptionUr} onChange={change} maxLength={1800} />
          </div>
          <div className="col-12">
            <SeoFields form={form} setForm={setForm} onAi={writeSeoWithAi} aiBusy={aiBusy} />
          </div>
          <div className="col-12">
            <SchemaFields form={form} onChange={changeSchema} source={schema.source} onAi={writeSeoWithAi} aiBusy={aiBusy} categoryName={categories.find((c) => c._id === form.category)?.name} />
          </div>
          <div className="col-md-5">
            <ImageInput label={t('Main photo')} current={product?.image} file={file} onFile={setFile} />
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
            {t('Cancel')}
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm" />} {product ? t('Save changes') : t('Add product')}
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
    title: t('Product'),
    responsivePriority: 1,
    render: display(
      (v, p) =>
        thumbCell(p.image, productName(p), `${esc(categoryName(p.category))}${p.gallery?.length ? ` · <i class="bi bi-images"></i> ${t('{n} photos', { n: p.gallery.length + 1 })}` : ''}${p.isRemoved ? `<div class="fs-7 text-danger">${t('Removed:')} ${esc(p.removedReason)}</div>` : ''}`, {
          bg: p.category?.color,
          cls: imageKind(p.image),
        }),
      (v, p) => `${v} ${p.category?.name || ''}`
    ),
  },
  { data: 'price', title: t('Price'), className: 'dt-nowrap', render: display((v, p) => `<span class="small fw-semi">${esc(money(v))}/${esc(unitName(p.unit))}</span>`) },
  { data: 'quantityAvailable', title: t('In stock'), responsivePriority: 3, render: display((v, p) => numberInput('quantityAvailable', v, t('Stock of {name}', { name: productName(p) }), !approved)) },
  { data: 'templateQuantity', title: t('Weekly template'), render: display((v, p) => numberInput('templateQuantity', v, t('Weekly template of {name}', { name: productName(p) }), !approved)) },
  { data: 'status', title: t('Status'), responsivePriority: 4, render: display((v, p) => selectInput('status', v, STATUS_OPTIONS.map(([k, l]) => [k, t(l)]), t('Status of {name}', { name: productName(p) }), !approved), (v) => v.replace('_', ' ')) },
  { data: 'totalSold', title: t('Sold'), className: 'text-end' },
  {
    data: null,
    title: t('Actions'),
    orderable: false,
    className: 'text-end text-nowrap no-export',
    responsivePriority: 2,
    render: (v, type, p) => `${iconAction('edit', t('Edit {name}', { name: productName(p) }), 'bi-pencil', 'btn-white', !approved)} ${iconAction('delete', t('Delete {name}?', { name: productName(p) }).replace(/[?؟]$/, ''), 'bi-trash3', 'btn-white', !approved)}`,
  },
];

export default function FarmerProducts() {
  useDocumentTitle(t('Weekly stock'));
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
      toast(t('Saved'));
    } catch (err) {
      toast(err.message, 'error');
      setData((d) => ({ ...d, products: [...d.products] })); // show the saved value again
    }
  }

  async function setStatus(product, next) {
    try {
      const res = await api.patch(`/farmer/products/${product._id}/status`, { status: next });
      replace(res.product);
      toast(t('{name} marked as {v2}', { name: product.name, v2: t(next.replace('_', ' ')) }));
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
      toast(checked ? t('Weekly stock will refresh automatically every week') : t('Automatic weekly refresh turned off'), checked ? 'success' : 'info');
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove() {
    try {
      await api.del(`/farmer/products/${deleting._id}`);
      toast(t('Product deleted'));
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
        title={t('Weekly stock & pricing')}
        subtitle={t('Add products, update quantities and prices, and mark items sold out or temporarily unavailable.')}
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
              <i className="bi bi-plus-lg" /> {t('Add product')}
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
              <strong>{t('Recurring weekly stock template')}</strong>
              <div className="small text-muted-2">
                {data.templateLastAppliedWeek
                  ? t('Set a “weekly template” quantity per product. Applying the template resets available stock to those amounts · last applied {week}.', { week: data.templateLastAppliedWeek })
                  : t('Set a “weekly template” quantity per product. Applying the template resets available stock to those amounts.')}
              </div>
            </div>
          </div>
          <div className="col-lg-5 d-flex gap-3 align-items-center justify-content-lg-end flex-wrap">
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" role="switch" id="autoTpl" checked={data.autoApplyTemplate} onChange={(e) => toggleAuto(e.target.checked)} disabled={!approved} />
              <label className="form-check-label small fw-semi" htmlFor="autoTpl">
                {t('Auto-apply every week')}
              </label>
            </div>
            <button type="button" className="btn btn-lime btn-sm" onClick={applyTemplate} disabled={!approved || applying}>
              {applying ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-lightning-charge" />} {t('Apply now')}
            </button>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="tabs-pill">
            {[
              ['', t('All')],
              ['available', t('Available')],
              ['sold_out', t('Sold out')],
              ['unavailable', t('Unavailable')],
            ].map(([v, l]) => (
              <button key={v} type="button" className={status === v ? 'active' : ''} onClick={() => setParams(v ? { status: v } : {})}>
                {l}
              </button>
            ))}
          </div>
        </div>
        {products.length === 0 ? (
          <div className="p-4">
            <EmptyState title={t('No products here')} message={approved ? t('Add your first product to start taking pre-orders.') : t('You can add products once your stall is approved.')} />
          </div>
        ) : (
          <DataGrid
            key={status}
            data={products}
            columns={stockColumns(approved)}
            order={[]}
            exportName="MarketLink weekly stock"
            searchPlaceholder={t('Search products…')}
            emptyText={t('No products here')}
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
      <ConfirmModal open={Boolean(deleting)} title={t('Delete {name}?', { name: deleting?.name })} message={t('Customers will no longer see this product. Past orders keep their history.')} confirmLabel={t('Delete')} danger onConfirm={remove} onClose={() => setDeleting(null)} />
    </>
  );
}
