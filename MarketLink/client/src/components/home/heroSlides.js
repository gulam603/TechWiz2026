// Slides of the home page banner. Images are product photos without a background (uploads/cutouts).
const cut = (name) => `/uploads/cutouts/${name}.webp`;

// The harvest slide changes with the season (month 1 = January), like the announcement bar
const SEASONS = [
  {
    months: [12, 1, 2],
    eyebrow: 'Winter harvest',
    title: 'Kinnow, carrots and fresh winter greens',
    text: 'Juicy kinnow from Sargodha, sweet carrots and leafy greens are at the markets now. Reserve yours before Friday.',
    to: '/products?category=vegetables',
    label: 'Shop winter produce',
    images: ['kinnow-oranges', 'sweet-carrots', 'iceberg-lettuce', 'farm-potatoes'],
  },
  {
    months: [3, 4],
    eyebrow: 'Spring harvest',
    title: 'Strawberries and the first spring greens',
    text: 'Sweet Lahore strawberries, fresh mint and crunchy cucumbers. Boxes sell out quickly, so pre-order early.',
    to: '/products?category=fruits',
    label: 'Shop spring produce',
    images: ['strawberries', 'fresh-mint-podina', 'desi-cucumbers', 'lemons'],
  },
  {
    months: [5, 6, 7, 8],
    eyebrow: 'Mango season is here',
    title: 'Sindhri and Chaunsa mangoes, tree-ripened',
    text: 'The king of fruits, straight from the Gadap orchards. Pre-order early: they sell out by Sunday noon.',
    to: '/products?category=fruits',
    label: 'Shop mangoes',
    images: ['sindhri-mangoes', 'chaunsa-mangoes', 'cantaloupe-melon', 'bananas'],
  },
  {
    months: [9, 10, 11],
    eyebrow: 'Autumn harvest',
    title: 'Crisp Swat apples, pears and kiwis',
    text: 'New-season fruit from the hills of Swat, picked this week and brought to your nearest market.',
    to: '/products?category=fruits',
    label: 'Shop autumn fruit',
    images: ['red-apples', 'pears', 'kiwi', 'green-apples'],
  },
];

/** The slides for a month: welcome, what is in season, how pickup works and selling for farmers. */
export function heroSlides(month = new Date().getMonth() + 1) {
  const season = SEASONS.find((s) => s.months.includes(month)) || SEASONS[0];
  return [
    {
      id: 'welcome',
      theme: 'forest',
      eyebrow: "This week's harvest is live",
      title: 'Fresh from local farms, reserved for you',
      text: "See which farmers are at the market, what's in stock and the price. Pre-order online and pick up at the stall.",
      primary: { label: 'Start shopping', to: '/products' },
      secondary: { label: 'Find a market', to: '/markets' },
      images: [cut('farm-potatoes'), cut('red-onions'), cut('green-chillies'), cut('purple-brinjal')],
    },
    {
      id: 'season',
      theme: 'peach',
      eyebrow: season.eyebrow,
      title: season.title,
      text: season.text,
      primary: { label: season.label, to: season.to },
      secondary: { label: 'All products', to: '/products' },
      images: season.images.map(cut),
    },
    {
      id: 'pickup',
      theme: 'cream',
      eyebrow: 'Pickup only, pay at the stall',
      title: 'Pre-order today, collect on market day',
      text: 'Choose a pickup time that suits you. We tell you when your order is packed. You pay the farmer in person.',
      primary: { label: 'How it works', to: '/#how-it-works' },
      secondary: { label: 'Open the map', to: '/map' },
      images: [cut('country-sourdough-loaf'), cut('farm-paneer'), cut('acacia-honey'), cut('butter-croissants')],
    },
    {
      id: 'farmers',
      theme: 'lime',
      eyebrow: 'For farmers',
      title: 'Sell your harvest before you pack the truck',
      text: 'List your weekly stock, take pre-orders with pickup times and see your best sellers. Free to join.',
      primary: { label: 'Register your stall', to: '/register/farmer', guestOnly: true },
      secondary: { label: 'Learn more', to: '/about' },
      images: [cut('desi-rose-bouquet'), cut('mango-chutney'), cut('sunflower-bunch'), cut('hand-churned-butter')],
    },
  ];
}
