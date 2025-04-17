import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  specifications: {
    type: mongoose.Schema.Types.Mixed
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product; 