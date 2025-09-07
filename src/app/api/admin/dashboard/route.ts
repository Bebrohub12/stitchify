import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import User from '@/models/User'
import Design from '@/models/Design'
import Transaction from '@/models/Transaction'

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

    // Check if user is admin
    const user = await User.findById(decoded.userId).select('role')
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get dashboard statistics
    const [
      totalUsers,
      totalDesigns,
      totalTransactions,
      totalRevenue,
      topDesigns,
      recentTransactions
    ] = await Promise.all([
      User.countDocuments(),
      Design.countDocuments(),
      Transaction.countDocuments({ status: 'completed' }),
      Transaction.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Design.find()
        .select('title sales images')
        .sort({ sales: -1 })
        .limit(5)
        .lean(),
      Transaction.find({ status: 'completed' })
        .populate('user', 'username')
        .populate('design', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ])

    const stats = {
      totalUsers,
      totalDesigns,
      totalSales: totalTransactions,
      totalRevenue: totalRevenue[0]?.total || 0,
      topDesigns,
      recentTransactions
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
