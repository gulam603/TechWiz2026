import { Link } from 'react-router-dom';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { PageHero } from '../../components/common/PageHeader';
import TermsContent from '../../components/legal/TermsContent';
import { TERMS_SECTIONS, TERMS_UPDATED } from '../../components/legal/terms';

function jump(e, id) {
  e.preventDefault();
  document.getElementById(`terms-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Terms() {
  useDocumentTitle('Terms & Conditions');
  return (
    <>
      <PageHero
        crumbs={[{ label: 'Terms & Conditions' }]}
        title="Terms & Conditions"
        subtitle="The simple rules that keep MarketLink fair for customers and farmers. Please read them before you create an account."
      >
        <span className="chip hero-chip">
          <i className="bi bi-calendar3" aria-hidden="true" /> Last updated {TERMS_UPDATED}
        </span>
      </PageHero>
      <div className="container pb-5">
        <div className="row g-4">
          <aside className="col-lg-3 d-none d-lg-block">
            <nav className="terms-toc" aria-label="Sections">
              <span className="eyebrow">On this page</span>
              <ol>
                {TERMS_SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a href={`#terms-${s.id}`} onClick={(e) => jump(e, s.id)}>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
          <div className="col-lg-9">
            <div className="terms-panel">
              <TermsContent />
              <div className="terms-foot">
                <p className="mb-0 small text-muted-2">By creating an account you confirm that you have read and agree to these terms.</p>
                <div className="d-flex gap-2 flex-wrap">
                  <Link to="/register" className="btn btn-primary">
                    Create an account
                  </Link>
                  <Link to="/contact" className="btn btn-white">
                    Ask a question
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
