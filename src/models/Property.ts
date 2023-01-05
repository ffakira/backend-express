import mongoose, { Schema } from 'mongoose'

const schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  editedUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  publishType: {
    type: String,
    enum: ['draft', 'publish'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    max: 200
  },
  reference: {
    type: String,
    default: null
  },
  yearBuilt: {
    type: Number,
    min: 1700,
    default: null
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  city: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  zipcode: {
    type: String,
    default: null
  },
  type: {
    type: String,
    required: true,
    enum: ['house', 'apartment']
  },
  sale: {
    type: String,
    required: true,
    enum: ['sell', 'rent']
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  units: {
    type: String,
    required: true,
    enum: ['sqft, ms']
  },
  minPrice: {
    type: Number,
    required: true,
    min: 0
  },
  maxPrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['brl', 'usd', 'eur']
  },
  totalRooms: {
    type: Number,
    required: true,
    min: 0
  },
  totalMasterBedrooms: {
    type: Number,
    min: 0
  },
  totalBathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  totalFloors: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  facilities: {
    type: [{ type: String }]
  },
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: {
    type: Date,
    default: null
  }
})

const Property = mongoose.model('Property', schema)
export default Property
