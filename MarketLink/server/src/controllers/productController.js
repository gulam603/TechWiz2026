import { Farmer, Product, Review } from '../models/index.js';
import { marketIdsInCity, resolveCategory } from './helpers/category.js';
import AppError from '../utils/AppError.js';
import { PRODUCT_STATUS } from '../utils/constants.js';
import { containsRegex, getPagination, isValidId, toBool, toNumber } from '../utils/helpers.js';

const SORTS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { ratingAvg: -1, ratingCount: -1 },
  popular: { totalSold: -1 },
  name: { name: 1 },
};

async function resolveCategoryId(value) {
  if (!value) return undefined;
  const category = await resolveCategory(value);
  return category?._id || null;
}

/** Builds the Mongo filter for the product catalogue from query string filters. */
export async function buildProductFilter(query) {
  const filter = Product.publicFilter();
  if (query.search) filter.$or = [{ name: containsRegex(query.search) }, { nameUr: containsRegex(query.search) }, { description: containsRegex(query.search) }, { keywords: containsRegex(query.search) }];

  const categoryId = await resolveCategoryId(query.category);
  if (categoryId === null) return null; // unknown category -> no results
  if (categoryId) filter.category = categoryId;

  if (query.market && isValidId(query.market)) filter.markets = query.market;
  else if (query.city) filter.markets = { $in: await marketIdsInCity(query.city) }; // location filter
  if (query.farmer && isValidId(query.farmer)) filter.farmer = query.farmer;
  const day = toNumber(query.day);
  if (day !== undefined && day >= 0 && day <= 6) filter.days = day;

  const minPrice = toNumber(query.minPrice);
  const maxPrice = toNumber(query.maxPrice);
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }
  // Minimum rating (e.g. 4 = four stars and up)
  const rating = toNumber(query.rating);
  if (rating >= 1 && rating <= 5) filter.ratingAvg = { $gte: rating };
  // Farming practice of the farmer (e.g. "Pesticide-free")
  if (query.practice) {
    const farmers = await Farmer.find({ isActive: true, tags: containsRegex(query.practice) }).select('_id').lean();
    const ids = farmers.map((f) => String(f._id));
    filter.farmer = filter.farmer ? (ids.includes(String(filter.farmer)) ? filter.farmer : null) : { $in: farmers.map((f) => f._id) };
  }
  // This week's offers: products with a usual price above today's price
  if (toBool(query.deals)) filter.$expr = { $gt: ['$compareAtPrice', '$price'] };
  if (toBool(query.inStock)) {
    filter.status = PRODUCT_STATUS.AVAILABLE;
    filter.quantityAvailable = { $gt: 0 };
  }
  return filter;
}

// GET /api/products
export async function listProducts(req, res) {
  const { page, limit, skip } = getPagination(req.query, 12);
  const filter = await buildProductFilter(req.query);
  if (!filter) return res.json({ products: [], total: 0, page, pages: 0 });

  const sort = SORTS[req.query.sort] || SORTS.popular;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('farmer', 'stallName slug logo latitude longitude')
      .populate('category', 'name nameUr slug color')
      .sort({ ...sort, _id: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  res.json({ products, total, page, pages: Math.ceil(total / limit) });
}

// GET /api/products/:id
export async function getProduct(req, res) {
  // Products open by readable slug (/products/sindhri-mangoes); old id links keep working
  const key = String(req.params.id || '').toLowerCase();
  const lookup = isValidId(key) ? { _id: key } : { slug: key };
  const product = await Product.findOne({ ...lookup, isRemoved: false, farmerActive: true })
    .populate('category', 'name nameUr slug color')
    .populate({
      path: 'farmer',
      select: 'stallName slug logo address city tags latitude longitude ratingAvg ratingCount operatingDays pickupWindows orderCutoffHours markets',
      populate: { path: 'markets', select: 'name slug address' },
    })
    .lean();
  if (!product) throw new AppError('Product not found', 404);

  const withRefs = (q) => q.populate('farmer', 'stallName slug').populate('category', 'name nameUr slug color');
  const [reviews, sameCategory, fromFarmer] = await Promise.all([
    Review.find({ product: product._id, type: 'product', isRemoved: false })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    withRefs(Product.find({ ...Product.publicFilter(), category: product.category?._id, _id: { $ne: product._id } }))
      .sort({ totalSold: -1 })
      .limit(12)
      .lean(),
    Product.find({ ...Product.publicFilter(), farmer: product.farmer._id, _id: { $ne: product._id } })
      .populate('category', 'name nameUr slug color')
      .select('name nameUr slug image price unit category status quantityAvailable')
      .sort({ totalSold: -1 })
      .limit(4)
      .lean(),
  ]);

  // "You may also like": the same category from other stalls first, topped up with popular products
  const otherStall = (p) => String(p.farmer?._id) !== String(product.farmer._id);
  let related = [...sameCategory.filter(otherStall), ...sameCategory.filter((p) => !otherStall(p))].slice(0, 4);
  if (related.length < 4) {
    const skip = [product._id, ...related.map((p) => p._id), ...fromFarmer.map((p) => p._id)];
    const more = await withRefs(Product.find({ ...Product.publicFilter(), status: 'available', _id: { $nin: skip } }))
      .sort({ totalSold: -1 })
      .limit(4 - related.length)
      .lean();
    related = related.concat(more);
  }

  const isFavorite = Boolean(req.user?.favoriteProducts?.some((id) => String(id) === String(product._id)));
  res.json({ product, reviews, related, fromFarmer, isFavorite });
}

// GET /api/products/price-range  (used by the price filter)
export async function priceRange(req, res) {
  const filter = Product.publicFilter();
  const [min, max] = await Promise.all([
    Product.findOne(filter).sort({ price: 1 }).select('price').lean(),
    Product.findOne(filter).sort({ price: -1 }).select('price').lean(),
  ]);
  res.json({ min: min?.price || 0, max: max?.price || 0 });
}

