import { Farmer, Market, Order, Product, User } from '../models/index.js';
import { ORDER_STATUS, ROLES, USER_STATUS } from '../utils/constants.js';
import { round2 } from '../utils/helpers.js';
import { addDays, startOfDay, toDateKey } from '../utils/dates.js';

export const REPORT_TITLES = {
  platform_overview: 'Platform overview',
  orders_summary: 'Orders summary',
  revenue_by_market: 'Revenue by market',
  top_farmers: 'Most active farmers',
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

const BUILDERS = {
  platform_overview: platformOverview,
  orders_summary: ordersSummary,
  revenue_by_market: revenueByMarket,
  top_farmers: topFarmers,
};

export async function buildReport(type, from, to) {
  return BUILDERS[type](from, to);
}
