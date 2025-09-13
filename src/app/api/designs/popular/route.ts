import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Design from '@/models/Design'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '8')

    const designs = await Design.find({ popular: true })
      .populate('categories', 'name slug')
      .sort({ sales: -1, downloads: -1, rating: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json(designs)

  } catch (error) {
    console.error('Get popular designs error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
