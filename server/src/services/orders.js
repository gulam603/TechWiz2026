import crypto from 'node:crypto';
import { Order, Review } from '../models/index.js';
import { ORDER_STATUS, ROLES } from '../utils/constants.js';

/** Human friendly order number, e.g. ML-260923-7K2Q */
export async function generateOrderNumber() {
  const now = new Date();
  const datePart = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  for (;;) {
    const code = crypto.randomBytes(3).toString('base64url').toUpperCase().replace(/[^A-Z0-9]/g, 'X').slice(0, 4);
    const orderNumber = `ML-${datePart}-${code}`;
    // eslint-disable-next-line no-await-in-loop
    if (!(await Order.exists({ orderNumber }))) return orderNumber;
  }
}

/** Customers may change or cancel an order only while it is open and before the farmer's cut-off. */
export function canCustomerModify(order, now = new Date()) {
  return [ORDER_STATUS.PLACED, ORDER_STATUS.ACCEPTED].includes(order.status) && now < new Date(order.cutoffAt);
}

export function pushStatus(order, status, by, note) {
  order.status = status;
  order.statusHistory.push({ status, at: new Date(), by, note });
}

/** Which parts of a completed order the customer has already reviewed. */
export async function reviewState(order, customerId) {
  if (order.status !== ORDER_STATUS.COMPLETED) return null;
  const reviews = await Review.find({ order: order._id, customer: customerId }).select('type product').lean();
  return {
    farmerReviewed: reviews.some((r) => r.type === 'farmer'),
    reviewedProducts: reviews.filter((r) => r.type === 'product').map((r) => String(r.product)),
  };
}

/** Can this user see the order? (owner, household member, the farmer of the order, or admin) */
export function canViewOrder(order, user, farmerId) {
  if (user.role === ROLES.ADMIN) return true;
  if (user.role === ROLES.FARMER) return farmerId && String(order.farmer._id || order.farmer) === String(farmerId);
  const ownerId = String(order.customer._id || order.customer);
  if (ownerId === String(user._id)) return true;
  return false;
}
