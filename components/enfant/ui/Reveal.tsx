"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  /** Delay in ms before the reveal starts. */
  delay?: number;
  /** Distance (px) the element travels in from below. */
  y?: number;
  /** Total duration in seconds. */
  duration?: number;
  /** Replay each time the element scrolls into view. Default false (once). */
  replay?: boolean;
  className?: string;
  /** Inline element variant — uses motion.span. */
  inline?: boolean;
};

export function Reveal({
  children,
  delay = 0,
  y = 8,
  duration = 0.4,
  replay = false,
  className,
  inline = false,
}: RevealProps) {
  const reduce = useReducedMotion();
  const variants: Variants = reduce
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration, ease: EASE, delay: delay / 1000 },
        },
      };

  const Component = inline ? motion.span : motion.div;
  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !replay, margin: "-40px" }}
      variants={variants}
      className={className}
    >
      {children}
    </Component>
  );
}

type RevealStaggerProps = {
  children: ReactNode;
  className?: string;
  /** Delay between children in seconds. */
  stagger?: number;
  /** Initial delay before first child reveals (seconds). */
  delayChildren?: number;
  /** Replay each time the container scrolls into view. */
  replay?: boolean;
};

const containerVariants = (
  stagger: number,
  delayChildren: number,
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: EASE },
  },
};

const reducedVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

export function RevealStagger({
  children,
  className,
  stagger = 0.05,
  delayChildren = 0.05,
  replay = false,
}: RevealStaggerProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: !replay, margin: "-40px" }}
      variants={
        reduce
          ? reducedVariants
          : containerVariants(stagger, delayChildren)
      }
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? reducedVariants : itemVariants}
    >
      {children}
    </motion.div>
  );
}
