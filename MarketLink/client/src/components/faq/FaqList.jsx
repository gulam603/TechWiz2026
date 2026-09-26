import { Fragment } from 'react';
import { localText } from '../../i18n';

/** An answer: paragraphs split on blank lines; lines starting with "1." become a numbered list. */
export function FaqAnswer({ text }) {
  return String(text || '')
    .split(/\n{2,}/)
    .map((block, i) => {
      const lines = block.split('\n').filter(Boolean);
      if (lines.length > 1 && lines.every((l) => /^\d+[.۔]\s/.test(l))) {
        return (
          <ol key={i}>
            {lines.map((l) => (
              <li key={l}>{l.replace(/^\d+[.۔]\s/, '')}</li>
            ))}
          </ol>
        );
      }
      return (
        <p key={i}>
          {lines.map((l, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {l}
            </Fragment>
          ))}
        </p>
      );
    });
}

/**
 * Questions as an accordion (native <details>, so it works with the keyboard and without JavaScript).
 * `openFirst` opens the first question; `idPrefix` gives every question a link target (#faq-...).
 */
export default function FaqList({ faqs, openFirst = false, idPrefix = 'faq' }) {
  return (
    <div className="faq-list">
      {faqs.map((f, i) => (
        <details key={f._id || f.question} className="faq-item" id={`${idPrefix}-${f._id || i}`} open={openFirst && i === 0 ? true : undefined}>
          <summary>
            <span className="faq-q">{localText(f, 'question')}</span>
            <i className="bi bi-plus-lg faq-toggle" aria-hidden="true" />
          </summary>
          <div className="faq-a">
            <FaqAnswer text={localText(f, 'answer')} />
          </div>
        </details>
      ))}
    </div>
  );
}
