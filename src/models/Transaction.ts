import mongoose, { Schema, Document } from 'mongoose'

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId
  design: mongoose.Types.ObjectId
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentMethod: string
  paymentId?: string
  paypalToken?: string
  payerId?: string
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  design: {
    type: Schema.Types.ObjectId,
    ref: 'Design',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'paypal'
  },
  paymentId: {
    type: String
  },
  paypalToken: {
    type: String
  },
  payerId: {
    type: String
  }
}, {
  timestamps: true
})

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema)
