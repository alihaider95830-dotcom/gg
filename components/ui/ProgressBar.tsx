'use client'

import { motion } from 'framer-motion'
import clsx from 'clsx'

interface ProgressBarProps {
  progress: number
  className?: string
  showPercentage?: boolean
}

export function ProgressBar({ progress, className, showPercentage = false }: ProgressBarProps) {
  return (
    <div className={clsx('w-full', className)}>
      <div className="glass rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showPercentage && (
        <div className="text-white/70 text-sm mt-1 text-right">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}
