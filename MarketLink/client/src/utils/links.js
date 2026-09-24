/** Readable product URL: /products/sindhri-mangoes (falls back to the id for old data). */
export function productPath(product) {
  if (!product) return '/products';
  if (typeof product === 'string') return `/products/${product}`;
  return `/products/${product.slug || product._id || product.productId}`;
}
