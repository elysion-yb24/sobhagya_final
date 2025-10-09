"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
  distance?: number;
  once?: boolean;
}

const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  direction = "up",
  distance = 50,
  once = true,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: once,
    margin: "-100px 0px -100px 0px" // Trigger animation when element is 100px from viewport
  });

  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance, opacity: 0 };
      case "down":
        return { y: -distance, opacity: 0 };
      case "left":
        return { x: distance, opacity: 0 };
      case "right":
        return { x: -distance, opacity: 0 };
      case "fade":
        return { opacity: 0 };
      default:
        return { y: distance, opacity: 0 };
    }
  };

  const getAnimatePosition = () => {
    switch (direction) {
      case "up":
      case "down":
        return { y: 0, opacity: 1 };
      case "left":
      case "right":
        return { x: 0, opacity: 1 };
      case "fade":
        return { opacity: 1 };
      default:
        return { y: 0, opacity: 1 };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitialPosition()}
      animate={isInView ? getAnimatePosition() : getInitialPosition()}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth animation
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimation;
