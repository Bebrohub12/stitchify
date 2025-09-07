'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, Star, Download, ShoppingCart, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import Link from 'next/link'

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
  formats: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function DesignDetailPage() {
  const params = useParams()
  const designId = params.id as string
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isPurchased, setIsPurchased] = useState(false)

  // Fetch design details
  const { data: design, isLoading } = useQuery({
    queryKey: ['design', designId],
    queryFn: async () => {
      const response = await axios.get(`/api/designs/${designId}`)
      return response.data
    }
  })

  // Check if user has purchased this design
  const { data: purchaseStatus } = useQuery({
    queryKey: ['purchaseStatus', designId],
    queryFn: async () => {
      if (!isAuthenticated) return { purchased: false }
      try {
        const response = await axios.get(`/api/payments/transactions`)
        const transactions = response.data
        return {
          purchased: transactions.some((t: any) => 
            t.design === designId && t.status === 'completed'
          )
        }
      } catch (error) {
        return { purchased: false }
      }
    },
    enabled: isAuthenticated
  })

  // Toggle favorite
  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/designs/${designId}/favorite`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design'] })
      queryClient.invalidateQueries({ queryKey: ['featuredDesigns'] })
      queryClient.invalidateQueries({ queryKey: ['popularDesigns'] })
      toast.success('Favorite updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update favorite')
    },
  })

  // Create PayPal payment
  const createPayment = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/payments/create', {
        designId: designId,
        amount: design.price
      })
      return response.data
    },
    onSuccess: (data) => {
      // Redirect to PayPal
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create payment')
    },
  })

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites')
      return
    }
    toggleFavorite.mutate()
  }

  const handlePurchase = () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase designs')
      return
    }
    createPayment.mutate()
  }

  const nextImage = () => {
    if (design?.images) {
      setCurrentImageIndex((prev) => 
        prev === design.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (design?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? design.images.length - 1 : prev - 1
      )
    }
  }

  const isFavorited = user?.favorites?.some((fav: any) => fav._id === designId)
  const purchased = purchaseStatus?.purchased || false

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!design) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Design not found</h2>
          <p className="text-gray-600 mb-4">The design you're looking for doesn't exist.</p>
          <Link
            href="/designs"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Browse all designs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
            </li>
            <li>
              <Link href="/designs" className="text-gray-500 hover:text-gray-700">
                Designs
              </Link>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium">{design.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              {design.images && design.images[currentImageIndex] ? (
                <img
                  src={design.images[currentImageIndex].url}
                  alt={design.images[currentImageIndex].alt || design.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">No Image</span>
                </div>
              )}

              {/* Navigation Arrows */}
              {design.images && design.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Favorite Button */}
              <button
                onClick={handleFavorite}
                className={`absolute top-4 right-4 p-3 rounded-full transition-colors ${
                  isFavorited
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
              </button>

              {/* Difficulty Badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  design.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                  design.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {design.difficulty}
                </span>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {design.images && design.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {design.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? 'border-primary-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${design.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Design Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{design.title}</h1>
              <p className="text-gray-600 text-lg">{design.description}</p>
            </div>

            {/* Price and Rating */}
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-primary-600">
                ${design.price.toFixed(2)}
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(design.rating?.average || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({design.rating?.count || 0} reviews)
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{design.stitchCount || 'N/A'}</div>
                <div className="text-sm text-gray-600">Stitches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{design.downloads || 0}</div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{design.sales || 0}</div>
                <div className="text-sm text-gray-600">Sales</div>
              </div>
            </div>

            {/* Categories */}
            {design.categories && design.categories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {design.categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/categories/${category._id}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {design.tags && design.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {design.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Supported Formats */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Supported Formats</h3>
              <div className="grid grid-cols-4 gap-2">
                {design.formats?.map((format) => (
                  <span
                    key={format}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm text-center font-medium"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {purchased ? (
                <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Design
                </button>
              ) : (
                <button
                  onClick={handlePurchase}
                  disabled={createPayment.isLoading}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {createPayment.isLoading ? 'Processing...' : 'Purchase Design'}
                </button>
              )}

              <button className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Design
              </button>
            </div>

            {/* Additional Info */}
            <div className="text-sm text-gray-500 space-y-1">
              <p>Added: {new Date(design.createdAt).toLocaleDateString()}</p>
              {design.updatedAt !== design.createdAt && (
                <p>Updated: {new Date(design.updatedAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
