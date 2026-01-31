'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, FileText, HardDrive, Trash2 } from 'lucide-react'
import { Course } from '@/types'
import { formatFileSize } from '@/lib/utils'
import Link from 'next/link'

interface CourseCardProps {
  course: Course
  onDelete?: (courseId: string) => void
}

function CourseCardBase({ course, onDelete }: CourseCardProps) {
  return (
    <motion.div
      className="glass rounded-3xl p-6 hover:scale-105 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
    >
      <Link href={`/course/${course.id}`}>
        <div className="space-y-4">
          {/* Course Header with Gradient */}
          <div
            className={`h-32 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center mb-4`}
          >
            <FolderOpen className="w-16 h-16 text-gray-700" />
          </div>

          {/* Course Info */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2 truncate">
              {course.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {course.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-xs">Files</span>
              </div>
              <p className="text-xl font-bold text-gray-800">{course.fileCount}</p>
            </div>
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <HardDrive className="w-4 h-4" />
                <span className="text-xs">Size</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {formatFileSize(course.totalSize)}
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* Delete Button */}
      {onDelete && (
        <motion.button
          onClick={(e) => {
            e.preventDefault()
            if (confirm(`Are you sure you want to delete "${course.name}"?`)) {
              onDelete(course.id)
            }
          }}
          className="w-full mt-4 glass rounded-xl p-3 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/20 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm font-semibold">Delete Course</span>
        </motion.button>
      )}
    </motion.div>
  )
}

export const CourseCard = memo(CourseCardBase)
