"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { HTMLMotionProps, motion } from "motion/react"

import { cn } from "@/lib/utils"

const bouncingDotsVariant = cva("flex gap-3 items-center justify-center", {
  variants: {
    messagePlacement: {
      bottom: "flex-col",
      right: "flex-row",
      left: "flex-row-reverse",
    },
  },
  defaultVariants: {
    messagePlacement: "bottom",
  },
})

export interface BouncingDotsProps {
  /**
   * The number of bouncing dots to display.
   * @default 3
   */
  dots?: number
  /**
   * Optional message to display alongside the bouncing dots.
   */
  message?: string
  /**
   * Position of the message relative to the spinner.
   * @default bottom
   */
  messagePlacement?: "bottom" | "left" | "right"
}

export function BouncingDots({
  dots = 3,
  message,
  messagePlacement = "bottom",
  className,
  ...props
}: HTMLMotionProps<"div"> & BouncingDotsProps) {
  return (
    <div className={cn(bouncingDotsVariant({ messagePlacement }), "p-4")}>
      <div className={cn("flex gap-3 items-center justify-center")}>
        {Array(dots)
          .fill(undefined)
          .map((_, index) => (
            <motion.div
              key={index}
              className={cn("w-4 h-4 bg-gold rounded-full shadow-[0_0_15px_rgba(235,185,93,0.3)]", className)}
              animate={{ 
                y: [0, -15, 0],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 0.8,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.15,
                ease: "easeInOut",
              }}
              {...props}
            />
          ))}
      </div>
      {message && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gold font-medium tracking-[0.2em] uppercase text-xs mt-4"
        >
          {message}
        </motion.div>
      )}
    </div>
  )
}
