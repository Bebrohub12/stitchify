'use client'

import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Scissors, Package, Award, Heart, Star } from 'lucide-react'
import axios from 'axios'
import DesignCard from '@/components/designs/DesignCard'
import Link from 'next/link'
import { dummyDesigns, dummyCategories } from '@/lib/dummyData'
import HeroCarousel from '@/components/common/HeroCarousel'
import { heroCarouselImages } from '@/lib/carouselData'

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
  description: string
  image?: string
  subcategories?: Category[]
}

export default function Home() {
  // Using dummy data instead of API calls
  const featuredDesigns = dummyDesigns.filter(design => design.featured);
  const popularDesigns = [...dummyDesigns].sort((a, b) => b.sales - a.sales).slice(0, 4);
  const categories = dummyCategories;

  return (
    <div className="min-h-screen">
      {/* Hero Section with Carousel */}
      <section className="bg-primary-900 text-white h-[600px]">
        <HeroCarousel images={heroCarouselImages} />
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-900 text-center mb-12 heading-serif">Why Choose Stitchify</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6 hover:transform hover:scale-105 transition-transform">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-primary-900" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">Premium Quality</h3>
              <p className="text-primary-700">Meticulously crafted designs with smooth stitching and perfect detail.</p>
            </div>
            <div className="text-center p-6 hover:transform hover:scale-105 transition-transform">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-primary-900" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">Multiple Formats</h3>
              <p className="text-primary-700">All designs available in DST, PES, JEF, EXP, HUS, and VP3 formats.</p>
            </div>
            <div className="text-center p-6 hover:transform hover:scale-105 transition-transform">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-900" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">Satisfaction Guaranteed</h3>
              <p className="text-primary-700">Love your designs or get your money back with our 30-day guarantee.</p>
            </div>
            <div className="text-center p-6 hover:transform hover:scale-105 transition-transform">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-900" />
              </div>
              <h3 className="text-xl font-semibold text-primary-900 mb-2">Customer Support</h3>
              <p className="text-primary-700">Dedicated support team to help with any questions or concerns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Designs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-primary-900 heading-serif">Featured Designs</h2>
            <Link
              href="/designs"
              className="text-primary-800 hover:text-primary-900 font-medium flex items-center gap-2 group"
            >
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredDesigns?.map((design) => (
              <DesignCard key={design._id} design={design} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-900 text-center mb-12 heading-serif">
            Explore by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories?.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category._id}`}
                className="group block"
              >
                <div className="card">
                  {category.image && (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 img-hover-zoom">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-primary-900 mb-3 heading-serif">
                      {category.name}
                    </h3>
                    <p className="text-primary-700 mb-4">
                      {category.description || `Explore beautiful ${category.name.toLowerCase()} designs`}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary-600">
                        {category.subcategories?.length || 0} subcategories
                      </span>
                      <ArrowRight className="w-5 h-5 text-primary-800 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Designs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-primary-900 heading-serif">Popular Designs</h2>
            <Link
              href="/designs?sortBy=sales&sortOrder=desc"
              className="text-primary-800 hover:text-primary-900 font-medium flex items-center gap-2 group"
            >
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularDesigns?.map((design) => (
              <DesignCard key={design._id} design={design} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 heading-serif">
            Ready to Start Your Embroidery Journey?
          </h2>
          <p className="text-xl mb-10 text-gray-300 max-w-2xl mx-auto">
            Join thousands of crafters who trust Stitchify for their embroidery needs.
            Get access to exclusive designs and special offers.
          </p>
          <Link
            href="/register"
            className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-900 px-8 py-3 text-lg inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-900 text-center mb-12 heading-serif">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <span className="text-primary-900 font-bold">JS</span>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900">Jane Smith</h4>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-primary-800 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-primary-700">"The designs from Stitchify are absolutely stunning. The quality is exceptional and they stitch out beautifully every time."</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <span className="text-primary-900 font-bold">RB</span>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900">Robert Brown</h4>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-primary-800 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-primary-700">"I've been using Stitchify designs for years and they never disappoint. The attention to detail is remarkable."</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <span className="text-primary-900 font-bold">EJ</span>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900">Emily Johnson</h4>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-primary-800 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-primary-700">"Customer service is top-notch and the designs are perfect. I recommend Stitchify to all my embroidery friends."</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
