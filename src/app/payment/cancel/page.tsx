'use client'

import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Cancel Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>

          {/* Cancel Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your payment was cancelled. No charges were made to your account.
          </p>

          {/* Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              What Happened?
            </h2>
            <div className="text-blue-700 text-left space-y-2">
              <p>• Your payment process was interrupted or cancelled</p>
              <p>• No money was withdrawn from your account</p>
              <p>• Your design is still available for purchase</p>
              <p>• You can try the payment process again anytime</p>
            </div>
          </div>

          {/* Common Reasons */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Common Reasons for Cancellation
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Browser was closed during payment</li>
              <li>• Network connection issues</li>
              <li>• Payment method declined</li>
              <li>• User manually cancelled the payment</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/designs"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Continue Shopping</span>
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Profile</span>
            </Link>
          </div>

          {/* Support Information */}
          <div className="border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-500 mb-2">
              Having trouble with payments or need assistance?
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
