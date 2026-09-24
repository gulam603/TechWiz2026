import { Link, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProduceImage from '../../components/common/ProduceImage';
import QuantityStepper from '../../components/common/QuantityStepper';
import EmptyState from '../../components/common/EmptyState';
import { PageHero } from '../../components/common/PageHeader';
import { money } from '../../utils/format';
import { productPath } from '../../utils/links';

export default function Cart() {
  useDocumentTitle('Your basket');
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!cart.items.length)
    return (
      <div className="container py-5">
        <EmptyState
          title="Your basket is empty"
          message="Browse this week's harvest and add a few things — you'll choose a pickup slot at checkout."
          action={<Link to="/products" className="btn btn-primary">Start shopping</Link>}
        />
      </div>
    );


  return (
    <>
      <PageHero crumbs={[{ label: 'Basket' }]} title="Your basket" subtitle={`${cart.count} item${cart.count === 1 ? '' : 's'} from ${cart.groups.length} farmer${cart.groups.length === 1 ? '' : 's'}. Each farmer gets its own pickup slot.`} />
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-8 d-grid gap-3">
            {cart.groups.map((g) => (
              <div key={g.farmer._id} className="cart-group">
                <div className="cart-group-head">
                  {g.farmer.logo && <img src={g.farmer.logo} alt="" />}
                  <div className="flex-grow-1">
                    <span className="fs-7 text-muted-2 d-block">Pickup from</span>
                    <Link to={`/farmers/${g.farmer.slug}`} className="fw-bold">
                      {g.farmer.stallName}
                    </Link>
                  </div>
                  <strong>{money(g.subtotal)}</strong>
                </div>
                {g.items.map((item) => (
                  <div key={item.productId} className="cart-line">
                    <div className="thumb">
                      <ProduceImage src={item.image} color={item.categoryColor} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <Link to={productPath(item)} className="name d-block text-truncate text-reset">
                        {item.name}
                      </Link>
                      <span className="small text-muted-2">
                        {money(item.price)} / {item.unit}
                      </span>
                    </div>
                    <QuantityStepper value={item.quantity} max={item.maxQty || 999} onChange={(q) => cart.update(item.productId, q)} />
                    <strong className="d-none d-sm-block text-end" style={{ minWidth: 90 }}>
                      {money(item.price * item.quantity)}
                    </strong>
                    <button type="button" className="btn btn-sm btn-icon btn-white" onClick={() => cart.remove(item.productId)} aria-label={`Remove ${item.name}`}>
                      <i className="bi bi-trash3" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
            <div>
              <button type="button" className="btn btn-link text-danger p-0" onClick={cart.clear}>
                <i className="bi bi-x-circle" /> Empty basket
              </button>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="summary-card">
              <h5 className="mb-3">Order summary</h5>
              {cart.groups.map((g) => (
                <div key={g.farmer._id} className="info-row">
                  <span>{g.farmer.stallName}</span>
                  <span>{money(g.subtotal)}</span>
                </div>
              ))}
              <div className="d-flex justify-content-between align-items-end mt-3 mb-3">
                <span className="fw-semi">Total due at pickup</span>
                <span className="total">{money(cart.total)}</span>
              </div>
              <div className="pay-note mb-3">
                <i className="bi bi-cash-coin" />
                <span>No online payment. You pay each farmer when you collect your order.</span>
              </div>
              {user && user.role !== 'customer' ? (
                <div className="alert alert-warning small mb-0">Only customer accounts can place pre-orders.</div>
              ) : (
                <>
                  <button type="button" className="btn btn-primary btn-lg w-100" onClick={() => navigate('/checkout')}>
                    {user ? 'Choose pickup & checkout' : 'Checkout'} <i className="bi bi-arrow-right" />
                  </button>
                  {!user && (
                    <p className="small text-muted-2 text-center mt-2 mb-0">
                      No account needed · <Link to="/login" state={{ from: '/checkout' }}>Log in</Link> if you have one
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
