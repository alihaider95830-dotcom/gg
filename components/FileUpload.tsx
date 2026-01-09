'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { ProgressBar } from './ui/ProgressBar'
import { validatePPTXFile, formatFileSize } from '@/lib/utils'
import { UploadProgress } from '@/types'

interface FileUploadProps {
  courseId: string
  onUploadComplete: () => void
  maxFiles?: number
}

export function FileUpload({ courseId, onUploadComplete, maxFiles = 100 }: FileUploadProps) {
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(validatePPTXFile)

    if (validFiles.length === 0) {
      alert('Please upload only PPT or PPTX files')
      return
    }

    if (validFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files at once`)
      return
    }

    // Initialize upload progress for each file
    const newUploads: UploadProgress[] = validFiles.map(file => ({
      fileId: `${Date.now()}-${file.name}`,
      fileName: file.name,
      progress: 0,
      status: 'pending',
    }))

    setUploadQueue(newUploads)

    // Simulate file upload (replace with actual API call)
    validFiles.forEach((file, index) => {
      simulateUpload(file, newUploads[index].fileId)
    })
  }, [maxFiles])

  const simulateUpload = (file: File, fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        setUploadQueue(prev =>
          prev.map(item =>
            item.fileId === fileId
              ? { ...item, progress: 100, status: 'completed' }
              : item
          )
        )

        // Save file to storage
        const reader = new FileReader()
        reader.onload = () => {
          const fileData = {
            id: fileId,
            courseId,
            name: file.name,
            size: file.size,
            uploadedAt: new Date(),
            tags: [],
          }

          const files = JSON.parse(localStorage.getItem('files') || '[]')
          files.push(fileData)
          localStorage.setItem('files', JSON.stringify(files))

          // Call onUploadComplete after a short delay
          setTimeout(() => {
            onUploadComplete()
          }, 500)
        }
        reader.readAsDataURL(file)
      } else {
        setUploadQueue(prev =>
          prev.map(item =>
            item.fileId === fileId
              ? { ...item, progress, status: 'uploading' }
              : item
          )
        )
      }
    }, 200)
  }

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
  })

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`glass rounded-3xl p-12 border-2 border-dashed cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
          isDragActive ? 'border-blue-400 bg-blue-500/10' : 'border-white/20'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ y: isDragActive ? -10 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Upload className="w-16 h-16 text-white/50 mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {isDragActive ? 'Drop files here' : 'Upload Slides'}
          </h3>
          <p className="text-white/60 mb-4">
            Drag & drop PowerPoint files here, or click to browse
          </p>
          <p className="text-white/40 text-sm">
            Supports .ppt and .pptx files • Max {maxFiles} files
          </p>
        </div>
      </div>

      {uploadQueue.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-semibold">Upload Queue ({uploadQueue.length})</h4>
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
                <span className="text-white flex-1 truncate">{item.fileName}</span>
                {item.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <button
                  onClick={() => removeFromQueue(item.fileId)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {item.status !== 'completed' && (
                <ProgressBar progress={item.progress} showPercentage />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
