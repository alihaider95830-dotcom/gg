'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, File, X, CheckCircle, AlertCircle, Cloud } from 'lucide-react'
import { ProgressBar } from './ui/ProgressBar'
import { validatePPTXFile, generateId } from '@/lib/utils'
import { UploadProgress } from '@/types'
import { uploadFileToCloud, updateCourseStatsInCloud } from '@/lib/cloudStorage'

interface FileUploadProps {
  courseId: string
  onUploadComplete: () => void
  maxFiles?: number
}

export function FileUploadCloud({ courseId, onUploadComplete, maxFiles = 100 }: FileUploadProps) {
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(validatePPTXFile)

    if (validFiles.length === 0) {
      alert('Please upload only PPT or PPTX files')
      return
    }

    if (validFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files at once`)
      return
    }

    setIsUploading(true)

    // Initialize upload progress for each file
    const newUploads: UploadProgress[] = validFiles.map(file => ({
      fileId: generateId(),
      fileName: file.name,
      progress: 0,
      status: 'pending',
    }))

    setUploadQueue(newUploads)

    // Upload files to cloud
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      const uploadInfo = newUploads[i]

      try {
        // Update status to uploading
        setUploadQueue(prev =>
          prev.map(item =>
            item.fileId === uploadInfo.fileId
              ? { ...item, status: 'uploading', progress: 10 }
              : item
          )
        )

        // Upload to Firebase Storage
        await uploadFileToCloud(
          file,
          courseId,
          uploadInfo.fileId,
          (progress) => {
            setUploadQueue(prev =>
              prev.map(item =>
                item.fileId === uploadInfo.fileId
                  ? { ...item, progress }
                  : item
              )
            )
          }
        )

        // Mark as completed
        setUploadQueue(prev =>
          prev.map(item =>
            item.fileId === uploadInfo.fileId
              ? { ...item, progress: 100, status: 'completed' }
              : item
          )
        )
      } catch (error) {
        console.error('Upload error:', error)
        setUploadQueue(prev =>
          prev.map(item =>
            item.fileId === uploadInfo.fileId
              ? { ...item, status: 'error', error: 'Upload failed' }
              : item
          )
        )
      }
    }

    // Update course stats
    await updateCourseStatsInCloud(courseId)

    setIsUploading(false)

    // Call onUploadComplete after a short delay
    setTimeout(() => {
      onUploadComplete()
    }, 500)
  }, [courseId, maxFiles, onUploadComplete])

  const removeFromQueue = (fileId: string) => {
    setUploadQueue(prev => prev.filter(item => item.fileId !== fileId))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    maxFiles,
    disabled: isUploading,
  })

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`glass rounded-3xl p-12 border-2 border-dashed cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
          isDragActive ? 'border-blue-400 bg-blue-500/10' : 'border-white/20'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ y: isDragActive ? -10 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <Upload className="w-16 h-16 text-gray-500 mb-4" />
              <Cloud className="w-8 h-8 text-blue-400 absolute -bottom-2 -right-2" />
            </div>
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {isDragActive ? 'Drop files here' : 'Upload to Cloud'}
          </h3>
          <p className="text-gray-600 mb-2">
            Drag & drop PowerPoint files here, or click to browse
          </p>
          <p className="text-gray-400 text-sm mb-2">
            Supports .ppt and .pptx files • Max {maxFiles} files
          </p>
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <Cloud className="w-4 h-4" />
            <span>Files will be synced to cloud and shareable</span>
          </div>
        </div>
      </div>

      {uploadQueue.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-gray-800 font-semibold">
            Upload Queue ({uploadQueue.length})
          </h4>
          {uploadQueue.map(item => (
            <motion.div
              key={item.fileId}
              className="glass rounded-2xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <File className="w-5 h-5 text-blue-400" />
                <span className="text-gray-800 flex-1 truncate">{item.fileName}</span>
                {item.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                {item.status === 'uploading' && (
                  <Cloud className="w-5 h-5 text-blue-400 animate-pulse" />
                )}
                <button
                  onClick={() => removeFromQueue(item.fileId)}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                  disabled={item.status === 'uploading'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {item.status !== 'completed' && (
                <ProgressBar progress={item.progress} showPercentage />
              )}
              {item.status === 'error' && (
                <p className="text-red-400 text-sm mt-2">{item.error}</p>
              )}
              {item.status === 'completed' && (
                <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                  <Cloud className="w-4 h-4" />
                  Synced to cloud
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
