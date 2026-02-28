'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

// Fade In Up Animation
export const FadeInUp = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={cn(className)}
    {...props}
  >
    {children}
  </motion.div>
));
FadeInUp.displayName = "FadeInUp";

// Stagger Container
export const StaggerContainer = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial="hidden"
    animate="show"
    viewport={{ once: true }}
    variants={{
      hidden: {},
      show: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    }}
    className={cn(className)}
    {...props}
  >
    {children}
  </motion.div>
));
StaggerContainer.displayName = "StaggerContainer";

// Stagger Item
export const StaggerItem = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    }}
    className={cn(className)}
    {...props}
  >
    {children}
  </motion.div>
));
StaggerItem.displayName = "StaggerItem";

// Scale on Hover Card
export const HoverCard = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={cn(className)}
    {...props}
  >
    {children}
  </motion.div>
));
HoverCard.displayName = "HoverCard";

// Button Press Effect
export const MotionButton = motion.button;
