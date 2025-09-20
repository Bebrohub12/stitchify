'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'
import toast from 'react-hot-toast'
import AdminRoute from '@/components/auth/AdminRoute'

export const dynamic = 'force-dynamic'

interface DesignFormData {
  title: string
  description: string
  price: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  stitchCount: number
  categories: string[]
  formats: string[]
  tags: string
  featured: boolean
  popular: boolean
}

interface DesignFiles {
  [key: string]: File | null
}

export default function EditDesignPage() {
  const params = useParams()
  const router = useRouter()
  const designId = params.id as string
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // State for images and files
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<Array<{ url: string; alt: string }>>([])
  const [designFiles, setDesignFiles] = useState<DesignFiles>({})
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  
  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<DesignFormData>({
    defaultValues: {
      difficulty: 'Beginner',
      formats: [],
      categories: [],
      price: 0,
      stitchCount: 0,
      featured: false,
      popular: false
    }
  })

  // Fetch categories for selection
  const { data: categories } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/categories')
      return response.data
    }
  })

  // Fetch design details
  const { data: design, isLoading } = useQuery({
    queryKey: ['adminDesignEdit', designId],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/designs/${designId}`)
      return response.data
    }
  })
  
  // Handle form population when data is loaded
  useEffect(() => {
    if (design) {
      // Populate form with existing design data
      reset({
        title: design.title,
        description: design.description,
        price: design.price,
        difficulty: design.difficulty,
        stitchCount: design.stitchCount,
        categories: design.categories.map((cat: any) => cat._id),
        formats: design.formats,
        tags: design.tags.join(', '),
        featured: design.featured,
        popular: design.popular || false
      })
      
      // Set existing images
      setExistingImages(design.images || [])
      
      // Set selected formats
      setSelectedFormats(design.formats || [])
    }
  }, [design, reset])

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setImageFiles(prev => [...prev, ...newFiles])
      
      // Generate previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file))
      setImagePreviews(prev => [...prev, ...newPreviews])
    }
  }
  
  // Handle image removal
  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index])
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }
  
  // Handle existing image removal
  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }
  
  // Handle design file selection
  const handleDesignFileSelect = (e: React.ChangeEvent<HTMLInputElement>, format: string) => {
    if (e.target.files && e.target.files.length > 0) {
      setDesignFiles(prev => ({
        ...prev,
        [format]: e.target.files![0]
      }))
    }
  }
  
  // Handle design file removal for specific format
  const handleRemoveDesignFile = (format: string) => {
    setDesignFiles(prev => ({
      ...prev,
      [format]: null
    }))
  }
  
  // Handle format checkbox change
  const handleFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setSelectedFormats(prev => [...prev, format])
    } else {
      setSelectedFormats(prev => prev.filter(f => f !== format))
      setDesignFiles(prev => ({
        ...prev,
        [format]: null
      }))
    }
  }
  
  // Update design mutation
  const updateDesign = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.patch(`/api/admin/designs/${designId}`, formData)
      return response.data
    },
    onSuccess: () => {
      toast.success('Design updated successfully!')
      router.push(`/admin/designs/${designId}`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update design')
      setIsSubmitting(false)
    }
  })
  
  // Form submission handler
  const onSubmit = async (data: DesignFormData) => {
    setIsSubmitting(true)
    
    const formData = new FormData()
    
    // Add basic design data
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('price', data.price.toString())
    formData.append('difficulty', data.difficulty)
    formData.append('stitchCount', data.stitchCount.toString())
    formData.append('featured', data.featured.toString())
    formData.append('popular', data.popular.toString())
    
    // Add categories
    data.categories.forEach(categoryId => {
      formData.append('categories', categoryId)
    })
    
    // Add formats
    selectedFormats.forEach(format => {
      formData.append('formats', format)
    })
    
    // Add tags
    const tags = data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    tags.forEach(tag => {
      formData.append('tags', tag)
    })
    
    // Add existing images
    formData.append('existingImages', JSON.stringify(existingImages))
    
    // Add new images
    imageFiles.forEach(file => {
      formData.append('images', file)
    })
    
    // Add design files
    Object.entries(designFiles).forEach(([format, file]) => {
      if (file) {
        formData.append(`designFile_${format}`, file)
      }
    })
    
    // Submit the form
    updateDesign.mutate(formData)
  }
  
  // Available formats
  const availableFormats = ['PES', 'DST', 'EXP', 'JEF', 'XXX', 'VP3', 'PDF']
  
  if (isLoading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </AdminRoute>
    )
  }
  
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  href={`/admin/designs/${designId}`}
                  className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Edit Design</h1>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      id="title"
                      type="text"
                      {...register('title', { required: 'Title is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      {...register('description', { required: 'Description is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) *
                    </label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price', { 
                        required: 'Price is required',
                        min: { value: 0, message: 'Price must be positive' }
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="stitchCount" className="block text-sm font-medium text-gray-700 mb-1">
                      Stitch Count *
                    </label>
                    <input
                      id="stitchCount"
                      type="number"
                      min="0"
                      {...register('stitchCount', { 
                        required: 'Stitch count is required',
                        min: { value: 0, message: 'Stitch count must be positive' }
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {errors.stitchCount && (
                      <p className="mt-1 text-sm text-red-600">{errors.stitchCount.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty *
                    </label>
                    <select
                      id="difficulty"
                      {...register('difficulty', { required: 'Difficulty is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    {errors.difficulty && (
                      <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
                      Categories *
                    </label>
                    <select
                      id="categories"
                      multiple
                      {...register('categories', { required: 'At least one category is required' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      size={4}
                    >
                      {categories?.map((category: any) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categories && (
                      <p className="mt-1 text-sm text-red-600">{errors.categories.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple categories</p>
                  </div>
                  
                  <div className="col-span-2">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <input
                      id="tags"
                      type="text"
                      {...register('tags')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter tags separated by commas"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate tags with commas (e.g., floral, animal, holiday)</p>
                  </div>
                </div>
              </div>
              
              {/* Promotion Options */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Promotion Options</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="featured"
                      type="checkbox"
                      {...register('featured')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Featured Design (appears on homepage)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="popular"
                      type="checkbox"
                      {...register('popular')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="popular" className="ml-2 block text-sm text-gray-900">
                      Popular Design (appears in popular section)
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Available Formats */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Available Formats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {availableFormats.map((format) => (
                    <div key={format} className="flex items-center">
                      <input
                        id={`format-${format}`}
                        type="checkbox"
                        checked={selectedFormats.includes(format)}
                        onChange={(e) => handleFormatChange(format, e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`format-${format}`} className="ml-2 block text-sm text-gray-900">
                        {format}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Design Files */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Design Files</h2>
                <div className="space-y-4">
                  {selectedFormats.map((format) => (
                    <div key={format} className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-700 w-12">{format}</span>
                      {designFiles[format] ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 truncate max-w-xs">
                            {designFiles[format]?.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDesignFile(format)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <input
                            type="file"
                            id={`file-${format}`}
                            onChange={(e) => handleDesignFileSelect(e, format)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50">
                            <Upload className="w-4 h-4" />
                            <span>Upload {format} file</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {selectedFormats.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Please select at least one format above to upload design files.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Images */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Images</h2>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                            <img
                              src={image.url}
                              alt={image.alt || `Design image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New Images */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* Image Previews */}
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={preview}
                            alt={`New image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Upload Button */}
                    <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300">
                      <input
                        type="file"
                        id="images"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-center">
                        <Plus className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <span className="text-sm text-gray-500">Add Image</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400"
                >
                  {isSubmitting ? 'Updating...' : 'Update Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}