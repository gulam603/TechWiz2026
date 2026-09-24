import mongoose from 'mongoose';
import { PRODUCT_STATUS, UNITS } from '../utils/constants.js';

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 100 },
    slug: { type: String, trim: true, lowercase: true }, // readable URL: /products/sindhri-mangoes
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: [true, 'Category is required'] },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    unit: { type: String, enum: UNITS, default: 'kg' },
    quantityAvailable: { type: Number, default: 0, min: [0, 'Quantity cannot be negative'] },
    templateQuantity: { type: Number, default: 0, min: 0 }, // weekly recurring stock
    description: { type: String, trim: true, maxlength: 1500 },
    image: String,
    // Attribution for licensed stock photos (seed data); cleared when the farmer uploads their own image
    imageCredit: {
      author: String,
      source: String,
      license: String,
    },
    status: { type: String, enum: Object.values(PRODUCT_STATUS), default: PRODUCT_STATUS.AVAILABLE },

    // Admin moderation (isRemoved) and farmer deletion of products that have order history
    isRemoved: { type: Boolean, default: false },
    removedReason: String,
    deletedByFarmer: { type: Boolean, default: false },

    // Copied from the farmer profile so products can be filtered by market / day quickly
    markets: [{ type: Schema.Types.ObjectId, ref: 'Market' }],
    days: [{ type: Number, min: 0, max: 6 }],
    farmerActive: { type: Boolean, default: true }, // false while farmer is pending / suspended

    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ farmer: 1, isRemoved: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ markets: 1 });
productSchema.index({ days: 1 });

// Selling out is automatic: when quantity hits zero the product shows as "sold out",
// and when stock is added again it becomes available.
productSchema.pre('save', function syncStockStatus() {
  if (this.quantityAvailable <= 0 && this.status === PRODUCT_STATUS.AVAILABLE) {
    this.status = PRODUCT_STATUS.SOLD_OUT;
  } else if (this.quantityAvailable > 0 && this.status === PRODUCT_STATUS.SOLD_OUT && this.isModified('quantityAvailable')) {
    this.status = PRODUCT_STATUS.AVAILABLE;
  }
});

/** Filter used for every public product listing. */
productSchema.statics.publicFilter = function publicFilter() {
  return { isRemoved: false, farmerActive: true, status: { $ne: PRODUCT_STATUS.UNAVAILABLE } };
};

export default mongoose.model('Product', productSchema);
