import { useRef, useState } from 'react';
import { t } from '../../i18n';

const STEPS = [
  { icon: 'bi-search', title: 'Find what you need', text: 'See which farmers are at each market this week, what they have and the price.' },
  { icon: 'bi-basket2', title: 'Pre-order', text: 'Add items to your basket and reserve them. No online payment needed.' },
  { icon: 'bi-clock-history', title: 'Pick a pickup time', text: "Choose a date and time slot inside the farmer's market hours." },
  { icon: 'bi-bag-check', title: 'Collect and pay', text: 'We tell you when it is packed. Collect at the stall and pay the farmer.' },
];

/** "How it works" with a short video tour of the website next to the four steps. */
export default function VideoTour() {
  const video = useRef(null);
  const [started, setStarted] = useState(false);

  function play() {
    setStarted(true);
    video.current?.play().catch(() => {});
  }

  return (
    <section className="section bg-sand" id="how-it-works" aria-labelledby="how-title">
      <div className="container">
        <div className="text-center mb-4 mb-lg-5">
          <span className="eyebrow">{t('How MarketLink works')}</span>
          <h2 id="how-title" className="section-title">{t('From the field to your basket in four steps')}</h2>
          <p className="text-muted-2 mx-auto mb-0" style={{ maxWidth: 560 }}>
            {t('Watch the 30 second tour, or read the steps. No app to install and no card needed.')}
          </p>
        </div>
        <div className="row g-4 align-items-center">
          <div className="col-lg-7">
            <div className={`video-tour ${started ? 'is-started' : ''}`}>
              <video
                ref={video}
                poster="/media/how-it-works.jpg"
                preload="none"
                playsInline
                controls={started}
                onPlay={() => setStarted(true)}
                aria-label={t('Video: how to pre-order on MarketLink')}
              >
                <source src="/media/how-it-works.webm" type="video/webm" />
                <source src="/media/how-it-works.mp4" type="video/mp4" />
                <track kind="captions" src="/media/how-it-works.vtt" srcLang="en" label={t('English')} default />
              </video>
              {!started && (
                <button type="button" className="video-play" onClick={play} aria-label={t('Play the video tour')}>
                  <span className="video-play-btn">
                    <i className="bi bi-play-fill" aria-hidden="true" />
                  </span>
                  <span className="video-play-label">{t('Watch the tour · 0:30')}</span>
                </button>
              )}
            </div>
          </div>
          <div className="col-lg-5">
            <ol className="how-steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className="how-num">{i + 1}</span>
                  <span>
                    <strong>
                      <i className={`bi ${s.icon}`} aria-hidden="true" /> {s.title}
                    </strong>
                    <span className="d-block">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
