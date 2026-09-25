import fs from 'node:fs';
import path from 'node:path';
import { Category, Farmer, Market, Product } from '../models/index.js';
import { CLIENT_DIST } from '../utils/paths.js';
import env from '../config/env.js';

/**
 * Search engines and link previews (WhatsApp, Facebook, X ...) read the HTML before any JavaScript
 * runs. The server therefore writes the right title, description, Open Graph tags and JSON-LD
 * structured data into index.html for every public page; the React app updates them while browsing.
 */

const SITE = 'MarketLink';
const DEFAULT_TITLE = 'MarketLink | Fresh from local farmers markets';
const DEFAULT_KEYWORDS = ['farmers market', 'fresh produce', 'local farmers', 'pre-order vegetables', 'fresh fruit', 'organic food', 'Karachi farmers market', 'Pakistan', 'pickup', 'MarketLink'];
const DEFAULT_DESCRIPTION = 'MarketLink connects local farmers markets with customers: see what each farmer has in stock this week, pre-order fresh produce and pick it up at the market. Pay at the stall.';
const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Pages that are only useful after logging in (or are personal) are kept out of search results
const PRIVATE = /^\/(account|farmer(\/|$)|admin|checkout|cart|reset-password|forgot-password|unsubscribe)/;

const STATIC_PAGES = {
  '/': { title: null, description: DEFAULT_DESCRIPTION },
  '/products': { title: 'Shop fresh produce', description: 'Browse this week’s vegetables, fruit, dairy, honey, baked goods and more from local farmers. Filter by market, day, city and price, then pre-order for pickup.', keywords: ['buy fresh vegetables', 'buy fruit online', 'dairy', 'honey', 'bakery', 'farm produce'] },
  '/markets': { title: 'Farmers markets', description: 'Find farmers markets near you: opening days and times, location on the map and the farmers selling at each market.', keywords: ['farmers markets near me', 'market timings', 'weekly bazaar'] },
  '/farmers': { title: 'Local farmers', description: 'Meet the local farmers and stalls on MarketLink: what they grow, where they sell, ratings and their weekly stock.', keywords: ['local growers', 'farm stalls', 'organic farms'] },
  '/map': { title: 'Market map', description: 'All farmers markets and farmer stalls on one map, with directions and opening days.' },
  '/about': { title: 'About MarketLink', description: 'MarketLink brings local farmers markets online so families can reserve fresh food before market day and farmers waste less. Built by Team Omniverse.' },
  '/contact': { title: 'Contact us', description: 'Questions about an order, joining as a farmer or partnering with a market? Contact the MarketLink team.' },
  '/terms': { title: 'Terms & Conditions', description: 'The terms for using MarketLink as a customer or farmer, and how your personal data is handled.' },
  '/login': { title: 'Log in', description: 'Log in to MarketLink as a customer, farmer or administrator.' },
  '/register': { title: 'Create an account', description: 'Create a free MarketLink account to pre-order from local farmers, save favourites and get restock alerts.' },
  '/register/farmer': { title: 'Sell with MarketLink', description: 'Register your farm stall on MarketLink: list your weekly stock, take pre-orders and set your pickup times.' },
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const clip = (s, n = 160) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : t;
};

/** The site's own address, e.g. https://marketlink.onrender.com (APP_URL, or the address of this request). */
export function siteOrigin(req) {
  if (process.env.APP_URL) return env.appUrl;
  return `${req.protocol}://${req.get('host')}`;
}

let template = null;
let templateTime = 0;
function readTemplate() {
  const file = path.join(CLIENT_DIST, 'index.html');
  const time = fs.statSync(file).mtimeMs;
  if (!template || time !== templateTime) {
    template = fs.readFileSync(file, 'utf8');
    templateTime = time;
  }
  return template;
}

const absolute = (origin, url) => (!url ? `${origin}/brand/icon-512.png` : /^https?:\/\//.test(url) ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`);

async function productMeta(slug, origin) {
  const product = await Product.findOne({ slug: slug.toLowerCase(), isRemoved: false, farmerActive: true })
    .populate('category', 'name')
    .populate('farmer', 'stallName slug city')
    .lean();
  if (!product) return null;
  const inStock = product.status === 'available' && product.quantityAvailable > 0;
  const url = `${origin}/products/${product.slug}`;
  return {
    // The farmer's own SEO title, description and keywords win; otherwise they are built from the product
    title: product.metaTitle || `${product.name}, Rs ${product.price} per ${product.unit} from ${product.farmer?.stallName}`,
    description: clip(product.metaDescription || product.description || `${product.name} (${product.category?.name}) from ${product.farmer?.stallName}. Pre-order on MarketLink and pay at the stall when you pick it up.`),
    keywords: [...(product.keywords || []), product.name, product.category?.name, product.farmer?.stallName, product.farmer?.city && `${product.category?.name} in ${product.farmer.city}`],
    image: absolute(origin, product.image),
    type: 'product',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || undefined,
      image: [product.image, ...(product.gallery || []).map((g) => g.url)].filter(Boolean).map((u) => absolute(origin, u)),
      category: product.category?.name,
      keywords: product.keywords?.length ? product.keywords.join(', ') : undefined,
      url,
      brand: { '@type': 'Brand', name: product.farmer?.stallName },
      offers: {
        '@type': 'Offer',
        url,
        price: product.price,
        priceCurrency: 'PKR',
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: product.farmer?.stallName, url: `${origin}/farmers/${product.farmer?.slug}` },
      },
      ...(product.ratingCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: product.ratingAvg, reviewCount: product.ratingCount, bestRating: 5, worstRating: 1 } } : {}),
    },
  };
}

async function farmerMeta(slug, origin) {
  const farmer = await Farmer.findOne({ slug: slug.toLowerCase(), isActive: true }).lean();
  if (!farmer) return null;
  return {
    title: `${farmer.stallName}, local farmer${farmer.city ? ` in ${farmer.city}` : ''}`,
    keywords: [farmer.stallName, ...(farmer.tags || []), farmer.city && `farmer in ${farmer.city}`],
    description: clip(farmer.bio || `${farmer.stallName} sells fresh produce on MarketLink. See this week's stock, pickup times and reviews.`),
    image: absolute(origin, farmer.coverImage || farmer.logo),
    type: 'profile',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: farmer.stallName,
      description: farmer.bio || undefined,
      image: absolute(origin, farmer.logo),
      url: `${origin}/farmers/${farmer.slug}`,
      telephone: farmer.phone || undefined,
      address: { '@type': 'PostalAddress', streetAddress: farmer.address, addressLocality: farmer.city || undefined, addressCountry: 'PK' },
      ...(farmer.latitude ? { geo: { '@type': 'GeoCoordinates', latitude: farmer.latitude, longitude: farmer.longitude } } : {}),
      ...(farmer.ratingCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: farmer.ratingAvg, reviewCount: farmer.ratingCount, bestRating: 5, worstRating: 1 } } : {}),
    },
  };
}

async function marketMeta(slug, origin) {
  const market = await Market.findOne({ slug: slug.toLowerCase(), isActive: true }).lean();
  if (!market) return null;
  const days = (market.operatingDays || []).map((d) => DAY[d]);
  return {
    title: `${market.name}, farmers market${market.city ? ` in ${market.city}` : ''}`,
    description: clip(market.description || `${market.name}, ${market.address}. Open ${days.join(', ')}, ${market.openTime} to ${market.closeTime}. See the farmers and pre-order on MarketLink.`),
    keywords: [market.name, market.city && `farmers market ${market.city}`, 'weekly market'],
    image: absolute(origin, market.image),
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: market.name,
      description: market.description || undefined,
      image: absolute(origin, market.image),
      url: `${origin}/markets/${market.slug}`,
      address: { '@type': 'PostalAddress', streetAddress: market.address, addressLocality: market.city || undefined, addressCountry: 'PK' },
      geo: { '@type': 'GeoCoordinates', latitude: market.latitude, longitude: market.longitude },
      openingHoursSpecification: days.length ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: market.openTime, closes: market.closeTime }] : undefined,
    },
  };
}

/** Title, description, image and structured data for a URL. `notFound` for unknown products, farmers or markets. */
export async function pageMeta(req) {
  const origin = siteOrigin(req);
  const pathname = decodeURIComponent(req.path).replace(/\/+$/, '') || '/';
  const detail = pathname.match(/^\/(products|farmers|markets)\/([^/]+)$/);
  let meta = null;
  if (detail) {
    const [, kind, slug] = detail;
    meta = await (kind === 'products' ? productMeta : kind === 'farmers' ? farmerMeta : marketMeta)(slug, origin).catch(() => null);
    if (!meta) return { origin, pathname, notFound: true, title: 'Page not found', description: DEFAULT_DESCRIPTION, noindex: true };
  } else if (STATIC_PAGES[pathname]) {
    meta = { ...STATIC_PAGES[pathname] };
    // A category page of the shop gets its own title
    if (pathname === '/products' && req.query.category) {
      const category = await Category.findOne({ slug: String(req.query.category).toLowerCase() }).select('name description').lean().catch(() => null);
      if (category) meta = { title: `${category.name} from local farmers`, description: clip(category.description || `Fresh ${category.name.toLowerCase()} from local farmers. Pre-order and pick up at the market.`), keywords: [`fresh ${category.name.toLowerCase()}`, `buy ${category.name.toLowerCase()}`] };
    }
  } else {
    meta = { title: null, description: DEFAULT_DESCRIPTION, noindex: PRIVATE.test(pathname) };
  }
  if (PRIVATE.test(pathname)) meta.noindex = true;
  // Filtered and paged shop pages point search engines to the main page (or the category page)
  const canonicalPath = pathname === '/products' && req.query.category ? `/products?category=${encodeURIComponent(String(req.query.category).toLowerCase())}` : pathname;
  return { origin, pathname, canonical: `${origin}${canonicalPath === '/' ? '/' : canonicalPath}`, ...meta };
}

// Who runs the site and the site search, on every page (absolute URLs as search engines expect)
const SOCIAL = ['https://www.facebook.com/marketlinkpk', 'https://www.instagram.com/marketlinkpk', 'https://x.com/marketlinkpk', 'https://www.youtube.com/@marketlinkpk', 'https://www.linkedin.com/company/marketlinkpk'];
function siteJsonLd(origin) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: SITE,
        url: `${origin}/`,
        logo: `${origin}/brand/icon-512.png`,
        description: 'Local farmers markets online: pre-order fresh produce and pick it up at the stall.',
        email: 'hello@marketlink.pk',
        telephone: '+92 21 3456 7890',
        address: { '@type': 'PostalAddress', streetAddress: 'Aptech Learning Centre, F.B. Area', addressLocality: 'Karachi', addressCountry: 'PK' },
        sameAs: SOCIAL,
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        name: SITE,
        url: `${origin}/`,
        publisher: { '@id': `${origin}/#organization` },
        potentialAction: { '@type': 'SearchAction', target: `${origin}/products?search={search_term_string}`, 'query-input': 'required name=search_term_string' },
      },
    ],
  };
}

/** Page keywords first, then the site keywords (no duplicates, 20 at most). */
export function keywordList(extra = []) {
  const seen = new Set();
  const out = [];
  for (const k of [...(extra || []), ...DEFAULT_KEYWORDS]) {
    const word = String(k || '').trim();
    if (!word || seen.has(word.toLowerCase())) continue;
    seen.add(word.toLowerCase());
    out.push(word);
  }
  return out.slice(0, 20).join(', ');
}

const ldScript = (id, data) => `<script type="application/ld+json" id="${id}">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

function headTags(meta) {
  const title = meta.title ? `${meta.title} · ${SITE}` : DEFAULT_TITLE;
  const description = meta.description || DEFAULT_DESCRIPTION;
  const image = meta.image || `${meta.origin}/brand/icon-512.png`;
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="keywords" content="${esc(keywordList(meta.keywords))}" />`,
    `<meta name="robots" content="${meta.noindex ? 'noindex, nofollow' : 'index, follow'}" />`,
    meta.noindex ? '' : `<link rel="canonical" href="${esc(meta.canonical)}" />`,
    `<meta property="og:site_name" content="${SITE}" />`,
    `<meta property="og:type" content="${esc(meta.type || 'website')}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:url" content="${esc(meta.canonical || meta.origin + meta.pathname)}" />`,
    '<meta property="og:locale" content="en_PK" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    ldScript('ld-site', siteJsonLd(meta.origin)),
    meta.jsonLd ? ldScript('ld-page', meta.jsonLd) : '',
  ];
  return tags.filter(Boolean).join('\n    ');
}

/** Sends index.html with the page's own head tags (SPA fallback for every non-API URL). */
export async function sendPage(req, res) {
  const meta = await pageMeta(req);
  const html = readTemplate().replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, `<!--seo:start-->\n    ${headTags(meta)}\n    <!--seo:end-->`);
  res.status(meta.notFound ? 404 : 200).set('Cache-Control', 'no-cache').type('html').send(html);
}

let sitemapCache = { at: 0, origin: '', xml: '' };

/** GET /sitemap.xml: every public page, product, farmer and market (cached for 10 minutes). */
export async function sitemap(req, res) {
  const origin = siteOrigin(req);
  if (sitemapCache.xml && sitemapCache.origin === origin && Date.now() - sitemapCache.at < 10 * 60 * 1000) {
    return res.type('application/xml').send(sitemapCache.xml);
  }
  const [products, farmers, markets, categories] = await Promise.all([
    Product.find(Product.publicFilter()).select('slug updatedAt').lean(),
    Farmer.find({ isActive: true }).select('slug updatedAt').lean(),
    Market.find({ isActive: true }).select('slug updatedAt').lean(),
    Category.find({ isActive: { $ne: false } }).select('slug updatedAt').lean(),
  ]);
  const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : undefined);
  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/products', priority: '0.9', changefreq: 'daily' },
    { loc: '/markets', priority: '0.8', changefreq: 'weekly' },
    { loc: '/farmers', priority: '0.8', changefreq: 'weekly' },
    { loc: '/map', priority: '0.6', changefreq: 'weekly' },
    { loc: '/about', priority: '0.5', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
    { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
    { loc: '/register/farmer', priority: '0.5', changefreq: 'monthly' },
    ...categories.map((c) => ({ loc: `/products?category=${c.slug}`, lastmod: day(c.updatedAt), priority: '0.7', changefreq: 'daily' })),
    ...products.map((p) => ({ loc: `/products/${p.slug}`, lastmod: day(p.updatedAt), priority: '0.8', changefreq: 'daily' })),
    ...farmers.map((f) => ({ loc: `/farmers/${f.slug}`, lastmod: day(f.updatedAt), priority: '0.7', changefreq: 'weekly' })),
    ...markets.map((m) => ({ loc: `/markets/${m.slug}`, lastmod: day(m.updatedAt), priority: '0.7', changefreq: 'weekly' })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${esc(origin + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`)
    .join('\n')}\n</urlset>\n`;
  sitemapCache = { at: Date.now(), origin, xml };
  res.type('application/xml').send(xml);
}

/** GET /robots.txt */
export function robots(req, res) {
  const origin = siteOrigin(req);
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/',
      'Disallow: /account',
      'Disallow: /farmer/',
      'Disallow: /farmer$',
      'Disallow: /admin',
      'Disallow: /checkout',
      'Disallow: /cart',
      'Disallow: /reset-password/',
      '',
      `Sitemap: ${origin}/sitemap.xml`,
      '',
    ].join('\n')
  );
}
