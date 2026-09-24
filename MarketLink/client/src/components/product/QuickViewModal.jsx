import { useState } from 'react';
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
import { PageLoader } from '../common/Loader';
import { DAY_SHORT, money } from '../../utils/format';
import { productPath } from '../../utils/links';

/** Product details in a dialog from the shop grid: photos, price, stock, description, farmer and "add to basket". */
export default function QuickViewModal({ product: summary, onClose }) {
  const { data, error } = useFetch(`/products/${summary.slug || summary._id}`);
  const cart = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const product = data?.product;
  const soldOut = product ? product.status !== 'available' || product.quantityAvailable <= 0 : false;
  const days = product ? [...new Set((product.farmer?.pickupWindows || []).map((w) => w.day))].sort() : [];

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
    <Modal open onClose={onClose} title={summary.name} size="modal-lg quickview-modal">
      {error ? (
        <p className="text-danger mb-0">{error.message}</p>
      ) : !product ? (
        <PageLoader />
      ) : (
        <div className="row g-4">
          <div className="col-md-6">
            <ProductGallery product={product} zoom={false}>
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
            <Link to={`/farmers/${product.farmer.slug}`} className="farmer-mini mb-3" onClick={onClose}>
              <span className="logo">
                <img src={product.farmer.logo} alt="" />
              </span>
              <span className="flex-grow-1 min-w-0">
                <span className="fs-7 text-muted-2 d-block">Grown & sold by</span>
                <strong className="d-block text-truncate small">{product.farmer.stallName}</strong>
                {days.length > 0 && <span className="fs-7 text-muted-2">Pickup: {days.map((d) => DAY_SHORT[d]).join(', ')}</span>}
              </span>
            </Link>
            <div className="d-flex align-items-center gap-2 mt-auto flex-wrap">
              <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, product.quantityAvailable)} />
              <button type="button" className="btn btn-primary flex-grow-1" onClick={add} disabled={soldOut}>
                <i className="bi bi-basket2" /> {soldOut ? 'Sold out' : `Add to basket · ${money(product.price * qty)}`}
              </button>
            </div>
            <Link to={productPath(product)} className="link-arrow small mt-3" onClick={onClose}>
              View full details and reviews <i className="bi bi-arrow-right" />
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
