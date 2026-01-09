'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Copy, Check } from 'lucide-react'
import { Modal } from './ui/Modal'
import { GlassButton } from './ui/GlassButton'
import { GlassInput } from './ui/GlassInput'
import { generateShareLink } from '@/lib/cloudStorage'

interface ShareButtonProps {
  fileId: string
  fileName: string
}

export function ShareButton({ fileId, fileName }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareLink = generateShareLink(fileId)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fileName,
          text: `Check out this presentation: ${fileName}`,
          url: shareLink,
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      setIsOpen(true)
    }
  }

  return (
    <>
      <motion.button
        onClick={handleShare}
        className="glass rounded-xl p-2 text-green-400 hover:bg-green-500/20 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Share file"
      >
        <Share2 className="w-4 h-4" />
      </motion.button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Share File"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Share this link with your friends to give them access to this file:
          </p>

          <div className="glass rounded-xl p-4">
            <p className="text-gray-800 font-semibold mb-2">{fileName}</p>
            <p className="text-gray-600 text-sm">
              Anyone with this link can view and download this file
            </p>
          </div>

          <div className="relative">
            <GlassInput
              type="text"
              value={shareLink}
              readOnly
              className="pr-12"
            />
            <button
              onClick={handleCopy}
              className="absolute right-2 top-1/2 -translate-y-1/2 glass rounded-lg p-2 hover:bg-white/20 transition-all"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          <div className="flex gap-3">
            <GlassButton
              onClick={handleCopy}
              variant="primary"
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </GlassButton>
            <GlassButton
              onClick={() => setIsOpen(false)}
              variant="secondary"
              className="flex-1"
            >
              Close
            </GlassButton>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-xs">
              💡 Tip: Your friends can download this file on any device
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
