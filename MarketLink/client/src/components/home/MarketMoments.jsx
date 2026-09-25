import { Link } from 'react-router-dom';

// Real photos from the markets (Open Images, CC BY 2.0, see server/uploads/photos/CREDITS.md)
const PHOTOS = [
  { src: '/uploads/photos/gallery/chaunsa-mangoes-2.webp', caption: 'Mangoes, picked the day before market', to: '/products?category=fruits' },
  { src: '/uploads/photos/country-sourdough-loaf.webp', caption: 'Bread baked at dawn', to: '/products?category=baked-goods' },
  { src: '/uploads/photos/capsicum-mix.webp', caption: 'Colourful vegetable stalls', to: '/products?category=vegetables' },
  { src: '/uploads/photos/desi-rose-bouquet.webp', caption: 'Fresh flowers and plants', to: '/products?category=flowers-plants' },
  { src: '/uploads/photos/acacia-honey.webp', caption: 'Honey from local hives', to: '/products?category=honey-preserves' },
];

/** Photo mosaic of market produce; every picture opens the matching category. */
export default function MarketMoments() {
  return (
    <section className="section pt-0" aria-labelledby="moments-title">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">At the market</span>
            <h2 id="moments-title" className="section-title">Real food from real farms</h2>
          </div>
          <Link to="/markets" className="link-arrow">
            Visit a market <i className="bi bi-arrow-right" />
          </Link>
        </div>
        <div className="moments">
          {PHOTOS.map((p, i) => (
            <Link key={p.src} to={p.to} className={`moment moment-${i + 1}`}>
              <img src={p.src} alt={p.caption} loading="lazy" />
              <span className="moment-caption">{p.caption}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
