import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { heroSlides } from './heroSlides';

const DELAY = 6500; // ms each slide stays on screen

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

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
      {link.label}
    </Link>
  );
}

/**
 * Home page banner carousel: slides change every few seconds, pause while the pointer or the
 * keyboard focus is on them, can be swiped on phones and have dots, arrows and a pause button.
 */
export default function HeroCarousel() {
  const { user } = useAuth();
  const slides = useMemo(() => heroSlides(), []);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(prefersReducedMotion);
  const [hidden, setHidden] = useState(false);
  const swipe = useRef(null);
  const count = slides.length;
  const playing = !stopped && !hovered && !hidden;

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
    <section className="hero-carousel" aria-roledescription="carousel" aria-label="Highlights">
      <div className="container">
        <div
          className={`hc-frame theme-${slides[index].theme}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHovered(false)}
          onKeyDown={onKeyDown}
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
              <div
                key={s.id}
                className={`hc-slide theme-${s.theme} ${active ? 'is-active' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={!active}
                inert={!active}
              >
                <div className="hc-copy">
                  <span className="hc-eyebrow">{s.eyebrow}</span>
                  <Heading className="hc-title text-balance">{s.title}</Heading>
                  <p className="hc-text">{s.text}</p>
                  <div className="hc-actions">
                    <SlideLink link={primary} className="btn btn-lg hc-primary" />
                    {primary !== s.secondary && <SlideLink link={s.secondary} className="btn btn-lg hc-secondary" />}
                  </div>
                </div>
                <div className="hc-art" aria-hidden="true">
                  <span className="hc-disc" />
                  {s.images.map((src, n) => (
                    <img key={src} src={src} alt="" className={`hc-img hc-img-${n + 1}`} loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 && n === 0 ? 'high' : undefined} draggable="false" />
                  ))}
                </div>
              </div>
            );
          })}

          <div className="hc-controls">
            <button type="button" className="hc-arrow" onClick={() => go(-1)} aria-label="Previous slide">
              <i className="bi bi-chevron-left" aria-hidden="true" />
            </button>
            <div className="hc-dots" role="group" aria-label="Choose a slide">
              {slides.map((s, i) => (
                <button key={s.id} type="button" className={`hc-dot ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)} aria-label={`Slide ${i + 1}: ${s.eyebrow}`} aria-current={i === index ? 'true' : undefined}>
                  {i === index && <span key={index} className={`hc-dot-fill ${playing ? '' : 'is-paused'}`} style={{ animationDuration: `${DELAY}ms` }} />}
                </button>
              ))}
            </div>
            <button type="button" className="hc-arrow" onClick={() => go(1)} aria-label="Next slide">
              <i className="bi bi-chevron-right" aria-hidden="true" />
            </button>
            <button type="button" className="hc-arrow hc-pause" onClick={() => setStopped((v) => !v)} aria-label={stopped ? 'Play the slides' : 'Pause the slides'} aria-pressed={stopped}>
              <i className={`bi ${stopped ? 'bi-play-fill' : 'bi-pause-fill'}`} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
