"use client";

import { motion, HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Fade in animation component
interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
}

export const FadeIn = forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, delay = 0, duration = 0.5, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration, ease: "easeOut" }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
FadeIn.displayName = "FadeIn";

// Scale in animation component
interface ScaleInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
}

export const ScaleIn = forwardRef<HTMLDivElement, ScaleInProps>(
  ({ children, delay = 0, duration = 0.3, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration, ease: "easeOut" }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ScaleIn.displayName = "ScaleIn";

// Slide in from left animation
interface SlideInLeftProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
}

export const SlideInLeft = forwardRef<HTMLDivElement, SlideInLeftProps>(
  ({ children, delay = 0, duration = 0.5, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration, ease: "easeOut" }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
SlideInLeft.displayName = "SlideInLeft";

// Slide in from right animation
interface SlideInRightProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
}

export const SlideInRight = forwardRef<HTMLDivElement, SlideInRightProps>(
  ({ children, delay = 0, duration = 0.5, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration, ease: "easeOut" }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
SlideInRight.displayName = "SlideInRight";

// Stagger children animation container
interface StaggerProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number;
}

export const Stagger = forwardRef<HTMLDivElement, StaggerProps>(
  ({ children, staggerDelay = 0.1, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
            },
          },
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Stagger.displayName = "Stagger";

// Stagger item (to be used inside Stagger)
export const StaggerItem = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerItem.displayName = "StaggerItem";

// Hover lift animation wrapper
interface HoverLiftProps extends HTMLMotionProps<"div"> {
  liftAmount?: number;
}

export const HoverLift = forwardRef<HTMLDivElement, HoverLiftProps>(
  ({ children, liftAmount = -5, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ 
          y: liftAmount, 
          transition: { type: "spring", stiffness: 300, damping: 20 } 
        }}
        whileTap={{ scale: 0.98 }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
HoverLift.displayName = "HoverLift";

// Float animation
interface FloatProps extends HTMLMotionProps<"div"> {
  floatHeight?: number;
  duration?: number;
}

export const Float = forwardRef<HTMLDivElement, FloatProps>(
  ({ children, floatHeight = 10, duration = 3, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        animate={{ y: [0, -floatHeight, 0] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Float.displayName = "Float";