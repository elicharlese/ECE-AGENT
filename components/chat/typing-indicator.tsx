"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface TypingIndicatorProps {
  userId: string
  userName: string
}

export function TypingIndicator({ userId, userName }: TypingIndicatorProps) {
  const [dots, setDots] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4)
    }, 500)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-xs mb-2">
      <div className="flex-shrink-0 mr-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="flex items-center">
        <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">{userName} is typing</span>
        <div className="flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-gray-400"
              animate={{
                opacity: dots === i ? 1 : 0.3,
                scale: dots === i ? 1 : 0.8
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
