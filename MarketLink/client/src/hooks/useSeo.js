import { useEffect } from 'react';
import { APP_NAME } from '../config';

const DEFAULT_TITLE = `${APP_NAME} | Fresh from local farmers markets`;
const DEFAULT_KEYWORDS = ['farmers market', 'fresh produce', 'local farmers', 'pre-order vegetables', 'fresh fruit', 'organic food', 'Karachi farmers market', 'Pakistan', 'pickup', 'MarketLink'];

/** Page keywords first, then the site keywords (no duplicates, 20 at most). */
function keywordList(extra = []) {
  const seen = new Set();
  return [...extra, ...DEFAULT_KEYWORDS]
    .map((k) => String(k || '').trim())
    .filter((k) => k && !seen.has(k.toLowerCase()) && seen.add(k.toLowerCase()))
    .slice(0, 20)
    .join(', ');
}
const DEFAULT_DESCRIPTION =
  'MarketLink connects local farmers markets with customers: see what each farmer has in stock this week, pre-order fresh produce and pick it up at the market. Pay at the stall.';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(data) {
  let el = document.getElementById('ld-page');
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'ld-page';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

const absolute = (url) => (!url ? `${window.location.origin}/brand/og-image.jpg` : /^https?:\/\//.test(url) ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`);

/**
 * Title, description, social preview (Open Graph / X) and structured data of the current page.
 * The server writes the same tags into the HTML of the first page (server/src/services/seo.js);
 * this hook keeps them right while the visitor browses inside the app.
 */
export default function useSeo({ title, description, image, type = 'website', noindex = false, jsonLd, canonicalPath, keywords } = {}) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';
  const words = keywordList(keywords || []);
  useEffect(() => {
    const fullTitle = title ? `${title} · ${APP_NAME}` : DEFAULT_TITLE;
    const desc = String(description || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim().slice(0, 170);
    const url = `${window.location.origin}${canonicalPath || window.location.pathname}`;
    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'keywords', words);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');
    setCanonical(noindex ? null : url);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', absolute(image));
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', absolute(image));
    setJsonLd(ld ? JSON.parse(ld) : null);
  }, [title, description, image, type, noindex, ld, canonicalPath, words]);
}
