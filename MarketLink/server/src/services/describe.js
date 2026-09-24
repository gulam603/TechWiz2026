import env from '../config/env.js';

/**
 * "Write with AI" for product descriptions.
 *
 * With ANTHROPIC_API_KEY in server/.env the text is written by Claude. Without a key (or when the
 * API cannot be reached) a built-in writer creates it from a small produce knowledge base, the
 * category and the farmer's practices, so the button always works, even offline.
 */

// Keyword -> what the product is like, how people use it and how to keep it
const KNOWLEDGE = [
  { k: /mango|aam/, taste: 'sweet, fragrant and juicy, with smooth fibre-free flesh', use: 'eating fresh, milkshakes, lassi or a summer fruit chaat', keep: 'Leave at room temperature until they give slightly when pressed, then chill.' },
  { k: /tomato/, taste: 'deep red and full of flavour, picked ripe from the vine', use: 'salads, salan, chutney and home-made ketchup', keep: 'Keep out of the fridge so they stay fragrant.' },
  { k: /potato|aloo/, taste: 'firm and creamy, freshly dug with the skin on', use: 'aloo bhujia, fries, curries and parathas', keep: 'Store in a cool, dark place away from onions.' },
  { k: /onion|pyaz/, taste: 'crisp with a clean, sharp bite', use: 'tarka, salads and every everyday curry', keep: 'Keep dry and airy; they last for weeks.' },
  { k: /garlic|lehsan/, taste: 'plump, aromatic cloves with a strong, sweet heat', use: 'tarka, marinades and chutneys', keep: 'Store whole bulbs in a dry, airy basket.' },
  { k: /ginger|adrak/, taste: 'fresh, fibrous and pleasantly fiery', use: 'chai, ginger-garlic paste and stir-fries', keep: 'Wrap and keep in the fridge for up to three weeks.' },
  { k: /spinach|palak/, taste: 'tender, dark-green leaves harvested young', use: 'palak paneer, saag, soups and smoothies', keep: 'Wrap loosely in a damp cloth and refrigerate; best within three days.' },
  { k: /carrot|gajar/, taste: 'crunchy and naturally sweet', use: 'gajar ka halwa, salads, juices and pickles', keep: 'Remove the tops and keep in the fridge crisper.' },
  { k: /cucumber|kheera/, taste: 'cool, crisp and refreshing with thin skin', use: 'raita, salads and summer drinks', keep: 'Refrigerate and use within a week.' },
  { k: /capsicum|pepper|shimla/, taste: 'glossy, crunchy and mildly sweet', use: 'stir-fries, pizza, salads and stuffed shimla mirch', keep: 'Keep dry in the fridge.' },
  { k: /okra|bhindi/, taste: 'tender, young pods that stay crisp when cooked', use: 'bhindi masala and crispy fried bhindi', keep: 'Keep dry and cook within two to three days.' },
  { k: /cauliflower|gobi/, taste: 'tight, creamy-white florets', use: 'aloo gobi, pakoras and roasted gobi', keep: 'Refrigerate with the leaves on.' },
  { k: /cabbage|band gobi/, taste: 'crisp, tightly packed leaves', use: 'coleslaw, stir-fries and cabbage sabzi', keep: 'Keeps well in the fridge for a week or more.' },
  { k: /peas|matar/, taste: 'sweet, bright-green peas', use: 'matar pulao, aloo matar and keema', keep: 'Keep chilled and shell just before cooking.' },
  { k: /corn|makai/, taste: 'sweet, milky kernels', use: 'roasting on coals, corn chaat and soups', keep: 'Cook soon after pickup for the sweetest taste.' },
  { k: /lemon|lime|nimbu/, taste: 'thin-skinned and bursting with juice', use: 'nimbu pani, salads, marinades and pickles', keep: 'Store at room temperature or chill for longer life.' },
  { k: /orange|kinnow|malta/, taste: 'juicy and sweet-tart, easy to peel', use: 'fresh juice, snacks and desserts', keep: 'Keep in a cool place or the fridge.' },
  { k: /apple|saib/, taste: 'crisp, juicy and naturally sweet', use: 'snacking, lunch boxes and baking', keep: 'Refrigerate to keep them crunchy.' },
  { k: /banana|kela/, taste: 'creamy and naturally sweet', use: 'breakfast, milkshakes and banana bread', keep: 'Keep at room temperature, away from other fruit.' },
  { k: /grape|angoor/, taste: 'sweet, juicy and crisp', use: 'snacking and fruit salads', keep: 'Refrigerate unwashed and rinse just before eating.' },
  { k: /guava|amrood/, taste: 'fragrant with sweet, pink or white flesh', use: 'eating with chaat masala, juices and jam', keep: 'Ripen at room temperature, then refrigerate.' },
  { k: /strawberr/, taste: 'bright red, sweet and aromatic', use: 'desserts, milkshakes and breakfast bowls', keep: 'Keep chilled and eat within two days.' },
  { k: /cherr/, taste: 'dark, glossy and sweet', use: 'snacking, desserts and baking', keep: 'Keep chilled and unwashed until eating.' },
  { k: /peach|aaru/, taste: 'soft, fragrant and dripping with juice', use: 'eating fresh, desserts and jams', keep: 'Ripen at room temperature, then chill.' },
  { k: /pear|nashpati/, taste: 'juicy with a delicate sweetness', use: 'snacking, salads and poaching', keep: 'Ripen on the counter, then refrigerate.' },
  { k: /kiwi/, taste: 'tangy-sweet with bright green flesh', use: 'breakfast, smoothies and fruit salads', keep: 'Ripen at room temperature; chill once soft.' },
  { k: /pomegranate|anar/, taste: 'ruby-red, sweet-tart seeds', use: 'fresh juice, raita, salads and chaat', keep: 'Keeps for weeks in a cool place.' },
  { k: /melon|watermelon|tarbooz|kharbooza/, taste: 'sweet, cool and very juicy', use: 'summer snacks and fresh juice', keep: 'Keep whole at room temperature; chill once cut.' },
  { k: /date|khajoor/, taste: 'soft, rich and caramel-sweet', use: 'iftar, snacks and desserts', keep: 'Store in an airtight jar.' },
  { k: /honey|shehad/, taste: 'raw, unfiltered and full of floral flavour', use: 'breakfast, tea, baking and a spoonful on its own', keep: 'Store at room temperature; it may crystallise naturally.' },
  { k: /jam|marmalade|preserve/, taste: 'made in small batches with plenty of fruit', use: 'toast, parathas and baking', keep: 'Refrigerate after opening.' },
  { k: /chutney|pickle|achar/, taste: 'tangy, spiced and made the traditional way', use: 'daal chawal, parathas and sandwiches', keep: 'Use a dry spoon and keep the lid closed.' },
  { k: /olive/, taste: 'firm and savoury, cured in brine', use: 'salads, pizza and snack platters', keep: 'Keep covered in brine and refrigerate after opening.' },
  { k: /milk|doodh/, taste: 'fresh, creamy and collected the same morning', use: 'chai, kheer and breakfast', keep: 'Boil and refrigerate; use within two days.' },
  { k: /yogurt|yoghurt|dahi/, taste: 'thick, set naturally and mildly tangy', use: 'raita, lassi and marinades', keep: 'Keep chilled.' },
  { k: /paneer|cottage/, taste: 'soft, fresh and milky', use: 'palak paneer, tikka and bhurji', keep: 'Keep in water in the fridge and use within three days.' },
  { k: /cheese/, taste: 'rich and full of flavour', use: 'sandwiches, pasta and cheese boards', keep: 'Wrap well and refrigerate.' },
  { k: /butter|makhan|ghee/, taste: 'rich and golden, churned in small batches', use: 'parathas, daal tarka and baking', keep: 'Keep in a cool place or the fridge.' },
  { k: /egg|anday/, taste: 'fresh eggs with deep orange yolks', use: 'breakfast, halwa and baking', keep: 'Refrigerate, pointed end down.' },
  { k: /bread|loaf|naan|baguette|sourdough|\bbuns?\b|bagel/, taste: 'baked the morning of the market with a golden crust', use: 'breakfast, sandwiches and with soups', keep: 'Keep in a paper bag; toast on day two.' },
  { k: /croissant|pastry|cookie|biscuit|pie|cake|rusk/, taste: 'freshly baked, buttery and golden', use: 'tea time, breakfast and gifting', keep: 'Best on the day; keep in an airtight box.' },
  { k: /rice|chawal|basmati/, taste: 'long, fragrant grains that cook up fluffy', use: 'biryani, pulao and plain chawal', keep: 'Store dry in an airtight container.' },
  { k: /atta|flour/, taste: 'stone-ground and wholesome', use: 'soft rotis, parathas and baking', keep: 'Store airtight in a cool, dry place.' },
  { k: /lentil|daal|dal|bean|chickpea|chana|masoor|moong|rajma/, taste: 'clean, even grains that cook evenly', use: 'daal, salan and salads', keep: 'Store airtight in a cool, dry place.' },
  { k: /peanut|almond|walnut|nut|badam|akhrot/, taste: 'crunchy and freshly roasted', use: 'snacking, desserts and garnishing', keep: 'Keep airtight to stay crunchy.' },
  { k: /mint|podina|coriander|dhania|basil|herb|parsley|methi|fenugreek/, taste: 'fragrant and freshly cut', use: 'chutneys, garnishing, raita and teas', keep: 'Stand the stems in water or wrap in a damp cloth in the fridge.' },
  { k: /lettuce|salad|greens|rocket|kale/, taste: 'crisp, tender leaves', use: 'salads, wraps and burgers', keep: 'Keep chilled in a bag with a paper towel.' },
  { k: /rose|tulip|sunflower|flower|bouquet|bunch|lily|orchid/, taste: 'cut fresh on market morning with long, strong stems', use: 'brightening your home or as a gift', keep: 'Trim the stems and change the water every two days.' },
  { k: /plant|money plant|cactus|succulent|hibiscus|pot/, taste: 'healthy, well-rooted and ready for a new home', use: 'balconies, windowsills and gifting', keep: 'Water when the top of the soil feels dry and keep in bright, indirect light.' },
];

const CATEGORY_FALLBACK = [
  { k: /fruit/, taste: 'picked ripe for the best flavour', use: 'snacking, desserts and fresh juice', keep: 'Keep cool and enjoy within a few days.' },
  { k: /veg/, taste: 'harvested for market day and full of flavour', use: 'everyday home cooking', keep: 'Keep cool and use within a few days.' },
  { k: /dairy|egg/, taste: 'fresh from the farm', use: 'breakfast and home cooking', keep: 'Keep refrigerated.' },
  { k: /bak/, taste: 'baked fresh the morning of the market', use: 'breakfast and tea time', keep: 'Best on the day it is bought.' },
  { k: /herb|green/, taste: 'fragrant and freshly cut', use: 'cooking, chutneys and garnishing', keep: 'Keep in the fridge wrapped in a damp cloth.' },
  { k: /honey|preserve/, taste: 'made in small batches', use: 'breakfast and cooking', keep: 'Store in a cool place.' },
  { k: /grain|pulse/, taste: 'clean and carefully sorted', use: 'everyday cooking', keep: 'Store airtight in a cool, dry place.' },
  { k: /flower|plant/, taste: 'fresh and healthy', use: 'brightening your home or as a gift', keep: 'Keep out of harsh sun.' },
];

const OPENERS = [
  (n, f) => `${n} from ${f}`,
  (n, f) => `Fresh ${n.toLowerCase()} grown and brought to market by ${f}`,
  (n, f) => `Our ${n.toLowerCase()} at ${f}`,
];

const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

/** The main word of a product name is usually the last one ("Mango Chutney" is a chutney). */
function findKnowledge(name) {
  const text = name.toLowerCase();
  let best = null;
  let bestAt = -1;
  for (const entry of KNOWLEDGE) {
    const m = entry.k.exec(text);
    if (m && m.index >= bestAt) {
      best = entry;
      bestAt = m.index;
    }
  }
  return best;
}

/** Built-in writer: 3 sentences from the knowledge base; `variant` changes the wording. */
export function localDescription({ name, category = '', unit = '', stallName = 'our farm', practices = [], variant = 0 }) {
  const info = findKnowledge(name) || CATEGORY_FALLBACK.find((x) => x.k.test(category.toLowerCase())) || { taste: 'fresh and full of flavour', use: 'everyday cooking', keep: 'Keep cool and enjoy it fresh.' };
  const v = Math.abs(Number(variant) || 0);
  const opener = OPENERS[v % OPENERS.length](name.trim(), stallName);
  const practice = practices.length ? ` (${practices.slice(0, 2).map(lowerFirst).join(', ')})` : '';
  const sentences = [
    `${opener}${practice}: ${info.taste}.`,
    v % 2 === 0 ? `Perfect for ${info.use}.` : `Great for ${info.use}.`,
    unit ? `Sold per ${unit} and reserved for you until pickup. ${info.keep}` : info.keep,
  ];
  return sentences.join(' ');
}

/** Asks Claude for a description (only when ANTHROPIC_API_KEY is set). */
async function claudeDescription(details) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: AbortSignal.timeout(12000),
    headers: { 'content-type': 'application/json', 'x-api-key': env.anthropic.apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: env.anthropic.model,
      max_tokens: 300,
      system:
        'You write product descriptions for MarketLink, a farmers market pre-order website in Pakistan. Write 2 or 3 short sentences (at most 60 words) in plain, friendly English: what the product is like, what it is good for and one storage tip. No emoji, no prices, no health claims, no quotation marks.',
      messages: [
        {
          role: 'user',
          content: `Product: ${details.name}\nCategory: ${details.category || 'unknown'}\nSold per: ${details.unit || 'unit'}\nFarm / stall: ${details.stallName}${details.practices.length ? `\nFarming practices: ${details.practices.join(', ')}` : ''}${details.variant ? '\nWrite a different version from before.' : ''}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json();
  const text = data.content?.find((c) => c.type === 'text')?.text?.trim();
  if (!text) throw new Error('Empty answer');
  return text.replace(/^["']|["']$/g, '').slice(0, 1500);
}

export async function describeProduct(details) {
  if (env.anthropic.apiKey) {
    try {
      return { description: await claudeDescription(details), source: 'claude' };
    } catch (err) {
      console.warn('[ai] Claude description failed, using the built-in writer:', err.message);
    }
  }
  return { description: localDescription(details), source: 'local' };
}

// ---------------------------------------------------------------- farm / stall descriptions ("About the farm")

const FARM_OPENERS = [
  (d) => `${d.stallName} is a local farm${d.city ? ` from ${d.city}` : ''}`,
  (d) => `At ${d.stallName}${d.city ? ` near ${d.city}` : ''}, we grow food the way our families always have`,
  (d) => `${d.stallName} brings fresh, seasonal produce${d.city ? ` from the fields around ${d.city}` : ''} straight to your market`,
];

const list = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`);

/** Built-in writer for the farm bio shown on the public stall page. */
export function localFarmBio(d) {
  const v = Math.abs(Number(d.variant) || 0);
  const grows = d.categories.length ? list(d.categories.map((c) => c.toLowerCase())) : 'seasonal produce';
  const parts = [`${FARM_OPENERS[v % FARM_OPENERS.length](d)}.`];
  parts.push(
    [`We bring ${grows}, picked and packed for every market day.`, `Our stall offers ${grows}, harvested close to market day so it reaches you fresh.`, `Look out for our ${grows} on every market day.`][v % 3]
  );
  const extra = d.practices.slice(0, 4);
  if (extra.length) parts.push(`What makes us different: ${list(extra.map(lowerFirst))}.`);
  if (d.markets.length) parts.push(`Find us at ${list(d.markets.slice(0, 3))}${d.markets.length > 3 ? ' and more' : ''}.`);
  parts.push(v % 3 === 2 ? 'Pre-order on MarketLink and we will have your basket ready for pickup.' : 'Pre-order online, pick up at the stall and pay in person.');
  return parts.join(' ');
}

async function claudeFarmBio(d) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal: AbortSignal.timeout(12000),
    headers: { 'content-type': 'application/json', 'x-api-key': env.anthropic.apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: env.anthropic.model,
      max_tokens: 350,
      system:
        'You write the "About the farm" text for stalls on MarketLink, a farmers market pre-order website in Pakistan. Write 3 or 4 short, warm sentences (at most 80 words) in plain English, in the first person plural (we). No emoji, no prices, no invented awards or certifications, no quotation marks.',
      messages: [
        {
          role: 'user',
          content: `Stall: ${d.stallName}\nCity: ${d.city || 'unknown'}\nGrows / sells: ${d.categories.join(', ') || 'seasonal produce'}\nFarming practices: ${d.practices.join(', ') || 'none given'}\nMarkets: ${d.markets.join(', ') || 'none yet'}${d.variant ? '\nWrite a different version from before.' : ''}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}`);
  const data = await res.json();
  const text = data.content?.find((c) => c.type === 'text')?.text?.trim();
  if (!text) throw new Error('Empty answer');
  return text.replace(/^["']|["']$/g, '').slice(0, 1200);
}

export async function describeFarm(details) {
  if (env.anthropic.apiKey) {
    try {
      return { description: await claudeFarmBio(details), source: 'claude' };
    } catch (err) {
      console.warn('[ai] Claude farm description failed, using the built-in writer:', err.message);
    }
  }
  return { description: localFarmBio(details), source: 'local' };
}
