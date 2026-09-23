/*
 * MarketLink - MongoDB database definition
 * ----------------------------------------
 * Run with mongosh:   mongosh "mongodb://127.0.0.1:27017" database/marketlink-schema.mongodb.js
 * (or open it in MongoDB Compass > mongosh tab / VS Code MongoDB playground)
 *
 * It creates the "marketlink" database with every collection, a JSON-schema
 * validator (the MongoDB equivalent of a table definition) and all indexes.
 * The Express API (Mongoose models in server/src/models) uses exactly these
 * collections. Demo data is inserted with:  cd server && npm run seed
 */

const dbName = 'marketlink';
const target = db.getSiblingDB(dbName);

function createCollection(name, schema, indexes = []) {
  if (target.getCollectionNames().includes(name)) {
    target.runCommand({ collMod: name, validator: { $jsonSchema: schema }, validationLevel: 'moderate' });
  } else {
    target.createCollection(name, { validator: { $jsonSchema: schema }, validationLevel: 'moderate' });
  }
  for (const [keys, options] of indexes) target[name].createIndex(keys, options || {});
  print(`✔ ${name}`);
}

const objectId = { bsonType: 'objectId' };
const date = { bsonType: 'date' };
const str = (max) => (max ? { bsonType: 'string', maxLength: max } : { bsonType: 'string' });
const num = (min, max) => ({ bsonType: ['double', 'int', 'long', 'decimal'], ...(min !== undefined && { minimum: min }), ...(max !== undefined && { maximum: max }) });
const bool = { bsonType: 'bool' };
const int = (min, max) => ({ bsonType: ['int', 'long', 'double'], minimum: min, maximum: max });
const days = { bsonType: 'array', items: int(0, 6) };
const time = { bsonType: 'string', pattern: '^([01][0-9]|2[0-3]):[0-5][0-9]$' };

// users: customers, farmers (login account) and administrators
createCollection(
  'users',
  {
    bsonType: 'object',
    required: ['name', 'email', 'password', 'role', 'status'],
    properties: {
      name: str(80),
      email: str(120),
      password: { bsonType: 'string', description: 'bcrypt hash' },
      role: { enum: ['customer', 'farmer', 'admin'] },
      phone: { bsonType: 'string', pattern: '^\\+?[0-9 ()-]{7,20}$' },
      address: str(250),
      city: str(60),
      status: { enum: ['active', 'pending', 'suspended', 'inactive'] },
      avatar: str(),
      favoriteFarmers: { bsonType: 'array', items: objectId },
      favoriteProducts: { bsonType: 'array', items: objectId },
      savedMarkets: { bsonType: 'array', items: objectId },
      household: objectId,
      lastLoginAt: date,
      createdAt: date,
      updatedAt: date,
    },
  },
  [[{ email: 1 }, { unique: true }], [{ role: 1, status: 1 }]]
);

// farmers: stall profile linked 1:1 to a user with role "farmer"
createCollection(
  'farmers',
  {
    bsonType: 'object',
    required: ['user', 'stallName', 'slug', 'contactPerson', 'phone', 'email', 'address'],
    properties: {
      user: objectId,
      stallName: str(100),
      slug: str(),
      contactPerson: str(),
      phone: str(),
      email: str(),
      address: str(),
      city: str(),
      bio: str(1200),
      tags: { bsonType: 'array', items: str(), description: 'farming practices' },
      categories: { bsonType: 'array', items: objectId, description: 'what the farmer grows / sells' },
      logo: str(),
      coverImage: str(),
      latitude: num(-90, 90),
      longitude: num(-180, 180),
      markets: { bsonType: 'array', items: objectId },
      operatingDays: days,
      pickupWindows: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['market', 'day', 'start', 'end'],
          properties: { market: objectId, day: int(0, 6), start: time, end: time },
        },
      },
      slotMinutes: num(10, 240),
      slotCapacity: num(1, 100),
      orderCutoffHours: num(0, 168),
      blockedDates: { bsonType: 'array', items: { bsonType: 'string', pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' }, description: 'dates the farmer is not at the market' },
      autoApplyTemplate: bool,
      templateLastAppliedWeek: str(),
      isActive: bool,
      ratingAvg: num(0, 5),
      ratingCount: num(0),
      createdAt: date,
      updatedAt: date,
    },
  },
  [[{ user: 1 }, { unique: true }], [{ slug: 1 }, { unique: true }], [{ isActive: 1 }], [{ markets: 1 }], [{ operatingDays: 1 }]]
);

// markets: farmers markets / pickup points shown on the map
createCollection(
  'markets',
  {
    bsonType: 'object',
    required: ['name', 'slug', 'address', 'latitude', 'longitude'],
    properties: {
      name: str(100),
      slug: str(),
      description: str(1000),
      address: str(),
      city: str(),
      latitude: num(-90, 90),
      longitude: num(-180, 180),
      mapProvider: { enum: ['openstreetmap', 'google'] },
      mapLink: str(),
      operatingDays: days,
      openTime: time,
      closeTime: time,
      image: str(),
      isActive: bool,
      createdAt: date,
      updatedAt: date,
    },
  },
  [[{ slug: 1 }, { unique: true }], [{ isActive: 1, city: 1 }]]
);

// categories: master data managed by the admin
createCollection(
  'categories',
  {
    bsonType: 'object',
    required: ['name', 'slug'],
    properties: { name: str(60), slug: str(), description: str(300), icon: str(), color: str(), sortOrder: num(), isActive: bool, createdAt: date, updatedAt: date },
  },
  [[{ name: 1 }, { unique: true }], [{ slug: 1 }, { unique: true }]]
);

// products: weekly stock of a farmer
createCollection(
  'products',
  {
    bsonType: 'object',
    required: ['farmer', 'name', 'category', 'price'],
    properties: {
      farmer: objectId,
      name: str(100),
      category: objectId,
      price: num(0),
      unit: { enum: ['kg', 'g', 'lb', 'dozen', 'piece', 'bunch', 'litre', 'pack', 'jar', 'loaf', 'box'] },
      quantityAvailable: num(0),
      templateQuantity: num(0),
      description: str(1500),
      image: str(),
      status: { enum: ['available', 'sold_out', 'unavailable'] },
      isRemoved: bool,
      removedReason: str(),
      deletedByFarmer: bool,
      markets: { bsonType: 'array', items: objectId },
      days,
      farmerActive: bool,
      ratingAvg: num(0, 5),
      ratingCount: num(0),
      totalSold: num(0),
      createdAt: date,
      updatedAt: date,
    },
  },
  [[{ farmer: 1, isRemoved: 1 }], [{ category: 1, price: 1 }], [{ markets: 1 }], [{ days: 1 }]]
);

// orders: one pre-order = one farmer + one pickup slot (items are embedded)
createCollection(
  'orders',
  {
    bsonType: 'object',
    required: ['orderNumber', 'customer', 'farmer', 'market', 'items', 'totalAmount', 'pickupDate', 'pickupSlot', 'pickupAt', 'cutoffAt', 'status'],
    properties: {
      orderNumber: str(),
      customer: objectId,
      farmer: objectId,
      market: objectId,
      items: {
        bsonType: 'array',
        minItems: 1,
        items: {
          bsonType: 'object',
          required: ['product', 'name', 'price', 'quantity', 'subtotal'],
          properties: { product: objectId, name: str(), image: str(), unit: str(), price: num(0), quantity: num(1), subtotal: num(0) },
        },
      },
      totalAmount: num(0),
      pickupDate: { bsonType: 'string', pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' },
      pickupSlot: { bsonType: 'object', required: ['start', 'end'], properties: { start: time, end: time } },
      pickupAt: date,
      cutoffAt: date,
      status: { enum: ['placed', 'accepted', 'ready', 'completed', 'declined', 'cancelled'] },
      statusHistory: {
        bsonType: 'array',
        items: { bsonType: 'object', properties: { status: str(), at: date, by: str(), note: str() } },
      },
      customerNote: str(500),
      farmerNote: str(500),
      paymentMethod: { enum: ['pay_at_pickup'] },
      completedAt: date,
      createdAt: date,
      updatedAt: date,
    },
  },
  [[{ orderNumber: 1 }, { unique: true }], [{ customer: 1, createdAt: -1 }], [{ farmer: 1, status: 1, pickupDate: 1 }], [{ market: 1 }]]
);

// reviews: ratings for a product or a farmer, only after a completed order
createCollection(
  'reviews',
  {
    bsonType: 'object',
    required: ['type', 'farmer', 'customer', 'order', 'rating'],
    properties: {
      type: { enum: ['product', 'farmer'] },
      product: objectId,
      farmer: objectId,
      customer: objectId,
      order: objectId,
      rating: int(1, 5),
      comment: str(1000),
      response: { bsonType: 'object', properties: { text: str(1000), at: date } },
      isRemoved: bool,
      removedReason: str(),
      createdAt: date,
      updatedAt: date,
    },
  },
  [[{ product: 1, isRemoved: 1 }], [{ farmer: 1, isRemoved: 1 }], [{ customer: 1, order: 1 }]]
);

// notifications: in-app alerts (order updates, restock alerts, announcements)
createCollection(
  'notifications',
  {
    bsonType: 'object',
    required: ['user', 'title', 'message'],
    properties: {
      user: objectId,
      type: { enum: ['order', 'restock', 'announcement', 'review', 'account', 'system'] },
      title: str(),
      message: str(),
      link: str(),
      read: bool,
      createdAt: date,
      updatedAt: date,
    },
  },
  [[{ user: 1, read: 1, createdAt: -1 }]]
);

// announcements: platform-wide notices published by the admin
createCollection(
  'announcements',
  {
    bsonType: 'object',
    required: ['title', 'message'],
    properties: { title: str(120), message: str(1000), audience: { enum: ['all', 'customer', 'farmer'] }, isActive: bool, createdBy: objectId, createdAt: date, updatedAt: date },
  }
);

// reports: saved snapshots of generated admin reports
createCollection(
  'reports',
  {
    bsonType: 'object',
    required: ['generatedBy', 'reportType'],
    properties: {
      generatedBy: objectId,
      reportType: { enum: ['platform_overview', 'orders_summary', 'revenue_by_market', 'top_farmers'] },
      title: str(),
      from: date,
      to: date,
      data: { bsonType: 'object' },
      generatedAt: date,
    },
  }
);

// contactmessages: messages sent from the Contact Us page
createCollection(
  'contactmessages',
  {
    bsonType: 'object',
    required: ['name', 'email', 'message'],
    properties: { name: str(80), email: str(120), subject: str(150), message: str(2000), status: { enum: ['new', 'read'] }, createdAt: date, updatedAt: date },
  }
);

print(`\nDatabase "${dbName}" is ready. Now run "npm run seed" inside /server to insert demo data.`);
