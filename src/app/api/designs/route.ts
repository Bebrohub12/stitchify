import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Design from '@/models/Design'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const priceRange = searchParams.get('priceRange')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    if (category) {
      query.categories = category
    }

    if (difficulty) {
      query.difficulty = difficulty
    }

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number)
      if (max) {
        query.price = { $gte: min, $lte: max }
      } else {
        query.price = { $gte: min }
      }
    }

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1

    // Execute query
    const designs = await Design.find(query)
      .populate('categories', 'name slug')
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    // Get total count for pagination
    const total = await Design.countDocuments(query)

    return NextResponse.json({
      designs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get designs error:', error)
    return NextResponse.json(
      { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error', "error1": error },
      { status: 500 }
    )
  }
}
