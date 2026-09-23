/**
 * MarketLink Assistant - a lightweight rule-based chatbot.
 *
 * It does not call any external AI service. Instead it:
 *  1. normalises the question,
 *  2. detects the intent with keyword rules (timings, pickup, availability, products ...),
 *  3. recognises markets, farmers, categories and days mentioned in the text,
 *  4. answers from live data in the database.
 */
import env from '../config/env.js';
import { Category, Farmer, Market, Order, Product } from '../models/index.js';
import { DAY_NAMES, OPEN_ORDER_STATUSES, PRODUCT_STATUS, ROLES } from '../utils/constants.js';
import { escapeRegex } from '../utils/helpers.js';

const STOP_WORDS = new Set(
  'a an the is are was were be do does did i you me my we our it its of for to in on at by with and or can could would should will what when where which who how any some there here have has get buy find need want show tell about please price cost much many available availability today tomorrow this week market markets bazaar farmer farmers farm stall stalls vendor sell sells selling fresh open time timing timings hours pickup slot slots window windows day days is are im looking near me from have got anyone somebody kg per rate'.split(
    ' '
  )
);

const NAME_NOISE = new Set(['market', 'farmers', 'farmer', 'farm', 'farms', 'the', 'bazaar', 'fresh', 'weekend', 'sunday', 'friday', 'saturday', 'green', 'organic', 'and', 'co', 'stall', 'fields', 'garden', 'gardens']);

const has = (text, words) => words.some((w) => new RegExp(`\\b${w}`, 'i').test(text));
const fmtDays = (days = []) => (days.length ? days.map((d) => DAY_NAMES[d]).join(', ') : 'no fixed days yet');
const closedNote = (farmer) =>
  farmer.blockedDates?.length ? `\n⚠️ Not at the market on: ${farmer.blockedDates.slice(0, 5).join(', ')}.` : '';
const money = (n) => `${env.currency} ${Number(n).toLocaleString('en-US')}`;

function tokens(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Finds the entity whose distinctive name words appear in the question. */
function matchEntity(text, list, getName) {
  let best = null;
  let bestScore = 0;
  const lower = text.toLowerCase();
  for (const item of list) {
    const name = getName(item).toLowerCase();
    if (lower.includes(name)) return { ...item, matchScore: 99 }; // full name typed
    const words = tokens(name).filter((w) => w.length >= 4 && !NAME_NOISE.has(w));
    const score = words.filter((w) => new RegExp(`\\b${escapeRegex(w)}`).test(lower)).length;
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return best ? { ...best, matchScore: bestScore } : null;
}

function detectDay(text) {
  const lower = text.toLowerCase();
  if (/\btoday\b/.test(lower)) return new Date().getDay();
  if (/\btomorrow\b/.test(lower)) return (new Date().getDay() + 1) % 7;
  const index = DAY_NAMES.findIndex((d) => lower.includes(d.toLowerCase()) || new RegExp(`\\b${d.slice(0, 3).toLowerCase()}\\b`).test(lower));
  return index === -1 ? null : index;
}

const productCard = (p) => ({
  kind: 'product',
  id: String(p._id),
  title: p.name,
  subtitle: `${money(p.price)} / ${p.unit} · ${p.farmer?.stallName || ''}${p.status === PRODUCT_STATUS.AVAILABLE ? ` · ${p.quantityAvailable} left` : ' · sold out'}`,
  image: p.image,
  link: `/products/${p._id}`,
});
const marketCard = (m) => ({
  kind: 'market',
  id: String(m._id),
  title: m.name,
  subtitle: `${fmtDays(m.operatingDays)} · ${m.openTime}-${m.closeTime}`,
  image: m.image,
  link: `/markets/${m.slug}`,
});
const farmerCard = (f) => ({
  kind: 'farmer',
  id: String(f._id),
  title: f.stallName,
  subtitle: `${fmtDays(f.operatingDays)}${f.ratingCount ? ` · ★ ${f.ratingAvg}` : ''}`,
  image: f.logo,
  link: `/farmers/${f.slug}`,
});

/** Products whose name starts with the searched word rank first ("mango" -> Mangoes before Mango Chutney). */
function nameScore(product, words) {
  const name = product.name.toLowerCase();
  return words.reduce((score, w) => {
    const stem = w.replace(/(es|s)$/, '');
    if (new RegExp(`\\b${escapeRegex(stem)}(e?s)?$`).test(name)) return score + 2;
    return name.includes(stem) ? score + 1 : score;
  }, product.status === PRODUCT_STATUS.AVAILABLE ? 0.5 : 0);
}

const DEFAULT_SUGGESTIONS = ['Market timings', 'Where can I buy tomatoes?', 'Pickup windows', 'How do I pay?'];

function reply(text, extra = {}) {
  return { reply: text, cards: extra.cards || [], suggestions: extra.suggestions || DEFAULT_SUGGESTIONS };
}

async function searchProducts(words, categoryId, farmerId) {
  const filter = { ...Product.publicFilter() };
  if (categoryId) filter.category = categoryId;
  if (farmerId) filter.farmer = farmerId;
  if (words.length) filter.$or = words.map((w) => ({ name: { $regex: escapeRegex(w.replace(/(es|s)$/, '')), $options: 'i' } }));
  return Product.find(filter).populate('farmer', 'stallName slug').sort({ status: 1, totalSold: -1 }).limit(5).lean();
}

export async function answer(rawMessage, user) {
  const message = String(rawMessage || '').trim().slice(0, 300);
  if (!message) return reply('Please type a question, for example "When is the Clifton market open?"');
  const text = message.toLowerCase();

  const [markets, farmers, categories] = await Promise.all([
    Market.find({ isActive: true }).select('name slug city address operatingDays openTime closeTime image').lean(),
    Farmer.find({ isActive: true }).select('stallName slug logo operatingDays pickupWindows markets blockedDates ratingAvg ratingCount orderCutoffHours').populate('pickupWindows.market', 'name').lean(),
    Category.find({ isActive: true }).select('name slug').lean(),
  ]);
  const market = matchEntity(text, markets, (m) => m.name);
  let farmer = matchEntity(text, farmers, (f) => f.stallName);
  // "where can I buy honey" is a product question even though a farmer is called "... Honey ..."
  const shopping = /\b(buy|where|find|price|cost|get)\b/.test(text) && !/\b(farmer|farm|stall|vendor)\b/.test(text);
  if (farmer && farmer.matchScore === 1 && shopping) farmer = null;
  // Remove the recognised names so "Thatta Dairy" is not also read as the "Dairy" category
  let rest = text;
  for (const name of [farmer?.stallName, market?.name].filter(Boolean)) {
    for (const w of tokens(name)) rest = rest.replace(new RegExp(`\\b${escapeRegex(w)}\\b`, 'g'), ' ');
  }
  const category = categories.find((c) => rest.includes(c.name.toLowerCase()) || tokens(c.name).some((w) => w.length > 4 && rest.includes(w)));
  const day = detectDay(text);

  // --- small talk & FAQs -------------------------------------------------
  if (/^(hi|hello|hey|salam|assalam|aoa|good (morning|afternoon|evening))\b/.test(text)) {
    return reply(`Hello${user ? ` ${user.name.split(' ')[0]}` : ''}! 👋 I'm the MarketLink assistant. Ask me about market timings, farmer availability, pickup windows or where to find a product.`);
  }
  if (has(text, ['thank', 'thanks', 'shukriya'])) return reply('You are welcome! Happy shopping at the market. 🥕');
  if (has(text, ['pay', 'payment', 'cash', 'card', 'online payment'])) {
    return reply('MarketLink has no online payment. You pre-order here and pay the farmer in person when you pick up your order at the market (cash or whatever the farmer accepts).');
  }
  if (has(text, ['deliver', 'delivery', 'shipping', 'courier', 'home delivery'])) {
    return reply('We do not deliver. MarketLink is pickup-only: choose a pickup date and time slot at checkout and collect your order at the farmer\'s stall.');
  }
  if (has(text, ['cancel', 'modify', 'change my order', 'edit my order', 'edit order'])) {
    return reply('You can modify or cancel a pre-order from **My Orders** until the farmer\'s cut-off time (usually a few hours before your pickup slot). After the cut-off the order is locked.', {
      suggestions: ['Track my order', 'Pickup windows', 'How do I pay?'],
    });
  }
  if (has(text, ['sell', 'become a farmer', 'register my stall', 'vendor account', 'list my'])) {
    return reply('Farmers can register from **Sell on MarketLink** (Register as Farmer). After an admin approves your stall you can publish weekly stock, set pickup windows and manage pre-orders.');
  }
  if (/how (do|can|to) (i )?(order|pre-?order|buy|shop)/.test(text) || has(text, ['how does it work', 'how it works'])) {
    return reply('1️⃣ Browse products or farmers and add items to your cart.\n2️⃣ At checkout pick a pickup date & time slot for each farmer.\n3️⃣ The farmer accepts your order and marks it ready.\n4️⃣ Collect it at the market and pay at pickup.');
  }

  // --- my orders -----------------------------------------------------------
  if (has(text, ['my order', 'my orders', 'order status', 'track', 'where is my order'])) {
    if (!user || user.role !== ROLES.CUSTOMER) return reply('Please log in as a customer to see your orders. After logging in, open **My Orders** from your account menu.');
    const orders = await Order.find({ customer: user._id, status: { $in: OPEN_ORDER_STATUSES } }).populate('farmer', 'stallName').sort({ pickupAt: 1 }).limit(5).lean();
    if (!orders.length) return reply('You have no active pre-orders right now. Browse the shop to place one!');
    const lines = orders.map((o) => `• **${o.orderNumber}** – ${o.farmer?.stallName}: *${o.status}*, pickup ${o.pickupDate} at ${o.pickupSlot.start}`);
    return reply(`Here are your active pre-orders:\n${lines.join('\n')}`, {
      cards: orders.map((o) => ({ kind: 'order', id: String(o._id), title: o.orderNumber, subtitle: `${o.status} · ${o.pickupDate} ${o.pickupSlot.start}`, link: `/account/orders/${o._id}` })),
    });
  }

  // --- market timings ------------------------------------------------------
  const asksTiming = has(text, ['time', 'timing', 'open', 'close', 'hours', 'when', 'schedule', 'days']);
  if (asksTiming && (market || has(text, ['market', 'bazaar']))) {
    if (market) {
      return reply(`**${market.name}** is open on ${fmtDays(market.operatingDays)} from ${market.openTime} to ${market.closeTime}.\n📍 ${market.address}`, { cards: [marketCard(market)] });
    }
    const list = (day !== null ? markets.filter((m) => m.operatingDays.includes(day)) : markets).slice(0, 6);
    if (!list.length) return reply(`No market is open on ${DAY_NAMES[day]}.`);
    return reply(`${day !== null ? `Markets open on ${DAY_NAMES[day]}` : 'Market timings'}:\n${list.map((m) => `• **${m.name}** – ${fmtDays(m.operatingDays)}, ${m.openTime}-${m.closeTime}`).join('\n')}`, {
      cards: list.map(marketCard),
    });
  }

  // --- pickup windows ------------------------------------------------------
  if (has(text, ['pickup', 'pick up', 'collect', 'slot', 'window'])) {
    if (farmer) {
      const lines = farmer.pickupWindows.map((w) => `• ${DAY_NAMES[w.day]} ${w.start}-${w.end} at ${w.market?.name || 'market'}`);
      return reply(
        `Pickup windows for **${farmer.stallName}**:\n${lines.join('\n') || 'No pickup windows published yet.'}\nOrders close ${farmer.orderCutoffHours} hour(s) before the slot starts.${closedNote(farmer)}`,
        { cards: [farmerCard(farmer)] }
      );
    }
    return reply('Each farmer publishes pickup windows (for example Saturday 08:00-12:00) split into short time slots. You choose a slot at checkout, and can change it until the cut-off time. Ask me "pickup windows for <farmer name>" for details.', {
      suggestions: farmers.slice(0, 3).map((f) => `Pickup windows for ${f.stallName}`),
    });
  }

  // --- farmer availability -------------------------------------------------
  const productWords = tokens(rest).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  if (farmer && (category || productWords.length)) {
    const found = await searchProducts(productWords, category?._id, farmer._id);
    if (found.length) {
      return reply(`${farmer.stallName} has:\n${found.map((p) => `• **${p.name}** – ${money(p.price)}/${p.unit}${p.status === PRODUCT_STATUS.AVAILABLE ? ` (${p.quantityAvailable} left)` : ' (sold out)'}`).join('\n')}`, {
        cards: found.map(productCard),
      });
    }
  }
  if (farmer) {
    const inStock = await Product.countDocuments({ ...Product.publicFilter(), farmer: farmer._id, status: PRODUCT_STATUS.AVAILABLE });
    const marketNames = [...new Set(farmer.pickupWindows.map((w) => w.market?.name).filter(Boolean))];
    return reply(
      `**${farmer.stallName}** sells on ${fmtDays(farmer.operatingDays)}${marketNames.length ? ` at ${marketNames.join(', ')}` : ''}. They currently have ${inStock} product(s) in stock.${closedNote(farmer)}`,
      { cards: [farmerCard(farmer)], suggestions: [`Pickup windows for ${farmer.stallName}`, 'Market timings'] }
    );
  }
  if (has(text, ['farmer', 'farmers', 'stall', 'vendor', 'who', 'which']) && (market || day !== null)) {
    let list = farmers;
    if (market) list = list.filter((f) => f.markets.some((m) => String(m) === String(market._id)));
    if (day !== null) list = list.filter((f) => f.operatingDays.includes(day));
    const where = [market ? `at ${market.name}` : '', day !== null ? `on ${DAY_NAMES[day]}` : ''].filter(Boolean).join(' ');
    if (!list.length) return reply(`I couldn't find farmers ${where}.`);
    return reply(`Farmers ${where}:\n${list.slice(0, 6).map((f) => `• **${f.stallName}** – ${fmtDays(f.operatingDays)}`).join('\n')}`, { cards: list.slice(0, 6).map(farmerCard) });
  }

  // --- product search ------------------------------------------------------
  const words = tokens(text).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const products = (await searchProducts(words, category?._id)).sort((a, b) => nameScore(b, words) - nameScore(a, words));

  // Product details: "tell me about Sindhri mangoes" or a single clear match
  const wantsDetails = /\b(about|detail|details|describe|info|information|what is|tell me)\b/.test(text);
  const top = products[0];
  if (top && (products.length === 1 || (wantsDetails && nameScore(top, words) >= 2))) {
    const product = await Product.findById(top._id)
      .populate({ path: 'farmer', select: 'stallName slug pickupWindows orderCutoffHours', populate: { path: 'pickupWindows.market', select: 'name' } })
      .populate('category', 'name')
      .lean();
    const days = [...new Set(product.farmer.pickupWindows.map((w) => `${DAY_NAMES[w.day]} at ${w.market?.name}`))];
    const stock = product.status === PRODUCT_STATUS.AVAILABLE ? `${product.quantityAvailable} ${product.unit} available this week` : 'sold out right now (add it to favourites for a restock alert)';
    return reply(
      `**${product.name}** (${product.category?.name}) – ${money(product.price)} per ${product.unit} from **${product.farmer.stallName}**.\n${product.description || ''}\nStock: ${stock}.${product.ratingCount ? `\nRating: ★ ${product.ratingAvg} from ${product.ratingCount} review(s).` : ''}\nPickup: ${days.join('; ') || 'no pickup windows yet'} (order ${product.farmer.orderCutoffHours} h before your slot).`,
      { cards: [productCard({ ...top })], suggestions: [`Pickup windows for ${product.farmer.stallName}`, 'How do I pay?'] }
    );
  }

  if (products.length) {
    const lines = products.map((p) => `• **${p.name}** – ${money(p.price)}/${p.unit} from ${p.farmer?.stallName}${p.status === PRODUCT_STATUS.AVAILABLE ? ` (${p.quantityAvailable} left)` : ' (sold out)'}`);
    return reply(`Here is what I found${category ? ` in ${category.name}` : ''}:\n${lines.join('\n')}`, { cards: products.map(productCard) });
  }
  if (market) return reply(`**${market.name}**: ${fmtDays(market.operatingDays)}, ${market.openTime}-${market.closeTime}. 📍 ${market.address}`, { cards: [marketCard(market)] });

  return reply("Sorry, I couldn't find an answer for that. Try asking about market timings, a farmer's availability, pickup windows, or a product such as \"mangoes\" or \"honey\".");
}
