import mongoose, { Schema } from 'mongoose'

const schema = new Schema({
  createdUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  statusId: {
    type: Schema.Types.ObjectId,
    ref: 'Status'
  },
  comment: {
    type: String,
    default: null
  },
  lastEditUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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

const Ticket = mongoose.model('Ticket', schema)
export default Ticket
