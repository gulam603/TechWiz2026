import { ContentFlag, Farmer, Order, Product, Review, User } from '../models/index.js';
import { FLAG_REASONS } from '../models/ContentFlag.js';
import { needsModeration } from '../services/moderation.js';
import { ROLES } from '../utils/constants.js';
import AppError from '../utils/AppError.js';
import { ORDER_STATUS, OPEN_ORDER_STATUSES } from '../utils/constants.js';
import { assertId, getPagination, isValidId } from '../utils/helpers.js';
import { refreshRatings } from '../services/ratings.js';
import { notify } from '../services/notify.js';

// GET /api/reviews?product=&farmer=
export async function listReviews(req, res) {
  const { page, limit, skip } = getPagination(req.query, 10, 50);
  const filter = { isRemoved: false };
  if (isValidId(req.query.product)) {
    filter.product = req.query.product;
    filter.type = 'product';
  }
  if (isValidId(req.query.farmer)) filter.farmer = req.query.farmer;
  const [reviews, total] = await Promise.all([
    Review.find(filter).populate('customer', 'name avatar').populate('product', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);
  res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
}

// POST /api/reviews  { orderId, type: 'product'|'farmer', productId?, rating, comment }
// Only possible after the order was completed, once per product / farmer per order.
export async function createReview(req, res) {
  const orderId = assertId(req.body.orderId, 'order');
  const type = req.body.type === 'farmer' ? 'farmer' : 'product';
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new AppError('Please choose a rating from 1 to 5 stars', 400);

  const order = await Order.findOne({ _id: orderId, customer: req.user._id });
  if (!order) throw new AppError('Order not found', 404);
  if (order.status !== ORDER_STATUS.COMPLETED) throw new AppError('You can review an order after it has been completed', 400);

  let productId;
  if (type === 'product') {
    productId = assertId(req.body.productId, 'product');
    if (!order.items.some((i) => String(i.product) === productId)) throw new AppError('This product is not part of the order', 400);
  }
  const duplicate = await Review.exists({ order: order._id, customer: req.user._id, type, ...(productId ? { product: productId } : {}) });
  if (duplicate) throw new AppError('You have already reviewed this', 409);

  const comment = req.body.comment ? String(req.body.comment).trim().slice(0, 1000) : undefined;
  // Content moderation: reviews with offensive words are held until an admin checks them
  const word = needsModeration(comment);
  const review = await Review.create({
    type,
    product: productId,
    farmer: order.farmer,
    customer: req.user._id,
    order: order._id,
    rating,
    comment,
    ...(word ? { isRemoved: true, removedReason: 'Held for moderation' } : {}),
  });
  if (word) {
    await ContentFlag.create({ targetType: 'review', review: review._id, farmer: order.farmer, product: productId, reason: 'auto_language', note: `Contains "${word}"` });
    const admins = await User.find({ role: ROLES.ADMIN }).select('_id').lean();
    for (const a of admins) await notify(a._id, { type: 'moderation', title: 'Review held for moderation', message: `A review by ${req.user.name} contains "${word}" and is waiting for a check.`, link: '/admin/moderation' });
    return res.status(201).json({ review, held: true, message: 'Thanks! Your review will appear after a quick check by our team.' });
  }
  await refreshRatings({ productId, farmerId: order.farmer });

  const farmer = await Farmer.findById(order.farmer).select('user');
  const item = productId ? order.items.find((i) => String(i.product) === productId) : null;
  await notify(farmer.user, {
    type: 'review',
    title: `New ${rating}-star review`,
    message: `${req.user.name} reviewed ${item ? item.name : 'your stall'}: "${(review.comment || '').slice(0, 80)}"`,
    link: '/farmer/reviews',
  });
  res.status(201).json({ review });
}

// Latest completed order of this customer for which the product / farmer has not been reviewed yet.
async function reviewableOrders(customerId) {
  const [orders, reviews] = await Promise.all([
    Order.find({ customer: customerId, status: ORDER_STATUS.COMPLETED }).populate('farmer', 'stallName slug logo').sort({ completedAt: -1, createdAt: -1 }).lean(),
    Review.find({ customer: customerId }).select('type product farmer').lean(),
  ]);
  const reviewedProducts = new Set(reviews.filter((r) => r.type === 'product').map((r) => String(r.product)));
  const reviewedFarmers = new Set(reviews.filter((r) => r.type === 'farmer').map((r) => String(r.farmer)));
  const pending = [];
  const seen = new Set();
  for (const o of orders) {
    const fid = String(o.farmer?._id || o.farmer);
    if (!reviewedFarmers.has(fid) && !seen.has(`f${fid}`)) {
      seen.add(`f${fid}`);
      pending.push({ type: 'farmer', orderId: o._id, orderNumber: o.orderNumber, completedAt: o.completedAt || o.updatedAt, farmer: o.farmer });
    }
    for (const i of o.items) {
      const pid = String(i.product);
      if (reviewedProducts.has(pid) || seen.has(`p${pid}`)) continue;
      seen.add(`p${pid}`);
      pending.push({ type: 'product', orderId: o._id, orderNumber: o.orderNumber, completedAt: o.completedAt || o.updatedAt, farmer: o.farmer, product: { _id: i.product, name: i.name, image: i.image, unit: i.unit } });
    }
  }
  return pending;
}

// GET /api/reviews/mine  (customer: things to review + reviews already written)
export async function myReviews(req, res) {
  const [pending, written] = await Promise.all([
    reviewableOrders(req.user._id),
    Review.find({ customer: req.user._id }).populate('product', 'name slug image').populate('farmer', 'stallName slug logo').sort({ createdAt: -1 }).lean(),
  ]);
  const slugs = await Product.find({ _id: { $in: pending.filter((p) => p.product).map((p) => p.product._id) } }).select('slug').lean();
  const slugOf = new Map(slugs.map((p) => [String(p._id), p.slug]));
  pending.forEach((p) => {
    if (p.product) p.product.slug = slugOf.get(String(p.product._id));
  });
  res.json({ pending, written });
}

// GET /api/reviews/eligible?product=ID | ?farmer=ID  (can the signed-in customer review it now?)
export async function reviewEligibility(req, res) {
  if (req.user.role !== ROLES.CUSTOMER) return res.json({ canReview: false, reason: 'Only customers can write reviews.' });
  const pending = await reviewableOrders(req.user._id);
  const hit = isValidId(req.query.product)
    ? pending.find((p) => p.type === 'product' && String(p.product._id) === String(req.query.product))
    : pending.find((p) => p.type === 'farmer' && String(p.farmer?._id || p.farmer) === String(req.query.farmer));
  if (hit) return res.json({ canReview: true, orderId: hit.orderId, orderNumber: hit.orderNumber });
  const reviewed = isValidId(req.query.product)
    ? await Review.exists({ customer: req.user._id, type: 'product', product: req.query.product })
    : await Review.exists({ customer: req.user._id, type: 'farmer', farmer: req.query.farmer });
  res.json({ canReview: false, reason: reviewed ? 'You have already reviewed this. Thank you!' : 'You can write a review after picking up an order.' });
}

// GET /api/customer/badges  (sidebar counters)
export async function customerBadges(req, res) {
  const [ready, pending] = await Promise.all([Order.countDocuments({ customer: req.user._id, status: ORDER_STATUS.READY }), reviewableOrders(req.user._id)]);
  const open = await Order.countDocuments({ customer: req.user._id, status: { $in: OPEN_ORDER_STATUSES } });
  // The sidebar counter shows recent pickups (last 30 days) that still have something to review
  const recent = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const orders = new Set(pending.filter((p) => new Date(p.completedAt).getTime() >= recent).map((p) => String(p.orderId)));
  res.json({ ready, open, toReview: orders.size });
}

// POST /api/flags  { targetType: review | product | farmer, targetId, reason, note }  (report content)
export async function reportContent(req, res) {
  const targetType = ['review', 'product', 'farmer'].includes(req.body.targetType) ? req.body.targetType : null;
  if (!targetType) throw new AppError('Choose what you are reporting', 400);
  const id = assertId(req.body.targetId, targetType);
  const reason = FLAG_REASONS.includes(req.body.reason) && req.body.reason !== 'auto_language' ? req.body.reason : 'other';
  const target = {};
  if (targetType === 'review') {
    const review = await Review.findById(id).select('product farmer').lean();
    if (!review) throw new AppError('Review not found', 404);
    Object.assign(target, { review: id, product: review.product, farmer: review.farmer });
  } else if (targetType === 'product') {
    const product = await Product.findById(id).select('farmer').lean();
    if (!product) throw new AppError('Product not found', 404);
    Object.assign(target, { product: id, farmer: product.farmer });
  } else {
    if (!(await Farmer.exists({ _id: id }))) throw new AppError('Farmer not found', 404);
    target.farmer = id;
  }
  const key = { targetType, [targetType]: id, reporter: req.user._id, status: 'open' };
  if (await ContentFlag.exists(key)) return res.json({ message: 'You already reported this. Our team will look at it.' });
  await ContentFlag.create({ ...target, targetType, reason, note: req.body.note ? String(req.body.note).trim().slice(0, 500) : undefined, reporter: req.user._id });
  const admins = await User.find({ role: ROLES.ADMIN }).select('_id').lean();
  for (const a of admins) await notify(a._id, { type: 'moderation', title: `New report: ${targetType}`, message: `${req.user.name} reported a ${targetType} (${reason.replace('_', ' ')}).`, link: '/admin/moderation' });
  res.status(201).json({ message: 'Thank you. The MarketLink team will review this.' });
}
