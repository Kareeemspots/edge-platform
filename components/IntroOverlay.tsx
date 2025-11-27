'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface IntroOverlayProps {
  onComplete?: () => void
}

const ANIMATION_DURATION = 2200

export default function IntroOverlay({ onComplete }: IntroOverlayProps) {
  const [visible, setVisible] = useState(false)
  const hasCompleted = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro')

    if (hasSeenIntro) {
      hasCompleted.current = true
      onComplete?.()
      return
    }

    sessionStorage.setItem('hasSeenIntro', 'true')
    setVisible(true)

    const timer = setTimeout(() => {
      setVisible(false)
    }, ANIMATION_DURATION)

    return () => clearTimeout(timer)
  }, [onComplete])

  const handleExitComplete = () => {
    if (hasCompleted.current) return
    hasCompleted.current = true
    onComplete?.()
  }

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -120 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 1.05] }}
            transition={{ duration: 1.8, times: [0, 0.25, 0.75, 1], ease: 'easeInOut' }}
            className="text-4xl font-semibold tracking-tight text-slate-900"
          >
            EDGE
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

