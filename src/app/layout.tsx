import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/providers/Providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stitchify - Digital Embroidery Designs',
  description: 'Premium digital embroidery designs for creative enthusiasts. Browse, purchase, and download designs in multiple formats.',
  keywords: 'embroidery, digital designs, SVG, DST, PES, JEF, EXP, HUS, VP3',
  authors: [{ name: 'Stitchify' }],
  openGraph: {
    title: 'Stitchify - Digital Embroidery Designs',
    description: 'Premium digital embroidery designs for creative enthusiasts',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
