'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, HardDrive, Loader2, AlertCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassButton } from '@/components/ui/GlassButton'
import { SlideFile } from '@/types'
import { getFileById } from '@/lib/cloudStorage'
import { formatFileSize } from '@/lib/utils'
import { format } from 'date-fns'

export default function SharePage() {
  const params = useParams()
  const fileId = params.id as string

  const [file, setFile] = useState<SlideFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    loadFile()
  }, [fileId])

  const loadFile = async () => {
    try {
      setLoading(true)
      const fileData = await getFileById(fileId)

      if (fileData) {
        setFile(fileData)
      } else {
        setError('File not found or link expired')
      }
    } catch (err) {
      console.error('Error loading file:', err)
      setError('Failed to load file')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!file || !file.downloadURL) return

    try {
      setDownloading(true)

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a')
      link.href = file.downloadURL
      link.download = file.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download file')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="text-center">
          <Loader2 className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-800 text-lg">Loading file...</p>
        </GlassCard>
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error || 'File not found'}</p>
          <p className="text-gray-400 text-sm">
            The file might have been deleted or the link is invalid.
          </p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Course Slides Manager
          </h1>
          <p className="text-gray-600">
            Someone shared a presentation with you
          </p>
        </motion.div>

        {/* File Card */}
        <GlassCard>
          <div className="text-center mb-6">
            <div className="inline-block p-6 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-4">
              <FileText className="w-20 h-20 text-gray-700" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{file.name}</h2>
          </div>

          {/* File Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm">File Size</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {formatFileSize(file.size)}
              </p>
            </div>

            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Uploaded</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {format(new Date(file.uploadedAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          {/* Download Button */}
          <GlassButton
            onClick={handleDownload}
            variant="primary"
            size="lg"
            className="w-full"
            disabled={downloading}
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download File
              </>
            )}
          </GlassButton>

          {/* Info */}
          <div className="mt-6 p-4 glass rounded-xl">
            <p className="text-gray-600 text-sm text-center">
              📱 This file can be downloaded on any device (phone, tablet, computer)
            </p>
          </div>
        </GlassCard>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-gray-400 text-sm">
            Powered by Course Slides Manager
          </p>
        </motion.div>
      </div>
    </div>
  )
}
