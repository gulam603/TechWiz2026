// App-wide settings. Values can be overridden with a client/.env file (VITE_ prefix).
export const APP_NAME = 'MarketLink';
export const CURRENCY = import.meta.env.VITE_CURRENCY || 'Rs';
export const API_BASE = import.meta.env.VITE_API_URL || '/api';

// OpenStreetMap tiles (free, no API key required)
export const MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const DEFAULT_CENTER = [24.8607, 67.0011]; // Karachi

// Static team / office details for the About and Contact pages
export const CONTACT = {
  email: 'hello@marketlink.pk',
  phone: '+92 21 3456 7890',
  address: 'Aptech Learning Centre, Shahrah-e-Faisal, Karachi',
  hours: 'Mon – Sat, 9:00 am – 6:00 pm',
  latitude: 24.8615,
  longitude: 67.0729,
};

// TODO: replace with your own team members before submitting (shown on the About page)
export const TEAM = [
  { name: 'Team Member 1', role: 'Team lead · Backend (Node / Express)' },
  { name: 'Team Member 2', role: 'Frontend (React) · UI design' },
  { name: 'Team Member 3', role: 'Database (MongoDB) · Testing' },
  { name: 'Team Member 4', role: 'Maps integration · Documentation' },
];
