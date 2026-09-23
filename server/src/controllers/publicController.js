import { Announcement, Category, ContactMessage, Farmer, Market, Order, Product, Review, User } from '../models/index.js';
import { ORDER_STATUS, ROLES, USER_STATUS } from '../utils/constants.js';
import { containsRegex, pick, requireFields, toNumber } from '../utils/helpers.js';
import { notifyMany } from '../services/notify.js';

// GET /api/stats  -> numbers shown on the home page
export async function publicStats(req, res) {
  const [markets, farmers, products, customers, ordersCompleted] = await Promise.all([
    Market.countDocuments({ isActive: true }),
    Farmer.countDocuments({ isActive: true }),
    Product.countDocuments(Product.publicFilter()),
    User.countDocuments({ role: ROLES.CUSTOMER, status: USER_STATUS.ACTIVE }),
    Order.countDocuments({ status: ORDER_STATUS.COMPLETED }),
  ]);
  res.json({ markets, farmers, products, customers, ordersCompleted });
}

// GET /api/categories
export async function listCategories(req, res) {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean();
  const counts = await Promise.all(
    categories.map((c) => Product.countDocuments({ ...Product.publicFilter(), category: c._id }))
  );
  res.json({ categories: categories.map((c, i) => ({ ...c, productCount: counts[i] })) });
}

// GET /api/search?q=  -> quick search across products, farmers and markets
export async function globalSearch(req, res) {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ products: [], farmers: [], markets: [] });
  const regex = containsRegex(q);
  const [products, farmers, markets] = await Promise.all([
    Product.find({ ...Product.publicFilter(), name: regex })
      .select('name price unit image status quantityAvailable farmer category')
      .populate('farmer', 'stallName slug')
      .populate('category', 'name color')
      .limit(6)
      .lean(),
    Farmer.find({ isActive: true, $or: [{ stallName: regex }, { tags: regex }] })
      .select('stallName slug logo ratingAvg')
      .limit(4)
      .lean(),
    Market.find({ isActive: true, $or: [{ name: regex }, { address: regex }, { city: regex }] })
      .select('name slug address image')
      .limit(4)
      .lean(),
  ]);
  res.json({ products, farmers, markets });
}

// GET /api/map?day=&search=  -> every market and farmer stall with coordinates
export async function mapData(req, res) {
  const marketFilter = { isActive: true };
  const farmerFilter = { isActive: true, latitude: { $ne: null }, longitude: { $ne: null } };
  const day = toNumber(req.query.day);
  if (day !== undefined && day >= 0 && day <= 6) {
    marketFilter.operatingDays = day;
    farmerFilter.operatingDays = day;
  }
  if (req.query.search) {
    marketFilter.$or = [{ name: containsRegex(req.query.search) }, { address: containsRegex(req.query.search) }];
    farmerFilter.stallName = containsRegex(req.query.search);
  }
  const [markets, farmers] = await Promise.all([
    Market.find(marketFilter)
      .select('name slug address city latitude longitude operatingDays openTime closeTime image')
      .lean(),
    Farmer.find(farmerFilter)
      .select('stallName slug logo address city latitude longitude operatingDays ratingAvg ratingCount markets tags')
      .populate('markets', 'name slug')
      .lean(),
  ]);
  res.json({ markets, farmers });
}

// GET /api/announcements/active
export async function activeAnnouncements(req, res) {
  const audiences = ['all'];
  if (req.user?.role === ROLES.CUSTOMER) audiences.push('customer');
  if (req.user?.role === ROLES.FARMER) audiences.push('farmer');
  const announcements = await Announcement.find({ isActive: true, audience: { $in: audiences } })
    .select('title message audience createdAt')
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();
  res.json({ announcements });
}

// GET /api/testimonials  -> recent 5-star reviews for the home page
export async function testimonials(req, res) {
  const reviews = await Review.find({ isRemoved: false, rating: { $gte: 4 }, comment: { $exists: true, $ne: '' } })
    .populate('customer', 'name')
    .populate('farmer', 'stallName slug')
    .sort({ rating: -1, createdAt: -1 })
    .limit(6)
    .lean();
  res.json({ reviews });
}

// POST /api/contact
export async function submitContact(req, res) {
  requireFields(req.body, ['name', 'email', 'message']);
  const msg = await ContactMessage.create(pick(req.body, ['name', 'email', 'subject', 'message']));
  const admins = await User.find({ role: ROLES.ADMIN }).select('_id').lean();
  await notifyMany(
    admins.map((a) => a._id),
    { type: 'system', title: 'New contact message', message: `${msg.name}: ${msg.subject || msg.message.slice(0, 60)}`, link: '/admin/messages' }
  );
  res.status(201).json({ message: 'Thank you! Our team will get back to you soon.' });
}
