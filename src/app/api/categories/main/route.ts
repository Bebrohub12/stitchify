import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Category from '@/models/Category'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const categories = await Category.find({ parent: null })
      .populate('subcategories', 'name slug description')
      .lean()

    return NextResponse.json(categories)

  } catch (error) {
    console.error('Get main categories error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
