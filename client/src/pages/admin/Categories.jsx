import { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api, toFormData } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { PageLoader } from '../../components/common/Loader';
import { ImageInput } from '../farmer/Products';

const EMPTY = { name: '', description: '', color: '#E4F3D8', sortOrder: 0, isActive: true };

export default function AdminCategories() {
  useDocumentTitle('Categories');
  const { toast } = useToast();
  const { data, loading, reload } = useFetch('/admin/categories');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    setFile(null);
    setForm(editing ? { name: editing.name, description: editing.description || '', color: editing.color || '#E4F3D8', sortOrder: editing.sortOrder, isActive: editing.isActive } : EMPTY);
  }, [editing, open]);

  async function save(e) {
    e.preventDefault();
    try {
      const fd = toFormData(form, { icon: file });
      if (editing) await api.upload('PUT', `/admin/categories/${editing._id}`, fd);
      else await api.upload('POST', '/admin/categories', fd);
      toast(editing ? 'Category updated' : 'Category added');
      setOpen(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  async function remove() {
    try {
      await api.del(`/admin/categories/${deleting._id}`);
      toast('Category deleted');
      setDeleting(null);
      reload();
    } catch (err) {
      toast(err.message, 'error');
      setDeleting(null);
    }
  }

  if (loading && !data) return <PageLoader />;
  return (
    <>
      <DashHeader
        title="Product categories"
        subtitle="Master data used by farmers when listing products and by customers when filtering."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <i className="bi bi-plus-lg" /> Add category
          </button>
        }
      />
      <div className="row g-3">
        {data.categories.map((c) => (
          <div key={c._id} className="col-sm-6 col-xl-4">
            <div className="panel d-flex gap-3 align-items-center">
              <span className="thumb-sm" style={{ background: c.color, width: 56, height: 56 }}>
                {c.icon ? <img src={c.icon} alt="" /> : <i className="bi bi-tag" />}
              </span>
              <div className="flex-grow-1 min-w-0">
                <strong className="d-block">{c.name}</strong>
                <span className="fs-7 text-muted-2">
                  {c.productCount} products · order {c.sortOrder}
                </span>
                <div className="mt-1">
                  <StatusBadge status={c.isActive ? 'active' : 'inactive'} label={c.isActive ? 'Active' : 'Hidden'} />
                </div>
              </div>
              <div className="d-flex flex-column gap-1">
                <button
                  type="button"
                  className="btn btn-sm btn-white btn-icon"
                  onClick={() => {
                    setEditing(c);
                    setOpen(true);
                  }}
                  aria-label={`Edit ${c.name}`}
                >
                  <i className="bi bi-pencil" />
                </button>
                <button type="button" className="btn btn-sm btn-white btn-icon" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}>
                  <i className="bi bi-trash3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${editing.name}` : 'Add category'}>
        <form onSubmit={save}>
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label" htmlFor="cat-name">Name</label>
              <input id="cat-name" className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="cat-order">Sort order</label>
              <input id="cat-order" type="number" className="form-control" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="cat-desc">Description</label>
              <input id="cat-desc" className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="col-6">
              <label className="form-label" htmlFor="cat-color">Card colour</label>
              <input id="cat-color" type="color" className="form-control form-control-color w-100" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
            <div className="col-6">
              <label className="form-label" htmlFor="cat-active">Visibility</label>
              <select id="cat-active" className="form-select" value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Hidden</option>
              </select>
            </div>
            <div className="col-12">
              <ImageInput label="Icon" current={editing?.icon} file={file} onFile={setFile} />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-white" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmModal open={Boolean(deleting)} title={`Delete ${deleting?.name}?`} message="Categories that are used by products cannot be deleted — hide them instead." confirmLabel="Delete" danger onConfirm={remove} onClose={() => setDeleting(null)} />
    </>
  );
}
