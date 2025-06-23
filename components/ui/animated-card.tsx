"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
}

export function AnimatedCard({ children, className, delay = 0, direction = "up" }: AnimatedCardProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: 20 }
      case "down":
        return { opacity: 0, y: -20 }
      case "left":
        return { opacity: 0, x: 20 }
      case "right":
        return { opacity: 0, x: -20 }
    }
  }

  const getFinalPosition = () => {
    switch (direction) {
      case "up":
      case "down":
        return { opacity: 1, y: 0 }
      case "left":
      case "right":
        return { opacity: 1, x: 0 }
    }
  }

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={getFinalPosition()}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      className={cn("", className)}
    >
      <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-300">{children}</Card>
    </motion.div>
  )
}

export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
