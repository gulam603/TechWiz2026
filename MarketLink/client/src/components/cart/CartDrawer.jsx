import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProduceImage from '../common/ProduceImage';
import QuantityStepper from '../common/QuantityStepper';
import { money } from '../../utils/format';
import { productPath } from '../../utils/links';

/** Basket in a sidebar on the right: lines per farmer, quantities, total, full basket and checkout. */
export default function CartDrawer() {
  const cart = useCart();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const panel = useRef(null);
  const { drawerOpen: open, closeDrawer } = cart;

  // Close when the page changes
  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && closeDrawer();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, closeDrawer]);

  const go = (to) => {
    closeDrawer();
    navigate(to);
  };
  const canOrder = !user || user.role === 'customer';

  return createPortal(
    <div className={`cart-drawer-root ${open ? 'is-open' : ''}`} inert={!open}>
      <button type="button" className="cart-drawer-backdrop" aria-label="Close basket" tabIndex={-1} onClick={closeDrawer} />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Your basket" tabIndex={-1} ref={panel}>
        <header className="cart-drawer-head">
          <div>
            <h5 className="mb-0">Your basket</h5>
            <span className="fs-7 text-muted-2">
              {cart.count} item{cart.count === 1 ? '' : 's'}
              {cart.groups.length > 0 && ` from ${cart.groups.length} farmer${cart.groups.length === 1 ? '' : 's'}`}
            </span>
          </div>
          <button type="button" className="btn-close" onClick={closeDrawer} aria-label="Close basket" />
        </header>

        {cart.items.length === 0 ? (
          <div className="cart-drawer-empty">
            <img src="/illustrations/basket.webp" alt="" width={96} />
            <strong>Your basket is empty</strong>
            <span className="small text-muted-2">Add fresh produce from local farmers, then pick a pickup slot.</span>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => go('/products')}>
              Browse products
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer-body">
              {cart.groups.map((g) => (
                <section key={g.farmer._id} className="cart-drawer-group">
                  <div className="cart-drawer-farmer">
                    {g.farmer.logo && <img src={g.farmer.logo} alt="" />}
                    <Link to={`/farmers/${g.farmer.slug}`} className="flex-grow-1 text-truncate">
                      {g.farmer.stallName}
                    </Link>
                    <strong className="small">{money(g.subtotal)}</strong>
                  </div>
                  {g.items.map((item) => (
                    <div key={item.productId} className="cart-drawer-line">
                      <ProduceImage src={item.image} color={item.categoryColor} className="cart-drawer-thumb" />
                      <div className="min-w-0 flex-grow-1">
                        <Link to={productPath(item)} className="d-block text-truncate fw-semi small text-reset">
                          {item.name}
                        </Link>
                        <span className="fs-7 text-muted-2">
                          {money(item.price)} / {item.unit}
                        </span>
                        <div className="d-flex align-items-center justify-content-between mt-1">
                          <QuantityStepper value={item.quantity} max={item.maxQty || 999} onChange={(q) => cart.update(item.productId, q)} size="sm" />
                          <strong className="small">{money(item.price * item.quantity)}</strong>
                        </div>
                      </div>
                      <button type="button" className="cart-drawer-remove" onClick={() => cart.remove(item.productId)} aria-label={`Remove ${item.name}`} title="Remove">
                        <i className="bi bi-x-lg" />
                      </button>
                    </div>
                  ))}
                </section>
              ))}
            </div>
            <footer className="cart-drawer-foot">
              <div className="d-flex justify-content-between align-items-end mb-2">
                <span className="fw-semi small">Total due at pickup</span>
                <span className="total">{money(cart.total)}</span>
              </div>
              <p className="fs-7 text-muted-2 mb-3">
                <i className="bi bi-cash-coin" /> No online payment: you pay each farmer when you collect.
              </p>
              {canOrder ? (
                <button type="button" className="btn btn-primary w-100 mb-2" onClick={() => go('/checkout')}>
                  Checkout <i className="bi bi-arrow-right" />
                </button>
              ) : (
                <div className="alert alert-warning small py-2 mb-2">Only customer accounts can place pre-orders.</div>
              )}
              <button type="button" className="btn btn-white w-100" onClick={() => go('/cart')}>
                <i className="bi bi-basket2" /> View full basket
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>,
    document.body
  );
}
