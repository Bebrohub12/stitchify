'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Heart, Grid, List } from 'lucide-react'
import axios from 'axios'
import DesignCard from '@/components/designs/DesignCard'
import DesignCardList from '@/components/designs/DesignCardList'
import { useAuth } from '@/contexts/AuthContext'

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

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch user's favorite designs
  const { data: favoriteDesigns, isLoading } = useQuery({
    queryKey: ['favoriteDesigns'],
    queryFn: async () => {
      if (!isAuthenticated || !user?.favorites?.length) return []
      
      const response = await axios.get('/api/users/favorites')
      return response.data
    },
    enabled: isAuthenticated && !!user?.favorites?.length
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your favorites.</p>
          <a
            href="/login"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Heart className="w-8 h-8 text-red-500 mr-3" />
                My Favorites
              </h1>
              <p className="text-gray-600 mt-2">
                {favoriteDesigns?.length || 0} design{favoriteDesigns?.length !== 1 ? 's' : ''} saved
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : !favoriteDesigns || favoriteDesigns.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-4">Start exploring designs and add them to your favorites!</p>
            <a
              href="/designs"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Designs
            </a>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'
            : 'space-y-3'
          }>
            {favoriteDesigns.map((design: Design) => (
              viewMode === 'grid' ? (
                <DesignCard key={design._id} design={design} />
              ) : (
                <DesignCardList key={design._id} design={design} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
