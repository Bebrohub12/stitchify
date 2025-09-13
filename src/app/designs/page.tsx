'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react'
import axios from 'axios'
import DesignCard from '@/components/designs/DesignCard'
import DesignCardList from '@/components/designs/DesignCardList'
import SearchBar from '@/components/common/SearchBar'

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
}

interface Category {
  _id: string
  name: string
  slug: string
  subcategories?: Category[]
}

interface FilterState {
  category: string
  difficulty: string
  priceRange: string
  sortBy: string
  sortOrder: string
}

function DesignsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    difficulty: '',
    priceRange: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // Get search query from URL safely
  const searchQuery = searchParams.get('search') || ''

  // Fetch designs with filters
  const { data, isLoading } = useQuery({
    queryKey: ['designs', filters, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (filters.category) params.append('category', filters.category)
      if (filters.difficulty) params.append('difficulty', filters.difficulty)
      if (filters.priceRange) params.append('priceRange', filters.priceRange)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

      const response = await axios.get(`/api/designs?${params.toString()}`)
      return response.data
    },
  })

  const designs = data?.designs || []

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('/api/categories/main')
      return response.data
    },
  })

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    if (filters.category) params.append('category', filters.category)
    if (filters.difficulty) params.append('difficulty', filters.difficulty)
    if (filters.priceRange) params.append('priceRange', filters.priceRange)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const newUrl = params.toString() ? `/designs?${params.toString()}` : '/designs'
    router.push(newUrl, { scroll: false })
  }, [filters, searchQuery, router])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      priceRange: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  }

  const priceRanges = [
    { value: '', label: 'All Prices' },
    { value: '0-5', label: 'Under $5' },
    { value: '5-10', label: '$5 - $10' },
    { value: '10-20', label: '$10 - $20' },
    { value: '20+', label: 'Over $20' },
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Newest' },
    { value: 'price', label: 'Price' },
    { value: 'sales', label: 'Popularity' },
    { value: 'rating', label: 'Rating' },
    { value: 'title', label: 'Title' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Designs'}
          </h1>
          <p className="text-gray-600">{designs?.length || 0} designs found</p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar />
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-white rounded-lg border border-gray-300 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories?.map((category: Category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) =>
                    handleFilterChange('difficulty', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Difficulties</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) =>
                    handleFilterChange('priceRange', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      handleFilterChange(
                        'sortOrder',
                        filters.sortOrder === 'asc' ? 'desc' : 'asc'
                      )
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {filters.sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Designs Grid/List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : designs.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No designs found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'
                : 'space-y-3'
            }
          >
            {designs.map((design: Design) =>
              viewMode === 'grid' ? (
                <DesignCard key={design._id} design={design} />
              ) : (
                <DesignCardList key={design._id} design={design} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DesignsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <DesignsPageContent />
    </Suspense>
  )
}






// 'use client'

//   // app/designs/page.tsx
// export const dynamic = 'force-dynamic'

// import { useState, useEffect } from 'react'
// import { useSearchParams, useRouter } from 'next/navigation'
// import { useQuery } from '@tanstack/react-query'
// import { Filter, Grid, List, Search, SlidersHorizontal } from 'lucide-react'
// import axios from 'axios'
// import DesignCard from '@/components/designs/DesignCard'
// import DesignCardList from '@/components/designs/DesignCardList'
// import SearchBar from '@/components/common/SearchBar'

// interface Design {
//   _id: string
//   title: string
//   description: string
//   price: number
//   images: Array<{ url: string; alt: string }>
//   categories: Array<{ _id: string; name: string; slug: string }>
//   difficulty: string
//   stitchCount: number
//   downloads: number
//   rating: { average: number; count: number }
//   sales: number
//   featured: boolean
// }

// interface Category {
//   _id: string
//   name: string
//   slug: string
//   subcategories?: Category[]
// }

// interface FilterState {
//   category: string
//   difficulty: string
//   priceRange: string
//   sortBy: string
//   sortOrder: string
// }

// export default function DesignsPage() {
//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
//   const [showFilters, setShowFilters] = useState(false)
//   const [filters, setFilters] = useState<FilterState>({
//     category: '',
//     difficulty: '',
//     priceRange: '',
//     sortBy: 'createdAt',
//     sortOrder: 'desc'
//   })



//   // Get search query from URL
//   const searchQuery = searchParams.get('search') || ''

//   // Fetch designs with filters
//   const { data, isLoading } = useQuery({
//     queryKey: ['designs', filters, searchQuery],
//     queryFn: async () => {
//       const params = new URLSearchParams()
//       if (searchQuery) params.append('search', searchQuery)
//       if (filters.category) params.append('category', filters.category)
//       if (filters.difficulty) params.append('difficulty', filters.difficulty)
//       if (filters.priceRange) params.append('priceRange', filters.priceRange)
//       if (filters.sortBy) params.append('sortBy', filters.sortBy)
//       if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

//       const response = await axios.get(`/api/designs?${params.toString()}`)
//       return response.data
//     }
//   })

//   // Extract designs array from the response
//   const designs = data?.designs || []

//   // Fetch categories for filter
//   const { data: categories } = useQuery({
//     queryKey: ['categories'],
//     queryFn: async () => {
//       const response = await axios.get('/api/categories/main')
//       return response.data
//     }
//   })

//   // Update URL when filters change
//   useEffect(() => {
//     const params = new URLSearchParams()
//     if (searchQuery) params.append('search', searchQuery)
//     if (filters.category) params.append('category', filters.category)
//     if (filters.difficulty) params.append('difficulty', filters.difficulty)
//     if (filters.priceRange) params.append('priceRange', filters.priceRange)
//     if (filters.sortBy) params.append('sortBy', filters.sortBy)
//     if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

//     const newUrl = params.toString() ? `/designs?${params.toString()}` : '/designs'
//     router.push(newUrl, { scroll: false })
//   }, [filters, searchQuery, router])

//   const handleFilterChange = (key: keyof FilterState, value: string) => {
//     setFilters(prev => ({ ...prev, [key]: value }))
//   }

//   const clearFilters = () => {
//     setFilters({
//       category: '',
//       difficulty: '',
//       priceRange: '',
//       sortBy: 'createdAt',
//       sortOrder: 'desc'
//     })
//   }

//   const priceRanges = [
//     { value: '', label: 'All Prices' },
//     { value: '0-5', label: 'Under $5' },
//     { value: '5-10', label: '$5 - $10' },
//     { value: '10-20', label: '$10 - $20' },
//     { value: '20+', label: 'Over $20' }
//   ]

//   const sortOptions = [
//     { value: 'createdAt', label: 'Newest' },
//     { value: 'price', label: 'Price' },
//     { value: 'sales', label: 'Popularity' },
//     { value: 'rating', label: 'Rating' },
//     { value: 'title', label: 'Title' }
//   ]

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             {searchQuery ? `Search Results for "${searchQuery}"` : 'All Designs'}
//           </h1>
//           <p className="text-gray-600">
//             {designs?.length || 0} designs found
//           </p>
//         </div>

//         {/* Search and Controls */}
//         <div className="flex flex-col lg:flex-row gap-4 mb-6">
//           <div className="flex-1">
//             <SearchBar />
//           </div>
          
//           <div className="flex items-center gap-4">
//             {/* View Mode Toggle */}
//             <div className="flex bg-white rounded-lg border border-gray-300 p-1">
//               <button
//                 onClick={() => setViewMode('grid')}
//                 className={`p-2 rounded-md transition-colors ${
//                   viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 <Grid className="w-5 h-5" />
//               </button>
//               <button
//                 onClick={() => setViewMode('list')}
//                 className={`p-2 rounded-md transition-colors ${
//                   viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900'
//                 }`}
//               >
//                 <List className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Filter Toggle */}
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               <SlidersHorizontal className="w-5 h-5" />
//               <span>Filters</span>
//             </button>
//           </div>
//         </div>

//         {/* Filters */}
//         {showFilters && (
//           <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {/* Category Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
//                 <select
//                   value={filters.category}
//                   onChange={(e) => handleFilterChange('category', e.target.value)}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                 >
//                   <option value="">All Categories</option>
//                   {categories?.map((category: Category) => (
//                     <option key={category._id} value={category._id}>
//                       {category.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Difficulty Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
//                 <select
//                   value={filters.difficulty}
//                   onChange={(e) => handleFilterChange('difficulty', e.target.value)}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                 >
//                   <option value="">All Difficulties</option>
//                   <option value="Beginner">Beginner</option>
//                   <option value="Intermediate">Intermediate</option>
//                   <option value="Advanced">Advanced</option>
//                 </select>
//               </div>

//               {/* Price Range Filter */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
//                 <select
//                   value={filters.priceRange}
//                   onChange={(e) => handleFilterChange('priceRange', e.target.value)}
//                   className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                 >
//                   {priceRanges.map((range) => (
//                     <option key={range.value} value={range.value}>
//                       {range.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Sort Options */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
//                 <div className="flex gap-2">
//                   <select
//                     value={filters.sortBy}
//                     onChange={(e) => handleFilterChange('sortBy', e.target.value)}
//                     className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
//                   >
//                     {sortOptions.map((option) => (
//                       <option key={option.value} value={option.value}>
//                         {option.label}
//                       </option>
//                     ))}
//                   </select>
//                   <button
//                     onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
//                     className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//                   >
//                     {filters.sortOrder === 'asc' ? '↑' : '↓'}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Clear Filters */}
//             <div className="mt-4 flex justify-end">
//               <button
//                 onClick={clearFilters}
//                 className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
//               >
//                 Clear All Filters
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Designs Grid/List */}
//         {isLoading ? (
//           <div className="flex justify-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//           </div>
//         ) : designs.length === 0 ? (
//           <div className="text-center py-12">
//             <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No designs found</h3>
//             <p className="text-gray-600">Try adjusting your search or filters</p>
//           </div>
//         ) : (
//           <div className={viewMode === 'grid' 
//             ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'
//             : 'space-y-3'
//           }>
//             {designs.map((design: Design) => (
//               viewMode === 'grid' ? (
//                 <DesignCard key={design._id} design={design} />
//               ) : (
//                 <DesignCardList key={design._id} design={design} />
//               )
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


