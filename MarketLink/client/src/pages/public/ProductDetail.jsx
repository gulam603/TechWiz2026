import { useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import ProductGallery from '../../components/common/ProductGallery';
import RatingStars from '../../components/common/RatingStars';
import QuantityStepper from '../../components/common/QuantityStepper';
import FavButton from '../../components/common/FavButton';
import ReviewItem from '../../components/cards/ReviewItem';
import WriteReviewButton from '../../components/reviews/WriteReviewButton';
import ReportButton from '../../components/reviews/ReportButton';
import ProductCard from '../../components/cards/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DAY_SHORT, money, time12 } from '../../utils/format';
import { productPath } from '../../utils/links';

export default function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { data, loading, error, reload } = useFetch(`/products/${id}`);
  const [qty, setQty] = useState(1);
  const cart = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  useDocumentTitle(data?.product?.name);

  if (loading && !data) return <PageLoader />;
  if (error)
    return (
      <div className="container py-5">
        <EmptyState title="Product not found" message="It may have been removed or is no longer listed." action={<Link to="/products" className="btn btn-primary">Back to the shop</Link>} />
      </div>
    );

  const { product, reviews, related } = data;
  // Old links use the id; show the readable name in the address bar instead
  if (product.slug && id !== product.slug) {
    return <Navigate to={productPath(product) + location.search + location.hash} replace />;
  }
  const farmer = product.farmer;
  const soldOut = product.status !== 'available' || product.quantityAvailable <= 0;
  const stockPct = Math.min(100, Math.round((product.quantityAvailable / Math.max(product.templateQuantity || product.quantityAvailable, 1)) * 100));
  const inCart = cart.items.find((i) => i.productId === product._id);

  function addToCart() {
    if (user && user.role !== 'customer') {
      toast('Only customer accounts can place pre-orders', 'error');
      return;
    }
    cart.add(product, qty);
    toast(`${qty} × ${product.name} added to your basket`);
  }

  // Group the farmer's pickup windows by market
  const windowsByMarket = {};
  for (const w of farmer.pickupWindows || []) {
    const name = farmer.markets?.find((m) => m._id === w.market)?.name || 'Market';
    (windowsByMarket[name] ||= []).push(w);
  }

  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/products">Shop</Link></li>
          <li className="breadcrumb-item"><Link to={`/products?category=${product.category?.slug}`}>{product.category?.name}</Link></li>
          <li className="breadcrumb-item active">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-4 g-lg-5">
        <div className="col-lg-6">
          <ProductGallery product={product}>
            <div className="position-absolute pd-fav">
              <FavButton type="products" id={product._id} />
            </div>
          </ProductGallery>
        </div>

        <div className="col-lg-6">
          <span className="chip chip-soft mb-2">{product.category?.name}</span>
          <h1 className="display-font mb-2" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>
            {product.name}
          </h1>
          <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
            <RatingStars value={product.ratingAvg} count={product.ratingCount} />
            <StatusBadge status={soldOut ? 'sold_out' : 'available'} label={soldOut ? 'Sold out' : 'In stock'} />
          </div>
          <div className="price mb-3" style={{ fontSize: '2rem' }}>
            {money(product.price)} <span className="unit">per {product.unit}</span>
          </div>
          {product.description && <p className="text-muted-2">{product.description}</p>}

          <div className="soft-panel my-4">
            <div className="d-flex justify-content-between small fw-semi mb-2">
              <span>Available this week</span>
              <span>
                {product.quantityAvailable} {product.unit}
              </span>
            </div>
            <div className={`stock-meter ${stockPct < 25 ? 'low' : ''}`}>
              <span style={{ width: `${soldOut ? 0 : Math.max(stockPct, 6)}%` }} />
            </div>
            <div className="d-flex align-items-center gap-3 mt-4 flex-wrap">
              <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, product.quantityAvailable)} size="lg" />
              <button type="button" className="btn btn-primary btn-lg flex-grow-1" onClick={addToCart} disabled={soldOut}>
                <i className="bi bi-basket2" /> {soldOut ? 'Sold out' : `Add to basket · ${money(product.price * qty)}`}
              </button>
            </div>
            {inCart && (
              <div className="small mt-2 text-success fw-semi">
                <i className="bi bi-check-circle" /> {inCart.quantity} in your basket · <Link to="/cart">View basket</Link>
              </div>
            )}
            {soldOut && <div className="small mt-2 text-muted-2">Tip: add it to favourites to get a restock alert.</div>}
          </div>

          <div className="farmer-mini-wrap mb-3">
            <Link to={`/farmers/${farmer.slug}`} className="farmer-mini">
              <span className="logo">
                <img src={farmer.logo} alt="" />
              </span>
              <span className="flex-grow-1 min-w-0">
                <span className="fs-7 text-muted-2 d-block">Grown & sold by</span>
                <strong className="d-block text-truncate">{farmer.stallName}</strong>
                <RatingStars value={farmer.ratingAvg} count={farmer.ratingCount} />
              </span>
              <i className="bi bi-chevron-right" />
            </Link>
            <FavButton type="farmers" id={farmer._id} className="farmer-mini-fav" />
          </div>

          <div className="soft-panel">
            <h6 className="mb-2">
              <i className="bi bi-clock-history text-success" /> Pickup windows
            </h6>
            {Object.keys(windowsByMarket).length === 0 && <p className="small text-muted-2 mb-0">This farmer hasn't published pickup windows yet.</p>}
            {Object.entries(windowsByMarket).map(([market, windows]) => (
              <div key={market} className="mb-2">
                <div className="small fw-semi">{market}</div>
                <ul className="window-list">
                  {windows.map((w) => (
                    <li key={w._id}>
                      <span className="day">{DAY_SHORT[w.day]}</span>
                      {time12(w.start)} – {time12(w.end)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="pay-note mt-2">
              <i className="bi bi-info-circle" />
              <span>
                Orders close {farmer.orderCutoffHours} hours before your pickup slot. You pay the farmer at pickup — no online payment.
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="section pb-0">
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
              <h2 className="h3 mb-0">Customer reviews</h2>
              <WriteReviewButton type="product" id={product._id} name={product.name} onDone={reload} />
            </div>
            <div className="soft-panel">
              {reviews.length === 0 ? <p className="text-muted-2 mb-0">No reviews yet. Reviews can be written after a completed pickup.</p> : reviews.map((r) => <ReviewItem key={r._id} review={r} farmerName={farmer.stallName} />)}
            </div>
            <div className="text-end mt-2">
              <ReportButton targetType="product" targetId={product._id} label="Report this listing" />
            </div>
          </div>
          <div className="col-lg-5">
            <h2 className="h3 mb-3">You may also like</h2>
            <div className="row g-3">
              {related.map((p) => (
                <div key={p._id} className="col-6">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
