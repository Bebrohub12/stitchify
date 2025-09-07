// Remove the 'use client' directive

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Design from '@/models/Design'
import { getServerSession } from 'next-auth/next'

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin status
    // This would typically use middleware or session validation
    
    await connectDB()
    
    const formData = await request.formData()
    
    // Extract basic fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const difficulty = formData.get('difficulty') as string
    const stitchCount = parseInt(formData.get('stitchCount') as string || '0')
    
    // Extract arrays
    const categories = formData.getAll('categories') as string[]
    const formats = formData.getAll('formats') as string[]
    const tags = formData.getAll('tags') as string[]
    
    // Handle image uploads
    // In a real implementation, you would upload these to a storage service
    // and store the URLs in the database
    const imageFiles = formData.getAll('images') as File[]
    const images = imageFiles.map(file => ({
      url: `/uploads/${file.name}`, // This is a placeholder
      alt: title
    }))
    
    // Create the design
    const design = await Design.create({
      title,
      description,
      price,
      difficulty,
      stitchCount,
      categories,
      formats,
      tags,
      images,
      featured: false,
      downloads: 0,
      sales: 0,
      rating: { average: 0, count: 0 }
    })
    
    return NextResponse.json(design, { status: 201 })
    
  } catch (error: any) {
    console.error('Create design error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to create design' },
      { status: 500 }
    )
  }
}