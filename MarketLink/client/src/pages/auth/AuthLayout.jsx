import useFetch from '../../hooks/useFetch';

// Produce "market crate" wall shown next to every login / sign-up form.
// The first tile is the big feature tile (2 x 2).
const WALL = [
  { img: 'basket', bg: '#d4f06e', feature: true },
  { img: 'tomato', bg: '#ffe0d6' },
  { img: 'carrot', bg: '#fde7c9' },
  { img: 'strawberry', bg: '#fbdde6' },
  { img: 'broccoli', bg: '#dff1d4' },
  { img: 'mango', bg: '#fff0c2' },
  { img: 'eggplant', bg: '#ece1f7' },
  { img: 'bread', bg: '#f8e8cf' },
  { img: 'watermelon', bg: '#ffe2e0' },
  { img: 'honey', bg: '#fff0c2' },
  { img: 'leafy-greens', bg: '#dff1d4' },
  { img: 'egg', bg: '#e3eefb' },
  { img: 'grapes', bg: '#ece1f7' },
  { img: 'corn', bg: '#fff4cc' },
  { img: 'milk', bg: '#e3eefb' },
  { img: 'avocado', bg: '#e4f3d8' },
  { img: 'cherries', bg: '#fde1e1' },
];
// 1 feature tile (2 x 2) + 16 small tiles = exactly 4 full rows of 5

/** Split screen used by the login / register pages. */
export default function AuthLayout({ title, highlight, text, children, variant = '', wide = false }) {
  const { data: stats } = useFetch('/stats');
  return (
    <div className="auth-wrap">
      <div className={`auth-art ${variant}`}>
        <div className="d-flex align-items-center justify-content-between gap-2">
          <span className="chip hero-chip">
            <span className="text-lime">●</span> eGreen Basket
          </span>
          <span className="small" style={{ color: 'rgba(255,255,255,.65)' }}>
            Fresh · Local · Pay at pickup
          </span>
        </div>

        <div className="produce-wall" aria-hidden="true">
          {WALL.map((t, i) => (
            <div key={t.img} className={`wall-tile ${t.feature ? 'feature' : ''}`} style={{ '--tile-bg': t.bg, '--delay': `${-(i % 6) * 0.7}s` }}>
              <img src={`/illustrations/${t.img}.webp`} alt="" />
            </div>
          ))}
        </div>

        <div>
          <h2>
            {title} <em>{highlight}</em>
          </h2>
          <p className="mt-2 mb-3">{text}</p>
          <div className="d-flex flex-wrap gap-2">
            <span className="chip hero-chip">
              <i className="bi bi-geo-alt" /> {stats?.markets ?? '–'} markets
            </span>
            <span className="chip hero-chip">
              <i className="bi bi-shop" /> {stats?.farmers ?? '–'} local farmers
            </span>
            <span className="chip hero-chip">
              <i className="bi bi-basket" /> {stats?.products ?? '–'} products this week
            </span>
          </div>
        </div>
      </div>
      <div className="auth-form">
        <div className={`auth-card ${wide ? 'wide' : ''}`}>{children}</div>
      </div>
    </div>
  );
}
