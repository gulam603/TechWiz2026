/**
 * English sentences the server writes with names and numbers in them (notifications, messages and
 * errors). tServer() recognises them, takes the names out and shows the Urdu sentence from ./ur.js
 * with the same names. Keep them in step with the server texts.
 */
const SERVER_TEMPLATES = [
  // Order notifications
  'Pre-order {n} placed',
  'New pre-order {n}',
  'Pre-order {n} was modified',
  'Pre-order {n} cancelled',
  'Pre-order {n} accepted',
  'Pre-order {n} declined',
  'Pre-order {n} is ready for pickup',
  'Pre-order {n} completed',
  '{stall} accepted your pre-order.',
  '{stall} could not fulfil your pre-order.',
  '{stall} could not fulfil your pre-order. Reason: {note}',
  'Your order from {stall} is packed and ready. Please pay at pickup.',
  'Thanks for shopping with {stall}! Share your experience by leaving a review.',
  'Pickup: {date}, {from}-{to} at {market}, {address}.',
  'Pickup: {date}, {from}-{to}.',
  'Directions: {url}',
  'Your pre-order has been placed with {stall}. Total: {currency} {amount} (pay at pickup).',
  'MarketLink placed this pre-order for you with {stall}. Total: {currency} {amount} (pay at pickup).',
  '{name} placed a pre-order for {date} {from}-{to}.',
  '{name} placed a pre-order (entered by an administrator) for {date} {from}-{to}.',
  '{name} placed a pre-order.',
  '{stall} received your pre-order.',
  '{name} cancelled the pre-order for {date}. Stock has been returned to your inventory.',
  '{name} changed the {what}.',
  '{name} changed the {what}. Please review and accept it again.',
  'Your pre-order with {stall} has been cancelled.',
  // Stock
  '{name} is back in stock',
  'Good news! {name} is available again. Pre-order before it sells out.',
  'Fresh weekly stock at {stall}',
  "{stall} has published this week's harvest. Browse and pre-order now.",
  '{name} is sold out',
  'Low stock: {name}',
  '{name} has no stock left, so customers cannot pre-order it. Add stock in Inventory when you have more.',
  'Only {n} {unit} of {name} left at {stall} (alert level {level}). Restock it in Inventory before it sells out.',
  'Only {n} of {name} left in stock',
  '{name} is currently not available',
  'You only have {n} {unit} in stock',
  // Reviews and listings
  '{stall} replied to your review',
  'New {n}-star review',
  'New {n}-star review (unverified)',
  '{name} reviewed {what}: "{comment}"',
  'A customer loved your {name}!',
  'Listing removed: {name}',
  'Listing restored: {name}',
  'After a report, an administrator removed "{name}". Reason: {reason}',
  'An administrator removed "{name}". Reason: {reason}',
  '"{name}" is visible again.',
  // Account, household and markets
  '{name} added you to their MarketLink household. You can now see each other\'s pre-orders.',
  'Welcome to MarketLink! {stall} has been approved. You can now list your weekly stock.',
  '{stall} has been re-activated.',
  '{stall} has been suspended by the MarketLink team.',
  '{stall} has been suspended by the MarketLink team. Reason: {reason}',
  '{stall} was suspended after a report.',
  '{stall} was suspended after a report. Reason: {reason}',
  '{market} was removed',
  '{market} is no longer available on MarketLink. Please review your pickup windows.',
  // Stock history
  'Pre-order {n}',
  '{reason}: {note}',
  // Product season ("May to August")
  '{from} to {to}',
  // Assistant suggestions
  'Pickup windows for {name}',
];

export default SERVER_TEMPLATES;
