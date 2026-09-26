import { useCallback, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import TermsCheckbox from '../../components/legal/TermsCheckbox';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import PickupPicker from '../../components/order/PickupPicker';
import { PageHero } from '../../components/common/PageHeader';
import { formatDateKey, money, time12 } from '../../utils/format';
import SearchSelect from '../../components/common/SearchSelect';
import { listText, productName, rich, t } from '../../i18n';
import PhoneInput from '../../components/common/PhoneInput';

function FarmerCheckout({ group, value, onChange }) {
  const handlePickup = useCallback((pickup) => onChange({ ...value, ...pickup }), [value, onChange]);
  return (
    <div className="cart-group">
      <div className="cart-group-head">
        {group.farmer.logo && <img src={group.farmer.logo} alt="" />}
        <div className="flex-grow-1">
          <strong className="d-block">{group.farmer.stallName}</strong>
          <span className="fs-7 text-muted-2">
            {listText(group.items.map((i) => `${i.quantity} × ${productName(i)}`))}
          </span>
        </div>
        <strong>{money(group.subtotal)}</strong>
      </div>
      <div className="p-3 p-md-4">
        <PickupPicker farmerId={group.farmer._id} value={value} onChange={handlePickup} />
        <label className="form-label mt-2" htmlFor={`note-${group.farmer._id}`}>
          {t('Note for the farmer (optional)')}
        </label>
        <textarea
          id={`note-${group.farmer._id}`}
          className="form-control"
          rows={2}
          maxLength={500}
          placeholder={t('e.g. Please pick ripe mangoes for today')}
          value={value.note || ''}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
        />
      </div>
    </div>
  );
}

/**
 * Checkout without an account: first name, last name, e-mail, number and address.
 * The server creates the customer account, e-mails a generated password and signs them in.
 */
function GuestDetails({ onCreated }) {
  const { quickAccount } = useAuth();
  const { data: cityData } = useFetch('/cities');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', acceptTerms: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (!form.acceptTerms) return setError({ message: t('Please accept the Terms & Conditions to continue.') });
    setBusy(true);
    try {
      const res = await quickAccount(form);
      onCreated({ email: res.user.email, mailNote: res.mailNote });
    } catch (err) {
      setError({ message: err.message, exists: err.details?.exists });
    } finally {
      setBusy(false);
    }
    return undefined;
  }

  return (
    <form className="cart-group guest-details" onSubmit={submit}>
      <div className="cart-group-head">
        <span className="step-dot">1</span>
        <div className="flex-grow-1">
          <strong className="d-block">{t('Your details')}</strong>
          <span className="fs-7 text-muted-2">{t('No account needed. We create one for you and e-mail your password, so you can follow your pickup.')}</span>
        </div>
      </div>
      <div className="p-3 p-md-4">
        {error && (
          <div className="alert alert-danger small py-2">
            {error.message}{' '}
            {error.exists && (
              <Link to="/login" state={{ from: '/checkout' }} className="alert-link">
                {t('Log in')}
              </Link>
            )}
          </div>
        )}
        <div className="row g-3">
          <div className="col-sm-6">
            <label className="form-label" htmlFor="g-first">{t('First name')}</label>
            <input id="g-first" name="firstName" className="form-control" required maxLength={40} autoComplete="given-name" value={form.firstName} onChange={change} />
          </div>
          <div className="col-sm-6">
            <label className="form-label" htmlFor="g-last">{t('Last name')}</label>
            <input id="g-last" name="lastName" className="form-control" required maxLength={40} autoComplete="family-name" value={form.lastName} onChange={change} />
          </div>
          <div className="col-sm-6">
            <label className="form-label" htmlFor="g-email">{t('E-mail')}</label>
            <input id="g-email" name="email" type="email" className="form-control" required autoComplete="email" value={form.email} onChange={change} />
          </div>
          <div className="col-sm-6">
            <label className="form-label" htmlFor="g-phone">{t('Contact number')}</label>
            <PhoneInput id="g-phone" required value={form.phone} onChange={change} />
          </div>
          <div className="col-sm-8">
            <label className="form-label" htmlFor="g-address">{t('Address')}</label>
            <input id="g-address" name="address" className="form-control" required maxLength={200} autoComplete="street-address" value={form.address} onChange={change} />
          </div>
          <div className="col-sm-4">
            <label className="form-label" htmlFor="g-city">{t('City')}</label>
            <SearchSelect id="g-city" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} ariaLabel={t('City')} placeholder={t('Choose…')} options={(cityData?.cities || []).map((c) => ({ value: c.name, label: t(c.name), hint: t(c.province) }))} />
          </div>
          <div className="col-12">
            <TermsCheckbox id="g-terms" checked={form.acceptTerms} onChange={(v) => setForm((f) => ({ ...f, acceptTerms: v }))} />
          </div>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-arrow-right-circle" />} {t('Continue to pickup')}
          </button>
          <span className="small text-muted-2">
            {t('Already have an account?')}{' '}
            <Link to="/login" state={{ from: '/checkout' }}>
              {t('Log in')}
            </Link>
          </span>
        </div>
      </div>
    </form>
  );
}

export default function Checkout() {
  useDocumentTitle(t('Checkout'));
  const cart = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [choices, setChoices] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState(false);
  const [newAccount, setNewAccount] = useState(null);

  const setChoice = useCallback((farmerId, value) => setChoices((c) => ({ ...c, [farmerId]: value })), []);

  if (!cart.items.length && !placed) return <Navigate to="/cart" replace />;
  if (user && user.role !== 'customer') {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">{t('Only customer accounts can place pre-orders. You are logged in as a {role}.', { role: t(user.role) })}</div>
      </div>
    );
  }

  const ready = cart.groups.every((g) => choices[g.farmer._id]?.slotStart);

  async function placeOrder() {
    setError('');
    if (!ready) {
      setError(t('Please choose a pickup slot for every farmer.'));
      return;
    }
    setBusy(true);
    try {
      const groups = cart.groups.map((g) => ({
        farmerId: g.farmer._id,
        marketId: choices[g.farmer._id].marketId,
        pickupDate: choices[g.farmer._id].pickupDate,
        slotStart: choices[g.farmer._id].slotStart,
        note: choices[g.farmer._id].note,
        items: g.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }));
      const res = await api.post('/orders', { groups });
      setPlaced(true);
      navigate(`/checkout/${res.orders.map((o) => o.orderNumber).join('+')}`, { state: { orders: res.orders, newAccount }, replace: true });
      cart.clear();
      toast(t('Pre-order placed! Check your e-mail and notifications.'));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero
        crumbs={[{ label: t('Basket'), to: '/cart' }, { label: t('Checkout') }]}
        title={user ? t('Choose your pickup') : t('Checkout')}
        subtitle={user ? t('Pick a date and time slot for each farmer. You can change or cancel until the farmer\'s cut-off time.') : t('Tell us who is picking up, then choose a pickup slot for each farmer. No payment online.')}
      />
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-8 d-grid gap-3">
            {!user && (
              <GuestDetails
                onCreated={(account) => {
                  setNewAccount(account);
                  // Tell the shopper straight away where the password went
                  toast(t('We created your account and sent your password to {email}.', { email: account.email }), 'success', { title: 'Account created', duration: 9000 });
                }}
              />
            )}
            {newAccount && (
              <div className="account-created">
                <i className="bi bi-person-check-fill" aria-hidden="true" />
                <div>
                  <strong className="d-block">{t('Your account is ready')}</strong>
                  <span className="small">
                    {rich('We e-mailed your password to <b>{email}</b>. You can change it later in Profile & family.', { email: newAccount.email })}
                    {newAccount.mailNote && <span className="d-block text-muted-2">{newAccount.mailNote}</span>}
                  </span>
                </div>
              </div>
            )}
            {user ? (
              cart.groups.map((g) => <FarmerCheckout key={g.farmer._id} group={g} value={choices[g.farmer._id] || {}} onChange={(v) => setChoice(g.farmer._id, v)} />)
            ) : (
              <div className="cart-group checkout-locked">
                <div className="cart-group-head">
                  <span className="step-dot">2</span>
                  <div className="flex-grow-1">
                    <strong className="d-block">{t('Pickup date and time')}</strong>
                    <span className="fs-7 text-muted-2">{cart.groups.length === 1 ? t('Available after your details: one pickup slot for the farmer in your basket.') : t('Available after your details: one pickup slot for each of the {n} farmers in your basket.', { n: cart.groups.length })}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="col-lg-4">
            <div className="summary-card">
              <h5 className="mb-3">{t('Pickup summary')}</h5>
              {cart.groups.map((g) => {
                const c = choices[g.farmer._id];
                return (
                  <div key={g.farmer._id} className="info-row">
                    <span>{g.farmer.stallName}</span>
                    <span>{c?.slotStart ? `${formatDateKey(c.pickupDate)}, ${time12(c.slotStart)}` : <em className="text-muted-2 fw-normal">{t('choose a slot')}</em>}</span>
                  </div>
                );
              })}
              {user && (
                <div className="info-row">
                  <span>{t('Customer')}</span>
                  <span>{user.name}</span>
                </div>
              )}
              <div className="d-flex justify-content-between align-items-end my-3">
                <span className="fw-semi">{t('Total due at pickup')}</span>
                <span className="total">{money(cart.total)}</span>
              </div>
              <div className="pay-note mb-3">
                <i className="bi bi-shield-check" />
                <span>{t('Payment is settled in person at pickup. MarketLink never asks for card details.')}</span>
              </div>
              {error && <div className="alert alert-danger small py-2">{error}</div>}
              <button type="button" className="btn btn-primary btn-lg w-100" onClick={placeOrder} disabled={busy || !ready || !user}>
                {busy ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-check2-circle" />} {t('Place pre-order')}
              </button>
              <Link to="/cart" className="btn btn-link w-100 mt-1">
                {t('Back to basket')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
