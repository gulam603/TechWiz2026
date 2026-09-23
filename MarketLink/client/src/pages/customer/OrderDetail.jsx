import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import OrderTimeline from '../../components/order/OrderTimeline';
import PickupPicker from '../../components/order/PickupPicker';
import DirectionsMap from '../../components/map/DirectionsMap';
import StatusBadge from '../../components/common/StatusBadge';
import QuantityStepper from '../../components/common/QuantityStepper';
import Modal, { ConfirmModal } from '../../components/common/Modal';
import { StarInput } from '../../components/common/RatingStars';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import FarmerOrderActions from '../farmer/FarmerOrderActions';
import { formatDate, formatDateKey, money, time12, timeUntil } from '../../utils/format';

function ModifyModal({ order, open, onClose, onSaved }) {
  const { toast } = useToast();
  const [items, setItems] = useState(order.items.map((i) => ({ productId: i.product, name: i.name, price: i.price, unit: i.unit, quantity: i.quantity })));
  const [pickup, setPickup] = useState({ pickupDate: order.pickupDate, marketId: order.market._id, slotStart: order.pickupSlot.start });
  const [busy, setBusy] = useState(false);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  async function save() {
    if (!pickup.slotStart) return toast('Please choose a pickup slot', 'error');
    setBusy(true);
    try {
      const res = await api.put(`/orders/${order._id}`, {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        pickupDate: pickup.pickupDate,
        slotStart: pickup.slotStart,
        marketId: pickup.marketId,
      });
      toast('Order updated. The farmer will review the changes.');
      onSaved(res.order);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
    return undefined;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Modify ${order.orderNumber}`}
      size="modal-lg"
      footer={
        <>
          <span className="me-auto fw-bold">New total: {money(total)}</span>
          <button type="button" className="btn btn-white" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm" />} Save changes
          </button>
        </>
      }
    >
      <h6>Items</h6>
      {items.map((item, idx) => (
        <div key={item.productId} className="d-flex align-items-center gap-3 py-2 border-bottom">
          <span className="flex-grow-1">
            <strong className="d-block small">{item.name}</strong>
            <span className="fs-7 text-muted-2">
              {money(item.price)} / {item.unit}
            </span>
          </span>
          <QuantityStepper value={item.quantity} onChange={(q) => setItems(items.map((x, i) => (i === idx ? { ...x, quantity: q } : x)))} />
          <button type="button" className="btn btn-sm btn-icon btn-white" disabled={items.length === 1} onClick={() => setItems(items.filter((_, i) => i !== idx))} aria-label={`Remove ${item.name}`}>
            <i className="bi bi-trash3" />
          </button>
        </div>
      ))}
      <h6 className="mt-4">Pickup slot</h6>
      <PickupPicker farmerId={order.farmer._id} value={pickup} onChange={setPickup} excludeOrder={order._id} />
      <p className="fs-7 text-muted-2 mb-0 mt-2">Changing an accepted order sends it back to the farmer for approval.</p>
    </Modal>
  );
}

function ReviewForm({ order, type, item, onDone }) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/reviews', { orderId: order._id, type, productId: item?.product, rating, comment });
      toast('Thanks for your review!');
      onDone();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="border rounded-4 p-3 mb-2 bg-white">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <strong className="small">{type === 'farmer' ? `Rate ${order.farmer.stallName}` : `Rate ${item.name}`}</strong>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <div className="d-flex gap-2">
        <input className="form-control form-control-sm" placeholder="Share a few words (optional)" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} aria-label="Comment" />
        <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
          Post
        </button>
      </div>
    </form>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const cart = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data, loading, error, reload, setData } = useFetch(`/orders/${id}`);
  const [modifying, setModifying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [busy, setBusy] = useState(false);
  useDocumentTitle(data?.order ? `Order ${data.order.orderNumber}` : 'Order');

  if (loading && !data) return <PageLoader />;
  if (error) return <EmptyState title="Order not found" action={<Link to="/" className="btn btn-primary">Go home</Link>} />;

  const { order } = data;
  const isOwner = user.role === 'customer' && order.customer._id === user._id;
  const backLink = user.role === 'farmer' ? '/farmer/orders' : user.role === 'admin' ? '/admin/orders' : '/account/orders';

  async function cancel() {
    setBusy(true);
    try {
      await api.post(`/orders/${order._id}/cancel`);
      toast('Order cancelled. The farmer has been notified.');
      setCancelling(false);
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function reorder() {
    try {
      const res = await api.get(`/orders/${order._id}/reorder`);
      const available = res.items.filter((i) => i.available);
      available.forEach((i) => cart.add(i.product, i.quantity));
      if (!available.length) toast('These items are not available right now', 'error');
      else {
        toast(`${available.length} item(s) added to your basket${available.length < res.items.length ? ' (some are sold out)' : ''}`);
        navigate('/cart');
      }
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  const review = order.review;
  const unreviewedItems = review ? order.items.filter((i) => !review.reviewedProducts.includes(String(i.product))) : [];

  return (
    <>
      <Link to={backLink} className="small fw-semi d-inline-block mb-2">
        <i className="bi bi-arrow-left" /> Back to orders
      </Link>
      <div className="dash-head">
        <div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h1>{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p>
            Placed {formatDate(order.createdAt, { time: true })} · {order.items.length} item(s) · pay at pickup
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {isOwner && order.canModify && (
            <>
              <button type="button" className="btn btn-white" onClick={() => setModifying(true)}>
                <i className="bi bi-pencil" /> Modify
              </button>
              <button type="button" className="btn btn-outline-danger" onClick={() => setCancelling(true)}>
                <i className="bi bi-x-circle" /> Cancel order
              </button>
            </>
          )}
          {isOwner && ['completed', 'cancelled', 'declined'].includes(order.status) && (
            <button type="button" className="btn btn-primary" onClick={reorder}>
              <i className="bi bi-arrow-repeat" /> Reorder
            </button>
          )}
          <button type="button" className="btn btn-white" onClick={() => window.print()}>
            <i className="bi bi-printer" /> Print
          </button>
        </div>
      </div>

      {isOwner && order.canModify && (
        <div className="pay-note mb-3">
          <i className="bi bi-hourglass-split" />
          <span>
            You can modify or cancel this order until <strong>{formatDate(order.cutoffAt, { time: true })}</strong> ({timeUntil(order.cutoffAt)}).
          </span>
        </div>
      )}

      <div className="panel mb-4">
        <OrderTimeline order={order} />
      </div>

      {user.role === 'farmer' && <FarmerOrderActions order={order} onChange={(o) => setData({ order: { ...order, ...o, farmer: order.farmer, market: order.market, customer: order.customer } })} />}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="table-card mb-4">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Qty</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i) => (
                  <tr key={String(i.product)}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="thumb-sm">
                          <img src={i.image} alt="" />
                        </span>
                        <Link to={`/products/${i.product}`} className="fw-semi text-reset">
                          {i.name}
                        </Link>
                      </div>
                    </td>
                    <td className="text-end">
                      {money(i.price)}/{i.unit}
                    </td>
                    <td className="text-end">{i.quantity}</td>
                    <td className="text-end fw-semi">{money(i.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-end fw-bold">
                    Total (pay at pickup)
                  </td>
                  <td className="text-end fw-bold fs-5 text-forest">{money(order.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {(order.customerNote || order.farmerNote) && (
            <div className="panel mb-4">
              {order.customerNote && (
                <p className="mb-2 small">
                  <strong>Customer note:</strong> {order.customerNote}
                </p>
              )}
              {order.farmerNote && (
                <p className="mb-0 small">
                  <strong>Farmer note:</strong> {order.farmerNote}
                </p>
              )}
            </div>
          )}

          {isOwner && review && (
            <div className="panel mb-4">
              <div className="panel-head">
                <h5>
                  <i className="bi bi-star text-warning" /> Rate your order
                </h5>
              </div>
              {!review.farmerReviewed && <ReviewForm order={order} type="farmer" onDone={reload} />}
              {unreviewedItems.map((item) => (
                <ReviewForm key={String(item.product)} order={order} type="product" item={item} onDone={reload} />
              ))}
              {review.farmerReviewed && unreviewedItems.length === 0 && <p className="small text-muted-2 mb-0">Thanks! You've reviewed everything in this order.</p>}
            </div>
          )}
        </div>

        <div className="col-lg-5">
          <div className="panel mb-4">
            <h5 className="mb-3">
              <i className="bi bi-geo-alt text-success" /> Pickup details
            </h5>
            <div className="info-row">
              <span>Date</span>
              <span>{formatDateKey(order.pickupDate, { withYear: true })}</span>
            </div>
            <div className="info-row">
              <span>Time slot</span>
              <span>
                {time12(order.pickupSlot.start)} – {time12(order.pickupSlot.end)}
              </span>
            </div>
            <div className="info-row">
              <span>Market</span>
              <span>
                <Link to={`/markets/${order.market.slug}`}>{order.market.name}</Link>
              </span>
            </div>
            <div className="info-row">
              <span>Address</span>
              <span>{order.market.address}</span>
            </div>
            <div className="info-row">
              <span>Farmer</span>
              <span>
                <Link to={`/farmers/${order.farmer.slug}`}>{order.farmer.stallName}</Link>
                <br />
                <a href={`tel:${order.farmer.phone}`} className="fs-7">
                  {order.farmer.phone}
                </a>
              </span>
            </div>
            {user.role !== 'customer' && (
              <div className="info-row">
                <span>Customer</span>
                <span>
                  {order.customer.name}
                  <br />
                  <a href={`tel:${order.customer.phone}`} className="fs-7">
                    {order.customer.phone}
                  </a>
                </span>
              </div>
            )}
            <div className="mt-3">
              <DirectionsMap
                destination={{ lat: order.market.latitude, lng: order.market.longitude, title: order.market.name, subtitle: `Pickup ${time12(order.pickupSlot.start)}` }}
                extraMarkers={order.farmer.latitude ? [{ id: 'stall', lat: order.farmer.latitude, lng: order.farmer.longitude, type: 'farmer', image: order.farmer.logo, title: order.farmer.stallName, subtitle: 'Farmer stall' }] : []}
                height={260}
              />
            </div>
          </div>
        </div>
      </div>

      {modifying && (
        <ModifyModal
          order={order}
          open={modifying}
          onClose={() => setModifying(false)}
          onSaved={() => {
            setModifying(false);
            reload();
          }}
        />
      )}
      <ConfirmModal
        open={cancelling}
        title="Cancel this pre-order?"
        message="The reserved items will be released back to the farmer. This cannot be undone."
        confirmLabel="Yes, cancel order"
        danger
        busy={busy}
        onConfirm={cancel}
        onClose={() => setCancelling(false)}
      />
    </>
  );
}
