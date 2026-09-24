// Structured data (schema.org JSON-LD) for the detail pages. The server builds the same data for the
// first page load (server/src/services/seo.js); these keep it right while browsing inside the app.
const DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const abs = (url) => (!url ? undefined : /^https?:\/\//.test(url) ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`);
const rating = (x) => (x.ratingCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: x.ratingAvg, reviewCount: x.ratingCount, bestRating: 5, worstRating: 1 } } : {});

export function productLd(product) {
  const url = abs(`/products/${product.slug}`);
  const inStock = product.status === 'available' && product.quantityAvailable > 0;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: [product.image, ...(product.gallery || []).map((g) => g.url)].filter(Boolean).map(abs),
    category: product.category?.name,
    url,
    brand: { '@type': 'Brand', name: product.farmer?.stallName },
    offers: {
      '@type': 'Offer',
      url,
      price: product.price,
      priceCurrency: 'PKR',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: product.farmer?.stallName },
    },
    ...rating(product),
  };
}

export function farmerLd(farmer) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: farmer.stallName,
    description: farmer.bio || undefined,
    image: abs(farmer.logo),
    url: abs(`/farmers/${farmer.slug}`),
    address: { '@type': 'PostalAddress', streetAddress: farmer.address, addressLocality: farmer.city || undefined, addressCountry: 'PK' },
    ...(farmer.latitude ? { geo: { '@type': 'GeoCoordinates', latitude: farmer.latitude, longitude: farmer.longitude } } : {}),
    ...rating(farmer),
  };
}

export function marketLd(market) {
  const days = (market.operatingDays || []).map((d) => DAY[d]);
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: market.name,
    description: market.description || undefined,
    image: abs(market.image),
    url: abs(`/markets/${market.slug}`),
    address: { '@type': 'PostalAddress', streetAddress: market.address, addressLocality: market.city || undefined, addressCountry: 'PK' },
    geo: { '@type': 'GeoCoordinates', latitude: market.latitude, longitude: market.longitude },
    ...(days.length ? { openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: market.openTime, closes: market.closeTime }] } : {}),
  };
}

export const clip = (s, n = 160) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : t;
};
