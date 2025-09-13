'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AdminRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

const AdminRoute = ({ children, redirectTo = '/login' }: AdminRouteProps) => {
  const { isAuthenticated,
    //  isLoading, 
     user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
      } else if (user?.role !== 'admin') {
        router.push('/')
      // }
    }
  }, [isAuthenticated,
    //  isLoading,
      user, router, redirectTo])

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
  //     </div>
  //   )
  // }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return <>{children}</>
}

export default AdminRoute
