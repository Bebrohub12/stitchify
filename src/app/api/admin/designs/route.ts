import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Design from '@/models/Design'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

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
    
    // Create the design first to get the ID
    const design = await Design.create({
      title,
      description,
      price,
      difficulty,
      stitchCount,
      categories,
      formats,
      tags,
      images: [], // Will be updated after file uploads
      designFiles: {}, // Will be updated after file uploads
      featured: false,
      downloads: 0,
      sales: 0,
      rating: { average: 0, count: 0 }
    })

    const designId = design._id.toString()
    
    // Create upload directories
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'designs', designId)
    const filesDir = path.join(uploadsDir, 'files')
    const imagesDir = path.join(uploadsDir, 'images')
    
    await fs.mkdir(filesDir, { recursive: true })
    await fs.mkdir(imagesDir, { recursive: true })
    
    // Handle image uploads
    const imageFiles = formData.getAll('images') as File[]
    const imageUrls: { url: string; alt: string }[] = []
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const fileExtension = path.extname(file.name)
      const fileName = `image_${i + 1}${fileExtension}`
      const filePath = path.join(imagesDir, fileName)
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await fs.writeFile(filePath, buffer)
      
      imageUrls.push({
        url: `/uploads/designs/${designId}/images/${fileName}`,
        alt: title
      })
    }
    
    // Handle design file uploads
    const designFiles: { [key: string]: string } = {}
    
    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith('designFiles[') && key.endsWith(']')) {
        const format = key.slice(13, -1) // Extract format from 'designFiles[FORMAT]'
        const file = value as File
        
        if (file && file.size > 0) {
          const fileExtension = path.extname(file.name) || `.${format.toLowerCase()}`
          const fileName = `design.${format.toLowerCase()}${fileExtension}`
          const filePath = path.join(filesDir, fileName)
          
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          await fs.writeFile(filePath, buffer)
          
          designFiles[format] = `/uploads/designs/${designId}/files/${fileName}`
        }
      }
    }
    
    // Update the design with file URLs
    const updatedDesign = await Design.findByIdAndUpdate(
      designId,
      {
        images: imageUrls,
        designFiles: designFiles
      },
      { new: true }
    )
    
    return NextResponse.json(updatedDesign, { status: 201 })
    
  } catch (error: any) {
    console.error('Create design error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to create design' },
      { status: 500 }
    )
  }
}