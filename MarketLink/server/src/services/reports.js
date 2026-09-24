import { Category, City, ContentFlag, Farmer, Market, Order, Product, Review, User } from '../models/index.js';
import { ORDER_STATUS, ROLES, USER_STATUS } from '../utils/constants.js';
import { round2 } from '../utils/helpers.js';
import { addDays, startOfDay, toDateKey } from '../utils/dates.js';

export const REPORT_TITLES = {
  platform_overview: 'Platform overview',
  orders_summary: 'Orders summary',
  revenue_by_market: 'Revenue by market',
  top_farmers: 'Most active farmers',
  sales_by_category: 'Sales by category',
  customer_activity: 'Customer activity',
  inventory_status: 'Inventory and low stock',
  city_overview: 'Cities overview',
  reviews_moderation: 'Reviews and moderation',
};

const sum = (list, fn) => round2(list.reduce((s, x) => s + fn(x), 0));

function ordersInRange(from, to) {
  return Order.find({ createdAt: { $gte: from, $lte: to } })
    .select('status totalAmount market farmer createdAt completedAt items')
    .lean();
}

function dailySeries(orders, from, to) {
  const series = [];
  for (let d = startOfDay(from); d <= to; d = addDays(d, 1)) series.push({ date: toDateKey(d), orders: 0, revenue: 0 });
  const index = new Map(series.map((p, i) => [p.date, i]));
  for (const o of orders) {
    const i = index.get(toDateKey(new Date(o.createdAt)));
    if (i === undefined) continue;
    series[i].orders += 1;
    if (o.status === ORDER_STATUS.COMPLETED) series[i].revenue = round2(series[i].revenue + o.totalAmount);
  }
  return series;
}

async function ordersSummary(from, to) {
  const orders = await ordersInRange(from, to);
  const completed = orders.filter((o) => o.status === ORDER_STATUS.COMPLETED);
  const byStatus = Object.fromEntries(Object.values(ORDER_STATUS).map((s) => [s, orders.filter((o) => o.status === s).length]));
  return {
    totals: {
      orders: orders.length,
      completed: completed.length,
      revenue: sum(completed, (o) => o.totalAmount),
      averageOrder: completed.length ? round2(sum(completed, (o) => o.totalAmount) / completed.length) : 0,
      cancelled: byStatus.cancelled,
      declined: byStatus.declined,
    },
    byStatus,
    series: dailySeries(orders, from, to),
  };
}

async function revenueByMarket(from, to) {
  const orders = await ordersInRange(from, to);
  const markets = await Market.find().select('name city').lean();
  const rows = new Map(markets.map((m) => [String(m._id), { marketId: String(m._id), market: m.name, city: m.city, orders: 0, completed: 0, revenue: 0 }]));
  for (const o of orders) {
    const row = rows.get(String(o.market));
    if (!row) continue;
    row.orders += 1;
    if (o.status === ORDER_STATUS.COMPLETED) {
      row.completed += 1;
      row.revenue = round2(row.revenue + o.totalAmount);
    }
  }
  const list = [...rows.values()].sort((a, b) => b.revenue - a.revenue);
  const total = sum(list, (r) => r.revenue);
  return {
    totals: { revenue: total, orders: sum(list, (r) => r.orders), markets: list.length },
    rows: list.map((r) => ({ ...r, share: total ? round2((r.revenue / total) * 100) : 0 })),
  };
}

async function topFarmers(from, to) {
  const orders = await ordersInRange(from, to);
  const farmers = await Farmer.find().select('stallName slug ratingAvg ratingCount isActive').lean();
  const productCounts = await Promise.all(farmers.map((f) => Product.countDocuments({ farmer: f._id, isRemoved: false })));
  const rows = new Map(
    farmers.map((f, i) => [
      String(f._id),
      { farmerId: String(f._id), farmer: f.stallName, slug: f.slug, rating: f.ratingAvg, reviews: f.ratingCount, products: productCounts[i], orders: 0, completed: 0, itemsSold: 0, revenue: 0 },
    ])
  );
  for (const o of orders) {
    const row = rows.get(String(o.farmer));
    if (!row) continue;
    row.orders += 1;
    if (o.status === ORDER_STATUS.COMPLETED) {
      row.completed += 1;
      row.revenue = round2(row.revenue + o.totalAmount);
      row.itemsSold += o.items.reduce((s, i) => s + i.quantity, 0);
    }
  }
  const list = [...rows.values()].sort((a, b) => b.orders - a.orders || b.revenue - a.revenue);
  return { totals: { farmers: list.length, activeSellers: list.filter((r) => r.orders > 0).length }, rows: list };
}

async function platformOverview(from, to) {
  const [customers, farmersActive, farmersPending, markets, products, newCustomers, newFarmers, summary] = await Promise.all([
    User.countDocuments({ role: ROLES.CUSTOMER }),
    User.countDocuments({ role: ROLES.FARMER, status: USER_STATUS.ACTIVE }),
    User.countDocuments({ role: ROLES.FARMER, status: USER_STATUS.PENDING }),
    Market.countDocuments({ isActive: true }),
    Product.countDocuments({ isRemoved: false }),
    User.countDocuments({ role: ROLES.CUSTOMER, createdAt: { $gte: from, $lte: to } }),
    User.countDocuments({ role: ROLES.FARMER, createdAt: { $gte: from, $lte: to } }),
    ordersSummary(from, to),
  ]);
  return {
    totals: { customers, farmersActive, farmersPending, markets, products, newCustomers, newFarmers, ...summary.totals },
    byStatus: summary.byStatus,
    series: summary.series,
  };
}


// ---- platform-wide reports with a generic table (columns + rows) and an optional chart

async function salesByCategory(from, to) {
  const orders = (await ordersInRange(from, to)).filter((o) => o.status === ORDER_STATUS.COMPLETED);
  const products = await Product.find().select('category').lean();
  const categories = await Category.find().select('name').lean();
  const catOf = new Map(products.map((p) => [String(p._id), String(p.category)]));
  const rows = new Map(categories.map((c) => [String(c._id), { category: c.name, orders: new Set(), items: 0, revenue: 0 }]));
  for (const o of orders) {
    for (const i of o.items) {
      const row = rows.get(catOf.get(String(i.product)));
      if (!row) continue;
      row.orders.add(String(o._id));
      row.items += i.quantity;
      row.revenue = round2(row.revenue + i.subtotal);
    }
  }
  const list = [...rows.values()].map((r) => ({ ...r, orders: r.orders.size })).sort((a, b) => b.revenue - a.revenue);
  const total = sum(list, (r) => r.revenue);
  return {
    totals: { revenue: total, items: list.reduce((s, r) => s + r.items, 0), categories: list.length },
    columns: [{ key: 'category', label: 'Category' }, { key: 'orders', label: 'Orders', num: true }, { key: 'items', label: 'Items sold', num: true }, { key: 'revenue', label: 'Revenue', money: true }, { key: 'share', label: 'Share %', num: true }],
    rows: list.map((r) => ({ ...r, share: total ? round2((r.revenue / total) * 100) : 0 })),
    chart: { label: 'category', value: 'revenue', name: 'Revenue', money: true },
  };
}

async function customerActivity(from, to) {
  const [customers, orders] = await Promise.all([User.find({ role: ROLES.CUSTOMER }).select('name email city status createdAt').lean(), ordersInRange(from, to)]);
  const rows = new Map(customers.map((c) => [String(c._id), { customer: c.name, email: c.email, city: c.city || '', status: c.status, joined: toDateKey(new Date(c.createdAt)), orders: 0, completed: 0, cancelled: 0, spent: 0, farmers: new Set() }]));
  for (const o of await Order.find({ createdAt: { $gte: from, $lte: to } }).select('customer status totalAmount farmer').lean()) {
    const row = rows.get(String(o.customer));
    if (!row) continue;
    row.orders += 1;
    row.farmers.add(String(o.farmer));
    if (o.status === ORDER_STATUS.COMPLETED) {
      row.completed += 1;
      row.spent = round2(row.spent + o.totalAmount);
    }
    if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.DECLINED].includes(o.status)) row.cancelled += 1;
  }
  const list = [...rows.values()].map((r) => ({ ...r, farmers: r.farmers.size })).sort((a, b) => b.spent - a.spent);
  return {
    totals: {
      customers: list.length,
      active: list.filter((r) => r.orders > 0).length,
      newCustomers: customers.filter((c) => c.createdAt >= from && c.createdAt <= to).length,
      repeat: list.filter((r) => r.completed > 1).length,
      orders: orders.length,
    },
    columns: [{ key: 'customer', label: 'Customer' }, { key: 'city', label: 'City' }, { key: 'orders', label: 'Orders', num: true }, { key: 'completed', label: 'Completed', num: true }, { key: 'cancelled', label: 'Cancelled', num: true }, { key: 'farmers', label: 'Farmers', num: true }, { key: 'spent', label: 'Spent', money: true }, { key: 'joined', label: 'Joined' }],
    rows: list,
    chart: { label: 'customer', value: 'spent', name: 'Spent', money: true, top: 10 },
  };
}

async function inventoryStatus() {
  const products = await Product.find({ isRemoved: false }).populate('farmer', 'stallName').select('name unit price quantityAvailable lowStockThreshold status farmer totalSold').lean();
  const rows = products
    .map((p) => {
      const t = p.lowStockThreshold ?? 5;
      const state = p.status === 'unavailable' ? 'Unavailable' : p.quantityAvailable <= 0 ? 'Sold out' : p.quantityAvailable <= t ? 'Low stock' : 'In stock';
      return { product: p.name, farmer: p.farmer?.stallName || '', stock: p.quantityAvailable, unit: p.unit, alertLevel: t, state, sold: p.totalSold, value: round2(p.price * p.quantityAvailable) };
    })
    .sort((a, b) => a.stock - b.stock);
  return {
    totals: { products: rows.length, lowStock: rows.filter((r) => r.state === 'Low stock').length, soldOut: rows.filter((r) => r.state === 'Sold out').length, units: rows.reduce((s, r) => s + r.stock, 0), stockValue: sum(rows, (r) => r.value) },
    columns: [{ key: 'product', label: 'Product' }, { key: 'farmer', label: 'Farmer' }, { key: 'stock', label: 'In stock', num: true }, { key: 'unit', label: 'Unit' }, { key: 'alertLevel', label: 'Alert level', num: true }, { key: 'state', label: 'State' }, { key: 'sold', label: 'Sold', num: true }, { key: 'value', label: 'Stock value', money: true }],
    rows,
  };
}

async function cityOverview(from, to) {
  const [cities, markets, farmers, customers, orders] = await Promise.all([
    City.find().sort({ sortOrder: 1 }).lean(),
    Market.find().select('city').lean(),
    Farmer.find({ isActive: true }).select('city').lean(),
    User.find({ role: ROLES.CUSTOMER }).select('city').lean(),
    Order.find({ createdAt: { $gte: from, $lte: to } }).populate('market', 'city').select('market status totalAmount').lean(),
  ]);
  const rows = cities.map((c) => {
    const own = orders.filter((o) => o.market?.city === c.name);
    const done = own.filter((o) => o.status === ORDER_STATUS.COMPLETED);
    return {
      city: c.name,
      province: c.province || '',
      markets: markets.filter((m) => m.city === c.name).length,
      farmers: farmers.filter((f) => f.city === c.name).length,
      customers: customers.filter((u) => u.city === c.name).length,
      orders: own.length,
      revenue: sum(done, (o) => o.totalAmount),
    };
  });
  return {
    totals: { cities: rows.length, activeCities: rows.filter((r) => r.orders > 0).length, revenue: sum(rows, (r) => r.revenue) },
    columns: [{ key: 'city', label: 'City' }, { key: 'province', label: 'Province' }, { key: 'markets', label: 'Markets', num: true }, { key: 'farmers', label: 'Farmers', num: true }, { key: 'customers', label: 'Customers', num: true }, { key: 'orders', label: 'Orders', num: true }, { key: 'revenue', label: 'Revenue', money: true }],
    rows: rows.sort((a, b) => b.revenue - a.revenue),
    chart: { label: 'city', value: 'revenue', name: 'Revenue', money: true },
  };
}

async function reviewsModeration(from, to) {
  const [reviews, flags, farmers] = await Promise.all([
    Review.find({ createdAt: { $gte: from, $lte: to } }).select('rating isRemoved farmer type').lean(),
    ContentFlag.find({ createdAt: { $gte: from, $lte: to } }).select('status reason targetType action farmer').lean(),
    Farmer.find().select('stallName ratingAvg ratingCount').lean(),
  ]);
  const rows = farmers.map((f) => {
    const own = reviews.filter((r) => String(r.farmer) === String(f._id));
    return {
      farmer: f.stallName,
      reviews: own.length,
      average: own.length ? round2(own.reduce((s, r) => s + r.rating, 0) / own.length) : 0,
      lowRatings: own.filter((r) => r.rating <= 2).length,
      removed: own.filter((r) => r.isRemoved).length,
      reports: flags.filter((x) => String(x.farmer) === String(f._id)).length,
      overall: f.ratingAvg,
    };
  });
  const byStars = [5, 4, 3, 2, 1].map((n) => ({ rating: `${n} stars`, count: reviews.filter((r) => r.rating === n).length }));
  return {
    totals: {
      reviews: reviews.length,
      averageRating: reviews.length ? round2(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0,
      removedReviews: reviews.filter((r) => r.isRemoved).length,
      reports: flags.length,
      openReports: flags.filter((x) => x.status === 'open').length,
      resolvedReports: flags.filter((x) => x.status !== 'open').length,
    },
    byStars,
    columns: [{ key: 'farmer', label: 'Farmer' }, { key: 'reviews', label: 'Reviews', num: true }, { key: 'average', label: 'Average (period)', num: true }, { key: 'lowRatings', label: '1-2 stars', num: true }, { key: 'removed', label: 'Removed', num: true }, { key: 'reports', label: 'Reports', num: true }, { key: 'overall', label: 'Overall rating', num: true }],
    rows: rows.sort((a, b) => b.reviews - a.reviews),
    chart: { label: 'rating', value: 'count', name: 'Reviews', data: 'byStars' },
  };
}

const BUILDERS = {
  platform_overview: platformOverview,
  orders_summary: ordersSummary,
  revenue_by_market: revenueByMarket,
  top_farmers: topFarmers,
  sales_by_category: salesByCategory,
  customer_activity: customerActivity,
  inventory_status: inventoryStatus,
  city_overview: cityOverview,
  reviews_moderation: reviewsModeration,
};

export async function buildReport(type, from, to) {
  return BUILDERS[type](from, to);
}
