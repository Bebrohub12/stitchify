'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Download, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [transaction, setTransaction] = useState<any>(null)

  const paymentId = searchParams.get('paymentId')
  const token = searchParams.get('token')
  const payerId = searchParams.get('PayerID')


  const PaymentSuccessPage = () => {
    const [transaction, setTransaction] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // ✅ useCallback ensures function reference is stable
    const executePayment = useCallback(async () => {
      try {
        const response = await fetch('/api/payments/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId,
            token,
            payerId,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setTransaction(data)
        } else {
          console.error('Payment execution failed')
        }
      } catch (error) {
        console.error('Error executing payment:', error)
      } finally {
        setIsLoading(false)
      }
    }, [paymentId, token, payerId]) // ✅ include dependencies here

    useEffect(() => {
      if (paymentId && token && payerId) {
        executePayment()
      } else {
        setIsLoading(false)
      }
    }, [paymentId, token, payerId, executePayment]) // ✅ now safe
  }


  // useEffect(() => {
  //   if (paymentId && token && payerId) {
  //     // Execute the payment on the backend
  //     executePayment()
  //   } else {
  //     setIsLoading(false)
  //   }
  // }, [paymentId, token, payerId])


  // const executePayment = async () => {
  //   try {
  //     const response = await fetch('/api/payments/execute', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         paymentId,
  //         token,
  //         payerId,
  //       }),
  //     })

  //     if (response.ok) {
  //       const data = await response.json()
  //       setTransaction(data)
  //     } else {
  //       console.error('Payment execution failed')
  //     }
  //   } catch (error) {
  //     console.error('Error executing payment:', error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-4">There was an issue processing your payment.</p>
          <Link
            href="/contact"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Contact Support
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your embroidery design is now available for download.
          </p>

          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium text-gray-900">{transaction._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Design:</span>
                <span className="font-medium text-gray-900">{transaction.design?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-gray-900">
                  ${transaction.amount?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Download Your Design
            </h3>
            <p className="text-blue-700 mb-4">
              Your design is available in multiple formats. Click the button below to download all formats.
            </p>
            <Link
              href={`/api/payments/download/${transaction._id}`}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download All Formats</span>
            </Link>
          </div>

          {/* Email Notification */}
          <div className="bg-yellow-50 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <Mail className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-900">
                Check Your Email
              </h3>
            </div>
            <p className="text-yellow-700">
              We've sent you a confirmation email with download links and instructions.
              Please check your inbox (and spam folder).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/profile"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>View My Purchases</span>
            </Link>
            <Link
              href="/designs"
              className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              <span>Browse More Designs</span>
            </Link>
          </div>

          {/* Support Information */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Need help with your download or have questions?
            </p>
            <Link
              href="/contact"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Contact our support team
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
