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

interface DesignCardProps {
  design: Design
}

export default function DesignCard({ design }: DesignCardProps) {
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`/api/designs/${design._id}/favorite`)
      return response.data
    },
    onSuccess: () => {
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

  const isFavorited = user?.favorites?.some((fav: any) => fav._id === design._id)

  return (
    <Link
      href={`/designs/${design._id}`}
      className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          {design.images && design.images[0] ? (
            <>
              <img
                src={design.images[0].url}
                alt={design.images[0].alt || design.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {design.images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  +{design.images.length - 1}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
              isFavorited
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Difficulty Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            design.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
            design.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {design.difficulty}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-primary-900 mb-3 line-clamp-2 group-hover:text-primary-800 transition-colors">
          {design.title}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-primary-900">
            ${design.price.toFixed(2)}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-primary-800 fill-current" />
            <span className="text-sm text-primary-700">
              {design.rating?.average?.toFixed(1) || '0.0'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-primary-600">
          <span>{design.stitchCount || 'N/A'} stitches</span>
          <span>{design.downloads || 0} downloads</span>
        </div>

        {design.categories && design.categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {design.categories.slice(0, 2).map((category) => (
              <span
                key={category._id}
                className="px-3 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
