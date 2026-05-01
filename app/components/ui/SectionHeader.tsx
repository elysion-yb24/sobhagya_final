"use client";

import React from "react";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  tag?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  center?: boolean;
  light?: boolean;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  tag,
  title,
  subtitle,
  center = true,
  light = false,
  className = "",
}) => {
  return (
    <div className={`mb-10 sm:mb-14 ${center ? "text-center" : "text-left"} ${className}`}>
      {tag && (
        <motion.span
          className={`inline-block text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-3 ${
            light ? "text-amber-300/90" : "text-orange-500"
          }`}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {tag}
        </motion.span>
      )}
      
      <motion.h2
        className={`section-heading mb-4 ${light ? "text-white" : "text-[#745802]"}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {title}
      </motion.h2>
      
      {subtitle && (
        <motion.div
          className={`mt-4 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed font-poppins ${
            center ? "mx-auto" : ""
          } ${light ? "text-white/70" : "text-gray-500"}`}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {subtitle}
        </motion.div>
      )}
      
      <motion.div
        className={`mt-6 h-[3px] rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 ${
          center ? "mx-auto w-24" : "w-16"
        }`}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
    </div>
  );
};

export default SectionHeader;
