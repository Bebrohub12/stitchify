import mongoose, { Schema, Document } from 'mongoose'

export interface IDesign extends Document {
  title: string
  description: string
  price: number
  images: Array<{
    url: string
    alt: string
  }>
  designFile?: {
    url: string
    filename: string
  }
  categories: mongoose.Types.ObjectId[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  stitchCount: number
  downloads: number
  rating: {
    average: number
    count: number
  }
  sales: number
  featured: boolean
  formats: string[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const DesignSchema = new Schema<IDesign>({
  title: {
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
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    }
  }],
  designFile: {
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    }
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  stitchCount: {
    type: Number,
    min: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  sales: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  formats: [{
    type: String,
    enum: ['SVG', 'PNG', 'DST', 'PES', 'JEF', 'EXP', 'HUS', 'VP3']
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
})

export default mongoose.models.Design || mongoose.model<IDesign>('Design', DesignSchema)
