'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Upload,
  Download,
  Search,
  FileText,
  CheckSquare,
  Square,
  Trash2,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassButton } from '@/components/ui/GlassButton'
import { GlassInput } from '@/components/ui/GlassInput'
import { Modal } from '@/components/ui/Modal'
import { FileCard } from '@/components/FileCard'
import { FileUpload } from '@/components/FileUpload'
import { EmptyState } from '@/components/ui/EmptyState'
import { FileCardSkeleton } from '@/components/ui/Skeleton'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Toast, ToastType } from '@/components/ui/Toast'
import { Course, SlideFile } from '@/types'
import { getCourses, getFilesByCourse, deleteFile, deleteMultipleFiles } from '@/lib/storage'
import JSZip from 'jszip'

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [files, setFiles] = useState<SlideFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<SlideFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  const [toast, setToast] = useState<{
    isVisible: boolean
    message: string
    type: ToastType
  }>({
    isVisible: false,
    message: '',
    type: 'info',
  })

  // Memoized helpers
  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ isVisible: true, message, type })
  }, [])

  const loadCourse = useCallback(() => {
    const courses = getCourses()
    const foundCourse = courses.find(c => c.id === courseId)
    if (foundCourse) {
      setCourse(foundCourse)
    }
  }, [courseId])

  const loadFiles = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      const courseFiles = getFilesByCourse(courseId)
      setFiles(courseFiles)
      setIsLoading(false)
    }, 500)
  }, [courseId])

  // Initial load
  useEffect(() => {
    loadCourse()
    loadFiles()
  }, [courseId, loadCourse, loadFiles])

  // Filter and sort
  useEffect(() => {
    let filtered = [...files]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        case 'size':
          return b.size - a.size
        default:
          return 0
      }
    })

    setFilteredFiles(filtered)
  }, [files, searchQuery, sortBy])

  const handleUploadComplete = useCallback(() => {
    loadFiles()
    loadCourse()
    setIsUploadModalOpen(false)
    showToast('Files uploaded successfully', 'success')
  }, [loadFiles, loadCourse, showToast])

  // Optimized: Uses functional update to avoid dependency on selectedFiles
  const handleFileSelect = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(fileId)) {
        newSelected.delete(fileId)
      } else {
        newSelected.add(fileId)
      }
      return newSelected
    })
  }, [])

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)))
    }
  }

  const handleDownloadFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file) {
      showToast(`Downloading ${file.name}`, 'info')
      // In a real implementation, this would trigger an actual download
    }
  }, [files, showToast])

  const handleDownloadSelected = async () => {
    if (selectedFiles.size === 0) return

    const selectedFilesList = files.filter(f => selectedFiles.has(f.id))

    if (selectedFiles.size === 1) {
      handleDownloadFile(selectedFilesList[0].id)
    } else {
      // Create ZIP for multiple files
      const zip = new JSZip()
      selectedFilesList.forEach(file => {
        // In real implementation, add actual file content
        zip.file(file.name, 'File content placeholder')
      })

      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `${course?.name || 'files'}.zip`
      a.click()

      showToast(`Downloaded ${selectedFiles.size} files`, 'success')
    }
  }

  // Optimized: Uses functional update for setFiles to avoid full files dependency if possible,
  // but here we just depend on loadCourse and showToast.
  const handleDeleteFile = useCallback((fileId: string) => {
    deleteFile(fileId)
    setFiles(prev => prev.filter(f => f.id !== fileId))
    loadCourse()
    showToast('File deleted successfully', 'success')
  }, [loadCourse, showToast])

  const handleDeleteSelected = () => {
    if (selectedFiles.size === 0) return

    if (confirm(`Delete ${selectedFiles.size} file(s)?`)) {
      deleteMultipleFiles(Array.from(selectedFiles))
      setFiles(files.filter(f => !selectedFiles.has(f.id)))
      setSelectedFiles(new Set())
      loadCourse()
      showToast(`Deleted ${selectedFiles.size} file(s)`, 'success')
    }
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard>
          <p className="text-gray-800 text-xl">Course not found</p>
          <GlassButton onClick={() => router.push('/')} className="mt-4">
            Go Back
          </GlassButton>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <GlassButton onClick={() => router.push('/')} variant="secondary">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </GlassButton>
          <ThemeToggle />
        </div>

        {/* Course Hero */}
        <GlassCard className="mb-8">
          <div
            className={`h-48 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center mb-6`}
          >
            <FileText className="w-24 h-24 text-gray-700" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{course.name}</h1>
          <p className="text-gray-600 text-lg mb-4">{course.description}</p>
          <div className="flex gap-4 text-gray-700">
            <span>{course.fileCount} files</span>
            <span>•</span>
            <span>
              {(course.totalSize / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </GlassCard>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <GlassInput
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
            className="flex-1"
          />

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="glass-input"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>

          <GlassButton onClick={() => setIsUploadModalOpen(true)} variant="primary">
            <Upload className="w-5 h-5 mr-2" />
            Upload Files
          </GlassButton>
        </div>

        {/* Selection Actions */}
        {selectedFiles.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 mb-6 flex items-center gap-4"
          >
            <span className="text-gray-800 font-semibold">
              {selectedFiles.size} file(s) selected
            </span>
            <div className="flex gap-2 ml-auto">
              <GlassButton onClick={handleDownloadSelected} size="sm" variant="primary">
                <Download className="w-4 h-4 mr-2" />
                Download
              </GlassButton>
              <GlassButton onClick={handleDeleteSelected} size="sm" variant="danger">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </GlassButton>
              <GlassButton onClick={() => setSelectedFiles(new Set())} size="sm" variant="secondary">
                Clear
              </GlassButton>
            </div>
          </motion.div>
        )}

        {/* Select All */}
        {filteredFiles.length > 0 && (
          <motion.button
            onClick={handleSelectAll}
            className="glass rounded-xl px-4 py-2 mb-4 flex items-center gap-2 text-gray-800 hover:bg-white/20 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            {selectedFiles.size === filteredFiles.length ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            <span>Select All</span>
          </motion.button>
        )}
      </div>

      {/* Files Grid */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <FileCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-24 h-24" />}
            title={searchQuery ? 'No files found' : 'No files yet'}
            description={
              searchQuery
                ? 'Try adjusting your search'
                : 'Upload your first presentation slide'
            }
            action={
              !searchQuery && (
                <GlassButton onClick={() => setIsUploadModalOpen(true)} variant="primary">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Files
                </GlassButton>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFiles.map(file => (
              <FileCard
                key={file.id}
                file={file}
                isSelected={selectedFiles.has(file.id)}
                onSelect={handleFileSelect}
                onDownload={handleDownloadFile}
                onDelete={handleDeleteFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Files"
      >
        <FileUpload courseId={courseId} onUploadComplete={handleUploadComplete} />
      </Modal>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}
