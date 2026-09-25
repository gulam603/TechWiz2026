// Frequently asked questions loaded by the seed (admins edit them later under Admin > FAQs).
// Each answer starts with one short, direct sentence: search engines and AI assistants quote it.
export const faqs = [
  // ---------------------------------------------------------------- shopping & pre-orders
  {
    group: 'shopping',
    showOnHome: true,
    question: 'What is MarketLink?',
    answer:
      'MarketLink is a website where you pre-order fresh food from local farmers and collect it at your weekly farmers market.\n\nYou can see what every farmer has in stock this week, reserve it online and pay the farmer in cash when you pick it up. Farmers see their orders before market day, so they bring the right amount and waste less.',
  },
  {
    group: 'shopping',
    showOnHome: true,
    question: 'How do I pre-order from a farmer?',
    answer:
      'Add products to your basket, pick a market and a pickup time for each farmer, then confirm the order.\n\n1. Open Shop (or a farmer or market page) and press Add on a product.\n2. Choose how many you want and press Add to basket.\n3. Open the basket and press Checkout.\n4. Pick the market, day and time slot for each farmer.\n5. Confirm. You get an order number and an e-mail, and the farmer is notified straight away.',
  },
  {
    group: 'shopping',
    question: 'Do I need an account to order?',
    answer:
      'No. You can check out as a guest with your name, phone number and e-mail, and MarketLink creates a free account for you.\n\nThe account lets you follow your orders, change or cancel them, save favourite farmers and leave reviews. You can set a password later from the e-mail we send.',
  },
  {
    group: 'shopping',
    question: 'Can I order from more than one farmer at once?',
    answer:
      'Yes. One basket can hold products from several farmers.\n\nAt checkout the basket is split per farmer, and you choose a pickup slot for each of them. Every farmer receives only their own part of the order.',
  },
  {
    group: 'shopping',
    showOnHome: true,
    question: 'Can I change or cancel my order?',
    answer:
      'Yes, until the farmer’s order cut-off time, which is usually 12 hours before your pickup slot.\n\nOpen Account > My orders, choose the order and change the quantities or the pickup slot, or cancel it. The stock goes back to the farmer automatically. After the cut-off, or once the order is ready, please contact the farmer directly.',
  },
  {
    group: 'shopping',
    question: 'What happens if a product sells out?',
    answer:
      'A sold-out product cannot be added to the basket, and the farmer’s stock is reserved the moment you place your order.\n\nAdd a sold-out product to your favourites and you get a notification as soon as the farmer restocks it.',
  },
  {
    group: 'shopping',
    question: 'Are the products organic?',
    answer:
      'Some are. Every farmer lists their own farming practices, such as organic, pesticide-free or free-range.\n\nYou can see the practices on the farmer’s page and filter the shop by them. MarketLink does not certify farms itself, so ask the farmer at the market if you have questions.',
  },
  // ---------------------------------------------------------------- pickup & payment
  {
    group: 'pickup',
    showOnHome: true,
    question: 'How do I pay?',
    answer:
      'You pay the farmer in cash (or however the farmer accepts) when you collect your order at the market.\n\nThere is no online payment and no card details are needed on MarketLink. The total shown in your basket is what you pay at the stall.',
  },
  {
    group: 'pickup',
    showOnHome: true,
    question: 'Where and when do I pick up my order?',
    answer:
      'At the farmers market and time slot you chose at checkout.\n\nYour order page and confirmation e-mail show the market address, the day and the time window. Show your order number at the farmer’s stall. You get a notification when the farmer marks your order as ready.',
  },
  {
    group: 'pickup',
    question: 'What if I cannot make it to my pickup slot?',
    answer:
      'Change the pickup slot, or cancel the order, before the farmer’s cut-off time.\n\nAfter the cut-off please contact the farmer using the phone number on their page, so the food does not go to waste.',
  },
  {
    group: 'pickup',
    question: 'Which markets and cities are on MarketLink?',
    answer:
      'MarketLink lists weekly farmers markets in Karachi, Lahore and Islamabad, and new markets are added regularly.\n\nOpen Markets or the Market map to see every market with its address, opening days and times, and the farmers who sell there.',
  },
  // ---------------------------------------------------------------- farmers
  {
    group: 'farmers',
    showOnHome: true,
    question: 'How can I sell my produce on MarketLink?',
    answer:
      'Register as a farmer, and after an administrator approves your stall you can list your products.\n\nThe sign-up form asks for your stall name, farm details, the markets you sell at and your pickup times. Joining is free. After approval you add products with a photo, price and weekly stock, and customers can pre-order straight away.',
  },
  {
    group: 'farmers',
    question: 'Does MarketLink charge farmers a fee?',
    answer:
      'No. Listing products and receiving pre-orders on MarketLink is free.\n\nCustomers pay you directly at your stall, so the full amount goes to you.',
  },
  {
    group: 'farmers',
    question: 'How do I manage my orders and stock?',
    answer:
      'Everything is in the farmer dashboard: orders, stock, pickup windows and sales reports.\n\nAccept or decline each new order, mark it ready and then completed at pickup. Stock goes down when an order is placed and back up when it is cancelled or declined, and you get an alert when a product is running low.',
  },
  // ---------------------------------------------------------------- account & privacy
  {
    group: 'account',
    question: 'How do reviews work?',
    answer:
      'Customers can rate a product or a farmer from 1 to 5 stars and write a short review.\n\nReviews from customers who collected a completed order are marked "Verified purchase". Anyone can report a review that breaks the rules, and administrators check every report.',
  },
  {
    group: 'account',
    question: 'I forgot my password. What do I do?',
    answer:
      'Press "Forgot password?" on the login page and enter your e-mail address.\n\nWe e-mail you a link to choose a new password. The link works for 30 minutes.',
  },
  {
    group: 'account',
    question: 'What do you do with my personal data?',
    answer:
      'MarketLink only uses your details to run your orders and your account, and never sells them.\n\nThe farmer you order from sees your name and phone number so they can reach you about the pickup. The Terms & Conditions page explains the details, and you can unsubscribe from e-mails with one click.',
  },
];
