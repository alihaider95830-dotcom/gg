import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Course Slides Manager - Upload & Organize Presentations',
  description: 'Securely upload, organize, and download course presentation slides with a modern glassmorphism UI. Support for PowerPoint files with batch operations.',
  keywords: ['course management', 'slides', 'presentations', 'powerpoint', 'upload', 'download', 'organize'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  publisher: 'Your Name',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Course Slides Manager',
    description: 'Upload, organize, and download course presentation slides',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Course Slides Manager',
    description: 'Upload, organize, and download course presentation slides',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#667eea' },
    { media: '(prefers-color-scheme: dark)', color: '#1e3a8a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
