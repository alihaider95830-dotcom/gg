'use client'

import { motion } from 'framer-motion'
import { FileText, Download, Trash2, Calendar, HardDrive } from 'lucide-react'
import { SlideFile } from '@/types'
import { formatFileSize } from '@/lib/utils'
import { format } from 'date-fns'

interface FileCardProps {
  file: SlideFile
  isSelected?: boolean
  onSelect?: (fileId: string) => void
  onDownload?: (fileId: string) => void
  onDelete?: (fileId: string) => void
  onPreview?: (fileId: string) => void
}

export function FileCard({
  file,
  isSelected = false,
  onSelect,
  onDownload,
  onDelete,
  onPreview,
}: FileCardProps) {
  return (
    <motion.div
      className={`glass rounded-2xl p-4 transition-all duration-300 ${
        isSelected ? 'ring-2 ring-blue-400' : ''
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Checkbox for selection */}
      {onSelect && (
        <div className="mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(file.id)}
            className="w-5 h-5 rounded cursor-pointer"
          />
        </div>
      )}

      {/* File Thumbnail Placeholder */}
      <div
        className="h-32 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 cursor-pointer"
        onClick={() => onPreview?.(file.id)}
      >
        <FileText className="w-12 h-12 text-white/50" />
      </div>

      {/* File Info */}
      <h4 className="text-white font-semibold truncate mb-2">{file.name}</h4>

      <div className="space-y-2 text-sm text-white/60 mb-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4" />
          <span>{formatFileSize(file.size)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(file.uploadedAt), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Tags */}
      {file.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {file.tags.map(tag => (
            <span
              key={tag}
              className="glass rounded-full px-3 py-1 text-xs text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onDownload && (
          <motion.button
            onClick={() => onDownload(file.id)}
            className="flex-1 glass rounded-xl p-2 flex items-center justify-center gap-2 text-blue-400 hover:bg-blue-500/20 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            <span className="text-xs font-semibold">Download</span>
          </motion.button>
        )}
        {onDelete && (
          <motion.button
            onClick={() => {
              if (confirm(`Delete "${file.name}"?`)) {
                onDelete(file.id)
              }
            }}
            className="glass rounded-xl p-2 text-red-400 hover:bg-red-500/20 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
