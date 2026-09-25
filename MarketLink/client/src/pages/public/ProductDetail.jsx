import { useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import ProductGallery from '../../components/common/ProductGallery';
import ProduceImage from '../../components/common/ProduceImage';
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
import useSeo from '../../hooks/useSeo';
import { breadcrumbLd, clip, ldGraph, productLd } from '../../utils/seo';

export default function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { data, loading, error, reload } = useFetch(`/products/${id}`);
  // The quantity starts at 1 again when another product is opened
  const [qtyFor, setQtyFor] = useState({ id: null, qty: 1 });
  const cart = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const p = data?.product;
  useSeo(
    p
      ? {
          // The farmer's own SEO title, description and keywords win (set in the product form)
          title: p.metaTitle || `${p.name}, Rs ${p.price} per ${p.unit} from ${p.farmer?.stallName}`,
          description: clip(p.metaDescription || p.description || `${p.name} (${p.category?.name}) from ${p.farmer?.stallName}. Pre-order on MarketLink and pay at the stall when you pick it up.`),
          keywords: [...(p.keywords || []), p.name, p.category?.name, p.farmer?.stallName],
          image: p.image,
          type: 'product',
          jsonLd: ldGraph(productLd(p), breadcrumbLd([{ name: 'Shop', path: '/products' }, { name: p.category?.name || 'Products', path: `/products?category=${p.category?.slug || ''}` }, { name: p.name, path: `/products/${p.slug}` }])),
          canonicalPath: `/products/${p.slug}`,
        }
      : { title: 'Product' }
  );

  // While another product is loading, the previous one is still in `data`: wait for the new one
  // (otherwise the old product would be shown, or its address restored, after clicking a related product)
  const shown = data?.product;
  const isCurrent = shown && (shown.slug === String(id).toLowerCase() || shown._id === id);
  if ((loading && !isCurrent) || (!data && !error)) return <PageLoader />;
  if (error)
    return (
      <div className="container py-5">
        <EmptyState title="Product not found" message="It may have been removed or is no longer listed." action={<Link to="/products" className="btn btn-primary">Back to the shop</Link>} />
      </div>
    );

  const { product, reviews, related } = data;
  // Old links use the id (or other capitals); show the readable name in the address bar instead
  if (product.slug && id !== product.slug && isCurrent) {
    return <Navigate to={productPath(product) + location.search + location.hash} replace />;
  }
  const farmer = product.farmer;
  const soldOut = product.status !== 'available' || product.quantityAvailable <= 0;
  const stockPct = Math.min(100, Math.round((product.quantityAvailable / Math.max(product.templateQuantity || product.quantityAvailable, 1)) * 100));
  const inCart = cart.items.find((i) => i.productId === product._id);
  const qty = qtyFor.id === product._id ? qtyFor.qty : 1;
  const setQty = (n) => setQtyFor({ id: product._id, qty: n });

  function addToCart() {
    if (user && user.role !== 'customer') {
      toast('Only customer accounts can place pre-orders', 'error');
      return;
    }
    cart.add(product, qty);
    toast(`${qty} × ${product.name} added to your basket`);
    cart.openDrawer();
  }

  // Group the farmer's pickup windows by market
  const windowsByMarket = {};
  for (const w of farmer.pickupWindows || []) {
    const name = farmer.markets?.find((m) => m._id === w.market)?.name || 'Market';
    (windowsByMarket[name] ||= []).push(w);
  }

  return (
    <div className="container py-4 pd-page">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/products">Shop</Link></li>
          <li className="breadcrumb-item"><Link to={`/products?category=${product.category?.slug}`}>{product.category?.name}</Link></li>
          <li className="breadcrumb-item active">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-4 g-lg-5">
        <div className="col-lg-5">
          <ProductGallery key={product._id} product={product}>
            <div className="position-absolute pd-fav">
              <FavButton type="products" id={product._id} />
            </div>
          </ProductGallery>
        </div>

        <div className="col-lg-7">
          <span className="chip chip-soft mb-2">{product.category?.name}</span>
          <h1 className="display-font mb-2 pd-title">
            {product.name}
          </h1>
          <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
            <RatingStars value={product.ratingAvg} count={product.ratingCount} />
            <StatusBadge status={soldOut ? 'sold_out' : 'available'} label={soldOut ? 'Sold out' : 'In stock'} />
          </div>
          <div className="price mb-2" style={{ fontSize: '1.9rem' }}>
            {money(product.price)} <span className="unit">per {product.unit}</span>
          </div>
          {product.description && <p className="text-muted-2">{product.description}</p>}

          <div className="soft-panel my-4 pd-buy">
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
                      {time12(w.start)} to {time12(w.end)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="pay-note mt-2">
              <i className="bi bi-info-circle" />
              <span>
                Orders close {farmer.orderCutoffHours} hours before your pickup slot. You pay the farmer at pickup, so there is no online payment.
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="section pb-0">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-3">
              <h2 className="h3 mb-0">Customer reviews</h2>
              <WriteReviewButton type="product" id={product._id} name={product.name} onDone={reload} />
            </div>
            <div className="soft-panel">
              {reviews.length === 0 ? <p className="text-muted-2 mb-0">No reviews yet. Bought it? Share how it was.</p> : reviews.map((r) => <ReviewItem key={r._id} review={r} farmerName={farmer.stallName} />)}
            </div>
            <div className="text-end mt-2">
              <ReportButton targetType="product" targetId={product._id} label="Report this listing" />
            </div>
          </div>
          <div className="col-lg-4">
            <h2 className="h3 mb-3">From the same stall</h2>
            <div className="d-grid gap-2">
              {(data.fromFarmer || []).map((p) => (
                <Link key={p._id} to={productPath(p)} className="mini-product">
                  <ProduceImage src={p.image} alt="" color={p.category?.color} />
                  <span className="min-w-0 flex-grow-1">
                    <strong className="d-block small text-truncate">{p.name}</strong>
                    <span className="fs-7 text-muted-2">{p.category?.name}</span>
                  </span>
                  <span className="small fw-bold text-nowrap">
                    {money(p.price)}
                    <span className="fs-7 text-muted-2 fw-normal">/{p.unit}</span>
                  </span>
                </Link>
              ))}
              {!(data.fromFarmer || []).length && <p className="small text-muted-2 mb-0">This is the only product of this stall right now.</p>}
              <Link to={`/farmers/${farmer.slug}`} className="link-arrow small mt-1">
                Visit {farmer.stallName} <i className="bi bi-arrow-right" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section pb-0">
          <div className="section-head">
            <div>
              <span className="eyebrow">{product.category?.name}</span>
              <h2 className="section-title">You may also like</h2>
            </div>
            <Link to={`/products?category=${product.category?.slug}`} className="link-arrow">
              More {product.category?.name?.toLowerCase()} <i className="bi bi-arrow-right" />
            </Link>
          </div>
          <div className="row g-3">
            {related.map((p) => (
              <div key={p._id} className="col-6 col-md-4 col-xl-3">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
