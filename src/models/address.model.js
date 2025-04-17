import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  street: {
    type: String,
    required: true,
    trim: true
  },
  street2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    default: 'Home',
    trim: true
  },
  formattedAddress: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create compound index for customerId and isDefault
addressSchema.index({ customerId: 1, isDefault: 1 }, { unique: true, sparse: true });

// Create geospatial index
addressSchema.index({ location: '2dsphere' });

const Address = mongoose.model('Address', addressSchema);

export default Address; 