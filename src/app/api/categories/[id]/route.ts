import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Category from '@/models/Category'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const categoryId = params.id
    
    const category = await Category.findById(categoryId)
      .populate('subcategories', 'name slug description')
      .lean()
    
    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(category)
    
  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
