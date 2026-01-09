'use client'

import { motion } from 'framer-motion'
import clsx from 'clsx'

interface GlassInputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  icon?: React.ReactNode
}

export function GlassInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  className,
  icon,
}: GlassInputProps) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={clsx(
          'glass-input w-full',
          icon && 'pl-12',
          className
        )}
      />
    </motion.div>
  )
}
