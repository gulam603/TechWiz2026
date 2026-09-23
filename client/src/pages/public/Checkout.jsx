import { useCallback, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import PickupPicker from '../../components/order/PickupPicker';
import { PageHero } from '../../components/common/PageHeader';
import { formatDateKey, money, time12 } from '../../utils/format';

function FarmerCheckout({ group, value, onChange }) {
  const handlePickup = useCallback((pickup) => onChange({ ...value, ...pickup }), [value, onChange]);
  return (
    <div className="cart-group">
      <div className="cart-group-head">
        {group.farmer.logo && <img src={group.farmer.logo} alt="" />}
        <div className="flex-grow-1">
          <strong className="d-block">{group.farmer.stallName}</strong>
          <span className="fs-7 text-muted-2">
            {group.items.map((i) => `${i.quantity} × ${i.name}`).join(', ')}
          </span>
        </div>
        <strong>{money(group.subtotal)}</strong>
      </div>
      <div className="p-3 p-md-4">
        <PickupPicker farmerId={group.farmer._id} value={value} onChange={handlePickup} />
        <label className="form-label mt-2" htmlFor={`note-${group.farmer._id}`}>
          Note for the farmer (optional)
        </label>
        <textarea
          id={`note-${group.farmer._id}`}
          className="form-control"
          rows={2}
          maxLength={500}
          placeholder="e.g. Please pick ripe mangoes for today"
          value={value.note || ''}
          onChange={(e) => onChange({ ...value, note: e.target.value })}
        />
      </div>
    </div>
  );
}

export default function Checkout() {
  useDocumentTitle('Checkout');
  const cart = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [choices, setChoices] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const placed = useRef(false);

  const setChoice = useCallback((farmerId, value) => setChoices((c) => ({ ...c, [farmerId]: value })), []);

  if (!cart.items.length && !placed.current) return <Navigate to="/cart" replace />;

  const ready = cart.groups.every((g) => choices[g.farmer._id]?.slotStart);

  async function placeOrder() {
    setError('');
    if (!ready) {
      setError('Please choose a pickup slot for every farmer.');
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
      placed.current = true;
      navigate('/checkout/success', { state: { orders: res.orders }, replace: true });
      cart.clear();
      toast('Pre-order placed! Check your e-mail and notifications.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHero crumbs={[{ label: 'Basket', to: '/cart' }, { label: 'Checkout' }]} title="Choose your pickup" subtitle="Pick a date and time slot for each farmer. You can change or cancel until the farmer's cut-off time." />
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-8 d-grid gap-3">
            {cart.groups.map((g) => (
              <FarmerCheckout key={g.farmer._id} group={g} value={choices[g.farmer._id] || {}} onChange={(v) => setChoice(g.farmer._id, v)} />
            ))}
          </div>
          <div className="col-lg-4">
            <div className="summary-card">
              <h5 className="mb-3">Pickup summary</h5>
              {cart.groups.map((g) => {
                const c = choices[g.farmer._id];
                return (
                  <div key={g.farmer._id} className="info-row">
                    <span>{g.farmer.stallName}</span>
                    <span>{c?.slotStart ? `${formatDateKey(c.pickupDate)}, ${time12(c.slotStart)}` : <em className="text-muted-2 fw-normal">choose a slot</em>}</span>
                  </div>
                );
              })}
              <div className="info-row">
                <span>Customer</span>
                <span>{user.name}</span>
              </div>
              <div className="d-flex justify-content-between align-items-end my-3">
                <span className="fw-semi">Total due at pickup</span>
                <span className="total">{money(cart.total)}</span>
              </div>
              <div className="pay-note mb-3">
                <i className="bi bi-shield-check" />
                <span>Payment is settled in person at pickup. MarketLink never asks for card details.</span>
              </div>
              {error && <div className="alert alert-danger small py-2">{error}</div>}
              <button type="button" className="btn btn-primary btn-lg w-100" onClick={placeOrder} disabled={busy || !ready}>
                {busy ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-check2-circle" />} Place pre-order
              </button>
              <Link to="/cart" className="btn btn-link w-100 mt-1">
                Back to basket
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
