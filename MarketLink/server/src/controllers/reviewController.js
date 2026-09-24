import { Farmer, Order, Review } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { ORDER_STATUS } from '../utils/constants.js';
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

  const review = await Review.create({
    type,
    product: productId,
    farmer: order.farmer,
    customer: req.user._id,
    order: order._id,
    rating,
    comment: req.body.comment ? String(req.body.comment).trim().slice(0, 1000) : undefined,
  });
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
