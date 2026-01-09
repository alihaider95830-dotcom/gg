'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="glass rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                {title && (
                  <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                )}
                <button
                  onClick={onClose}
                  className="ml-auto glass rounded-xl p-2 hover:bg-white/20 transition-all"
                >
                  <X className="w-6 h-6 text-gray-800" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar max-h-[calc(90vh-100px)]">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
