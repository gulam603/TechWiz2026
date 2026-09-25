import { Link } from 'react-router-dom';
import FaqList from '../faq/FaqList';
import { Bone } from '../common/Skeletons';

/** Home page FAQ block: the questions the admin picked for the home page, with a link to all of them. */
export default function HomeFaq({ faqs, loading }) {
  if (!loading && !faqs?.length) return null;
  return (
    <section className="section pt-0" aria-labelledby="home-faq-title">
      <div className="container">
        <div className="row g-4 align-items-start">
          <div className="col-lg-4">
            <span className="eyebrow">FAQs</span>
            <h2 id="home-faq-title" className="section-title mt-2">
              Questions, answered
            </h2>
            <p className="text-muted-2">Everything you need before your first pre-order: how it works, where you collect and how you pay.</p>
            <div className="d-flex gap-2 flex-wrap">
              <Link to="/faq" className="btn btn-primary">
                All questions <i className="bi bi-arrow-right" />
              </Link>
              <Link to="/contact" className="btn btn-white">
                Ask us
              </Link>
            </div>
          </div>
          <div className="col-lg-8">
            {loading && !faqs ? (
              <div className="d-grid gap-2" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <Bone key={i} h={58} r={16} />
                ))}
              </div>
            ) : (
              <FaqList faqs={faqs} openFirst idPrefix="home-faq" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
