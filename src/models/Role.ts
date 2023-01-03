import mongoose, { Schema } from 'mongoose'

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: null
  }
})

const Role = mongoose.model('Role', schema)
export default Role
