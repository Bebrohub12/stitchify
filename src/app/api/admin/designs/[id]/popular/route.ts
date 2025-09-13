import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Design from '@/models/Design'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const designId = params.id
    const { popular } = await request.json()
    
    const design = await Design.findByIdAndUpdate(
      designId,
      { popular },
      { new: true }
    )
    
    if (!design) {
      return NextResponse.json(
        { message: 'Design not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      message: `Design ${popular ? 'marked as popular' : 'removed from popular'}`,
      design
    })
    
  } catch (error) {
    console.error('Toggle popular error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
