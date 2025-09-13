'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Star
} from 'lucide-react'
import axios from 'axios'
import AdminRoute from '@/components/auth/AdminRoute'
import Link from 'next/link'

interface DashboardStats {
  totalRevenue: number
  totalDesigns: number
  totalUsers: number
  totalSales: number
  monthlyRevenue: number[]
  topDesigns: Array<{
    _id: string
    title: string
    sales: number
    revenue: number
    images: Array<{ url: string; alt: string }>
  }>
  recentTransactions: Array<{
    _id: string
    design: { title: string }
    user: { username: string }
    amount: number
    status: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'designs' | 'categories' | 'users'>('overview')
  const [updatingPopular, setUpdatingPopular] = useState<string | null>(null)

  // Toggle popular status
  const togglePopular = async (designId: string, currentPopular: boolean) => {
    setUpdatingPopular(designId)
    try {
      await axios.patch(`/api/admin/designs/${designId}/popular`, {
        popular: !currentPopular
      })
      // Refetch data
      window.location.reload()
    } catch (error) {
      console.error('Failed to toggle popular status:', error)
    } finally {
      setUpdatingPopular(null)
    }
  }

  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/dashboard')
      return response.data
    }
  })

  // Fetch designs for management
  const { data: designs } = useQuery({
    queryKey: ['adminDesigns'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/designs')
      return response.data
    }
  })

  // Fetch categories for management
  const { data: categories } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/categories')
      return response.data
    }
  })

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'designs', label: 'Designs', icon: Package },
    { id: 'categories', label: 'Categories', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
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

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your embroidery design business</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(stats?.totalRevenue || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Package className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Designs</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats?.totalDesigns || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats?.totalUsers || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Sales</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats?.totalSales || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Performing Designs */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Top Performing Designs</h3>
                  </div>
                  <div className="p-6">
                    {stats?.topDesigns?.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No designs yet</p>
                    ) : (
                      <div className="space-y-4">
                        {stats?.topDesigns?.slice(0, 5).map((design:any) => (
                          <div key={design._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                            <div className="flex-shrink-0">
                              {design.images && design.images[0] ? (
                                <img
                                  src={design.images[0].url}
                                  alt={design.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">No Image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{design.title}</h4>
                              <p className="text-sm text-gray-500">
                                {design.sales} sales • {formatCurrency(design.revenue)}
                              </p>
                            </div>
                            <Link
                              href={`/admin/designs/${design._id}`}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              View Details
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  </div>
                  <div className="p-6">
                    {stats?.recentTransactions?.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No transactions yet</p>
                    ) : (
                      <div className="space-y-4">
                        {stats?.recentTransactions?.slice(0, 5).map((transaction) => (
                          <div key={transaction._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div>
                              <h4 className="font-medium text-gray-900">{transaction.design.title}</h4>
                              <p className="text-sm text-gray-500">
                                {transaction.user.username} • {new Date(transaction.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                transaction.status === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Designs Tab */}
            {activeTab === 'designs' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Designs</h3>
                  <Link
                    href="/admin/designs/new"
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Design</span>
                  </Link>
                </div>
                <div className="p-6">
                  {designs?.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No designs yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Design
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sales
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Popular
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {designs?.map((design: any) => (
                            <tr key={design._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12">
                                    {design.images && design.images[0] ? (
                                      <img
                                        className="h-12 w-12 rounded-lg object-cover"
                                        src={design.images[0].url}
                                        alt={design.title}
                                      />
                                    ) : (
                                      <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-500 text-xs">No Image</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{design.title}</div>
                                    <div className="text-sm text-gray-500">{design.categories?.map((c: any) => c.name).join(', ')}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(design.price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {design.sales || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  design.featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {design.featured ? 'Featured' : 'Active'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => togglePopular(design._id, design.popular)}
                                  disabled={updatingPopular === design._id}
                                  className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                                    design.popular 
                                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  } ${updatingPopular === design._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  <Star className={`w-3 h-3 ${design.popular ? 'fill-current' : ''}`} />
                                  <span>{design.popular ? 'Popular' : 'Make Popular'}</span>
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Link
                                    href={`/designs/${design._id}`}
                                    className="text-primary-600 hover:text-primary-900"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <Link
                                    href={`/admin/designs/${design._id}/edit`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Link>
                                  <button className="text-red-600 hover:text-red-900">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Categories</h3>
                  <Link
                    href="/admin/categories/new"
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </Link>
                </div>
                <div className="p-6">
                  {categories?.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No categories yet</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categories?.map((category: any) => (
                        <div key={category._id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{category.name}</h4>
                            <div className="flex space-x-2">
                              <Link
                                href={`/admin/categories/${category._id}/edit`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{category.description}</p>
                          <div className="text-xs text-gray-400">
                            {category.subcategories?.length || 0} subcategories
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                    <p className="text-gray-600">User management features coming soon</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}
