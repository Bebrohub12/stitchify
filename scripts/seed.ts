import { connectDB } from '../src/lib/db'
import User from '../src/models/User'
import Category from '../src/models/Category'
import Design from '../src/models/Design'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Category.deleteMany({})
    await Design.deleteMany({})
    console.log('Cleared existing data')

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@stitchify.com',
      password: adminPassword,
      role: 'admin'
    })
    console.log('Created admin user:', adminUser.email)

    // Create demo user
    const userPassword = await bcrypt.hash('user123', 10)
    const demoUser = await User.create({
      username: 'demo',
      email: 'demo@stitchify.com',
      password: userPassword,
      role: 'user'
    })
    console.log('Created demo user:', demoUser.email)

    // Create main categories
    const animalsCategory = await Category.create({
      name: 'Animals',
      description: 'Beautiful animal embroidery designs',
      slug: 'animals',
      image: '/images/categories/animals.jpg'
    })

    const flowersCategory = await Category.create({
      name: 'Flowers',
      description: 'Elegant floral embroidery patterns',
      slug: 'flowers',
      image: '/images/categories/flowers.jpg'
    })

    const natureCategory = await Category.create({
      name: 'Nature',
      description: 'Inspiring nature-inspired designs',
      slug: 'nature',
      image: '/images/categories/nature.jpg'
    })

    // Create subcategories
    const birdsCategory = await Category.create({
      name: 'Birds',
      description: 'Graceful bird designs',
      slug: 'birds',
      parent: animalsCategory._id
    })

    const mammalsCategory = await Category.create({
      name: 'Mammals',
      description: 'Wild and domestic mammal designs',
      slug: 'mammals',
      parent: animalsCategory._id
    })

    const rosesCategory = await Category.create({
      name: 'Roses',
      description: 'Classic rose embroidery patterns',
      slug: 'roses',
      parent: flowersCategory._id
    })

    const sunflowersCategory = await Category.create({
      name: 'Sunflowers',
      description: 'Bright and cheerful sunflower designs',
      slug: 'sunflowers',
      parent: flowersCategory._id
    })

    // Update parent categories with subcategories
    await Category.findByIdAndUpdate(animalsCategory._id, {
      subcategories: [birdsCategory._id, mammalsCategory._id]
    })

    await Category.findByIdAndUpdate(flowersCategory._id, {
      subcategories: [rosesCategory._id, sunflowersCategory._id]
    })

    console.log('Created categories and subcategories')

    // Create sample designs
    const sampleDesigns = [
      {
        title: 'Elegant Rose Garden',
        description: 'A beautiful rose garden design perfect for spring projects',
        price: 12.99,
        images: [
          { url: '/images/designs/rose-garden-1.jpg', alt: 'Rose Garden Design' },
          { url: '/images/designs/rose-garden-2.jpg', alt: 'Rose Garden Detail' }
        ],
        categories: [flowersCategory._id, rosesCategory._id],
        difficulty: 'Intermediate',
        stitchCount: 15000,
        downloads: 45,
        rating: { average: 4.8, count: 23 },
        sales: 67,
        featured: true,
        popular: true,
        formats: ['SVG', 'PNG', 'DST', 'PES', 'JEF', 'EXP', 'HUS', 'VP3'],
        tags: ['roses', 'garden', 'spring', 'floral']
      },
      {
        title: 'Majestic Eagle',
        description: 'A stunning eagle design with detailed wings and feathers',
        price: 15.99,
        images: [
          { url: '/images/designs/eagle-1.jpg', alt: 'Eagle Design' },
          { url: '/images/designs/eagle-2.jpg', alt: 'Eagle Detail' }
        ],
        categories: [animalsCategory._id, birdsCategory._id],
        difficulty: 'Advanced',
        stitchCount: 25000,
        downloads: 32,
        rating: { average: 4.9, count: 18 },
        sales: 45,
        featured: true,
        popular: true,
        formats: ['SVG', 'PNG', 'DST', 'PES', 'JEF', 'EXP', 'HUS', 'VP3'],
        tags: ['eagle', 'bird', 'wildlife', 'patriotic']
      },
      {
        title: 'Sunny Sunflower',
        description: 'A cheerful sunflower design that brings summer joy',
        price: 9.99,
        images: [
          { url: '/images/designs/sunflower-1.jpg', alt: 'Sunflower Design' }
        ],
        categories: [flowersCategory._id, sunflowersCategory._id],
        difficulty: 'Beginner',
        stitchCount: 8000,
        downloads: 78,
        rating: { average: 4.7, count: 45 },
        sales: 89,
        featured: false,
        popular: true,
        formats: ['SVG', 'PNG', 'DST', 'PES', 'JEF', 'EXP', 'HUS', 'VP3'],
        tags: ['sunflower', 'summer', 'yellow', 'beginner']
      },
      {
        title: 'Gentle Deer',
        description: 'A graceful deer design perfect for nature lovers',
        price: 13.99,
        images: [
          { url: '/images/designs/deer-1.jpg', alt: 'Deer Design' }
        ],
        categories: [animalsCategory._id, mammalsCategory._id],
        difficulty: 'Intermediate',
        stitchCount: 18000,
        downloads: 56,
        rating: { average: 4.6, count: 34 },
        sales: 72,
        featured: false,
        popular: false,
        formats: ['SVG', 'PNG', 'DST', 'PES', 'JEF', 'EXP', 'HUS', 'VP3'],
        tags: ['deer', 'wildlife', 'forest', 'nature']
      }
    ]

    await Design.insertMany(sampleDesigns)
    console.log('Created sample designs')

    console.log('Seeding completed successfully!')
    process.exit(0)

  } catch (error) {
    console.error('Seeding error:', error)
    process.exit(1)
  }
}

seed()
