// Links shared by the desktop navbar, the mobile drawer and the account dropdown.
export const LINKS = [
  { to: '/products', label: 'Shop', icon: 'bi-shop' },
  { to: '/markets', label: 'Markets', icon: 'bi-geo-alt' },
  { to: '/farmers', label: 'Farmers', icon: 'bi-people' },
  { to: '/map', label: 'Map', icon: 'bi-map' },
  { to: '/about', label: 'About', icon: 'bi-info-circle' },
  { to: '/contact', label: 'Contact', icon: 'bi-envelope' },
];

export const MENUS = {
  customer: [
    { to: '/account', icon: 'bi-grid', label: 'My dashboard' },
    { to: '/account/orders', icon: 'bi-bag', label: 'My orders' },
    { to: '/account/favorites', icon: 'bi-heart', label: 'Favourites' },
    { to: '/account/profile', icon: 'bi-person', label: 'Profile & family' },
  ],
  farmer: [
    { to: '/farmer', icon: 'bi-graph-up', label: 'Dashboard & insights' },
    { to: '/farmer/orders', icon: 'bi-receipt', label: 'Pre-orders' },
    { to: '/farmer/products', icon: 'bi-basket', label: 'Weekly stock' },
    { to: '/farmer/pickup', icon: 'bi-geo-alt', label: 'Markets & pickup' },
  ],
  admin: [
    { to: '/admin', icon: 'bi-speedometer2', label: 'Admin dashboard' },
    { to: '/admin/farmers', icon: 'bi-shop', label: 'Farmers' },
    { to: '/admin/reports', icon: 'bi-file-earmark-bar-graph', label: 'Reports' },
  ],
};
