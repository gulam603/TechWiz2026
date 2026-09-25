import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { money } from '../../utils/format';
import ProduceImage from '../common/ProduceImage';
import RatingStars from '../common/RatingStars';
import FavButton from '../common/FavButton';
import { productPath } from '../../utils/links';

const QuickViewModal = lazy(() => import('../product/QuickViewModal'));

export default function ProductCard({ product }) {
  const cart = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const soldOut = product.status !== 'available' || product.quantityAvailable <= 0;
  const low = !soldOut && product.quantityAvailable <= 5;
  // null (closed), 'view' (Quick view) or 'add' (the Add button: choose how many, then add)
  const [quick, setQuick] = useState(null);
  const inCart = cart.items.find((i) => i.productId === product._id);

  function openAdd() {
    if (user && user.role !== 'customer') {
      toast('Only customer accounts can place pre-orders', 'error');
      return;
    }
    setQuick('add');
  }

  return (
    <article className={`product-card ${soldOut ? 'is-soldout' : ''}`}>
      <div className="card-top-badges">
        {soldOut && <span className="chip chip-dark">Sold out</span>}
        {low && <span className="chip chip-warn">Only {product.quantityAvailable} left</span>}
      </div>
      <FavButton type="products" id={product._id} className="fav-btn" />
      <div className="product-media">
        <ProduceImage src={product.image} alt={product.name} color={product.category?.color} />
        <button type="button" className="quickview-btn" onClick={() => setQuick('view')} aria-label={`Quick view: ${product.name}`}>
          <i className="bi bi-eye" aria-hidden="true" /> Quick view
        </button>
      </div>
      <div className="product-body">
        <span className="product-cat">{product.category?.name}</span>
        <h3 className="product-name">
          <Link to={productPath(product)}>{product.name}</Link>
        </h3>
        {product.farmer?.stallName && (
          <div className="product-farmer">
            by <Link to={`/farmers/${product.farmer.slug}`}>{product.farmer.stallName}</Link>
          </div>
        )}
        {product.ratingCount > 0 && (
          <div className="mt-1">
            <RatingStars value={product.ratingAvg} count={product.ratingCount} />
          </div>
        )}
        <div className="product-footer">
          <div className="price">
            {money(product.price)}
            <span className="unit">/ {product.unit}</span>
          </div>
          <button type="button" className="add-btn" onClick={openAdd} disabled={soldOut} aria-haspopup="dialog" aria-label={`Add ${product.name} to basket${inCart ? ` (${inCart.quantity} already in it)` : ''}`} title="Choose how many and add to basket">
            <i className="bi bi-basket2" aria-hidden="true" />
            <span className="add-label">{soldOut ? 'Sold out' : 'Add'}</span>
            {inCart && (
              <span className="add-count" aria-hidden="true">
                {inCart.quantity}
              </span>
            )}
          </button>
        </div>
      </div>
      {quick && (
        <Suspense fallback={null}>
          <QuickViewModal product={product} focusAdd={quick === 'add'} onClose={() => setQuick(null)} />
        </Suspense>
      )}
    </article>
  );
}
