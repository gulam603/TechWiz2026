import { Link } from 'react-router-dom';

export function DashHeader({ title, subtitle, actions }) {
  return (
    <div className="dash-head">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="d-flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function PageHero({ title, subtitle, crumbs = [], children }) {
  return (
    <section className="page-hero">
      <div className="container">
        {crumbs.length > 0 && (
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">Home</Link>
              </li>
              {crumbs.map((c) => (
                <li key={c.label} className={`breadcrumb-item ${c.to ? '' : 'active'}`}>
                  {c.to ? <Link to={c.to}>{c.label}</Link> : c.label}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="text-balance">{title}</h1>
        {subtitle && <p className="lead">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
