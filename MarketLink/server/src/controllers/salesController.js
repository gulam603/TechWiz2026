import { Order, Product } from '../models/index.js';
import { DAY_NAMES, ORDER_STATUS } from '../utils/constants.js';
import { round2 } from '../utils/helpers.js';
import { addDays, startOfDay } from '../utils/dates.js';

const DAY = 24 * 60 * 60 * 1000;
const isKey = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ''));
const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

function period(query) {
  const to = isKey(query.to) ? new Date(`${query.to}T23:59:59.999`) : new Date();
  const days = [7, 30, 90, 365].includes(Number(query.days)) ? Number(query.days) : 30;
  const from = isKey(query.from) ? new Date(`${query.from}T00:00:00`) : startOfDay(addDays(to, -(days - 1)));
  if (from > to) return { from: to, to: from };
  return { from, to };
}

const pct = (a, b) => (b ? round2(((a - b) / b) * 100) : null);

/**
 * GET /api/farmer/reports/sales?days=30 | from=&to=
 * Sales insights for the signed-in farmer: totals compared with the previous period,
 * daily trend, products, categories, markets, weekdays, pickup times and repeat customers.
 * Sales = completed orders (paid at pickup); cancellations and open orders are shown separately.
 */
export async function salesReport(req, res) {
  const { from, to } = period(req.query);
  const span = to - from + 1;
  const prevFrom = new Date(from.getTime() - span);
  const farmerId = req.farmer._id;

  const [orders, prevOrders, firstOrders] = await Promise.all([
    Order.find({ farmer: farmerId, createdAt: { $gte: from, $lte: to } }).populate('customer', 'name email city').populate('market', 'name').lean(),
    Order.find({ farmer: farmerId, createdAt: { $gte: prevFrom, $lt: from }, status: ORDER_STATUS.COMPLETED }).select('totalAmount').lean(),
    Order.find({ farmer: farmerId, createdAt: { $lt: from } }).select('customer').lean(),
  ]);
  const sold = orders.filter((o) => o.status === ORDER_STATUS.COMPLETED);
  const cancelled = orders.filter((o) => [ORDER_STATUS.CANCELLED, ORDER_STATUS.DECLINED].includes(o.status));
  const open = orders.filter((o) => [ORDER_STATUS.PLACED, ORDER_STATUS.ACCEPTED, ORDER_STATUS.READY].includes(o.status));
  const revenue = round2(sold.reduce((s, o) => s + o.totalAmount, 0));
  const prevRevenue = round2(prevOrders.reduce((s, o) => s + o.totalAmount, 0));

  // Products (with category) sold in the period
  const productIds = [...new Set(sold.flatMap((o) => o.items.map((i) => String(i.product))))];
  const productDocs = await Product.find({ _id: { $in: productIds } }).populate('category', 'name color').select('category name').lean();
  const categoryOf = new Map(productDocs.map((p) => [String(p._id), p.category]));

  const byProduct = new Map();
  const byCategory = new Map();
  const byMarket = new Map();
  const byWeekday = DAY_NAMES.map((name) => ({ day: name, orders: 0, revenue: 0 }));
  const bySlot = new Map();
  const byCustomer = new Map();
  const series = new Map();
  let items = 0;

  for (let t = startOfDay(from).getTime(); t <= to.getTime(); t += DAY) series.set(dayKey(t), { date: dayKey(t), orders: 0, revenue: 0 });

  for (const o of sold) {
    const k = dayKey(o.createdAt);
    const d = series.get(k) || { date: k, orders: 0, revenue: 0 };
    d.orders += 1;
    d.revenue = round2(d.revenue + o.totalAmount);
    series.set(k, d);

    const m = byMarket.get(String(o.market?._id)) || { market: o.market?.name || 'Market', orders: 0, revenue: 0 };
    m.orders += 1;
    m.revenue = round2(m.revenue + o.totalAmount);
    byMarket.set(String(o.market?._id), m);

    const wd = new Date(`${o.pickupDate}T00:00:00`).getDay();
    byWeekday[wd].orders += 1;
    byWeekday[wd].revenue = round2(byWeekday[wd].revenue + o.totalAmount);

    const hour = (o.pickupSlot?.start || '00:00').slice(0, 2);
    const s = bySlot.get(hour) || { hour, orders: 0 };
    s.orders += 1;
    bySlot.set(hour, s);

    const cId = String(o.customer?._id || o.customer);
    const c = byCustomer.get(cId) || { customerId: cId, customer: o.customer?.name || 'Customer', city: o.customer?.city || '', orders: 0, revenue: 0, last: o.createdAt };
    c.orders += 1;
    c.revenue = round2(c.revenue + o.totalAmount);
    if (o.createdAt > c.last) c.last = o.createdAt;
    byCustomer.set(cId, c);

    for (const i of o.items) {
      items += i.quantity;
      const p = byProduct.get(String(i.product)) || { product: i.name, unit: i.unit, quantity: 0, revenue: 0, orders: 0 };
      p.quantity += i.quantity;
      p.revenue = round2(p.revenue + i.subtotal);
      p.orders += 1;
      byProduct.set(String(i.product), p);
      const cat = categoryOf.get(String(i.product));
      const ck = String(cat?._id || 'other');
      const cr = byCategory.get(ck) || { category: cat?.name || 'Other', color: cat?.color, revenue: 0, quantity: 0 };
      cr.revenue = round2(cr.revenue + i.subtotal);
      cr.quantity += i.quantity;
      byCategory.set(ck, cr);
    }
  }

  const earlier = new Set(firstOrders.map((o) => String(o.customer)));
  const customers = [...byCustomer.values()].sort((a, b) => b.revenue - a.revenue);
  const repeat = customers.filter((c) => c.orders > 1 || earlier.has(c.customerId)).length;
  const products = [...byProduct.values()].map((p) => ({ ...p, share: revenue ? round2((p.revenue / revenue) * 100) : 0 })).sort((a, b) => b.revenue - a.revenue);
  const markets = [...byMarket.values()].sort((a, b) => b.revenue - a.revenue);
  const categories = [...byCategory.values()].sort((a, b) => b.revenue - a.revenue);
  const busiest = [...byWeekday].sort((a, b) => b.orders - a.orders)[0];
  const slots = [...bySlot.values()].sort((a, b) => a.hour.localeCompare(b.hour));
  const peakSlot = [...slots].sort((a, b) => b.orders - a.orders)[0];

  // Short, plain-language insights for the top of the report
  const insights = [];
  if (products[0]) insights.push({ icon: 'bi-trophy', text: `${products[0].product} is your best seller: ${products[0].quantity} ${products[0].unit} (${products[0].share}% of sales).` });
  if (busiest?.orders) insights.push({ icon: 'bi-calendar-week', text: `${busiest.day} is your busiest pickup day with ${busiest.orders} completed orders.` });
  if (peakSlot) insights.push({ icon: 'bi-clock', text: `Most customers pick up around ${peakSlot.hour}:00.` });
  if (markets[0]) insights.push({ icon: 'bi-geo-alt', text: `${markets[0].market} brings the most sales (${markets.length > 1 ? `${round2((markets[0].revenue / revenue) * 100)}%` : 'all of them'}).` });
  if (customers.length) insights.push({ icon: 'bi-arrow-repeat', text: `${repeat} of ${customers.length} customers came back more than once.` });
  if (orders.length && cancelled.length) insights.push({ icon: 'bi-x-circle', text: `${round2((cancelled.length / orders.length) * 100)}% of pre-orders were cancelled or declined.` });

  res.json({
    period: { from: dayKey(from), to: dayKey(to) },
    kpis: {
      revenue,
      revenueChange: pct(revenue, prevRevenue),
      orders: sold.length,
      ordersChange: pct(sold.length, prevOrders.length),
      items,
      averageOrder: sold.length ? round2(revenue / sold.length) : 0,
      customers: customers.length,
      repeatCustomers: repeat,
      newCustomers: customers.filter((c) => !earlier.has(c.customerId)).length,
      cancelled: cancelled.length,
      cancellationRate: orders.length ? round2((cancelled.length / orders.length) * 100) : 0,
      openOrders: open.length,
      openValue: round2(open.reduce((s, o) => s + o.totalAmount, 0)),
    },
    insights,
    series: [...series.values()],
    products,
    categories,
    markets,
    weekdays: byWeekday,
    slots,
    customers,
  });
}
