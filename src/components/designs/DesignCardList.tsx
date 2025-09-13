'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

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
}

interface DesignCardListProps {
  design: Design
}

export default function DesignCardList({ design }: DesignCardListProps) {
  const { isAuthenticated, user, updateFavorites } = useAuth()
  const queryClient = useQueryClient()

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/designs/${design._id}/favorite`)
      return response.data
    },
    onSuccess: (data) => {
      // Update the local state immediately
      updateFavorites(design._id, data.favorited)
      queryClient.invalidateQueries({ queryKey: ['featuredDesigns'] })
      queryClient.invalidateQueries({ queryKey: ['popularDesigns'] })
      queryClient.invalidateQueries({ queryKey: ['designs'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update favorite')
    },
  })

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to add favorites')
      return
    }
    toggleFavorite.mutate()
  }

  const isFavorited = user?.favorites?.includes(design._id)

  return (
    <Link
      href={`/designs/${design._id}`}
      className="group block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-100"
    >
      <div className="flex">
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden">
          {design.images && design.images[0] ? (
            <>
              <img
                src={design.images[0].url}
                alt={design.images[0].alt || design.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {design.images.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                  +{design.images.length - 1}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm line-clamp-1 flex-1 mr-2">
              {design.title}
            </h3>
            <button
              onClick={handleFavorite}
              className={`p-1 rounded-full transition-all duration-200 flex-shrink-0 ${
                isFavorited
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500'
              }`}
            >
              <Heart className={`w-3 h-3 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {design.description}
          </p>

          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-gray-900">
              ${design.price.toFixed(2)}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600">
                {design.rating?.average?.toFixed(1) || '0.0'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="flex items-center space-x-3">
              <span>{design.stitchCount || 'N/A'} stitches</span>
              <span>{design.downloads || 0} downloads</span>
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-md ${
              design.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
              design.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {design.difficulty}
            </span>
          </div>

          {design.categories && design.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {design.categories.slice(0, 3).map((category) => (
                <span
                  key={category._id}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
