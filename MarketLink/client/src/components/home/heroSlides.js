// Slides of the home page banner. Photos: Open Images (CC BY 2.0), see client/public/images/CREDITS.md.
import CREDITS from './heroCredits.json';
import { t } from '../../i18n';

const ALT = {
  welcome: 'Fruit and vegetable stalls at a farmers market',
  winter: 'Fresh mandarin oranges with their leaves',
  spring: 'Punnets of ripe strawberries',
  summer: 'A basket of ripe mangoes',
  autumn: 'Red apples and green pears',
  pickup: 'Crates of fresh produce ready at a market stall',
  farmers: 'A farmer harvesting sweet potatoes in the field',
};

const hero = (name, focus = '50% 50%') => ({ src: `/images/hero/${name}.webp`, alt: ALT[name], focus, credit: CREDITS[`/images/hero/${name}.webp`] });

// The harvest slide changes with the season (month 1 = January), like the announcement bar
const SEASONS = [
  {
    months: [12, 1, 2],
    eyebrow: 'Winter harvest',
    title: 'Kinnow, carrots and fresh winter greens',
    text: 'Juicy kinnow from Sargodha, sweet carrots and leafy greens are at the markets now. Reserve yours before Friday.',
    to: '/products?category=vegetables',
    label: 'Shop winter produce',
    photo: hero('winter'),
    badge: { icon: 'bi-snow', text: 'Winter citrus is in' },
  },
  {
    months: [3, 4],
    eyebrow: 'Spring harvest',
    title: 'Strawberries and the first spring greens',
    text: 'Sweet Lahore strawberries, fresh mint and crunchy cucumbers. Boxes sell out quickly, so pre-order early.',
    to: '/products?category=fruits',
    label: 'Shop spring produce',
    photo: hero('spring'),
    badge: { icon: 'bi-flower1', text: 'Picked this week' },
  },
  {
    months: [5, 6, 7, 8],
    eyebrow: 'Mango season is here',
    title: 'Sindhri and Chaunsa mangoes, tree-ripened',
    text: 'The king of fruits, straight from the Gadap orchards. Pre-order early: they sell out by Sunday noon.',
    to: '/products?category=fruits',
    label: 'Shop mangoes',
    photo: hero('summer', '50% 60%'),
    badge: { icon: 'bi-sun', text: 'Tree-ripened mangoes' },
  },
  {
    months: [9, 10, 11],
    eyebrow: 'Autumn harvest',
    title: 'Crisp Swat apples, pears and kiwis',
    text: 'New-season fruit from the hills of Swat, picked this week and brought to your nearest market.',
    to: '/products?category=fruits',
    label: 'Shop autumn fruit',
    photo: hero('autumn'),
    badge: { icon: 'bi-tree', text: 'New-season fruit' },
  },
];

/** The slides for a month: welcome, what is in season, how pickup works and selling for farmers. */
export function heroSlides(month = new Date().getMonth() + 1) {
  const season = SEASONS.find((s) => s.months.includes(month)) || SEASONS[0];
  const slides = [
    {
      id: 'welcome',
      theme: 'forest',
      eyebrow: t('This week\'s harvest is live'),
      title: t('Fresh from local farms, reserved for you'),
      text: t('See which farmers are at the market, what\'s in stock and the price. Pre-order online and pick up at the stall.'),
      primary: { label: t('Start shopping'), to: '/products' },
      secondary: { label: t('Find a market'), to: '/markets' },
      photo: hero('welcome'),
      badge: { icon: 'bi-basket2', text: t('Fresh stock every week') },
    },
    {
      id: 'season',
      theme: 'peach',
      eyebrow: season.eyebrow,
      title: season.title,
      text: season.text,
      primary: { label: season.label, to: season.to },
      secondary: { label: t('All products'), to: '/products' },
      photo: season.photo,
      badge: season.badge,
    },
    {
      id: 'pickup',
      theme: 'cream',
      eyebrow: t('Pickup only, pay at the stall'),
      title: t('Pre-order today, collect on market day'),
      text: t('Choose a pickup time that suits you. We tell you when your order is packed. You pay the farmer in person.'),
      primary: { label: t('How it works'), to: '/#how-it-works' },
      secondary: { label: t('Open the map'), to: '/map' },
      photo: hero('pickup'),
      badge: { icon: 'bi-cash-coin', text: t('No online payment') },
    },
    {
      id: 'farmers',
      theme: 'lime',
      eyebrow: t('For farmers'),
      title: t('Sell your harvest before you pack the truck'),
      text: t('List your weekly stock, take pre-orders with pickup times and see your best sellers. Free to join.'),
      primary: { label: t('Register your stall'), to: '/register/farmer', guestOnly: true },
      secondary: { label: t('Learn more'), to: '/about' },
      photo: hero('farmers', '50% 35%'),
      badge: { icon: 'bi-shop', text: t('Free to join') },
    },
  ];
  // Texts in the language in use (the button labels are translated where they are drawn)
  return slides.map((s) => ({ ...s, eyebrow: t(s.eyebrow), title: t(s.title), text: t(s.text), photo: { ...s.photo, alt: t(s.photo.alt) }, badge: s.badge && { ...s.badge, text: t(s.badge.text) } }));
}
