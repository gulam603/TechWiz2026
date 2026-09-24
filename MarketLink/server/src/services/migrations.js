import Product from '../models/Product.js';
import { uniqueSlug } from '../utils/slug.js';

/**
 * Small data fixes that run once at start-up. They only touch documents that still need them,
 * so running them again does nothing.
 */
export async function runMigrations() {
  // Products created before readable URLs existed get a slug from their name
  const missing = await Product.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] })
    .select('name')
    .lean();
  for (const p of missing) {
    await Product.updateOne({ _id: p._id }, { slug: await uniqueSlug(Product, p.name, p._id) });
  }
  if (missing.length) console.log(`[db] Added readable URLs to ${missing.length} product(s)`);
}
