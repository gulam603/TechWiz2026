import mongoose from 'mongoose';
import { ORDER_STATUS } from '../utils/constants.js';

const { Schema } = mongoose;

// Price / name are copied into the order so history stays correct even if the product changes later.
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    nameUr: String, // the Urdu name at order time (shown when the site is in Urdu)
    image: String,
    unit: String,
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const statusEntrySchema = new Schema(
  {
    status: { type: String, enum: Object.values(ORDER_STATUS) },
    at: { type: Date, default: Date.now },
    by: String, // customer | farmer | admin | system
    note: String,
  },
  { _id: false }
);

// One order = one farmer + one pickup slot. A cart with several farmers creates several orders.
const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farmer: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    market: { type: Schema.Types.ObjectId, ref: 'Market', required: true }, // pickup point
    items: { type: [orderItemSchema], validate: [(v) => v.length > 0, 'Order must contain at least one item'] },
    totalAmount: { type: Number, required: true, min: 0 },
    pickupDate: { type: String, required: true }, // "YYYY-MM-DD"
    pickupSlot: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    pickupAt: { type: Date, required: true },
    cutoffAt: { type: Date, required: true }, // after this the customer can no longer modify / cancel
    status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PLACED },
    statusHistory: [statusEntrySchema],
    customerNote: { type: String, trim: true, maxlength: 500 },
    // Who entered the pre-order: the customer at checkout or an administrator for them
    placedBy: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    farmerNote: { type: String, trim: true, maxlength: 500 },
    paymentMethod: { type: String, default: 'pay_at_pickup' }, // no online payment by design
    completedAt: Date,
    // After the farmer marks it picked up, the customer confirms whether they really received it
    receipt: {
      status: { type: String, enum: ['received', 'not_received'] },
      note: { type: String, trim: true, maxlength: 500 },
      at: Date,
    },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ farmer: 1, status: 1, pickupDate: 1 });
orderSchema.index({ market: 1 });

export default mongoose.model('Order', orderSchema);
