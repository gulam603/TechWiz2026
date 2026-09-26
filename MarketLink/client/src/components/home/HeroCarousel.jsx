import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { heroSlides } from './heroSlides';
import { t } from '../../i18n';

const DELAY = 3000; // ms each slide stays on screen

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Why people can trust the market, shown under the banner
const TRUST = [
  { icon: 'bi-basket2', title: 'Fresh every week', text: 'Picked for market day' },
  { icon: 'bi-cash-coin', title: 'Pay at pickup', text: 'No online payment' },
  { icon: 'bi-patch-check', title: 'Checked farmers', text: 'Every stall is approved' },
  { icon: 'bi-clock', title: 'Your pickup time', text: 'Choose a time slot' },
];

/** Scrolls to a section of the home page for links such as "/#how-it-works". */
function scrollToHash(e, to) {
  const hash = to.startsWith('/#') ? to.slice(1) : null;
  const target = hash && document.querySelector(hash);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

function SlideLink({ link, className }) {
  return (
    <Link to={link.to} className={className} onClick={(e) => scrollToHash(e, link.to)}>
      {t(link.label)}
    </Link>
  );
}

/**
 * Home page banner: full-width photos with the words on them. The slides change by themselves every
 * few seconds (also with "reduce motion" turned on, then without the zoom) and keep going while the
 * mouse is over them; they stop only with the pause button, while a keyboard user is on the controls
 * or while the browser tab is hidden. Phones can swipe.
 */
export default function HeroCarousel() {
  const { user } = useAuth();
  const slides = useMemo(() => heroSlides(), []);
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [hidden, setHidden] = useState(false);
  const swipe = useRef(null);
  const count = slides.length;
  const playing = !stopped && !keyboard && !hidden;

  const go = useCallback((step) => setIndex((i) => (i + step + count) % count), [count]);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setTimeout(() => go(1), DELAY);
    return () => clearTimeout(timer);
  }, [playing, index, go]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  function onKeyDown(e) {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  }

  return (
    <section className="hero-banner" aria-roledescription="carousel" aria-label={t('Highlights')}>
      <div className="container">
        <div
          className="hb-frame"
          onKeyDown={onKeyDown}
          // Only keyboard focus pauses the slides (a mouse click on a dot does not)
          onFocus={(e) => setKeyboard(e.target.matches(':focus-visible'))}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setKeyboard(false)}
          onPointerDown={(e) => {
            swipe.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const start = swipe.current;
            swipe.current = null;
            if (!start) return;
            const dx = e.clientX - start.x;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - start.y)) go(dx < 0 ? 1 : -1);
          }}
        >
          {slides.map((s, i) => {
            const active = i === index;
            const Heading = i === 0 ? 'h1' : 'h2';
            const primary = s.primary.guestOnly && user ? s.secondary : s.primary;
            return (
              <div key={s.id} className={`hb-slide ${active ? 'is-active' : ''}`} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`} aria-hidden={!active} inert={!active}>
                <img className="hb-img" src={s.photo.src} alt={s.photo.alt} style={{ objectPosition: s.photo.focus }} loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : undefined} draggable="false" />
                <div className="hb-copy">
                  <span className="hb-eyebrow">
                    {s.badge && <i className={`bi ${s.badge.icon}`} aria-hidden="true" />} {s.eyebrow}
                  </span>
                  <Heading className="hb-title text-balance">{s.title}</Heading>
                  <p className="hb-text">{s.text}</p>
                  <div className="hb-actions">
                    <SlideLink link={primary} className="btn btn-lime btn-lg" />
                    {primary !== s.secondary && <SlideLink link={s.secondary} className="btn btn-lg hb-ghost" />}
                  </div>
                </div>
                {s.photo.credit && (
                  <small className="hb-credit">
                    {t('Photo:')}{' '}
                    <a href={s.photo.credit.source} target="_blank" rel="noreferrer">
                      {s.photo.credit.author}
                    </a>{' '}
                    {t('(CC BY 2.0)')}
                  </small>
                )}
              </div>
            );
          })}

          <div className="hb-controls">
            <div className="hb-dots" role="group" aria-label={t('Choose a slide')}>
              {slides.map((s, i) => (
                <button key={s.id} type="button" className={`hb-dot ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)} aria-label={t('Slide {v1}: {eyebrow}', { v1: i + 1, eyebrow: s.eyebrow })} aria-current={i === index ? 'true' : undefined}>
                  {i === index && <span key={index} className={`hb-dot-fill ${playing ? '' : 'is-paused'}`} style={{ animationDuration: `${DELAY}ms` }} />}
                </button>
              ))}
            </div>
            <div className="hb-buttons">
              <button type="button" className="hb-arrow" onClick={() => go(-1)} aria-label={t('Previous slide')}>
                <i className="bi bi-chevron-left" aria-hidden="true" />
              </button>
              <button type="button" className="hb-arrow" onClick={() => setStopped((v) => !v)} aria-label={stopped ? t('Play the slides') : t('Pause the slides')} aria-pressed={stopped}>
                <i className={`bi ${stopped ? 'bi-play-fill' : 'bi-pause-fill'}`} aria-hidden="true" />
              </button>
              <button type="button" className="hb-arrow" onClick={() => go(1)} aria-label={t('Next slide')}>
                <i className="bi bi-chevron-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <ul className="trust-row" aria-label={t('Why shop at MarketLink')}>
          {TRUST.map((item) => (
            <li key={item.title}>
              <span className="trust-icon">
                <i className={`bi ${item.icon}`} aria-hidden="true" />
              </span>
              <span>
                <strong>{t(item.title)}</strong>
                <span>{t(item.text)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
