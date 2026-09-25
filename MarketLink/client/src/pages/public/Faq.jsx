import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import useSeo from '../../hooks/useSeo';
import { PageHero } from '../../components/common/PageHeader';
import { Bone } from '../../components/common/Skeletons';
import FaqList from '../../components/faq/FaqList';
import { breadcrumbLd, faqLd, ldGraph } from '../../utils/seo';

const GROUP_ICONS = { shopping: 'bi-basket2', pickup: 'bi-geo-alt', farmers: 'bi-shop', account: 'bi-person-lock' };

const matches = (f, q) => !q || `${f.question} ${f.answer}`.toLowerCase().includes(q);

export default function Faq() {
  const { data, loading, error } = useFetch('/faqs');
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const faqs = useMemo(() => data?.faqs || [], [data]);
  const groups = data?.groups || {};
  const q = query.trim().toLowerCase();
  const shown = faqs.filter((f) => (group === 'all' || f.group === group) && matches(f, q));
  const sections = Object.keys(groups)
    .map((key) => ({ key, label: groups[key], items: shown.filter((f) => f.group === key) }))
    .filter((s) => s.items.length);

  useSeo({
    title: 'Frequently asked questions',
    description: 'Answers about pre-ordering from local farmers on MarketLink: how ordering works, pickup at the market, paying the farmer in cash, changing an order and selling as a farmer.',
    keywords: ['MarketLink FAQ', 'how to pre-order vegetables', 'farmers market pickup', 'pay at pickup', 'sell produce online Pakistan'],
    jsonLd: ldGraph(faqLd(faqs), breadcrumbLd([{ name: 'FAQs', path: '/faq' }])),
  });

  return (
    <>
      <PageHero
        crumbs={[{ label: 'FAQs' }]}
        title="Frequently asked questions"
        subtitle="Short answers about ordering, pickup, payment and selling on MarketLink. In one line: you reserve fresh food from local farmers online, collect it at the market and pay the farmer there."
      >
        <div className="faq-search">
          <i className="bi bi-search" aria-hidden="true" />
          <label htmlFor="faq-search" className="visually-hidden">
            Search the questions
          </label>
          <input id="faq-search" type="search" className="form-control" placeholder="Search, e.g. payment, cancel, pickup" value={query} onChange={(e) => setQuery(e.target.value)} maxLength={80} />
        </div>
      </PageHero>

      <div className="container pb-5">
        <div className="faq-tabs" role="group" aria-label="Topics">
          <button type="button" className={`chip chip-btn ${group === 'all' ? 'active' : ''}`} aria-pressed={group === 'all'} onClick={() => setGroup('all')}>
            All questions
          </button>
          {Object.entries(groups).map(([key, label]) => (
            <button key={key} type="button" className={`chip chip-btn ${group === key ? 'active' : ''}`} aria-pressed={group === key} onClick={() => setGroup(key)}>
              <i className={`bi ${GROUP_ICONS[key] || 'bi-question-circle'}`} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            {error && <div className="alert alert-danger">{error.message}</div>}
            {loading && !data && (
              <div className="d-grid gap-2" aria-busy="true" aria-label="Loading the questions">
                {Array.from({ length: 6 }, (_, i) => (
                  <Bone key={i} h={58} r={16} />
                ))}
              </div>
            )}
            {data && sections.length === 0 && (
              <div className="soft-panel text-center py-4">
                <i className="bi bi-search fs-3 text-muted-2" aria-hidden="true" />
                <p className="mb-2 mt-2">No question matches “{query}”.</p>
                <button type="button" className="btn btn-white btn-sm" onClick={() => { setQuery(''); setGroup('all'); }}>
                  Show all questions
                </button>
              </div>
            )}
            {sections.map((s, i) => (
              <section key={s.key} className="faq-section" aria-labelledby={`faq-group-${s.key}`}>
                <h2 id={`faq-group-${s.key}`} className="faq-group-title">
                  <i className={`bi ${GROUP_ICONS[s.key] || 'bi-question-circle'}`} aria-hidden="true" /> {s.label}
                </h2>
                <FaqList faqs={s.items} openFirst={i === 0 && !q} />
              </section>
            ))}
          </div>
          <aside className="col-lg-4">
            <div className="faq-help">
              <span className="faq-help-icon" aria-hidden="true">
                <i className="bi bi-chat-dots" />
              </span>
              <h2 className="h5 mt-3">Still have a question?</h2>
              <p className="small text-muted-2">Ask the MarketLink assistant (the chat button at the bottom of the page) or send us a message. We reply within one working day.</p>
              <Link to="/contact" className="btn btn-primary w-100">
                <i className="bi bi-envelope" /> Contact us
              </Link>
              <hr />
              <h3 className="h6">Popular pages</h3>
              <ul className="faq-links">
                <li>
                  <Link to="/products">Shop this week’s produce</Link>
                </li>
                <li>
                  <Link to="/markets">Markets and opening times</Link>
                </li>
                <li>
                  <Link to="/register/farmer">Sell as a farmer</Link>
                </li>
                <li>
                  <Link to="/terms">Terms & Conditions</Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
