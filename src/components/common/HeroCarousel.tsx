'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface CarouselImage {
  url: string
  alt: string
  title: string
  description: string
}

interface HeroCarouselProps {
  images: CarouselImage[]
  autoplaySpeed?: number
}

const HeroCarousel = ({ images, autoplaySpeed = 5000 }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance the carousel
 useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoplaySpeed);

    return () => clearInterval(interval);
  }, [images.length, autoplaySpeed]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-primary-900 text-white">
      {/* Carousel Images */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 bg-black/50 z-10" />
            <Image
              src={image.url}
              alt={image.alt}
              fill
              priority={index === 0}
              quality={90}
              className="object-cover"
              sizes="100vw"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 heading-serif">
                  {image.title}
                </h1>
                <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-3xl mx-auto">
                  {image.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/designs"
                    className="btn btn-primary px-8 py-3 text-lg"
                  >
                    Browse Designs
                  </Link>
                  <Link
                    href="/contact"
                    className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-900 px-8 py-3 text-lg"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full z-30 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full z-30 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-30">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default HeroCarousel