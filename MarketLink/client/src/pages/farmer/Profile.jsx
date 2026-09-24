import { useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api, toFormData } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DashHeader } from '../../components/common/PageHeader';
import { PageLoader } from '../../components/common/Loader';
import { ImageInput } from './Products';
import { PasswordForm } from '../customer/Profile';
import ProfilePhoto from '../../components/common/ProfilePhoto';
import { ApprovalBanner } from './Dashboard';

export default function FarmerProfile() {
  useDocumentTitle('Stall profile');
  const { data, setData } = useFetch('/farmer/me');
  if (!data) return <PageLoader />;
  return <ProfileEditor data={data} setData={setData} />;
}

function ProfileEditor({ data, setData }) {
  const { user, refresh } = useAuth();
  const { data: catData } = useFetch('/categories');
  const { toast } = useToast();
  const [form, setForm] = useState(() => {
    const f = data.farmer;
    return {
      stallName: f.stallName,
      contactPerson: f.contactPerson,
      phone: f.phone,
      address: f.address,
      city: f.city || '',
      bio: f.bio || '',
      tags: (f.tags || []).join(', '),
      categories: (f.categories || []).map((c) => c._id || c),
    };
  });
  const [logo, setLogo] = useState(null);
  const [cover, setCover] = useState(null);
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.upload('PUT', '/farmer/profile', toFormData(form, { logo, coverImage: cover }));
      setData(res);
      setLogo(null);
      setCover(null);
      toast('Stall profile saved');
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DashHeader
        title="Stall profile"
        subtitle="This is what customers see on your public stall page."
        actions={
          data.farmer.isActive && (
            <Link to={`/farmers/${data.farmer.slug}`} className="btn btn-white" target="_blank">
              <i className="bi bi-box-arrow-up-right" /> View public page
            </Link>
          )
        }
      />
      <ApprovalBanner status={user.status} />
      <div className="row g-4">
        <div className="col-xl-7">
          <form className="panel" onSubmit={save}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label" htmlFor="s-name">Stall / business name</label>
                <input id="s-name" name="stallName" className="form-control" required value={form.stallName} onChange={change} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="s-contact">Contact person</label>
                <input id="s-contact" name="contactPerson" className="form-control" required value={form.contactPerson} onChange={change} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="s-phone">Contact number</label>
                <input id="s-phone" name="phone" className="form-control" required pattern="\+?[\d\s\(\)\-]{7,20}" title="7-20 digits, spaces, +, - or brackets" value={form.phone} onChange={change} />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="s-email">E-mail</label>
                <input id="s-email" className="form-control" value={data.farmer.email} disabled />
              </div>
              <div className="col-md-8">
                <label className="form-label" htmlFor="s-address">Address</label>
                <input id="s-address" name="address" className="form-control" required value={form.address} onChange={change} />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="s-city">City</label>
                <input id="s-city" name="city" className="form-control" value={form.city} onChange={change} />
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="s-bio">About your farm</label>
                <textarea id="s-bio" name="bio" rows={4} className="form-control" value={form.bio} onChange={change} maxLength={1200} />
              </div>
              <div className="col-12">
                <span className="form-label d-block">What you grow / sell</span>
                <div className="choice-grid" role="group" aria-label="Categories">
                  {(catData?.categories || []).map((c) => {
                    const on = form.categories.includes(c._id);
                    return (
                      <button
                        type="button"
                        key={c._id}
                        className={`choice-tile ${on ? 'active' : ''}`}
                        aria-pressed={on}
                        onClick={() => setForm({ ...form, categories: on ? form.categories.filter((x) => x !== c._id) : [...form.categories, c._id] })}
                      >
                        <img src={c.icon} alt="" /> {c.name}
                        <i className="bi bi-check-circle-fill check" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="col-12">
                <label className="form-label" htmlFor="s-tags">Farming practices (comma separated)</label>
                <input id="s-tags" name="tags" className="form-control" value={form.tags} onChange={change} placeholder="Pesticide-free, Family farm" />
              </div>
              <div className="col-md-6">
                <ImageInput label="Logo" current={data.farmer.logo} file={logo} onFile={setLogo} />
              </div>
              <div className="col-md-6">
                <ImageInput label="Cover photo" current={data.farmer.coverImage} file={cover} onFile={setCover} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-4" disabled={busy}>
              {busy && <span className="spinner-border spinner-border-sm" />} Save profile
            </button>
          </form>
        </div>
        <div className="col-xl-5 d-flex flex-column gap-4">
          <div className="panel">
            <div className="panel-head">
              <h5>
                <i className="bi bi-person-circle" /> Your photo
              </h5>
            </div>
            <ProfilePhoto subtitle={`Contact person · ${data.farmer.stallName}`} />
            <p className="small text-muted-2 mb-0">Shown in the menu and on your dashboard. Your stall logo and cover photo are set on the left.</p>
          </div>
          <PasswordForm />
        </div>
      </div>
    </>
  );
}
