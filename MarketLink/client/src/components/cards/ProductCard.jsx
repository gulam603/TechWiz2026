import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { money } from '../../utils/format';
import ProduceImage from '../common/ProduceImage';
import RatingStars from '../common/RatingStars';
import FavButton from '../common/FavButton';
import { productPath } from '../../utils/links';

export default function ProductCard({ product }) {
  const cart = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const soldOut = product.status !== 'available' || product.quantityAvailable <= 0;
  const low = !soldOut && product.quantityAvailable <= 5;

  function addToCart() {
    if (user && user.role !== 'customer') {
      toast('Only customer accounts can place pre-orders', 'error');
      return;
    }
    cart.add(product, 1);
    toast(`${product.name} added to your basket`);
  }

  return (
    <article className={`product-card ${soldOut ? 'is-soldout' : ''}`}>
      <div className="card-top-badges">
        {soldOut && <span className="chip chip-dark">Sold out</span>}
        {low && <span className="chip chip-warn">Only {product.quantityAvailable} left</span>}
      </div>
      <FavButton type="products" id={product._id} className="fav-btn" />
      <ProduceImage src={product.image} alt={product.name} color={product.category?.color} />
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
          <button type="button" className="add-btn" onClick={addToCart} disabled={soldOut} aria-label={`Add ${product.name} to basket`} title="Add to basket">
            <i className="bi bi-plus-lg" />
          </button>
        </div>
      </div>
    </article>
  );
}
