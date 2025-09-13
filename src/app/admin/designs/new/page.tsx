'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'
import toast from 'react-hot-toast'
import AdminRoute from '@/components/auth/AdminRoute'

interface DesignFormData {
  title: string
  description: string
  price: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  stitchCount: number
  categories: string[]
  formats: string[]
  tags: string
  images: File[]
}

interface DesignFiles {
  [key: string]: File | null
}

export default function NewDesignPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Update state to handle multiple images and design files
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [designFiles, setDesignFiles] = useState<DesignFiles>({})
  const [selectedFormats, setSelectedFormats] = useState<string[]>([])
  
  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<DesignFormData>({
    defaultValues: {
      difficulty: 'Beginner',
      formats: [],
      categories: [],
      price: 0,
      stitchCount: 0
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

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const newFiles = Array.from(e.target.files)
    const totalImages = imageFiles.length + newFiles.length
    
    if (totalImages > 4) {
      toast.error('Maximum 4 images allowed')
      return
    }
    
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    
    setImageFiles(prev => [...prev, ...newFiles])
    setImagePreviews(prev => [...prev, ...newPreviews])
    
    // Reset the input to allow re-uploading the same file
    e.target.value = ''
  }
  
  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const newFiles = [...imageFiles]
    const newPreviews = [...imagePreviews]
    
    // Release object URL to prevent memory leaks
    URL.revokeObjectURL(newPreviews[index])
    
    newFiles.splice(index, 1)
    newPreviews.splice(index, 1)
    
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
  }
  
  // Handle design file upload for specific format
  const handleDesignFileUpload = (format: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    setDesignFiles(prev => ({
      ...prev,
      [format]: file
    }))
    
    // Reset the input to allow re-uploading the same file
    e.target.value = ''
  }
  
  // Handle design file removal for specific format
  const handleRemoveDesignFile = (format: string) => {
    setDesignFiles(prev => ({
      ...prev,
      [format]: null
    }))
  }
  
  // Handle format checkbox change - remove file if format is unchecked
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
  
  // Create design mutation
  const createDesign = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axios.post('/api/admin/designs', formData)
      return response.data
    },
    onSuccess: () => {
      toast.success('Design created successfully!')
      router.push('/admin')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create design')
      setIsSubmitting(false)
    }
  })

  // Form submission handler
  const onSubmit = async (data: DesignFormData) => {
    setIsSubmitting(true)
    
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('price', data.price.toString())
    formData.append('difficulty', data.difficulty)
    formData.append('stitchCount', data.stitchCount.toString())
    
    // Add categories
    data.categories.forEach(category => {
      formData.append('categories', category)
    })
    
    // Add formats
    selectedFormats.forEach(format => {
      formData.append('formats', format)
    })
    
    // Add tags (split by comma)
    const tags = data.tags.split(',').map(tag => tag.trim())
    tags.forEach(tag => {
      if (tag) formData.append('tags', tag)
    })
    
    // Add images
    imageFiles.forEach(file => {
      formData.append('images', file)
    })
    
    // Add design files for each format
    Object.entries(designFiles).forEach(([format, file]) => {
      if (file) {
        formData.append(`designFiles[${format}]`, file)
      }
    })
    
    // Submit the form
    createDesign.mutate(formData)
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
                  href="/admin" 
                  className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Add New Design</h1>
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
                    <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      id="difficulty"
                      {...register('difficulty')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="stitchCount" className="block text-sm font-medium text-gray-700 mb-1">
                      Stitch Count
                    </label>
                    <input
                      id="stitchCount"
                      type="number"
                      min="0"
                      {...register('stitchCount', { 
                        min: { value: 0, message: 'Stitch count must be positive' }
                      })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {errors.stitchCount && (
                      <p className="mt-1 text-sm text-red-600">{errors.stitchCount.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      id="tags"
                      type="text"
                      placeholder="floral, spring, nature"
                      {...register('tags')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              {/* Categories */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Categories</h2>
                <div className="space-y-4">
                  {categories?.map((category: any) => (
                    <div key={category._id} className="flex items-start">
                      <input
                        type="checkbox"
                        id={`category-${category._id}`}
                        value={category._id}
                        {...register('categories')}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`category-${category._id}`} className="ml-3 block text-sm font-medium text-gray-700">
                        {category.name}
                        <p className="text-xs text-gray-500">{category.description}</p>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Formats */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Available Formats</h2>
                <div className="space-y-4">
                  {['SVG', 'PNG', 'DST', 'PES', 'JEF', 'EXP', 'HUS', 'VP3'].map(format => (
                    <div key={format} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <input
                          type="checkbox"
                          id={`format-${format}`}
                          value={format}
                          checked={selectedFormats.includes(format)}
                          onChange={(e) => handleFormatChange(format, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`format-${format}`} className="ml-3 block text-sm font-medium text-gray-700">
                          {format}
                        </label>
                      </div>
                      
                      {/* File input for this format */}
                      {selectedFormats.includes(format) && (
                        <div className="ml-7">
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor={`file-upload-${format}`}
                              className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                <p className="text-xs text-gray-600">Upload {format} file</p>
                              </div>
                              <input
                                key={`file-upload-${format}-${selectedFormats.includes(format)}`}
                                id={`file-upload-${format}`}
                                type="file"
                                accept={`.${format.toLowerCase()}`}
                                onChange={(e) => handleDesignFileUpload(format, e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                          
                          {/* Show uploaded file name and remove option */}
                          {designFiles[format] && (
                            <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-2">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                <span className="text-sm text-green-800 font-medium">
                                  {designFiles[format]?.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDesignFile(format)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Images */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Images</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload images</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <input
                        key={`image-upload-${imageFiles.length}`}
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  {/* Image previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting || (imageFiles.length === 0 && Object.values(designFiles).every(file => !file))}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Creating...' : 'Create Design'}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  * Required fields
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}