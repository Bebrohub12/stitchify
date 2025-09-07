'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

const SearchBar = () => {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/designs?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search embroidery designs..."
          className="w-full pl-10 pr-4 py-2 border-2 border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-800 focus:border-primary-800 focus:outline-none transition-all"
        />
      </div>
      <button
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-900 text-white px-3 py-1 rounded-md hover:bg-primary-800 text-sm transition-colors"
      >
        Search
      </button>
    </form>
  )
}

export default SearchBar
