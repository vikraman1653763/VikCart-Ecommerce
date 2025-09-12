// models/Product.js
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // needed to destroy on Cloudinary
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: Array, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    // CHANGED: store objects instead of plain strings
    image: {
      type: [imageSchema],
      required: true,
      // Backward-compat: allow arrays of strings and normalize on read
      get: (val) => {
        // If already [{ url, publicId }], return as-is
        if (Array.isArray(val) && val.every(v => typeof v === "object" && v !== null)) return val;
        // If legacy array of URLs, map them to { url, publicId: null }
        if (Array.isArray(val)) return val.map(u => ({ url: String(u), publicId: null }));
        return [];
      },
    },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Instance helper: get all Cloudinary public IDs (skip null legacy ones)
productSchema.methods.getImagePublicIds = function () {
  if (!Array.isArray(this.image)) return [];
  return this.image
    .map(i => i?.publicId)
    .filter(Boolean);
};

const Product = mongoose.models.product || mongoose.model("product", productSchema);
export default Product;
