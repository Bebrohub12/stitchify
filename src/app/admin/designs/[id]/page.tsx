'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, Trash2, Star, Download, ShoppingCart } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'
import toast from 'react-hot-toast'
import AdminRoute from '@/components/auth/AdminRoute'

export const dynamic = 'force-dynamic'

interface Design {
  _id: string
  title: string
  description: string
  price: number
  images: Array<{ url: string; alt: string }>
  categories: Array<{ _id: string; name: string; slug: string }>
  difficulty: string
  stitchCount: number
  downloads: number
  rating: { average: number; count: number }
  sales: number
  featured: boolean
  popular?: boolean
  formats: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function AdminDesignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const designId = params.id as string
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Fetch design details
  const { data: design, isLoading } = useQuery({
    queryKey: ['adminDesign', designId],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/designs/${designId}`)
      return response.data
    }
  })

  // Toggle featured status
  const toggleFeatured = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(`/api/admin/designs/${designId}/featured`, {
        featured: !design?.featured
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDesign', designId] })
      toast.success(`Design ${design?.featured ? 'removed from' : 'added to'} featured designs`)
    },
    onError: () => {
      toast.error('Failed to update featured status')
    }
  })

  // Toggle popular status
  const togglePopular = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(`/api/admin/designs/${designId}/popular`, {
        popular: !design?.popular
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDesign', designId] })
      toast.success(`Design ${design?.popular ? 'removed from' : 'added to'} popular designs`)
    },
    onError: () => {
      toast.error('Failed to update popular status')
    }
  })

  // Delete design
  const deleteDesign = useMutation({
    mutationFn: async () => {
      const response = await axios.delete(`/api/admin/designs/${designId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Design deleted successfully')
      router.push('/admin')
    },
    onError: () => {
      toast.error('Failed to delete design')
    }
  })

  const handleDeleteDesign = () => {
    if (window.confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      deleteDesign.mutate()
    }
  }

  const handleNextImage = () => {
    if (design?.images && currentImageIndex < design.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  if (isLoading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </AdminRoute>
    )
  }

  if (!design) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Design not found</h2>
            <p className="text-gray-600 mb-4">The design you're looking for doesn't exist.</p>
            <Link
              href="/admin"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  href="/admin" 
                  className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{design.title}</h1>
              </div>
              <div className="flex space-x-3">
                <Link
                  href={`/admin/designs/${designId}/edit`}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Design</span>
                </Link>
                <button
                  onClick={handleDeleteDesign}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Main Image */}
                <div className="relative aspect-video bg-gray-100">
                  {design.images && design.images.length > 0 ? (
                    <img
                      src={design.images[currentImageIndex].url}
                      alt={design.images[currentImageIndex].alt || design.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image available
                    </div>
                  )}

                  {/* Image Navigation */}
                  {design.images && design.images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between">
                      <button
                        onClick={handlePrevImage}
                        className="p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white ml-4"
                        disabled={currentImageIndex === 0}
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white mr-4"
                        disabled={currentImageIndex === design.images.length - 1}
                      >
                        <ArrowLeft className="w-5 h-5 transform rotate-180" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {design.images && design.images.length > 1 && (
                  <div className="p-4 flex space-x-2 overflow-x-auto">
                    {design.images.map((image: { url: string; alt: string }, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                          currentImageIndex === index
                            ? 'border-primary-500'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.alt || `${design.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700">{design.description}</p>
                </div>
              </div>

              {/* Available Formats */}
              {design.formats && design.formats.length > 0 && (
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Formats</h2>
                  <div className="flex flex-wrap gap-2">
                    {design.formats.map((format: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {design.tags && design.tags.length > 0 && (
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {design.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-8">
              {/* Design Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Design Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-lg font-medium text-gray-900">${design.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Difficulty</p>
                    <p className="text-gray-900 capitalize">{design.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Stitch Count</p>
                    <p className="text-gray-900">{design.stitchCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Categories</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {design.categories.map((category: { _id: string; name: string }) => (
                        <span
                          key={category._id}
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="text-gray-900">
                      {new Date(design.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-gray-900">
                      {new Date(design.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Download className="w-5 h-5 text-gray-500 mr-2" />
                      <p className="text-sm text-gray-500">Downloads</p>
                    </div>
                    <p className="text-xl font-semibold text-center text-gray-900">
                      {design.downloads}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <ShoppingCart className="w-5 h-5 text-gray-500 mr-2" />
                      <p className="text-sm text-gray-500">Sales</p>
                    </div>
                    <p className="text-xl font-semibold text-center text-gray-900">
                      {design.sales}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-5 h-5 text-gray-500 mr-2" />
                      <p className="text-sm text-gray-500">Rating</p>
                    </div>
                    <p className="text-xl font-semibold text-center text-gray-900">
                      {design.rating.average.toFixed(1)} ({design.rating.count})
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                    <p className="text-xl font-semibold text-center text-gray-900">
                      ${(design.price * design.sales).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Featured/Popular Controls */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Promotion</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Featured Design</p>
                      <p className="text-sm text-gray-500">Show on homepage featured section</p>
                    </div>
                    <button
                      onClick={() => toggleFeatured.mutate()}
                      className={`px-4 py-2 rounded-lg text-white ${
                        design.featured
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                    >
                      {design.featured ? 'Featured' : 'Not Featured'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Popular Design</p>
                      <p className="text-sm text-gray-500">Show in popular designs section</p>
                    </div>
                    <button
                      onClick={() => togglePopular.mutate()}
                      className={`px-4 py-2 rounded-lg text-white ${
                        design.popular
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                    >
                      {design.popular ? 'Popular' : 'Not Popular'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}