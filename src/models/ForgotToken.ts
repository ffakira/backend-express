import mongoose, { Schema } from 'mongoose'

const schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
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

const ForgotToken = mongoose.model('ForgotToken', schema)
export default ForgotToken
