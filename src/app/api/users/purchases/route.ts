import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import Transaction from '@/models/Transaction'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
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

    const transactions = await Transaction.find({ 
      user: decoded.userId,
      status: 'completed'
    })
      .populate({
        path: 'design',
        select: 'title images price'
      })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(transactions)

  } catch (error) {
    console.error('Get purchases error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
