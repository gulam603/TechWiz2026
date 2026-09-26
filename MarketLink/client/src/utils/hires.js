// Banner photos that also come in a 1920 px wide copy (name-1920.webp) for large screens. The copies were
// made from the 1024 px originals with an AI upscaler (EDSR), so the banners stay sharp across the screen.
const HIRES = new Set([
  '/images/hero/welcome.webp',
  '/images/hero/autumn.webp',
  '/images/hero/winter.webp',
  '/images/hero/spring.webp',
  '/images/hero/summer.webp',
  '/images/hero/pickup.webp',
  '/images/hero/farmers.webp',
  '/images/hero/cta-farmer.webp',
  '/images/banners/deal-vegetables.webp',
]);

/** srcSet for an <img>: the 1024 px photo for phones, the 1920 px copy for large screens (undefined for other photos). */
export const srcSetFor = (src) => (HIRES.has(src) ? `${src} 1024w, ${src.replace(/\.webp$/, '-1920.webp')} 1920w` : undefined);
