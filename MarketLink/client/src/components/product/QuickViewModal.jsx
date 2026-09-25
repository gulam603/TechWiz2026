import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal';
import ProductGallery from '../common/ProductGallery';
import RatingStars from '../common/RatingStars';
import StatusBadge from '../common/StatusBadge';
import QuantityStepper from '../common/QuantityStepper';
import FavButton from '../common/FavButton';
import { DAY_SHORT, money } from '../../utils/format';
import { productPath } from '../../utils/links';

/**
 * Product details in a dialog, opened by a product card's "Quick view" or "Add" button: photos,
 * price, stock, farmer and a quantity picker, so the shopper chooses how many before adding.
 * The card's own data shows at once; the full product (gallery, pickup days) loads behind it.
 */
export default function QuickViewModal({ product: summary, onClose, focusAdd = false }) {
  const { data, error } = useFetch(`/products/${summary.slug || summary._id}`);
  const cart = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const addRef = useRef(null);
  const product = data?.product || summary;
  const soldOut = product.status !== 'available' || product.quantityAvailable <= 0;
  const days = [...new Set((product.farmer?.pickupWindows || []).map((w) => w.day))].sort();
  const inCart = cart.items.find((i) => i.productId === product._id);

  // Opened from "Add": the add button gets the focus, so Enter adds straight away
  useEffect(() => {
    if (focusAdd) addRef.current?.focus({ preventScroll: true });
  }, [focusAdd]);

  function add() {
    if (user && user.role !== 'customer') {
      toast('Only customer accounts can place pre-orders', 'error');
      return;
    }
    cart.add(product, qty);
    toast(`${qty} × ${product.name} added to your basket`);
    onClose();
    cart.openDrawer();
  }

  return (
    <Modal open onClose={onClose} title={focusAdd ? 'Add to basket' : summary.name} size="modal-lg quickview-modal">
      {error && <p className="text-danger small">{error.message}</p>}
      <div className="row g-4">
        <div className="col-md-6">
          <ProductGallery key={data ? 'full' : 'summary'} product={product} zoom={false}>
            <div className="position-absolute pd-fav">
              <FavButton type="products" id={product._id} />
            </div>
          </ProductGallery>
        </div>
        <div className="col-md-6 d-flex flex-column">
          <span className="chip chip-soft align-self-start mb-2">{product.category?.name}</span>
          <h3 className="display-font mb-1">{product.name}</h3>
          <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
            <RatingStars value={product.ratingAvg} count={product.ratingCount} />
            <StatusBadge status={soldOut ? 'sold_out' : 'available'} label={soldOut ? 'Sold out' : `${product.quantityAvailable} ${product.unit} available`} />
          </div>
          <div className="price mb-2" style={{ fontSize: '1.6rem' }}>
            {money(product.price)} <span className="unit">per {product.unit}</span>
          </div>
          {product.description && <p className="small text-muted-2 quickview-desc">{product.description}</p>}
          {product.farmer?.slug && (
            <Link to={`/farmers/${product.farmer.slug}`} className="farmer-mini mb-3" onClick={onClose}>
              <span className="logo">{product.farmer.logo ? <img src={product.farmer.logo} alt="" /> : <i className="bi bi-shop" aria-hidden="true" />}</span>
              <span className="flex-grow-1 min-w-0">
                <span className="fs-7 text-muted-2 d-block">Grown & sold by</span>
                <strong className="d-block text-truncate small">{product.farmer.stallName}</strong>
                {days.length > 0 && <span className="fs-7 text-muted-2">Pickup: {days.map((d) => DAY_SHORT[d]).join(', ')}</span>}
              </span>
            </Link>
          )}
          <div className={`qv-buy mt-auto ${focusAdd ? 'is-highlighted' : ''}`}>
            <div className="qv-buy-label">
              <span>How many {product.unit ? `(${product.unit})` : ''}?</span>
              {!soldOut && <strong>{money(product.price * qty)}</strong>}
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, product.quantityAvailable)} label={`How many ${product.unit || ''}`.trim()} />
              <button type="button" ref={addRef} className="btn btn-primary flex-grow-1 qv-add" onClick={add} disabled={soldOut}>
                <i className="bi bi-basket2" /> {soldOut ? 'Sold out' : 'Add to basket'}
              </button>
            </div>
            {inCart && (
              <div className="fs-7 mt-2 text-success fw-semi">
                <i className="bi bi-check-circle" /> {inCart.quantity} already in your basket
              </div>
            )}
          </div>
          <Link to={productPath(product)} className="link-arrow small mt-3" onClick={onClose}>
            View full details and reviews <i className="bi bi-arrow-right" />
          </Link>
        </div>
      </div>
    </Modal>
  );
}
