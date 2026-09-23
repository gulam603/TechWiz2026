import { Category } from '../../models/index.js';
import { isValidId } from '../../utils/helpers.js';

/** Accepts a category id or slug and returns the category (or null). */
export async function resolveCategory(value) {
  if (!value) return null;
  const filter = isValidId(value) ? { _id: value } : { slug: String(value).toLowerCase() };
  return Category.findOne(filter).lean();
}
