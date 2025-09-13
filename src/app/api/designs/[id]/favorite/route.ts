import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import User from '@/models/User'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const designId = params.id
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if design is already favorited
    const isFavorited = user.favorites?.includes(designId)
    
    if (isFavorited) {
      // Remove from favorites
      user.favorites = user.favorites?.filter(id => id.toString() !== designId) || []
    } else {
      // Add to favorites
      user.favorites = [...(user.favorites || []), designId]
    }

    await user.save()

    return NextResponse.json({
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      favorited: !isFavorited
    })

  } catch (error) {
    console.error('Toggle favorite error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
