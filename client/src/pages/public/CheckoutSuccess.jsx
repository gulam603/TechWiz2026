import { Link, Navigate, useLocation } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { formatDateKey, money, time12 } from '../../utils/format';

export default function CheckoutSuccess() {
  useDocumentTitle('Pre-order placed');
  const { state } = useLocation();
  if (!state?.orders) return <Navigate to="/account/orders" replace />;
  return (
    <div className="container py-5" style={{ maxWidth: 760 }}>
      <div className="text-center mb-4">
        <img src="/illustrations/basket.webp" alt="" width={110} className="mb-3" style={{ filter: 'drop-shadow(0 14px 16px rgba(23,59,44,.2))' }} />
        <h1 className="display-font">Your pre-order is in!</h1>
        <p className="text-muted-2">We've told the farmer and sent a confirmation to your e-mail. You'll get an alert when it's ready for pickup.</p>
      </div>
      <div className="d-grid gap-3 mb-4">
        {state.orders.map((o) => (
          <div key={o._id} className="order-card d-flex flex-wrap align-items-center gap-3">
            <div className="flex-grow-1">
              <strong className="d-block">{o.orderNumber}</strong>
              <span className="small text-muted-2">
                Pickup {formatDateKey(o.pickupDate)} · {time12(o.pickupSlot.start)} – {time12(o.pickupSlot.end)}
              </span>
            </div>
            <strong>{money(o.totalAmount)}</strong>
            <Link to={`/account/orders/${o._id}`} className="btn btn-soft btn-sm">
              View order
            </Link>
          </div>
        ))}
      </div>
      <div className="d-flex gap-2 justify-content-center">
        <Link to="/account/orders" className="btn btn-primary">
          My orders
        </Link>
        <Link to="/products" className="btn btn-white">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
