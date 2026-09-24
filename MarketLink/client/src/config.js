// App-wide settings. Values can be overridden with a client/.env file (VITE_ prefix).
export const APP_NAME = 'MarketLink';
export const CURRENCY = import.meta.env.VITE_CURRENCY || 'Rs';
export const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Map tiles (free, no API key). OpenStreetMap is used first; if its tiles fail to load,
// the map switches automatically to CARTO's free basemap, which is also built on OpenStreetMap data.
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const TILE_PROVIDERS = [
  { name: 'OpenStreetMap', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: OSM_ATTRIBUTION, maxZoom: 19 },
  {
    name: 'CARTO',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: `${OSM_ATTRIBUTION} &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    maxZoom: 19,
  },
];
export const DEFAULT_CENTER = [24.8607, 67.0011]; // Karachi

// Static team / office details for the About and Contact pages
export const CONTACT = {
  email: 'hello@marketlink.pk',
  phone: '+92 21 3456 7890',
  address: 'Aptech Learning Centre, F.B. Area, Karachi',
  hours: 'Mon – Sat, 9:00 am – 6:00 pm',
  // Google Maps looks this place up by name, so the pin lands on the centre itself
  mapQuery: 'Aptech Learning Centre, Federal B Area, Karachi',
  latitude: 24.928,
  longitude: 67.0682,
};

// Social media pages (footer, Contact page and search engines). Replace with the team's own pages.
export const SOCIAL = [
  { name: 'Facebook', icon: 'bi-facebook', url: 'https://www.facebook.com/marketlinkpk' },
  { name: 'Instagram', icon: 'bi-instagram', url: 'https://www.instagram.com/marketlinkpk' },
  { name: 'X (Twitter)', icon: 'bi-twitter-x', url: 'https://x.com/marketlinkpk' },
  { name: 'YouTube', icon: 'bi-youtube', url: 'https://www.youtube.com/@marketlinkpk' },
  { name: 'WhatsApp', icon: 'bi-whatsapp', url: 'https://wa.me/922134567890' },
  { name: 'LinkedIn', icon: 'bi-linkedin', url: 'https://www.linkedin.com/company/marketlinkpk' },
];

// The team that created MarketLink (About page and footer)
export const TEAM_NAME = 'Team Omniverse';
export const TEAM_PLACE = 'Aptech Learning Centre, F.B. Area, Karachi';

// Add each member's name to show it on the About page (cards show the area of work until then)
export const TEAM = [
  { name: '', area: 'Team lead · Backend', role: 'Node / Express API, security and e-mails', icon: 'bi-hdd-network' },
  { name: '', area: 'Frontend · UI design', role: 'React pages, design system and animations', icon: 'bi-palette' },
  { name: '', area: 'Database · Testing', role: 'MongoDB schema, demo data and test runs', icon: 'bi-database-check' },
  { name: '', area: 'Maps · Documentation', role: 'Leaflet maps, routes, AI assistant and docs', icon: 'bi-map' },
];
