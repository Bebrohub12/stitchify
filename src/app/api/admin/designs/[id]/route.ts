import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Design from '@/models/Design'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const design = await Design.findById(params.id)
      .populate('categories', 'name slug description')
      .lean()

    if (!design) {
      return NextResponse.json(
        { message: 'Design not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(design)

  } catch (error) {
    console.error('Get admin design error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const designId = params.id
    const formData = await request.formData()
    
    // Check if design exists
    const existingDesign = await Design.findById(designId)
    if (!existingDesign) {
      return NextResponse.json(
        { message: 'Design not found' },
        { status: 404 }
      )
    }
    
    // Extract basic fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const difficulty = formData.get('difficulty') as string
    const stitchCount = parseInt(formData.get('stitchCount') as string || '0')
    const featured = formData.get('featured') === 'true'
    const popular = formData.get('popular') === 'true'
    
    // Extract arrays
    const categories = formData.getAll('categories') as string[]
    const formats = formData.getAll('formats') as string[]
    const tags = formData.getAll('tags') as string[]
    
    // Handle existing images
    let existingImages: { url: string; alt: string }[] = []
    const existingImagesJson = formData.get('existingImages')
    if (existingImagesJson && typeof existingImagesJson === 'string') {
      existingImages = JSON.parse(existingImagesJson)
    }
    
    // Create upload directories if they don't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'designs', designId)
    const filesDir = path.join(uploadsDir, 'files')
    const imagesDir = path.join(uploadsDir, 'images')
    
    await fs.mkdir(filesDir, { recursive: true })
    await fs.mkdir(imagesDir, { recursive: true })
    
    // Handle new image uploads
    const imageFiles = formData.getAll('images') as File[]
    const newImageUrls: { url: string; alt: string }[] = []
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const fileExtension = path.extname(file.name)
      const fileName = `image_${Date.now()}_${i}${fileExtension}`
      const filePath = path.join(imagesDir, fileName)
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await fs.writeFile(filePath, buffer)
      
      newImageUrls.push({
        url: `/uploads/designs/${designId}/images/${fileName}`,
        alt: title
      })
    }
    
    // Combine existing and new images
    const allImages = [...existingImages, ...newImageUrls]
    
    // Handle design file uploads
    const designFiles: { [key: string]: string } = { ...existingDesign.designFiles }
    
    for (const [key, value] of Array.from(formData.entries())) {
      if (key.startsWith('designFile_') && value instanceof File && value.size > 0) {
        const format = key.replace('designFile_', '')
        const fileExtension = path.extname(value.name) || `.${format.toLowerCase()}`
        const fileName = `design_${Date.now()}.${format.toLowerCase()}${fileExtension}`
        const filePath = path.join(filesDir, fileName)
        
        const bytes = await value.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await fs.writeFile(filePath, buffer)
        
        designFiles[format] = `/uploads/designs/${designId}/files/${fileName}`
      }
    }
    
    // Update the design
    const updatedDesign = await Design.findByIdAndUpdate(
      designId,
      {
        title,
        description,
        price,
        difficulty,
        stitchCount,
        categories,
        formats,
        tags,
        images: allImages,
        designFiles,
        featured,
        popular
      },
      { new: true }
    ).populate('categories', 'name slug description')
    
    return NextResponse.json(updatedDesign)
    
  } catch (error: any) {
    console.error('Update design error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to update design' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const designId = params.id
    
    // Check if design exists
    const design = await Design.findById(designId)
    if (!design) {
      return NextResponse.json(
        { message: 'Design not found' },
        { status: 404 }
      )
    }
    
    // Delete the design
    await Design.findByIdAndDelete(designId)
    
    // Optionally, delete associated files
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'designs', designId)
      await fs.rm(uploadsDir, { recursive: true, force: true })
    } catch (fileError) {
      console.error('Error deleting design files:', fileError)
      // Continue with the response even if file deletion fails
    }
    
    return NextResponse.json({ message: 'Design deleted successfully' })
    
  } catch (error) {
    console.error('Delete design error:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}