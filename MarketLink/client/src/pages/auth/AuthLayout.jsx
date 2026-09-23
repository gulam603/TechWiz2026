/** Split screen used by the login / register pages. */
export default function AuthLayout({ title, highlight, text, children, variant = '' }) {
  return (
    <div className="auth-wrap">
      <div className={`auth-art ${variant}`}>
        <div className="art-cluster" aria-hidden="true">
          <img src="/illustrations/basket.webp" alt="" style={{ width: 170, right: '10%', top: '14%' }} />
          <img src="/illustrations/tomato.webp" alt="" style={{ width: 80, right: '42%', top: '8%', animationDelay: '-2s' }} />
          <img src="/illustrations/broccoli.webp" alt="" style={{ width: 90, right: '36%', top: '34%', animationDelay: '-3s' }} />
          <img src="/illustrations/honey.webp" alt="" style={{ width: 70, right: '8%', top: '48%', animationDelay: '-1s' }} />
        </div>
        <div />
        <div style={{ maxWidth: 440 }}>
          <h2>
            {title} <em>{highlight}</em>
          </h2>
          <p className="mt-3 mb-0">{text}</p>
        </div>
      </div>
      <div className="auth-form">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
}
