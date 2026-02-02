'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, FolderOpen, FileText, HardDrive, TrendingUp } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { GlassButton } from '@/components/ui/GlassButton'
import { Modal } from '@/components/ui/Modal'
import { GlassInput } from '@/components/ui/GlassInput'
import { CourseCard } from '@/components/CourseCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { CourseCardSkeleton } from '@/components/ui/Skeleton'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Course } from '@/types'
import { getCourses, saveCourse, deleteCourse, getStorageStats } from '@/lib/storage'
import { generateId, getRandomCourseColor, formatFileSize } from '@/lib/utils'
import { Toast, ToastType } from '@/components/ui/Toast'

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseDescription, setNewCourseDescription] = useState('')
  const [stats, setStats] = useState({
    courseCount: 0,
    fileCount: 0,
    totalSize: 0,
    averageFileSize: 0,
  })
  const [toast, setToast] = useState<{
    isVisible: boolean
    message: string
    type: ToastType
  }>({
    isVisible: false,
    message: '',
    type: 'info',
  })

  const loadCourses = useCallback(() => {
    setIsLoading(true)
    const loadedCourses = getCourses()
    setCourses(loadedCourses)
    setIsLoading(false)
  }, [])

  const loadStats = useCallback(() => {
    const storageStats = getStorageStats()
    setStats(storageStats)
  }, [])

  useEffect(() => {
    loadCourses()
    loadStats()
  }, [loadCourses, loadStats])

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ isVisible: true, message, type })
  }, [])

  const handleCreateCourse = () => {
    if (!newCourseName.trim()) {
      showToast('Please enter a course name', 'error')
      return
    }

    if (courses.length >= 5) {
      showToast('Maximum 5 courses allowed', 'error')
      return
    }

    const newCourse: Course = {
      id: generateId(),
      name: newCourseName,
      description: newCourseDescription,
      color: getRandomCourseColor(),
      createdAt: new Date(),
      fileCount: 0,
      totalSize: 0,
    }

    saveCourse(newCourse)
    setCourses([...courses, newCourse])
    setIsCreateModalOpen(false)
    setNewCourseName('')
    setNewCourseDescription('')
    showToast('Course created successfully', 'success')
    loadStats()
  }

  const handleDeleteCourse = useCallback((courseId: string) => {
    deleteCourse(courseId)
    setCourses(prev => prev.filter(c => c.id !== courseId))
    showToast('Course deleted successfully', 'success')
    loadStats()
  }, [loadStats, showToast])

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              Course Slides Manager
            </h1>
            <p className="text-gray-600 text-lg">
              Upload, organize, and download your presentation slides
            </p>
          </motion.div>
          <ThemeToggle />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-500/20">
              <FolderOpen className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Courses</p>
              <p className="text-3xl font-bold text-gray-800">{stats.courseCount}</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/20">
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Files</p>
              <p className="text-3xl font-bold text-gray-800">{stats.fileCount}</p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-green-500/20">
              <HardDrive className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Storage Used</p>
              <p className="text-3xl font-bold text-gray-800">
                {formatFileSize(stats.totalSize)}
              </p>
            </div>
          </GlassCard>

          <GlassCard className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-orange-500/20">
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Avg File Size</p>
              <p className="text-3xl font-bold text-gray-800">
                {formatFileSize(stats.averageFileSize)}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Create Course Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassButton
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            size="lg"
            disabled={courses.length >= 5}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Course {courses.length >= 5 && '(Max Reached)'}
          </GlassButton>
        </motion.div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="w-24 h-24" />}
            title="No courses yet"
            description="Create your first course to start organizing your presentation slides"
            action={
              <GlassButton onClick={() => setIsCreateModalOpen(true)} variant="primary">
                <Plus className="w-5 h-5 mr-2" />
                Create Course
              </GlassButton>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onDelete={handleDeleteCourse}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Course"
      >
        <div className="space-y-4">
          <div>
            <label className="text-gray-700 text-sm mb-2 block">Course Name</label>
            <GlassInput
              type="text"
              placeholder="e.g., Data Structures & Algorithms"
              value={newCourseName}
              onChange={e => setNewCourseName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-gray-700 text-sm mb-2 block">Description</label>
            <GlassInput
              type="text"
              placeholder="Brief description of the course"
              value={newCourseDescription}
              onChange={e => setNewCourseDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <GlassButton onClick={handleCreateCourse} variant="primary" className="flex-1">
              Create Course
            </GlassButton>
            <GlassButton
              onClick={() => setIsCreateModalOpen(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </GlassButton>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  )
}
